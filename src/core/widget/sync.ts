import type { WidgetTimelineEntry } from "expo-widgets";

import { getDayKey, getNextLocalMidnight } from "@/core/date";
import type { QuoteView } from "@/core/types";

import {
  buildTodayWidgetPayload,
  createPlaceholderWidgetPayload,
} from "./payload";
import { createDailyQuoteWidget } from "./layout";
import type { WidgetQuotePayload, WidgetTheme } from "./types";

export function buildTodayWidgetTimelineEntries(args?: {
  quote?: QuoteView | null;
  scheme?: WidgetTheme;
  now?: Date;
}) {
  const now = args?.now ?? new Date();
  const scheme = args?.scheme ?? "light";
  const dayKey = getDayKey(now);
  const currentPayload = args?.quote
    ? buildTodayWidgetPayload(args.quote, { scheme, dayKey })
    : createPlaceholderWidgetPayload({ scheme, now });
  const nextRefresh = getNextLocalMidnight(now);
  const refreshPayload = createPlaceholderWidgetPayload({
    scheme,
    now: nextRefresh,
  });

  return [
    { date: now, props: currentPayload },
    { date: nextRefresh, props: refreshPayload },
  ] satisfies WidgetTimelineEntry<WidgetQuotePayload>[];
}

export function syncTodayWidgetTimeline(args?: {
  quote?: QuoteView | null;
  scheme?: WidgetTheme;
  now?: Date;
}) {
  try {
    createDailyQuoteWidget().updateTimeline(buildTodayWidgetTimelineEntries(args));
  } catch {
    // Widgets are unavailable in Expo Go and other runtimes without the native target.
  }
}
