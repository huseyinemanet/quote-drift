jest.mock("expo-widgets", () => ({
  Widget: jest.fn(),
}));

import { Widget } from "expo-widgets";

import type { QuoteView } from "@/core/types";
import { DAILY_QUOTE_WIDGET_LAYOUT } from "@/core/widget/layout";
import {
  buildTodayWidgetTimelineEntries,
  syncTodayWidgetTimeline,
} from "@/core/widget/sync";

const widgetInstance = {
  updateTimeline: jest.fn(),
};

const WidgetMock = Widget as unknown as jest.Mock;

const quote: QuoteView = {
  id: "quote-7",
  text: "The soul becomes dyed with the color of its thoughts.",
  author: "Marcus Aurelius",
  authorId: "marcus-aurelius",
  source: undefined,
  tags: ["stoicism"],
  primaryTag: "stoicism",
  saved: false,
};

describe("widget sync", () => {
  beforeEach(() => {
    widgetInstance.updateTimeline.mockClear();
    WidgetMock.mockReset();
    WidgetMock.mockImplementation(() => widgetInstance);
  });

  it("stores the widget layout as a function string", () => {
    expect(DAILY_QUOTE_WIDGET_LAYOUT.startsWith("function(props)")).toBe(true);
  });

  it("builds an immediate timeline entry plus next-midnight refresh", () => {
    const now = new Date(2026, 2, 6, 22, 15, 0, 0);
    const entries = buildTodayWidgetTimelineEntries({
      quote,
      scheme: "dark",
      now,
    });

    expect(entries).toHaveLength(2);
    expect(entries[0]?.props.quoteId).toBe("quote-7");
    expect(entries[0]?.props.deepLink).toBe("quotify://today");
    expect(entries[1]?.date.getDate()).toBe(7);
    expect(entries[1]?.props.quoteId).toBe("placeholder");
  });

  it("uses a placeholder payload when no quote is available", () => {
    const entries = buildTodayWidgetTimelineEntries({
      quote: null,
      scheme: "light",
      now: new Date(2026, 2, 6, 8, 0, 0, 0),
    });

    expect(entries[0]?.props.quoteId).toBe("placeholder");
    expect(entries[0]?.props.deepLink).toBe("quotify://today");
  });

  it("pushes the timeline to the widget instance", () => {
    syncTodayWidgetTimeline({
      quote,
      scheme: "dark",
      now: new Date(2026, 2, 6, 10, 0, 0, 0),
    });

    expect(WidgetMock).toHaveBeenCalledTimes(1);
    expect(widgetInstance.updateTimeline).toHaveBeenCalledTimes(1);
    expect(widgetInstance.updateTimeline.mock.calls[0]?.[0]).toHaveLength(2);
  });
});
