import quotesJson from "../../assets/quotes.json";
import { quotesSchema } from "./schema";
import type { QuoteRecord } from "./types";

export function getBundledQuotes() {
  return quotesJson as QuoteRecord[];
}

export function validateBundledQuotes() {
  return quotesSchema.safeParse(getBundledQuotes());
}
