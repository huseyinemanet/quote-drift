import { TEST_NOTIFICATION_COPY } from "@/core/constants";
import { buildTestNotificationPayload } from "@/core/scheduleUtils";
import {
  persistTimezoneOffsetAfterSync,
  syncNotificationSchedule,
} from "@/core/notifications";
import type { NotificationSettings } from "@/core/types";

jest.mock("expo-notifications", () => {
  const callOrder: string[] = [];
  return {
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, canAskAgain: true }),
    requestPermissionsAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn().mockImplementation(() => {
      callOrder.push("cancel");
      return Promise.resolve(undefined);
    }),
    scheduleNotificationAsync: jest.fn().mockImplementation(() => {
      callOrder.push("schedule");
      return Promise.resolve("id");
    }),
    setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
    AndroidImportance: { DEFAULT: 3 },
    SchedulableTriggerInputTypes: { DATE: "date" },
    __getCallOrder: () => callOrder,
  };
});

jest.mock("@/core/db", () => ({
  getDb: jest.fn(),
  enqueueDbWrite: jest.fn((task: () => Promise<unknown>) => task()),
  setAppState: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/core/quoteEngine", () => ({
  clearFutureNotificationReservations: jest.fn().mockResolvedValue(undefined),
  reserveNotificationQuote: jest.fn().mockResolvedValue({
    type: "success",
    data: {
      notificationId: "quote-1-abc",
      quoteId: "q1",
      fireAt: Date.now() + 60_000,
      dayKey: "2026-03-07",
    },
  }),
  cancelFailedNotificationReservation: jest.fn().mockResolvedValue(undefined),
}));

import * as Notifications from "expo-notifications";
import { getDb, setAppState } from "@/core/db";
import { APP_STATE_KEYS } from "@/core/constants";
import {
  clearFutureNotificationReservations,
  reserveNotificationQuote,
} from "@/core/quoteEngine";

const grantedSettings: NotificationSettings = {
  enabled: true,
  frequency_per_day: 2,
  active_start_minute: 570,
  active_end_minute: 1230,
  pause_until: null,
  permission_status: "granted",
  updated_at: Date.now(),
};

describe("test notification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getFirstAsync: jest.fn().mockResolvedValue({
        enabled: 1,
        frequency_per_day: 2,
        active_start_minute: 570,
        active_end_minute: 1230,
        pause_until: null,
        permission_status: "granted",
        updated_at: Date.now(),
      }),
      runAsync: jest.fn().mockResolvedValue(undefined),
    });
  });

  it("uses fixed copy and does not rely on quote content", () => {
    expect(buildTestNotificationPayload()).toEqual({
      content: {
        title: TEST_NOTIFICATION_COPY.title,
        body: TEST_NOTIFICATION_COPY.body,
        sound: false,
      },
      trigger: null,
    });
  });

  it("cancels all scheduled notifications before scheduling new ones", async () => {
    await syncNotificationSchedule(grantedSettings);

    const expo = jest.requireMock("expo-notifications") as { __getCallOrder?: () => string[] };
    const order = expo.__getCallOrder?.() ?? [];
    const firstCancel = order.indexOf("cancel");
    const firstSchedule = order.indexOf("schedule");
    expect(firstCancel).toBeGreaterThanOrEqual(0);
    expect(firstSchedule).toBeGreaterThanOrEqual(0);
    expect(firstCancel).toBeLessThan(firstSchedule);
  });

  it("schedules exactly frequency notifications when enabled and granted", async () => {
    await syncNotificationSchedule(grantedSettings);

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(clearFutureNotificationReservations).toHaveBeenCalled();
    expect(reserveNotificationQuote).toHaveBeenCalledTimes(grantedSettings.frequency_per_day);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(
      grantedSettings.frequency_per_day
    );
  });

  it("persists timezone offset after sync so timezone/DST change can trigger re-sync", async () => {
    (setAppState as jest.Mock).mockClear();
    await persistTimezoneOffsetAfterSync();

    expect(setAppState).toHaveBeenCalledTimes(1);
    expect(setAppState).toHaveBeenCalledWith(
      APP_STATE_KEYS.lastNotificationTimezoneOffset,
      expect.any(String)
    );
    const value = (setAppState as jest.Mock).mock.calls[0][1];
    const offset = Number(value);
    expect(Number.isInteger(offset)).toBe(true);
    expect(offset).toBeGreaterThanOrEqual(-720);
    expect(offset).toBeLessThanOrEqual(720);
  });
});
