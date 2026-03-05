import { TEST_NOTIFICATION_COPY } from "./constants";

export function buildScheduleTimes(
  startMinute: number,
  endMinute: number,
  frequency: 1 | 2 | 3,
  referenceDate: Date = new Date()
) {
  const window = endMinute - startMinute;
  const slotLength = Math.floor(window / frequency);
  const results: Date[] = [];

  for (let index = 0; index < frequency; index += 1) {
    const slotStart = startMinute + slotLength * index;
    const slotEnd =
      index === frequency - 1 ? endMinute : slotStart + slotLength - 1;
    const minute =
      slotStart + Math.max(0, Math.floor(Math.random() * (slotEnd - slotStart + 1)));
    const scheduled = new Date(referenceDate);
    scheduled.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    if (scheduled.getTime() <= Date.now()) {
      scheduled.setDate(scheduled.getDate() + 1);
    }
    results.push(scheduled);
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
