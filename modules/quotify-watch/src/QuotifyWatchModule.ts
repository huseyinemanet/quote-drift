import { requireNativeModule } from "expo";

type WatchSyncPayload = {
  dayKey: string;
  quotes: Array<{ id: string; text: string; author: string; kind: "daily" | "extra" }>;
};

interface QuotifyWatchModule {
  syncQuotesToWatch(payload: WatchSyncPayload): void;
}

export default requireNativeModule<QuotifyWatchModule>("QuotifyWatch");
