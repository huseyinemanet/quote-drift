import type { SQLiteDatabase } from "expo-sqlite";

import { APP_STATE_KEYS } from "./constants";
import { getAuthorIdFromName } from "./authorIdentity";
import { getDayKey } from "./date";
import { getDb, getAppState, setAppState, withExclusiveTransaction } from "./db";
import type {
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

async function getPreferenceProfile(): Promise<PreferenceProfile> {
  const selectedTopics = await getSelectedTopics();
  return {
    selectedTopics,
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
    explanation: string | null;
    context: string | null;
    takeaway: string | null;
    tags: string;
    saved: number | null;
  }>(
    `SELECT q.id, q.text, q.author, q.source, q.explanation, q.context, q.takeaway,
            GROUP_CONCAT(qt.tag, '|') AS tags,
            sq.quote_id AS saved
     FROM quotes q
     LEFT JOIN quote_tags qt ON qt.quote_id = q.id
     LEFT JOIN saved_quotes sq ON sq.quote_id = q.id
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
    authorId: getAuthorIdFromName(quote.author),
    source: quote.source ?? undefined,
    explanation: quote.explanation ?? undefined,
    context: quote.context ?? undefined,
    takeaway: quote.takeaway ?? undefined,
    tags,
    primaryTag: tags[0] ?? null,
    saved: Boolean(quote.saved),
  };
}

async function claimQuoteInTransaction(
  tx: SQLiteDatabase,
  kind: "today" | "notification",
  metadata: { dayKey?: string; notificationId?: string; fireAt?: number }
) {
  const profile = await getPreferenceProfile();
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
    const existingInTx = await tx.getFirstAsync<{ quote_id: string }>(
      "SELECT quote_id FROM today_state WHERE day_key = ?",
      [dayKey]
    );
    if (existingInTx) {
      return {
        type: "success",
        data: await hydrateQuote(tx, existingInTx.quote_id),
      } satisfies SuccessResult<QuoteView>;
    }

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
    await tx.runAsync(
      `DELETE FROM quote_usage
       WHERE kind = 'notification'
         AND notification_id IN (
           SELECT notification_id FROM scheduled_notifications WHERE fire_at >= ?
         )`,
      [fromTimestamp]
    );
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
  return withExclusiveTransaction(async (tx) => {
    const existing = await tx.getFirstAsync<{ quote_id: string }>(
      "SELECT quote_id FROM saved_quotes WHERE quote_id = ?",
      [quoteId]
    );

    if (existing) {
      await tx.runAsync("DELETE FROM saved_quotes WHERE quote_id = ?", [quoteId]);
      return false;
    }

    await tx.runAsync(
      "INSERT INTO saved_quotes(quote_id, saved_at) VALUES(?, ?)",
      [quoteId, Date.now()]
    );
    return true;
  });
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
    explanation: string | null;
    context: string | null;
    takeaway: string | null;
    tags: string;
    saved: number | null;
  }>(
    `SELECT q.id, q.text, q.author, q.source, q.explanation, q.context, q.takeaway,
            GROUP_CONCAT(qt.tag, '|') AS tags,
            sq.quote_id AS saved
     FROM quotes q
     LEFT JOIN quote_tags qt ON qt.quote_id = q.id
     LEFT JOIN saved_quotes sq ON sq.quote_id = q.id
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
      authorId: getAuthorIdFromName(row.author),
      source: row.source ?? undefined,
      explanation: row.explanation ?? undefined,
      context: row.context ?? undefined,
      takeaway: row.takeaway ?? undefined,
      tags,
      primaryTag: tags[0] ?? null,
      saved: Boolean(row.saved),
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
