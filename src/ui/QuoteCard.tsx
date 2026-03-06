import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { QuoteView } from "@/core/types";

import { ThemeTokens, useTheme } from "./theme";

export function QuoteCard({
  quote,
  eyebrow,
  hideAuthor = false,
  onPressAuthor,
  isExpanded = true,
  onToggleExpanded,
  maxCollapsedLines = 8,
}: {
  quote: QuoteView;
  eyebrow: string;
  hideAuthor?: boolean;
  onPressAuthor?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  maxCollapsedLines?: number;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const authorLabel = <Text style={styles.author}>{quote.author}</Text>;
  const [isTruncated, setIsTruncated] = useState(false);
  const canCollapse = quote.text.length > 150 || isTruncated || isExpanded;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text
        onTextLayout={(event) => {
          if (isExpanded) {
            return;
          }
          setIsTruncated(event.nativeEvent.lines.length > maxCollapsedLines);
        }}
        numberOfLines={isExpanded ? undefined : maxCollapsedLines}
        style={styles.text}
      >
        {quote.text}
      </Text>
      {canCollapse && onToggleExpanded ? (
        <Pressable accessibilityRole="button" onPress={onToggleExpanded}>
          <Text style={styles.expandLabel}>
            {isExpanded ? "Show less" : "Read full quote"}
          </Text>
        </Pressable>
      ) : null}
      {!hideAuthor ? (
        onPressAuthor ? (
          <Pressable accessibilityRole="button" onPress={onPressAuthor}>
            {authorLabel}
          </Pressable>
        ) : (
          authorLabel
        )
      ) : null}
      <View style={styles.metaRow}>
        {quote.primaryTag ? <Text style={styles.meta}>#{quote.primaryTag}</Text> : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.accent,
    },
    text: {
      fontSize: 30,
      lineHeight: 42,
      letterSpacing: -0.45,
      color: colors.text,
      fontFamily: "SourceSerif4_400Regular",
    },
    author: {
      fontSize: 17,
      color: colors.text,
      fontWeight: "600",
    },
    expandLabel: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500",
      color: colors.textMuted,
    },
    metaRow: {
      gap: 4,
      marginTop: 2,
    },
    meta: {
      alignSelf: "flex-start",
      fontSize: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: colors.background,
    },
  });
