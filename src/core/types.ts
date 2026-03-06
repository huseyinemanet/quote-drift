export type QuoteRecord = {
  id: string;
  text: string;
  author: string;
  tags: string[];
  source?: string;
};

export type Author = {
  id: string;
  name: string;
  slug?: string;
  shortBio?: string;
  description?: string;
  tags?: string[];
};

export type BootstrapState =
  | "loading"
  | "ready"
  | "onboarding"
  | "fatalCorpus"
  | "exhausted";

export type NotificationPermissionStatus =
  | "undetermined"
  | "granted"
  | "denied"
  | "unavailable";

export type NotificationSettings = {
  enabled: boolean;
  frequency_per_day: 1 | 2 | 3;
  active_start_minute: number;
  active_end_minute: number;
  pause_until: number | null;
  permission_status: NotificationPermissionStatus;
  updated_at: number;
};

export type TodayQuoteState = {
  day_key: string;
  quote_id: string;
  extra_quote_id: string | null;
};

export type QuoteView = QuoteRecord & {
  authorId: string;
  primaryTag: string | null;
  saved: boolean;
};

export type ShareableQuote = Pick<
  QuoteView,
  "id" | "text" | "author" | "source" | "primaryTag"
>;

export type ExhaustedResult = {
  type: "exhausted";
};

export type InvalidCorpusResult = {
  type: "invalid-corpus";
  issues: string[];
};

export type SuccessResult<T> = {
  type: "success";
  data: T;
};

export type AlreadyClaimedResult = {
  type: "already-claimed";
};

export type Result<T> =
  | SuccessResult<T>
  | ExhaustedResult
  | InvalidCorpusResult
  | AlreadyClaimedResult;

export type ScheduleReservation = {
  notificationId: string;
  quoteId: string;
  fireAt: number;
  dayKey: string;
};

export type AppBootstrapSnapshot = {
  state: BootstrapState;
  hasLibraryContent: boolean;
  invalidIssues: string[];
  onboardingComplete: boolean;
  notificationSettings: NotificationSettings;
};
