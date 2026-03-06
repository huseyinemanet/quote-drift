import { StyleSheet, Text, View } from "react-native";

import type { QuoteView } from "@/core/types";

import { ThemeTokens, useTheme } from "./theme";

export function QuoteCard({ quote, eyebrow }: { quote: QuoteView; eyebrow: string }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.text}>{quote.text}</Text>
      <Text style={styles.author}>{quote.author}</Text>
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
    metaRow: {
      gap: 4,
    },
    meta: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
