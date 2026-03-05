import { buildScheduleTimes } from "@/core/scheduleUtils";
import { getAvailableCandidates, reserveUniqueQuotes } from "@/core/testHelpers";
import type { QuoteRecord } from "@/core/types";

function buildQuotes(count: number): QuoteRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `q-${index + 1}`,
    text: `Quote ${index + 1}`,
    author: "Tester",
    tags: ["growth"],
  }));
}

describe("quote selection invariants", () => {
  it("never repeats across mixed today and notification claims until exhausted", () => {
    const allQuotes = buildQuotes(5);
    const used = new Set<string>(["q-1", "q-2"]);
    const reserved = new Set<string>(["q-3"]);

    const remaining = getAvailableCandidates({
      allQuotes,
      usedQuoteIds: used,
      reservedQuoteIds: reserved,
    });

    expect(remaining.map((quote) => quote.id)).toEqual(["q-4", "q-5"]);

    used.add("q-4");
    const exhausted = getAvailableCandidates({
      allQuotes,
      usedQuoteIds: used,
      reservedQuoteIds: new Set(["q-3", "q-5"]),
    });

    expect(exhausted).toHaveLength(0);
  });

  it("reschedules cleanly by reusing the pool only after old reservations are cleared", () => {
    const allQuotes = buildQuotes(4);
    const firstRun = reserveUniqueQuotes({
      allQuotes,
      existingUsedIds: new Set(),
      existingReservedIds: new Set(),
      notificationIds: ["n1", "n2"],
    });

    expect(firstRun.map((item) => item.quoteId)).toEqual(["q-1", "q-2"]);

    expect(() =>
      reserveUniqueQuotes({
        allQuotes,
        existingUsedIds: new Set(firstRun.map((item) => item.quoteId)),
        existingReservedIds: new Set(firstRun.map((item) => item.quoteId)),
        notificationIds: ["n3", "n4", "n5"],
      })
    ).toThrow("Exhausted");

    const secondRun = reserveUniqueQuotes({
      allQuotes,
      existingUsedIds: new Set(),
      existingReservedIds: new Set(),
      notificationIds: ["n3", "n4"],
    });

    expect(secondRun.map((item) => item.quoteId)).toEqual(["q-1", "q-2"]);
  });

  it("builds schedule times inside the active window", () => {
    const reference = new Date("2026-03-06T08:00:00.000Z");
    const times = buildScheduleTimes(570, 1230, 3, reference);

    expect(times).toHaveLength(3);
    for (const time of times) {
      const minute = time.getHours() * 60 + time.getMinutes();
      expect(minute).toBeGreaterThanOrEqual(570);
      expect(minute).toBeLessThanOrEqual(1230);
    }
  });
});
