import { APP_STATE_KEYS, DEFAULT_NOTIFICATION_SETTINGS } from "./constants";
import { enqueueDbWrite, getAppState, getDb, setAppState } from "./db";
import { digestString } from "./hash";
import { getBundledQuotes, validateBundledQuotes } from "./quoteData";
import type { InvalidCorpusResult } from "./types";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export async function importQuotesIfNeeded() {
  const db = await getDb();
  const rawQuotes = getBundledQuotes();
  const validation = validateBundledQuotes();
  const serialized = JSON.stringify(rawQuotes);
  const corpusHash = await digestString(serialized);

  if (!validation.success) {
    const issues = validation.error.issues.map((issue) => issue.message);
    await setAppState(APP_STATE_KEYS.corpusInvalidIssues, JSON.stringify(issues));
    return {
      type: "invalid-corpus",
      issues,
    } satisfies InvalidCorpusResult;
  }

  const storedHash = await getAppState(APP_STATE_KEYS.corpusHash);
  if (storedHash === corpusHash) {
    await ensureNotificationSettings();
    await setAppState(APP_STATE_KEYS.corpusInvalidIssues, null);
    return { type: "success" as const };
  }

  const importedAt = Date.now();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync("DELETE FROM quote_tags");
    await tx.runAsync("DELETE FROM quotes");

    for (const quote of validation.data) {
      await tx.runAsync(
        `INSERT INTO quotes(id, text, author, source, normalized_author, searchable_text, imported_at)
         VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [
          quote.id,
          quote.text,
          quote.author,
          quote.source ?? null,
          normalizeText(quote.author),
          normalizeText(`${quote.text} ${quote.author}`),
          importedAt,
        ]
      );

      for (const tag of quote.tags) {
        await tx.runAsync(
          "INSERT INTO quote_tags(quote_id, tag) VALUES(?, ?)",
          [quote.id, normalizeText(tag)]
        );
      }
    }
  });

  await setAppState(APP_STATE_KEYS.corpusHash, corpusHash);
  await setAppState(APP_STATE_KEYS.corpusInvalidIssues, null);
  await ensureNotificationSettings();

  return { type: "success" as const };
}

export async function ensureNotificationSettings() {
  const db = await getDb();
  const row = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM notification_settings WHERE id = 1"
  );

  if (row) {
    return;
  }

  await enqueueDbWrite(async () => {
    await db.runAsync(
      `INSERT INTO notification_settings(
        id, enabled, frequency_per_day, active_start_minute, active_end_minute,
        pause_until, permission_status, updated_at
      ) VALUES(1, ?, ?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_NOTIFICATION_SETTINGS.enabled,
        DEFAULT_NOTIFICATION_SETTINGS.frequency_per_day,
        DEFAULT_NOTIFICATION_SETTINGS.active_start_minute,
        DEFAULT_NOTIFICATION_SETTINGS.active_end_minute,
        DEFAULT_NOTIFICATION_SETTINGS.pause_until,
        DEFAULT_NOTIFICATION_SETTINGS.permission_status,
        Date.now(),
      ]
    );
  });
}
