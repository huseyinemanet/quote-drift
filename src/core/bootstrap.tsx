import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { AppState, Appearance, InteractionManager, useColorScheme } from "react-native";

import { APP_STATE_KEYS } from "./constants";
import { getDayKey } from "./date";
import { getAppState, getDb, runMigrations, setAppState } from "./db";
import { importQuotesIfNeeded } from "./importQuotes";
import { cleanupTempFiles } from "./sharecard/cleanupTempFiles";
import { syncTodayWidgetTimeline } from "./widget/sync";
import { syncQuotesToWatch } from "./watch/syncWatch";
import { syncSiriQuote } from "./siriQuote";
import { initializeMobileAds } from "./ads/admob";
import {
  getNotificationPermissionStatus,
  getNotificationSettings,
  pauseNotifications,
  persistNotificationSettings,
  persistTimezoneOffsetAfterSync,
  requestNotificationPermission,
  sendTestNotification,
  syncNotificationSchedule,
} from "./notifications";
import {
  claimExtraTodayQuote,
  getAvailableTopics,
  getDaysReadStreak,
  getExtraTodayQuote,
  getLibraryQuotes,
  getOrCreateTodayQuote,
  getRemainingQuoteCount,
  getSavedCount,
  restartCollection,
  setSelectedTopics,
  toggleSavedQuote,
} from "./quoteEngine";
import type {
  AppBootstrapSnapshot,
  BootstrapState,
  NotificationPermissionStatus,
  NotificationSettings,
  QuoteView,
} from "./types";

