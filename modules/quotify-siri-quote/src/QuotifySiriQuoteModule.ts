import { requireNativeModule } from "expo";

interface QuotifySiriQuoteModule {
  setSiriQuote(text: string, author: string): void;
  clearSiriQuote(): void;
}

export default requireNativeModule<QuotifySiriQuoteModule>("QuotifySiriQuote");
