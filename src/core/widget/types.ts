export type WidgetTheme = "light" | "dark";

export type WidgetDisplayFamily =
  | "systemSmall"
  | "systemMedium"
  | "accessoryRectangular"
  | "accessoryInline"
  | "accessoryCircular";

export type WidgetQuotePayload = {
  quoteId: string;
  text: string;
  authorName: string;
  category?: string;
  dateKey: string;
  deepLink: string;
  theme: WidgetTheme;
};
