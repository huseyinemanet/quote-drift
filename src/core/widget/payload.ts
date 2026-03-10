import { z } from "zod";

import { getDayKey } from "@/core/date";
import type { QuoteView } from "@/core/types";

import type { WidgetDisplayFamily, WidgetQuotePayload, WidgetTheme } from "./types";

const SMALL_QUOTE_LIMIT = 120;
const MEDIUM_QUOTE_LIMIT = 200;
const ACCESSORY_INLINE_QUOTE_LIMIT = 50;
const ACCESSORY_RECTANGULAR_QUOTE_LIMIT = 100;
const ACCESSORY_CIRCULAR_LABEL_LIMIT = 20;
const DEFAULT_DEEP_LINK = "quotify://today";
const PLACEHOLDER_TEXT = "Open Quotify to load today's quote.";
const PLACEHOLDER_AUTHOR = "Quotify";

export const widgetQuotePayloadSchema = z.object({
  quoteId: z.string().min(1),
  text: z.string().min(1),
  authorName: z.string().min(1),
  category: z.string().min(1).optional(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deepLink: z.string().min(1),
  theme: z.enum(["light", "dark"]),
});

function getCharacterLimit(family: WidgetDisplayFamily) {
  switch (family) {
    case "systemSmall":
      return SMALL_QUOTE_LIMIT;
    case "systemMedium":
      return MEDIUM_QUOTE_LIMIT;
    case "accessoryRectangular":
      return ACCESSORY_RECTANGULAR_QUOTE_LIMIT;
    case "accessoryInline":
      return ACCESSORY_INLINE_QUOTE_LIMIT;
    case "accessoryCircular":
      return ACCESSORY_CIRCULAR_LABEL_LIMIT;
    default:
      return MEDIUM_QUOTE_LIMIT;
  }
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function truncateQuoteForWidget(text: string, family: WidgetDisplayFamily) {
  const normalized = normalizeText(text);
  const limit = getCharacterLimit(family);

  if (normalized.length <= limit) {
    return normalized;
  }

  const slice = normalized.slice(0, Math.max(0, limit - 1)).trimEnd();
  const lastSpace = slice.lastIndexOf(" ");
  const truncated = lastSpace > limit * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${truncated.trimEnd()}…`;
}

export function createPlaceholderWidgetPayload(input?: {
  scheme?: WidgetTheme;
  now?: Date;
}): WidgetQuotePayload {
  const date = input?.now ?? new Date();
  const scheme = input?.scheme ?? "light";

  return {
    quoteId: "placeholder",
    text: PLACEHOLDER_TEXT,
    authorName: PLACEHOLDER_AUTHOR,
    dateKey: getDayKey(date),
    deepLink: DEFAULT_DEEP_LINK,
    theme: scheme,
  };
}

export function buildTodayWidgetPayload(
  quote: QuoteView,
  input: { scheme: WidgetTheme; dayKey: string }
): WidgetQuotePayload {
  const payload: WidgetQuotePayload = {
    quoteId: quote.id,
    text: normalizeText(quote.text),
    authorName: normalizeText(quote.author),
    category: quote.primaryTag ?? undefined,
    dateKey: input.dayKey,
    deepLink: DEFAULT_DEEP_LINK,
    theme: input.scheme,
  };

  return widgetQuotePayloadSchema.parse(payload);
}
