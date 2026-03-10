import { Platform } from "react-native";

import type { QuoteView } from "@/core/types";

import { buildWatchPayload } from "./payload";
let lastSyncedPayloadJson: string | null = null;

/**
 * Syncs today's quote (and optional extra quote) to the Apple Watch via WatchConnectivity.
 * Skips if payload is unchanged. No-op on non-iOS or if the native module / Watch is unavailable.
 */
export function syncQuotesToWatch(args: {
  todayQuote: QuoteView | null;
  extraQuote: QuoteView | null;
}) {
  if (Platform.OS !== "ios") {
    return;
  }
  const payload = buildWatchPayload(args);
  const payloadJson = JSON.stringify(payload);
  if (lastSyncedPayloadJson === payloadJson) {
    return;
  }
  try {
    const QuotifyWatch = require("../../../modules/quotify-watch").default;
    QuotifyWatch.syncQuotesToWatch(payload);
    lastSyncedPayloadJson = payloadJson;
  } catch {
    if (__DEV__) {
      console.warn("[WatchSync] Native watch module unavailable, skipping sync.");
    }
  }
}
