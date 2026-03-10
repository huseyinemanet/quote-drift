import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

import {
  APP_STATE_KEYS,
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_CHANNEL_ID,
} from "./constants";
import { addDays, getDayKey } from "./date";
import { enqueueDbWrite, getDb, setAppState } from "./db";
import {
  cancelFailedNotificationReservation,
  clearFutureNotificationReservations,
  reserveNotificationQuote,
} from "./quoteEngine";
import type {
  NotificationPermissionStatus,
  NotificationSettings,
  Result,
  ScheduleReservation,
} from "./types";
import { buildScheduleTimes, buildTestNotificationPayload } from "./scheduleUtils";

/**
 * Notification permission must only be requested after the user has opted in
 * (e.g. onboarding reminder toggle ON, or Settings reminders ON).
 * Do not call requestNotificationPermission on app launch.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: "Daily quotes",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
  }
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted && permissions.canAskAgain === false) {
      return "denied";
    }

    return permissions.granted ? "granted" : "undetermined";
  } catch {
    return "unavailable";
  }
}

export async function requestNotificationPermission() {
  try {
    const response = await Notifications.requestPermissionsAsync();
    if (!response.granted && response.canAskAgain === false) {
      return "denied" as const;
    }
    return response.granted ? ("granted" as const) : ("undetermined" as const);
  } catch {
    return "unavailable" as const;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    enabled: number;
    frequency_per_day: 1 | 2 | 3;
    active_start_minute: number;
    active_end_minute: number;
    pause_until: number | null;
    permission_status: NotificationPermissionStatus;
    updated_at: number;
  }>(
    `SELECT enabled, frequency_per_day, active_start_minute, active_end_minute,
            pause_until, permission_status, updated_at
     FROM notification_settings
     WHERE id = 1`
  );

  if (!row) {
    return {
      enabled: Boolean(DEFAULT_NOTIFICATION_SETTINGS.enabled),
      frequency_per_day: DEFAULT_NOTIFICATION_SETTINGS.frequency_per_day,
      active_start_minute: DEFAULT_NOTIFICATION_SETTINGS.active_start_minute,
      active_end_minute: DEFAULT_NOTIFICATION_SETTINGS.active_end_minute,
      pause_until: DEFAULT_NOTIFICATION_SETTINGS.pause_until,
      permission_status: DEFAULT_NOTIFICATION_SETTINGS.permission_status,
      updated_at: Date.now(),
    };
  }

  return {
    enabled: Boolean(row.enabled),
    frequency_per_day: row.frequency_per_day,
    active_start_minute: row.active_start_minute,
    active_end_minute: row.active_end_minute,
    pause_until: row.pause_until,
    permission_status: row.permission_status,
    updated_at: row.updated_at,
  };
}

export async function persistNotificationSettings(
  patch: Partial<NotificationSettings>
) {
  return enqueueDbWrite(async () => {
    const current = await getNotificationSettings();
    const next = {
      ...current,
      ...patch,
      updated_at: Date.now(),
    };
    const db = await getDb();
    await db.runAsync(
      `UPDATE notification_settings
       SET enabled = ?, frequency_per_day = ?, active_start_minute = ?,
           active_end_minute = ?, pause_until = ?, permission_status = ?, updated_at = ?
       WHERE id = 1`,
      [
        next.enabled ? 1 : 0,
        next.frequency_per_day,
        next.active_start_minute,
        next.active_end_minute,
        next.pause_until,
        next.permission_status,
        next.updated_at,
      ]
    );

    return next;
  });
}

export async function syncNotificationSchedule(
  settings: NotificationSettings
): Promise<Result<ScheduleReservation[]>> {
  const permissionStatus = await getNotificationPermissionStatus();
  const nextSettings = await persistNotificationSettings({
    permission_status: permissionStatus,
  });

  await Notifications.cancelAllScheduledNotificationsAsync();
  await clearFutureNotificationReservations(Date.now());

  const isPaused =
    typeof nextSettings.pause_until === "number" &&
    nextSettings.pause_until > Date.now();

  if (!nextSettings.enabled || permissionStatus !== "granted" || isPaused) {
    return { type: "success", data: [] };
  }

  await ensureChannel();
  const scheduleTimes = buildScheduleTimes(
    nextSettings.active_start_minute,
    nextSettings.active_end_minute,
    nextSettings.frequency_per_day
  );

  const reservations: ScheduleReservation[] = [];
  for (const fireAt of scheduleTimes) {
    const notificationId = `quote-${fireAt.getTime()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const dayKey = getDayKey(fireAt);
    const reservation = await reserveNotificationQuote({
      notificationId,
      fireAt: fireAt.getTime(),
      dayKey,
    });
    if (reservation.type !== "success") {
      return reservation;
    }

    reservations.push(reservation.data);
  }

  for (const reservation of reservations) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: reservation.notificationId,
        content: {
          title: "A quiet quote for today",
          body: "Open Quotify for your reserved reflection.",
          sound: false,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(reservation.fireAt),
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
    } catch (error) {
      await cancelFailedNotificationReservation(reservation.notificationId);
      return {
        type: "invalid-corpus",
        issues: [
          error instanceof Error
            ? error.message
            : "Scheduling failed for a local notification.",
        ],
      };
    }
  }

  return { type: "success", data: reservations };
}

export async function sendTestNotification() {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync(buildTestNotificationPayload());
}

export async function pauseNotifications(days: number) {
  const pauseUntil = addDays(new Date(), days).getTime();
  const settings = await persistNotificationSettings({ pause_until: pauseUntil });
  return syncNotificationSchedule(settings);
}

export async function openSystemSettings() {
  await Linking.openSettings();
}

/**
 * Persists current timezone offset after a notification sync.
 * Used so schedule can be re-run when timezone/DST changes (e.g. on next app foreground).
 */
export async function persistTimezoneOffsetAfterSync(): Promise<void> {
  await setAppState(
    APP_STATE_KEYS.lastNotificationTimezoneOffset,
    String(new Date().getTimezoneOffset())
  );
}
