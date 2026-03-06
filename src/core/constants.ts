export const APP_STATE_KEYS = {
  corpusHash: "corpus_hash",
  corpusInvalidIssues: "corpus_invalid_issues",
  onboardingComplete: "onboarding_complete",
  selectedTopics: "selected_topics",
} as const;

export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: 0,
  frequency_per_day: 1,
  active_start_minute: 9 * 60 + 30,
  active_end_minute: 20 * 60 + 30,
  pause_until: null,
  permission_status: "undetermined",
} as const;

export const NOTIFICATION_CHANNEL_ID = "daily-quotes";

export const TOPIC_OPTIONS = [
  "resilience",
  "creativity",
  "focus",
  "kindness",
  "growth",
  "courage",
  "clarity",
  "gratitude",
  "balance",
  "patience",
  "curiosity",
  "discipline",
] as const;

export const TEST_NOTIFICATION_COPY = {
  title: "Quote Drift test",
  body: "Notifications are working. Your quote collection remains untouched.",
};
