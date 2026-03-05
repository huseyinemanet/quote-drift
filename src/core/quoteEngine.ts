import type { SQLiteDatabase } from "expo-sqlite";

import { APP_STATE_KEYS } from "./constants";
import { getDayKey } from "./date";
import { getDb, getAppState, setAppState, withExclusiveTransaction } from "./db";
import type {
  QuoteFeedback,
  QuoteRecord,
  QuoteView,
  Result,
  ScheduleReservation,
  SuccessResult,
  TodayQuoteState,
} from "./types";

type CandidateRow = {
  id: string;
  text: string;
  author: string;
  source: string | null;
  tags: string;
};

type PreferenceProfile = {
  selectedTopics: string[];
  lovedAuthors: string[];
  lovedTags: string[];
  blockedAuthors: string[];
  blockedTags: string[];
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

async function getSelectedTopics() {
  const raw = await getAppState(APP_STATE_KEYS.selectedTopics);
  if (!raw) {
    return [] as string[];
  }

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function getPreferenceProfile(tx: SQLiteDatabase): Promise<PreferenceProfile> {
  const selectedTopics = await getSelectedTopics();
  const rows = await tx.getAllAsync<{
    feedback: QuoteFeedback;
    author: string;
    tag: string;
  }>(
    `SELECT qf.feedback as feedback, q.author as author, qt.tag as tag
     FROM quote_feedback qf
     INNER JOIN quotes q ON q.id = qf.quote_id
     INNER JOIN quote_tags qt ON qt.quote_id = q.id`
  );

  const lovedAuthors = new Set<string>();
  const lovedTags = new Set<string>();
  const blockedAuthors = new Set<string>();
  const blockedTags = new Set<string>();

  for (const row of rows) {
    if (row.feedback === "loved") {
      lovedAuthors.add(row.author);
      lovedTags.add(row.tag);
    }

    if (row.feedback === "not_for_me") {
      blockedAuthors.add(row.author);
      blockedTags.add(row.tag);
    }
  }

  return {
    selectedTopics,
    lovedAuthors: Array.from(lovedAuthors),
    lovedTags: Array.from(lovedTags),
    blockedAuthors: Array.from(blockedAuthors),
    blockedTags: Array.from(blockedTags),
  };
}

function calculateWeight(
  candidate: QuoteRecord,
  profile: PreferenceProfile
): number {
  let weight = 1;

  for (const tag of candidate.tags) {
    if (profile.selectedTopics.includes(tag)) {
      weight += 3;
    }

    if (profile.lovedTags.includes(tag)) {
      weight += 2;
    }

    if (profile.blockedTags.includes(tag)) {
      weight -= 2;
    }
  }

  if (profile.lovedAuthors.includes(candidate.author)) {
    weight += 3;
  }

  if (profile.blockedAuthors.includes(candidate.author)) {
    weight -= 3;
  }

  return Math.max(weight, 0.2);
}

function pickWeightedCandidate(
  candidates: QuoteRecord[],
  profile: PreferenceProfile
): QuoteRecord | null {
  if (candidates.length === 0) {
    return null;
  }

  const weighted = candidates.map((candidate) => ({
    candidate,
    weight: calculateWeight(candidate, profile),
  }));

  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;

  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.candidate;
    }
  }

  return weighted[weighted.length - 1]?.candidate ?? null;
}

async function fetchCandidates(tx: SQLiteDatabase, now: number) {
  const rows = await tx.getAllAsync<CandidateRow>(
    `SELECT q.id, q.text, q.author, q.source,
            GROUP_CONCAT(qt.tag, '|') AS tags
     FROM quotes q
     LEFT JOIN quote_tags qt ON qt.quote_id = q.id
     WHERE q.id NOT IN (SELECT quote_id FROM quote_usage)
       AND q.id NOT IN (
         SELECT quote_id FROM scheduled_notifications
         WHERE status = 'scheduled' AND fire_at >= ?
       )
     GROUP BY q.id
     ORDER BY q.id ASC`,
    [now]
  );

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    author: row.author,
    source: row.source ?? undefined,
    tags: row.tags ? row.tags.split("|").filter(Boolean) : [],
  }));
}

async function hydrateQuote(tx: SQLiteDatabase, quoteId: string): Promise<QuoteView> {
  const quote = await tx.getFirstAsync<{
    id: string;
    text: string;
    author: string;
    source: string | null;
    tags: string;
    saved: number | null;
    feedback: QuoteFeedback | null;
  }>(
    `SELECT q.id, q.text, q.author, q.source,
            GROUP_CONCAT(qt.tag, '|') AS tags,
            sq.quote_id AS saved,
            qf.feedback AS feedback
     FROM quotes q
     LEFT JOIN quote_tags qt ON qt.quote_id = q.id
     LEFT JOIN saved_quotes sq ON sq.quote_id = q.id
     LEFT JOIN quote_feedback qf ON qf.quote_id = q.id
     WHERE q.id = ?
     GROUP BY q.id`,
    [quoteId]
  );

  if (!quote) {
    throw new Error(`Missing quote ${quoteId}`);
  }

  const tags = quote.tags ? quote.tags.split("|").filter(Boolean) : [];

  return {
    id: quote.id,
    text: quote.text,
    author: quote.author,
    source: quote.source ?? undefined,
    tags,
    primaryTag: tags[0] ?? null,
    saved: Boolean(quote.saved),
    feedback: quote.feedback,
  };
}

