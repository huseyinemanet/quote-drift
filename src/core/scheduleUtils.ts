import { TEST_NOTIFICATION_COPY } from "./constants";

/**
 * Builds schedule times in a DST-safe way: use local midnight as base and add
 * minute offsets so that "same local time" on the next day is unambiguous
 * across timezone and daylight-saving transitions.
 */
export function buildScheduleTimes(
  startMinute: number,
  endMinute: number,
  frequency: 1 | 2 | 3,
  referenceDate: Date = new Date()
) {
  const window = endMinute - startMinute;
  const slotLength = Math.floor(window / frequency);
  const results: Date[] = [];
  const now = Date.now();

  const dayStart = new Date(referenceDate);
  dayStart.setHours(0, 0, 0, 0);

  for (let index = 0; index < frequency; index += 1) {
    const slotStart = startMinute + slotLength * index;
    const slotEnd =
      index === frequency - 1 ? endMinute : slotStart + slotLength - 1;
    const minute =
      slotStart + Math.max(0, Math.floor(Math.random() * (slotEnd - slotStart + 1)));

    let fireAt = new Date(dayStart.getTime() + minute * 60 * 1000);
    if (fireAt.getTime() <= now) {
      const tomorrowStart = new Date(dayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      fireAt = new Date(tomorrowStart.getTime() + minute * 60 * 1000);
    }
    results.push(fireAt);
  }

  return results.sort((left, right) => left.getTime() - right.getTime());
}

export function buildTestNotificationPayload() {
  return {
    content: {
      title: TEST_NOTIFICATION_COPY.title,
      body: TEST_NOTIFICATION_COPY.body,
      sound: false,
    },
    trigger: null,
  };
}
