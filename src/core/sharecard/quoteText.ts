import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";

type QuoteTextPayload = {
  text: string;
  author: string;
};

export function formatQuoteText(quote: QuoteTextPayload) {
  return `"${quote.text}" — ${quote.author}`;
}

export async function copyQuoteText(quote: QuoteTextPayload) {
  await Clipboard.setStringAsync(formatQuoteText(quote));
}

export async function shareQuoteText(quote: QuoteTextPayload) {
  await Share.share({ message: formatQuoteText(quote) });
}
