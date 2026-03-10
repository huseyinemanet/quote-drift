import { getDb, enqueueDbWrite } from "./db";
import type { Reflection, ReflectionWithQuote } from "./types";
import { addDays, getDayKey } from "./date";

function generateId(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function getReflection(
  quoteId: string,
  dayKey: string
): Promise<Reflection | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    quote_id: string;
    day_key: string;
    text: string;
    topic: string | null;
    created_at: number;
    updated_at: number;
  }>(
    "SELECT id, quote_id, day_key, text, topic, created_at, updated_at FROM reflections WHERE quote_id = ? AND day_key = ?",
    [quoteId, dayKey]
  );
  if (!row) return null;
  return {
    id: row.id,
    quoteId: row.quote_id,
    dayKey: row.day_key,
    text: row.text,
    topic: row.topic ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type ReflectionRow = {
  id: string;
  quote_id: string;
  day_key: string;
  text: string;
  topic: string | null;
  created_at: number;
  updated_at: number;
  quote_text: string;
  quote_author: string;
};

export async function getAllReflectionsOrderedByDate(): Promise<ReflectionWithQuote[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ReflectionRow>(
    `SELECT r.id, r.quote_id, r.day_key, r.text, r.topic, r.created_at, r.updated_at,
            q.text AS quote_text, q.author AS quote_author
     FROM reflections r
     INNER JOIN quotes q ON r.quote_id = q.id
     ORDER BY r.updated_at DESC`
  );
  return rows.map((row) => ({
    reflection: {
      id: row.id,
      quoteId: row.quote_id,
      dayKey: row.day_key,
      text: row.text,
      topic: row.topic ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    quote: {
      id: row.quote_id,
      text: row.quote_text,
      author: row.quote_author,
      topic: row.topic ?? undefined,
    },
  }));
}

export async function saveReflection(
  quoteId: string,
  dayKey: string,
  text: string,
  topic?: string | null
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  await enqueueDbWrite(async () => {
    const db = await getDb();
    const now = Date.now();
    const existing = await db.getFirstAsync<{ id: string }>(
      "SELECT id FROM reflections WHERE quote_id = ? AND day_key = ?",
      [quoteId, dayKey]
    );
    if (existing) {
      await db.runAsync(
        "UPDATE reflections SET text = ?, topic = ?, updated_at = ? WHERE quote_id = ? AND day_key = ?",
        [trimmed, topic ?? null, now, quoteId, dayKey]
      );
    } else {
      await db.runAsync(
        "INSERT INTO reflections (id, quote_id, day_key, text, topic, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [generateId(), quoteId, dayKey, trimmed, topic ?? null, now, now]
      );
    }
  });
}

/** Consecutive days with at least one reflection, ending at today. */
export async function getReflectionStreak(): Promise<number> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ day_key: string }>(
    "SELECT DISTINCT day_key FROM reflections ORDER BY day_key DESC"
  );
  if (rows.length === 0) return 0;
  const dayKeySet = new Set(rows.map((r) => r.day_key));
  const today = getDayKey();
  let streak = 0;
  let cursor = new Date();
  while (dayKeySet.has(getDayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