async function claimQuoteInTransaction(
  tx: SQLiteDatabase,
  kind: "today" | "notification",
  metadata: { dayKey?: string; notificationId?: string; fireAt?: number }
) {
  const profile = await getPreferenceProfile(tx);
  const candidates = await fetchCandidates(tx, Date.now());
  const selected = pickWeightedCandidate(candidates, profile);

  if (!selected) {
    return { type: "exhausted" } as const;
  }

  await tx.runAsync(
    `INSERT INTO quote_usage(quote_id, used_at, kind, day_key, notification_id)
     VALUES(?, ?, ?, ?, ?)`,
    [
      selected.id,
      Date.now(),
      kind,
      metadata.dayKey ?? null,
      metadata.notificationId ?? null,
    ]
  );

  if (kind === "notification" && metadata.notificationId && metadata.fireAt) {
    await tx.runAsync(
      `INSERT INTO scheduled_notifications(notification_id, quote_id, fire_at, day_key, status)
       VALUES(?, ?, ?, ?, 'scheduled')`,
      [
        metadata.notificationId,
        selected.id,
        metadata.fireAt,
        metadata.dayKey ?? getDayKey(new Date(metadata.fireAt)),
      ]
    );
  }

  return { type: "success", data: selected } as const;
}

export async function setSelectedTopics(topics: string[]) {
  await setAppState(APP_STATE_KEYS.selectedTopics, JSON.stringify(topics));
}

export async function getRemainingQuoteCount() {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM quotes
     WHERE id NOT IN (SELECT quote_id FROM quote_usage)
       AND id NOT IN (
         SELECT quote_id FROM scheduled_notifications
         WHERE status = 'scheduled' AND fire_at >= ?
       )`,
    [Date.now()]
  );

  return row?.count ?? 0;
}

export async function getOrCreateTodayQuote(dayKey: string): Promise<Result<QuoteView>> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ quote_id: string }>(
    "SELECT quote_id FROM today_state WHERE day_key = ?",
    [dayKey]
  );

  if (existing) {
    return { type: "success", data: await hydrateQuote(db, existing.quote_id) };
  }

  return withExclusiveTransaction(async (tx) => {
    const claimed = await claimQuoteInTransaction(tx, "today", { dayKey });
    if (claimed.type !== "success") {
      return claimed;
    }

    await tx.runAsync(
      "INSERT INTO today_state(day_key, quote_id, extra_quote_id) VALUES(?, ?, NULL)",
      [dayKey, claimed.data.id]
    );

    return {
      type: "success",
      data: await hydrateQuote(tx, claimed.data.id),
    } satisfies SuccessResult<QuoteView>;
  });
}

export async function claimExtraTodayQuote(dayKey: string): Promise<Result<QuoteView>> {
  const db = await getDb();
  const todayState = await db.getFirstAsync<TodayQuoteState>(
    "SELECT day_key, quote_id, extra_quote_id FROM today_state WHERE day_key = ?",
    [dayKey]
  );

  if (!todayState) {
    return getOrCreateTodayQuote(dayKey);
  }

  if (todayState.extra_quote_id) {
    return { type: "already-claimed" };
  }

  return withExclusiveTransaction(async (tx) => {
    const claimed = await claimQuoteInTransaction(tx, "today", { dayKey });
    if (claimed.type !== "success") {
      return claimed;
    }

    await tx.runAsync(
      "UPDATE today_state SET extra_quote_id = ? WHERE day_key = ?",
      [claimed.data.id, dayKey]
    );

    return {
      type: "success",
      data: await hydrateQuote(tx, claimed.data.id),
    } satisfies SuccessResult<QuoteView>;
  });
}

export async function getExtraTodayQuote(dayKey: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<{ extra_quote_id: string | null }>(
    "SELECT extra_quote_id FROM today_state WHERE day_key = ?",
    [dayKey]
  );
  if (!row?.extra_quote_id) {
    return null;
  }

  return hydrateQuote(db, row.extra_quote_id);
}

export async function reserveNotificationQuote(input: {
  notificationId: string;
  fireAt: number;
  dayKey: string;
}): Promise<Result<ScheduleReservation>> {
  return withExclusiveTransaction(async (tx) => {
    const claimed = await claimQuoteInTransaction(tx, "notification", input);
    if (claimed.type !== "success") {
      return claimed;
    }

    return {
      type: "success",
      data: {
        notificationId: input.notificationId,
        quoteId: claimed.data.id,
        fireAt: input.fireAt,
        dayKey: input.dayKey,
      },
    } satisfies SuccessResult<ScheduleReservation>;
  });
}

export async function clearFutureNotificationReservations(fromTimestamp: number) {
  await withExclusiveTransaction(async (tx) => {
    const futureRows = await tx.getAllAsync<{
      notification_id: string;
    }>(
      `SELECT notification_id
       FROM scheduled_notifications
       WHERE fire_at >= ?`,
      [fromTimestamp]
    );

    for (const row of futureRows) {
      await tx.runAsync(
        "DELETE FROM quote_usage WHERE notification_id = ? AND kind = 'notification'",
        [row.notification_id]
      );
    }

    await tx.runAsync(
      "DELETE FROM scheduled_notifications WHERE fire_at >= ?",
      [fromTimestamp]
    );
  });
}

export async function cancelFailedNotificationReservation(notificationId: string) {
  await withExclusiveTransaction(async (tx) => {
    await tx.runAsync(
      "DELETE FROM quote_usage WHERE notification_id = ? AND kind = 'notification'",
      [notificationId]
    );
    await tx.runAsync(
      "UPDATE scheduled_notifications SET status = 'cancelled' WHERE notification_id = ?",
      [notificationId]
    );
    await tx.runAsync(
      "DELETE FROM scheduled_notifications WHERE notification_id = ?",
      [notificationId]
    );
  });
}

export async function restartCollection() {
  await withExclusiveTransaction(async (tx) => {
    await tx.runAsync("DELETE FROM scheduled_notifications");
    await tx.runAsync("DELETE FROM quote_usage");
    await tx.runAsync("DELETE FROM today_state");
  });
}

export async function toggleSavedQuote(quoteId: string) {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ quote_id: string }>(
    "SELECT quote_id FROM saved_quotes WHERE quote_id = ?",
    [quoteId]
  );

  if (existing) {
    await db.runAsync("DELETE FROM saved_quotes WHERE quote_id = ?", [quoteId]);
    return false;
  }

  await db.runAsync(
    "INSERT INTO saved_quotes(quote_id, saved_at) VALUES(?, ?)",
    [quoteId, Date.now()]
  );
  return true;
}

export async function setQuoteFeedback(quoteId: string, feedback: QuoteFeedback) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO quote_feedback(quote_id, feedback, updated_at)
     VALUES(?, ?, ?)
     ON CONFLICT(quote_id) DO UPDATE SET feedback = excluded.feedback, updated_at = excluded.updated_at`,
    [quoteId, feedback, Date.now()]
  );
}

