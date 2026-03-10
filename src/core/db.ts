import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_NAME = "quotify.db";

let databasePromise: Promise<SQLiteDatabase> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export async function getDb() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA busy_timeout = 5000;
      `);
      return db;
    })();
  }

  return databasePromise;
}

export async function enqueueDbWrite<T>(task: () => Promise<T>) {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
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
      explanation TEXT,
      context TEXT,
      takeaway TEXT,
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

    CREATE TABLE IF NOT EXISTS reflections (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      day_key TEXT NOT NULL,
      text TEXT NOT NULL,
      topic TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(quote_id, day_key),
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quotes_normalized_author ON quotes(normalized_author);
    CREATE INDEX IF NOT EXISTS idx_quotes_searchable_text ON quotes(searchable_text);
    CREATE INDEX IF NOT EXISTS idx_quote_tags_tag ON quote_tags(tag);
    CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_fire_at ON scheduled_notifications(fire_at);
    CREATE INDEX IF NOT EXISTS idx_quote_usage_kind_used_at ON quote_usage(kind, used_at);
    CREATE INDEX IF NOT EXISTS idx_reflections_quote_id ON reflections(quote_id);
    CREATE INDEX IF NOT EXISTS idx_reflections_day_key ON reflections(day_key);
  `);

  // Migration: add explanation column to quotes if missing (existing installs)
  const tableInfo = await db.getAllAsync<{ name: string }>("PRAGMA table_info(quotes)");
  const hasExplanation = tableInfo.some((col) => col.name === "explanation");
  if (!hasExplanation) {
    await db.execAsync("ALTER TABLE quotes ADD COLUMN explanation TEXT");
  }
  const hasContext = tableInfo.some((col) => col.name === "context");
  if (!hasContext) {
    await db.execAsync("ALTER TABLE quotes ADD COLUMN context TEXT");
  }
  const hasTakeaway = tableInfo.some((col) => col.name === "takeaway");
  if (!hasTakeaway) {
    await db.execAsync("ALTER TABLE quotes ADD COLUMN takeaway TEXT");
  }

  const reflectionsInfo = await db.getAllAsync<{ name: string }>("PRAGMA table_info(reflections)");
  const hasReflectionsTopic = reflectionsInfo.some((col) => col.name === "topic");
  if (!hasReflectionsTopic) {
    await db.execAsync("ALTER TABLE reflections ADD COLUMN topic TEXT");
  }
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
  await enqueueDbWrite(async () => {
    const db = await getDb();

    if (value === null) {
      await db.runAsync("DELETE FROM app_state WHERE key = ?", [key]);
      return;
    }

    await db.runAsync(
      "INSERT INTO app_state(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value]
    );
  });
}

export type DbTransaction = Parameters<
  Awaited<ReturnType<typeof getDb>>["withExclusiveTransactionAsync"]
>[0] extends (tx: infer T) => Promise<void>
  ? T
  : SQLiteDatabase;

export async function withExclusiveTransaction<T>(
  task: (tx: SQLiteDatabase) => Promise<T>
) {
  let result: T | undefined;
  await enqueueDbWrite(async () => {
    const db = await getDb();
    await db.withExclusiveTransactionAsync(async (tx) => {
      result = await task(tx);
    });
  });
  return result as T;
}
