import AsyncStorage from "@react-native-async-storage/async-storage";

import { addDays, getDayKey } from "@/core/date";

const STORAGE_KEY = "quotify_streak_data";

/** Persisted shape for streak data (local calendar day only). */
export type StreakData = {
  currentStreak: number;
  bestStreak: number;
  lastSeenDate: string; // YYYY-MM-DD
};

/** Result of updateStreak() when the user has just seen the daily quote. */
export type UpdateStreakResult = {
  currentStreak: number;
  bestStreak: number;
  isNewDay: boolean;
  milestoneReached?: number; // 3 | 7 | 14 | 30 | 100
};

const MILESTONES = [3, 7, 14, 30, 100] as const;

function isMilestone(n: number): n is (typeof MILESTONES)[number] {
  return (MILESTONES as readonly number[]).includes(n);
}

/** Returns today's date as YYYY-MM-DD in local time (single source for calendar day).
 *  Uses local date only — never toISOString() — to avoid timezone bugs. */
export function getTodayDate(): string {
  return getDayKey();
}

/** Parses YYYY-MM-DD to a local Date at midnight for "next day" math. */
function parseDayKeyToDate(dayKey: string): Date {
  const [y, m, d] = dayKey.split("-").map(Number);
  if (y == null || m == null || d == null || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return new Date(0); // invalid
  }
  return new Date(y, m - 1, d);
}

/** Returns the calendar day immediately after the given dayKey (YYYY-MM-DD). */
function nextDayKey(dayKey: string): string {
  return getDayKey(addDays(parseDayKeyToDate(dayKey), 1));
}

/** Reads streak data from storage. Returns null if missing or invalid (defensive). */
export async function getStreakData(): Promise<StreakData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    const currentStreak = Number(obj.currentStreak);
    const bestStreak = Number(obj.bestStreak);
    const lastSeenDate = obj.lastSeenDate;
    if (
      !Number.isInteger(currentStreak) ||
      currentStreak < 0 ||
      !Number.isInteger(bestStreak) ||
      bestStreak < 0 ||
      typeof lastSeenDate !== "string" ||
      lastSeenDate.length !== 10
    ) {
      return null;
    }
    return { currentStreak, bestStreak, lastSeenDate };
  } catch {
    return null;
  }
}

/** Writes streak data to storage. */
export async function saveStreakData(data: StreakData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Call when the user has seen the daily quote. Updates streak at most once per calendar day.
 * Returns current streak state and whether a milestone was reached (3, 7, 14, 30, 100).
 */
export async function updateStreak(): Promise<UpdateStreakResult> {
  const today = getTodayDate();
  const data = await getStreakData();

  // Case 1 — First time / no data: start streak at 1
  if (data == null) {
    const next: StreakData = {
      currentStreak: 1,
      bestStreak: 1,
      lastSeenDate: today,
    };
    await saveStreakData(next);
    return {
      currentStreak: 1,
      bestStreak: 1,
      isNewDay: true,
      // No milestoneReached for 1 per spec (only 3,7,14,30,100)
    };
  }

  const { currentStreak, bestStreak, lastSeenDate } = data;

  // Case 2 — Already seen today: do nothing (once per calendar day)
  if (today === lastSeenDate) {
    return {
      currentStreak,
      bestStreak,
      isNewDay: false,
    };
  }

  const expectedNextDay = nextDayKey(lastSeenDate);

  // Case 3 — Consecutive day: increment streak
  if (today === expectedNextDay) {
    const newStreak = currentStreak + 1;
    const newBest = Math.max(bestStreak, newStreak);
    const next: StreakData = {
      currentStreak: newStreak,
      bestStreak: newBest,
      lastSeenDate: today,
    };
    await saveStreakData(next);
    return {
      currentStreak: newStreak,
      bestStreak: newBest,
      isNewDay: true,
      ...(isMilestone(newStreak) ? { milestoneReached: newStreak } : {}),
    };
  }

  // Case 4 — Missed one or more days: previous streak ends, new streak starts at 1 for today.
  const next: StreakData = {
    currentStreak: 1,
    bestStreak,
    lastSeenDate: today,
  };
  await saveStreakData(next);
  return {
    currentStreak: 1,
    bestStreak,
    isNewDay: true,
    // No milestone for "new streak started"; UI shows 🔥 1-day streak.
  };
}

/** For future Stats page: returns current and best streak without updating. */
export async function getStreakStatus(): Promise<{
  currentStreak: number;
  bestStreak: number;
}> {
  const data = await getStreakData();
  if (data == null) return { currentStreak: 0, bestStreak: 0 };
  return {
    currentStreak: data.currentStreak,
    bestStreak: data.bestStreak,
  };
}