export async function getLibraryQuotes(filters: {
  query: string;
  topic: string | null;
  savedOnly: boolean;
}) {
  const db = await getDb();
  const terms: string[] = [];
  const conditions = ["1 = 1"];

  if (filters.query.trim()) {
    conditions.push("(q.searchable_text LIKE ? OR q.normalized_author LIKE ?)");
    const query = `%${normalizeText(filters.query)}%`;
    terms.push(query, query);
  }

  if (filters.topic) {
    conditions.push(
      "q.id IN (SELECT quote_id FROM quote_tags WHERE tag = ?)"
    );
    terms.push(filters.topic);
  }

  if (filters.savedOnly) {
    conditions.push("q.id IN (SELECT quote_id FROM saved_quotes)");
  }

  const rows = await db.getAllAsync<{
    id: string;
    text: string;
    author: string;
    source: string | null;
    tags: string;
    saved: number | null;
    feedback: QuoteFeedback | null;
  }>(
    `SELECT q.id, q.text, q.author, q.source,
            GROUP_CONCAT(qt.tag, '|') AS tags,
            sq.quote_id AS saved,
            qf.feedback AS feedback
     FROM quotes q
     LEFT JOIN quote_tags qt ON qt.quote_id = q.id
     LEFT JOIN saved_quotes sq ON sq.quote_id = q.id
     LEFT JOIN quote_feedback qf ON qf.quote_id = q.id
     WHERE ${conditions.join(" AND ")}
     GROUP BY q.id
     ORDER BY q.author ASC, q.text ASC
     LIMIT 250`,
    terms
  );

  return rows.map((row) => {
    const tags = row.tags ? row.tags.split("|").filter(Boolean) : [];
    return {
      id: row.id,
      text: row.text,
      author: row.author,
      source: row.source ?? undefined,
      tags,
      primaryTag: tags[0] ?? null,
      saved: Boolean(row.saved),
      feedback: row.feedback,
    } satisfies QuoteView;
  });
}

export async function getAvailableTopics() {
  const db = await getDb();
  const rows = await db.getAllAsync<{ tag: string }>(
    "SELECT DISTINCT tag FROM quote_tags ORDER BY tag ASC"
  );
  return rows.map((row) => row.tag);
}

export async function getSavedCount() {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM saved_quotes"
  );
  return row?.count ?? 0;
}

export async function getDaysReadStreak() {
  const db = await getDb();
  const rows = await db.getAllAsync<{ day_key: string }>(
    "SELECT day_key FROM today_state ORDER BY day_key DESC"
  );

  let streak = 0;
  let cursor = new Date();
  for (const row of rows) {
    const expected = getDayKey(cursor);
    if (row.day_key !== expected) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
