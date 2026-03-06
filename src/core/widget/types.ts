export type WidgetTheme = "light" | "dark";

export type WidgetDisplayFamily = "systemSmall" | "systemMedium";

export type WidgetQuotePayload = {
  quoteId: string;
  text: string;
  authorName: string;
  category?: string;
  dateKey: string;
  deepLink: string;
  theme: WidgetTheme;
};
