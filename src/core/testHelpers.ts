import type { QuoteRecord } from "./types";

export function getAvailableCandidates(input: {
  allQuotes: QuoteRecord[];
  usedQuoteIds: Set<string>;
  reservedQuoteIds: Set<string>;
}) {
  return input.allQuotes.filter(
    (quote) =>
      !input.usedQuoteIds.has(quote.id) && !input.reservedQuoteIds.has(quote.id)
  );
}

export function reserveUniqueQuotes(input: {
  allQuotes: QuoteRecord[];
  existingUsedIds: Set<string>;
  existingReservedIds: Set<string>;
  notificationIds: string[];
}) {
  const used = new Set(input.existingUsedIds);
  const reserved = new Set(input.existingReservedIds);

  return input.notificationIds.map((notificationId) => {
    const candidate = getAvailableCandidates({
      allQuotes: input.allQuotes,
      usedQuoteIds: used,
      reservedQuoteIds: reserved,
    })[0];

    if (!candidate) {
      throw new Error("Exhausted");
    }

    used.add(candidate.id);
    reserved.add(candidate.id);

    return {
      notificationId,
      quoteId: candidate.id,
    };
  });
}
