import { Pressable, StyleSheet, Text, View } from "react-native";

import type { QuoteView } from "@/core/types";

import { Button } from "./Button";
import { ThemeTokens, useTheme } from "./theme";

type Props = {
  quote: QuoteView;
  onToggleSave: () => void;
  onShare: () => void;
  onCopy?: () => void;
  onPressAuthor?: () => void;
  showAuthor?: boolean;
};

export function QuoteListItem({
  quote,
  onToggleSave,
  onShare,
  onCopy,
  onPressAuthor,
  showAuthor = true,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const authorLabel = (
    <Text style={styles.quoteAuthor}>{quote.author}</Text>
  );

  return (
    <View style={styles.quoteRow}>
      <Text style={styles.quoteText}>{quote.text}</Text>
      {showAuthor ? (
        onPressAuthor ? (
          <Pressable accessibilityRole="button" onPress={onPressAuthor}>
            {authorLabel}
          </Pressable>
        ) : (
          authorLabel
        )
      ) : null}
      <View style={styles.quoteMeta}>
        {quote.primaryTag ? <Text style={styles.meta}>#{quote.primaryTag}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Button
          label={quote.saved ? "Unsave" : "Save"}
          variant="secondary"
          onPress={onToggleSave}
        />
        {onCopy ? (
          <Button
            label="Copy"
            variant="ghost"
            onPress={onCopy}
          />
        ) : null}
        <Button
          label="Share"
          variant="ghost"
          onPress={onShare}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    quoteRow: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 16,
      gap: 8,
    },
    quoteText: {
      fontSize: 18,
      lineHeight: 26,
      color: colors.text,
    },
    quoteAuthor: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    quoteMeta: {
      gap: 2,
    },
    meta: {
      color: colors.textMuted,
      fontSize: 13,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap",
    },
  });
