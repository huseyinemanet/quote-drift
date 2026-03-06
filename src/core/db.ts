import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_NAME = "quote-drift.db";

let databasePromise: Promise<SQLiteDatabase> | null = null;

export async function getDb() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

export async function runMigrations() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      source TEXT,
      normalized_author TEXT NOT NULL,
      searchable_text TEXT NOT NULL,
      imported_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quote_tags (
      quote_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (quote_id, tag),
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quote_usage (
      quote_id TEXT PRIMARY KEY,
      used_at INTEGER NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('today', 'notification')),
      day_key TEXT NULL,
      notification_id TEXT NULL,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_quotes (
      quote_id TEXT PRIMARY KEY,
      saved_at INTEGER NOT NULL,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notification_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      enabled INTEGER NOT NULL,
      frequency_per_day INTEGER NOT NULL,
      active_start_minute INTEGER NOT NULL,
      active_end_minute INTEGER NOT NULL,
      pause_until INTEGER NULL,
      permission_status TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scheduled_notifications (
      notification_id TEXT PRIMARY KEY,
      quote_id TEXT UNIQUE NOT NULL,
      fire_at INTEGER NOT NULL,
      day_key TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('scheduled', 'cancelled')),
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS today_state (
      day_key TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      extra_quote_id TEXT NULL,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
      FOREIGN KEY (extra_quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quotes_normalized_author ON quotes(normalized_author);
    CREATE INDEX IF NOT EXISTS idx_quotes_searchable_text ON quotes(searchable_text);
    CREATE INDEX IF NOT EXISTS idx_quote_tags_tag ON quote_tags(tag);
    CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_fire_at ON scheduled_notifications(fire_at);
    CREATE INDEX IF NOT EXISTS idx_quote_usage_kind_used_at ON quote_usage(kind, used_at);
  `);
}

export async function getAppState(key: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_state WHERE key = ?",
    [key]
  );

  return row?.value ?? null;
}

export async function setAppState(key: string, value: string | null) {
  const db = await getDb();

  if (value === null) {
    await db.runAsync("DELETE FROM app_state WHERE key = ?", [key]);
    return;
  }

  await db.runAsync(
    "INSERT INTO app_state(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value]
  );
}

export type DbTransaction = Parameters<
  Awaited<ReturnType<typeof getDb>>["withExclusiveTransactionAsync"]
>[0] extends (tx: infer T) => Promise<void>
  ? T
  : SQLiteDatabase;

export async function withExclusiveTransaction<T>(
  task: (tx: SQLiteDatabase) => Promise<T>
) {
  const db = await getDb();
  let result: T | undefined;
  await db.withExclusiveTransactionAsync(async (tx) => {
    result = await task(tx);
  });
  return result as T;
}
