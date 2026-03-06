import { Pressable, StyleSheet, Text, View } from "react-native";

import type { QuoteView } from "@/core/types";

import { Button } from "./Button";
import { ThemeTokens, useTheme } from "./theme";

type Props = {
  quote: QuoteView;
  onToggleSave: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onPressAuthor?: () => void;
  showAuthor?: boolean;
  showShare?: boolean;
  compact?: boolean;
};

export function QuoteListItem({
  quote,
  onToggleSave,
  onShare,
  onCopy,
  onPressAuthor,
  showAuthor = true,
  showShare = true,
  compact = false,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const authorLabel = (
    <Text style={styles.quoteAuthor}>{quote.author}</Text>
  );

  return (
    <View style={styles.quoteRow}>
      <Text numberOfLines={compact ? 3 : 4} style={[styles.quoteText, compact ? styles.quoteTextCompact : null]}>
        {quote.text}
      </Text>
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
          label={quote.saved ? "Saved" : "Save"}
          variant="ghost"
          onPress={onToggleSave}
        />
        {onCopy ? (
          <Button
            label="Copy"
            variant="ghost"
            onPress={onCopy}
          />
        ) : null}
        {showShare && onShare ? (
          <Button
            label="Share"
            variant="ghost"
            onPress={onShare}
          />
        ) : null}
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
      gap: 10,
    },
    quoteText: {
      fontSize: 17,
      lineHeight: 25,
      color: colors.text,
    },
    quoteTextCompact: {
      fontSize: 16,
      lineHeight: 23,
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
      alignSelf: "flex-start",
      color: colors.textMuted,
      fontSize: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: colors.background,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
  });
