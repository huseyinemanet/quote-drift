export type WatchQuoteKind = "daily" | "extra";

export type WatchQuoteItem = {
  id: string;
  text: string;
  author: string;
  kind: WatchQuoteKind;
};

export type WatchSyncPayload = {
  dayKey: string;
  quotes: WatchQuoteItem[];
};
