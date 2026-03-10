import { Platform } from "react-native";

import type { QuoteView } from "@/core/types";

/**
 * Updates the Siri quote cache in App Group UserDefaults so the Get Quote App Intent
 * can read and speak it when the user says "Hey Siri, give me a quote".
 * No-op on non-iOS or if the native module is unavailable.
 */
export function syncSiriQuote(quote: QuoteView | null): void {
  if (Platform.OS !== "ios") {
    return;
  }
  try {
    const QuotifySiriQuote = require("../../modules/quotify-siri-quote").default;
    if (quote) {
      QuotifySiriQuote.setSiriQuote(quote.text.trim(), quote.author.trim());
    } else {
      QuotifySiriQuote.clearSiriQuote();
    }
  } catch {
    if (__DEV__) {
      console.warn("[SiriQuote] Native module unavailable, skipping Siri quote sync.");
    }
  }
}
