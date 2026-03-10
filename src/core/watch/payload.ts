import { getDayKey } from "@/core/date";
import type { QuoteView } from "@/core/types";

import type { WatchQuoteItem, WatchQuoteKind, WatchSyncPayload } from "./types";

/** Character limit for quote text on the Watch (small screen). */
export const WATCH_QUOTE_LIMIT = 120;

/** Max author length sent to Watch (truncate with … if longer). */
export const WATCH_AUTHOR_LIMIT = 40;

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Smart truncation: cut at last space in the last ~third of the range when possible,
 * so the cut doesn’t break mid-word or mid-sentence.
 */
export function truncateQuoteForWatch(text: string, max = WATCH_QUOTE_LIMIT): string {
  const normalized = normalizeText(text);
  if (normalized.length <= max) {
    return normalized;
  }
  const slice = normalized.slice(0, Math.max(0, max - 1)).trimEnd();
  const lastSpace = slice.lastIndexOf(" ");
  const minSpaceIndex = Math.floor(max * 0.6);
  const truncated =
    lastSpace >= minSpaceIndex ? slice.slice(0, lastSpace) : slice;
  return `${truncated.trimEnd()}…`;
}

function truncateAuthorForWatch(author: string): string {
  const normalized = normalizeText(author);
  if (normalized.length <= WATCH_AUTHOR_LIMIT) {
    return normalized;
  }
  return `${normalized.slice(0, WATCH_AUTHOR_LIMIT - 1).trimEnd()}…`;
}

function toWatchQuoteItem(quote: QuoteView, kind: WatchQuoteKind): WatchQuoteItem {
  return {
    id: quote.id,
    text: truncateQuoteForWatch(quote.text),
    author: truncateAuthorForWatch(quote.author),
    kind,
  };
}

/**
 * Builds the payload to send to the Watch via WatchConnectivity.
 * Includes daily quote and optional extra quote (for swipe), with kind for labels.
 */
export function buildWatchPayload(args: {
  todayQuote: QuoteView | null;
  extraQuote: QuoteView | null;
  now?: Date;
}): WatchSyncPayload {
  const dayKey = args.now ? getDayKey(args.now) : getDayKey();
  const quotes: WatchQuoteItem[] = [];
  if (args.todayQuote) {
    quotes.push(toWatchQuoteItem(args.todayQuote, "daily"));
  }
  if (args.extraQuote) {
    quotes.push(toWatchQuoteItem(args.extraQuote, "extra"));
  }
  return { dayKey, quotes };
}
