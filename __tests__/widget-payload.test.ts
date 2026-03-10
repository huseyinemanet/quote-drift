import type { QuoteView } from "@/core/types";
import {
  buildTodayWidgetPayload,
  createPlaceholderWidgetPayload,
  truncateQuoteForWidget,
} from "@/core/widget/payload";

const quote: QuoteView = {
  id: "quote-1",
  text: "The obstacle is the way when you stop fighting the lesson hidden inside the day.",
  author: "Marcus Aurelius",
  authorId: "marcus-aurelius",
  source: undefined,
  tags: ["stoicism"],
  primaryTag: "stoicism",
  saved: false,
};

describe("widget payload", () => {
  it("maps a today quote into widget props", () => {
    expect(
      buildTodayWidgetPayload(quote, {
        scheme: "dark",
        dayKey: "2026-03-06",
      })
    ).toEqual({
      quoteId: "quote-1",
      text: quote.text,
      authorName: "Marcus Aurelius",
      category: "stoicism",
      dateKey: "2026-03-06",
      deepLink: "quotify://today",
      theme: "dark",
    });
  });

  it("creates a safe placeholder payload", () => {
    expect(
      createPlaceholderWidgetPayload({
        scheme: "light",
        now: new Date(2026, 2, 6, 9, 30, 0, 0),
      })
    ).toEqual({
      quoteId: "placeholder",
      text: "Open Quotify to load today's quote.",
      authorName: "Quotify",
      dateKey: "2026-03-06",
      deepLink: "quotify://today",
      theme: "light",
    });
  });

  it("does not truncate short quotes", () => {
    expect(truncateQuoteForWidget("Stay present.", "systemSmall")).toBe(
      "Stay present."
    );
  });

  it("truncates long small-widget quotes within the target cap", () => {
    const truncated = truncateQuoteForWidget(
      "A very long quote that keeps going long enough to exceed the safe limit for the small widget layout without preserving every single trailing word in the rendered widget.",
      "systemSmall"
    );

    expect(truncated.length).toBeLessThanOrEqual(120);
    expect(truncated.endsWith("…")).toBe(true);
  });

  it("truncates medium-widget quotes within the target cap", () => {
    const truncated = truncateQuoteForWidget(
      "A medium widget can carry a little more language, but it still needs a deterministic cap so the layout never breaks when a quote is unusually long and dense with clauses and punctuation.",
      "systemMedium"
    );

    expect(truncated.length).toBeLessThanOrEqual(200);
  });

  it("truncates accessoryCircular to short label length", () => {
    expect(truncateQuoteForWidget("Daily Quote", "accessoryCircular")).toBe(
      "Daily Quote"
    );
    const truncated = truncateQuoteForWidget(
      "A quote that is too long for the circular lock screen widget.",
      "accessoryCircular"
    );
    expect(truncated.length).toBeLessThanOrEqual(20);
    expect(truncated.endsWith("…")).toBe(true);
  });
});