type AppContextValue = AppBootstrapSnapshot & {
  todayQuote: QuoteView | null;
  extraQuote: QuoteView | null;
  streak: number;
  topics: string[];
  selectedTopics: string[];
  savedCount: number;
  refreshAll: () => Promise<void>;
  completeOnboarding: (topics: string[]) => Promise<void>;
  requestNotifications: () => Promise<NotificationPermissionStatus>;
  updateNotificationSettings: (
    patch: Partial<NotificationSettings>
  ) => Promise<void>;
  pauseNotificationsForDays: (days: number) => Promise<void>;
  claimExtraQuote: () => Promise<"success" | "already-claimed" | "exhausted">;
  toggleSave: (quoteId: string) => Promise<void>;
  loadLibrary: (filters: {
    query: string;
    topic: string | null;
    savedOnly: boolean;
  }) => Promise<QuoteView[]>;
  sendTestReminder: () => Promise<void>;
  restartQuoteCollection: () => Promise<void>;
  setBootstrapState: (state: BootstrapState) => void;
  resetOnboarding: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

async function readSnapshot(): Promise<AppBootstrapSnapshot> {
  try {
    await runMigrations();
    const importResult = await importQuotesIfNeeded();
    const db = await getDb();
    const quoteRow = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM quotes"
    );
    const hasLibraryContent = (quoteRow?.count ?? 0) > 0;
    const onboardingComplete =
      (await getAppState(APP_STATE_KEYS.onboardingComplete)) === "true";
    const invalidRaw = await getAppState(APP_STATE_KEYS.corpusInvalidIssues);
    const invalidIssues = invalidRaw ? (JSON.parse(invalidRaw) as string[]) : [];
    const notificationSettings = await getNotificationSettings();

    if (importResult.type === "invalid-corpus") {
      return {
        state: "fatalCorpus",
        hasLibraryContent,
        invalidIssues: importResult.issues,
        onboardingComplete,
        notificationSettings,
      };
    }

    const remaining = await getRemainingQuoteCount();
    const todayState = await db.getFirstAsync<{ day_key: string }>(
      "SELECT day_key FROM today_state WHERE day_key = ?",
      [getDayKey()]
    );
    const state: BootstrapState =
      !onboardingComplete
        ? "onboarding"
        : remaining === 0 && !todayState
          ? "exhausted"
          : "ready";

    return {
      state,
      hasLibraryContent,
      invalidIssues,
      onboardingComplete,
      notificationSettings,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (__DEV__) {
      console.error("Bootstrap readSnapshot failed:", err);
    }
    return {
      state: "fatalCorpus",
      hasLibraryContent: false,
      invalidIssues: [`Uygulama başlatılırken bir hata oluştu: ${message}`],
      onboardingComplete: false,
      notificationSettings: {
        enabled: false,
        frequency_per_day: 1,
        active_start_minute: 570,
        active_end_minute: 1230,
        pause_until: null,
        permission_status: "undetermined",
        updated_at: Date.now(),
      },
    };
  }
}

export function AppProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [snapshot, setSnapshot] = useState<AppBootstrapSnapshot>({
    state: "loading",
    hasLibraryContent: false,
    invalidIssues: [],
    onboardingComplete: false,
    notificationSettings: {
      enabled: false,
      frequency_per_day: 1,
      active_start_minute: 570,
      active_end_minute: 1230,
      pause_until: null,
      permission_status: "undetermined",
      updated_at: Date.now(),
    },
  });
  const [todayQuote, setTodayQuote] = useState<QuoteView | null>(null);
  const [extraQuote, setExtraQuote] = useState<QuoteView | null>(null);
  const [streak, setStreak] = useState(0);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopicsState] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const notificationSyncInProgressRef = useRef(false);

  const refreshAllInternal = async (
    shouldSyncWidget: boolean,
    isCancelled?: () => boolean
  ) => {
    try {
      const nextSnapshot = await readSnapshot();
      if (isCancelled?.()) return;
      setSnapshot(nextSnapshot);
      setTopics(await getAvailableTopics());
      setSavedCount(await getSavedCount());
      setStreak(await getDaysReadStreak());

      const rawTopics = await getAppState(APP_STATE_KEYS.selectedTopics);
      if (isCancelled?.()) return;
      setSelectedTopicsState(rawTopics ? (JSON.parse(rawTopics) as string[]) : []);

      if (nextSnapshot.state === "ready" || nextSnapshot.state === "exhausted") {
        const primary = await getOrCreateTodayQuote(getDayKey());
        if (isCancelled?.()) return;
        if (primary.type === "success") {
          setTodayQuote(primary.data);
          syncSiriQuote(primary.data);
          if (shouldSyncWidget) {
            syncTodayWidgetTimeline({
              quote: primary.data,
              scheme: systemScheme === "dark" ? "dark" : "light",
            });
          }
        } else {
          setTodayQuote(null);
          setSnapshot((current) => ({ ...current, state: "exhausted" }));
          syncSiriQuote(null);
          if (shouldSyncWidget) {
            syncTodayWidgetTimeline({
              quote: null,
              scheme: systemScheme === "dark" ? "dark" : "light",
            });
          }
        }
        const extra = await getExtraTodayQuote(getDayKey());
        if (isCancelled?.()) return;
        setExtraQuote(extra);
        if (shouldSyncWidget) {
          syncQuotesToWatch({
            todayQuote: primary.type === "success" ? primary.data : null,
            extraQuote: extra,
          });
        }
      } else {
        setTodayQuote(null);
        setExtraQuote(null);
        syncSiriQuote(null);
        if (shouldSyncWidget) {
          syncTodayWidgetTimeline({
            quote: null,
            scheme: systemScheme === "dark" ? "dark" : "light",
          });
          syncQuotesToWatch({ todayQuote: null, extraQuote: null });
        }
      }
    } catch (err) {
      if (__DEV__) {
        console.error("Bootstrap refreshAll failed:", err);
      }
      if (isCancelled?.()) return;
      const message = err instanceof Error ? err.message : String(err);
      setSnapshot((current) => ({
        ...current,
        state: "fatalCorpus",
        invalidIssues: [`Yenileme sırasında hata: ${message}`],
      }));
    }
  };

  const refreshAll = async () => {
    await refreshAllInternal(true);
  };

  useEffect(() => {
    let cancelled = false;
    void refreshAllInternal(true, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void cleanupTempFiles();
  }, []);

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_DISABLE_ADMOB === "1") {
      return;
    }
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const cancel = InteractionManager.runAfterInteractions(() => {
      timeoutId = setTimeout(() => {
        void initializeMobileAds();
      }, 500);
    });
    return () => {
      cancel.cancel();
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...snapshot,
      todayQuote,
      extraQuote,
      streak,
      topics,
      selectedTopics,
      savedCount,
      refreshAll,
      completeOnboarding: async (topicsToSave) => {
        await setSelectedTopics(topicsToSave);
        await setAppState(APP_STATE_KEYS.onboardingComplete, "true");
        setSelectedTopicsState(topicsToSave);
        await refreshAll();
      },
      requestNotifications: async () => {
        const permission = await requestNotificationPermission();
        const settings = await persistNotificationSettings({
          permission_status: permission,
          enabled: permission === "granted",
        });
        await syncNotificationSchedule(settings);
        await refreshAll();
        return permission;
      },
      updateNotificationSettings: async (patch) => {
        const merged = await persistNotificationSettings(patch);
        await syncNotificationSchedule(merged);
        await refreshAll();
      },
      pauseNotificationsForDays: async (days) => {
        await pauseNotifications(days);
        await refreshAll();
      },
      claimExtraQuote: async () => {
        const result = await claimExtraTodayQuote(getDayKey());
        if (result.type === "success") {
          setExtraQuote(result.data);
          setSnapshot((current) => ({ ...current, state: "ready" }));
          setSavedCount(await getSavedCount());
          if (todayQuote) {
            syncQuotesToWatch({ todayQuote, extraQuote: result.data });
          }
          return "success";
        }

        if (result.type === "already-claimed") {
          return "already-claimed";
        }

        setSnapshot((current) => ({ ...current, state: "exhausted" }));
        return "exhausted";
      },
      toggleSave: async (quoteId) => {
        await toggleSavedQuote(quoteId);
        await refreshAllInternal(false);
      },
      loadLibrary: (filters) => getLibraryQuotes(filters),
      sendTestReminder: async () => {
        await sendTestNotification();
      },
      restartQuoteCollection: async () => {
        await restartCollection();
        const settings = await getNotificationSettings();
        await syncNotificationSchedule(settings);
        await refreshAll();
      },
      setBootstrapState: (state) => {
        setSnapshot((current) => ({ ...current, state }));
      },
      resetOnboarding: async () => {
        await setAppState(APP_STATE_KEYS.onboardingComplete, null);
        setSnapshot((current) => ({ ...current, state: "onboarding" }));
      },
    }),
    [
      snapshot,
      todayQuote,
      extraQuote,
      streak,
      topics,
      selectedTopics,
      savedCount,
      systemScheme,
    ]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const status = await getNotificationPermissionStatus();
      if (cancelled) return;
      if (status !== snapshot.notificationSettings.permission_status) {
        const next = await persistNotificationSettings({ permission_status: status });
        if (cancelled) return;
        setSnapshot((current) => ({ ...current, notificationSettings: next }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [snapshot.notificationSettings.permission_status]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") return;
      if (notificationSyncInProgressRef.current) return;
      notificationSyncInProgressRef.current = true;
      void (async () => {
        try {
          const currentOffset = new Date().getTimezoneOffset();
          const storedRaw = await getAppState(
            APP_STATE_KEYS.lastNotificationTimezoneOffset
          );
          const storedOffset =
            storedRaw !== null ? Number(storedRaw) : null;
          if (storedOffset !== null && storedOffset !== currentOffset) {
            // Timezone or DST changed; sync below reschedules for current local time.
          }

          const status = await getNotificationPermissionStatus();
          const next = await persistNotificationSettings({ permission_status: status });
          setSnapshot((current) => ({ ...current, notificationSettings: next }));
          await syncNotificationSchedule(next);
          await persistTimezoneOffsetAfterSync();

          // Push current day's quote to widget so it shows real content (not placeholder).
          const dayKey = getDayKey();
          const primary = await getOrCreateTodayQuote(dayKey);
          const scheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
          syncTodayWidgetTimeline({
            quote: primary.type === "success" ? primary.data : null,
            scheme,
          });
        } finally {
          notificationSyncInProgressRef.current = false;
        }
      })();
    });
    return () => subscription.remove();
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("AppProvider is missing");
  }
  return value;
}
