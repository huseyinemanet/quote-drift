import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { useColorScheme } from "react-native";

import { APP_STATE_KEYS } from "./constants";
import { getDayKey } from "./date";
import { getAppState, getDb, runMigrations, setAppState } from "./db";
import { importQuotesIfNeeded } from "./importQuotes";
import { cleanupTempFiles } from "./sharecard/cleanupTempFiles";
import { syncTodayWidgetTimeline } from "./widget/sync";
import { initializeMobileAds } from "./ads/admob";
import {
  getNotificationPermissionStatus,
  getNotificationSettings,
  pauseNotifications,
  persistNotificationSettings,
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
};

const AppContext = createContext<AppContextValue | null>(null);

async function readSnapshot(): Promise<AppBootstrapSnapshot> {
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

  const refreshAllInternal = async (shouldSyncWidget: boolean) => {
    const nextSnapshot = await readSnapshot();
    setSnapshot(nextSnapshot);
    setTopics(await getAvailableTopics());
    setSavedCount(await getSavedCount());
    setStreak(await getDaysReadStreak());

    const rawTopics = await getAppState(APP_STATE_KEYS.selectedTopics);
    setSelectedTopicsState(rawTopics ? (JSON.parse(rawTopics) as string[]) : []);

    if (nextSnapshot.state === "ready" || nextSnapshot.state === "exhausted") {
      const primary = await getOrCreateTodayQuote(getDayKey());
      if (primary.type === "success") {
        setTodayQuote(primary.data);
        if (shouldSyncWidget) {
          syncTodayWidgetTimeline({
            quote: primary.data,
            scheme: systemScheme === "dark" ? "dark" : "light",
          });
        }
      } else {
        setTodayQuote(null);
        setSnapshot((current) => ({ ...current, state: "exhausted" }));
        if (shouldSyncWidget) {
          syncTodayWidgetTimeline({
            quote: null,
            scheme: systemScheme === "dark" ? "dark" : "light",
          });
        }
      }
      setExtraQuote(await getExtraTodayQuote(getDayKey()));
    } else {
      setTodayQuote(null);
      setExtraQuote(null);
      if (shouldSyncWidget) {
        syncTodayWidgetTimeline({
          quote: null,
          scheme: systemScheme === "dark" ? "dark" : "light",
        });
      }
    }
  };

  const refreshAll = async () => {
    await refreshAllInternal(true);
  };

  useEffect(() => {
    void refreshAll();
  }, []);

  useEffect(() => {
    void cleanupTempFiles();
  }, []);

  useEffect(() => {
    void initializeMobileAds();
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
    void (async () => {
      const status = await getNotificationPermissionStatus();
      if (status !== snapshot.notificationSettings.permission_status) {
        const next = await persistNotificationSettings({ permission_status: status });
        setSnapshot((current) => ({ ...current, notificationSettings: next }));
      }
    })();
  }, [snapshot.notificationSettings.permission_status]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("AppProvider is missing");
  }
  return value;
}
