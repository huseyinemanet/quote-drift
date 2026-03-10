import { Widget } from "expo-widgets";

import type { WidgetQuotePayload } from "./types";

export const DAILY_QUOTE_WIDGET_NAME = "DailyQuoteWidget";

export const DAILY_QUOTE_WIDGET_LAYOUT = String.raw`function(props) {
  const theme = props && props.theme === "dark"
    ? {
        background: "#141915",
        border: "#314035",
        text: "#eff3ec",
        muted: "#b0bbaf",
        accent: "#d7b18a"
      }
    : {
        background: "#f5efe2",
        border: "#d7ccb8",
        text: "#1c2421",
        muted: "#5d675f",
        accent: "#8b5e3c"
      };
  const family = (props && (props.family === "systemMedium" || props.family === "accessoryRectangular" || props.family === "accessoryInline" || props.family === "accessoryCircular"))
    ? props.family
    : "systemSmall";
  const quoteText = typeof props?.text === "string" && props.text.trim().length > 0
    ? props.text.replace(/\s+/g, " ").trim()
    : "Open Quotify to load today's quote.";
  const authorName = typeof props?.authorName === "string" && props.authorName.trim().length > 0
    ? props.authorName.trim()
    : "Quotify";
  const category = typeof props?.category === "string" && props.category.trim().length > 0
    ? props.category.trim()
    : null;
  const limit = family === "systemSmall" ? 120 : family === "systemMedium" ? 200 : family === "accessoryRectangular" ? 100 : family === "accessoryCircular" ? 20 : 50;
  const normalizedQuote = quoteText.length <= limit
    ? quoteText
    : (function() {
        const slice = quoteText.slice(0, Math.max(0, limit - 1)).trimEnd();
        const lastSpace = slice.lastIndexOf(" ");
        const safeSlice = lastSpace > limit * 0.6 ? slice.slice(0, lastSpace) : slice;
        return safeSlice.trimEnd() + "…";
      })();

  if (family === "accessoryInline") {
    return React.createElement(
      Text,
      {
        modifiers: [
          font({ size: 14, weight: "medium", design: "rounded" }),
          foregroundStyle(theme.text),
          lineLimit(1),
          truncationMode("tail")
        ]
      },
      normalizedQuote
    );
  }
  if (family === "accessoryRectangular") {
    return React.createElement(
      VStack,
      {
        spacing: 6,
        modifiers: [
          frame({ maxWidth: 1000, maxHeight: 1000, alignment: "topLeading" }),
          padding({ all: 10 })
        ]
      },
      React.createElement(
        Text,
        {
          modifiers: [
            font({ size: 12, weight: "medium", design: "serif" }),
            foregroundStyle(theme.text),
            lineLimit(3),
            truncationMode("tail")
          ]
        },
        normalizedQuote
      ),
      React.createElement(
        Text,
        {
          modifiers: [
            font({ size: 10, weight: "regular", design: "rounded" }),
            foregroundStyle(theme.muted),
            lineLimit(1),
            truncationMode("tail")
          ]
        },
        authorName
      )
    );
  }
  if (family === "accessoryCircular") {
    return React.createElement(
      Text,
      {
        modifiers: [
          font({ size: 11, weight: "semibold", design: "rounded" }),
          foregroundStyle(theme.text),
          lineLimit(1),
          truncationMode("tail")
        ]
      },
      quoteText === "Open Quotify to load today's quote." ? "Daily Quote" : normalizedQuote
    );
  }
  return React.createElement(
    VStack,
    {
      spacing: family === "systemSmall" ? 10 : 12,
      modifiers: [
        frame({ maxWidth: 1000, maxHeight: 1000, alignment: "topLeading" }),
        padding({ all: family === "systemSmall" ? 16 : 18 }),
        background(
          theme.background,
          shapes.roundedRectangle({
            cornerRadius: family === "systemSmall" ? 24 : 28,
            roundedCornerStyle: "continuous"
          })
        ),
        border({ color: theme.border, width: 1 })
      ]
    },
    category && family === "systemMedium"
      ? React.createElement(
          Text,
          {
            modifiers: [
              font({ size: 11, weight: "semibold", design: "rounded" }),
              foregroundStyle(theme.accent),
              kerning(0.4),
              lineLimit(1),
              truncationMode("tail")
            ]
          },
          category
        )
      : null,
    React.createElement(
      Text,
      {
        modifiers: [
          font({
            size: family === "systemSmall" ? 18 : 20,
            weight: "medium",
            design: "serif"
          }),
          foregroundStyle(theme.text),
          lineLimit(family === "systemSmall" ? 4 : 5),
          lineSpacing(family === "systemSmall" ? 2 : 3),
          multilineTextAlignment("leading"),
          truncationMode("tail"),
          fixedSize({ vertical: true })
        ]
      },
      normalizedQuote
    ),
    React.createElement(Spacer, null),
    React.createElement(
      HStack,
      { spacing: 8, alignment: "bottom" },
      React.createElement(
        Text,
        {
          modifiers: [
            font({ size: 12, weight: "regular", design: "rounded" }),
            foregroundStyle(theme.muted),
            lineLimit(1),
            truncationMode("tail"),
            frame({ maxWidth: 1000, alignment: "leading" })
          ]
        },
        authorName
      ),
      React.createElement(Spacer, null),
      React.createElement(
        Text,
        {
          modifiers: [
            font({ size: 10, weight: "semibold", design: "rounded" }),
            foregroundStyle(theme.accent),
            kerning(0.3)
          ]
        },
        "Quotify"
      )
    )
  );
}`;

export function createDailyQuoteWidget() {
  return new Widget<WidgetQuotePayload>(
    DAILY_QUOTE_WIDGET_NAME,
    DAILY_QUOTE_WIDGET_LAYOUT as unknown as never
  );
}
