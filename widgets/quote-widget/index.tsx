"widget";

import { createWidget } from "expo-widgets";

import {
  DAILY_QUOTE_WIDGET_LAYOUT,
  DAILY_QUOTE_WIDGET_NAME,
} from "@/core/widget/layout";
import type { WidgetQuotePayload } from "@/core/widget/types";

export const quoteWidget = createWidget<WidgetQuotePayload>(
  DAILY_QUOTE_WIDGET_NAME,
  DAILY_QUOTE_WIDGET_LAYOUT as unknown as never
);
