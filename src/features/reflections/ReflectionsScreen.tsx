import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { getAuthorIdFromName } from "@/core/authorIdentity";
import { getAllReflectionsOrderedByDate } from "@/core/reflections";
import type { QuoteView, ReflectionWithQuote } from "@/core/types";

import { EmptyState } from "@/ui/EmptyState";
import { ReflectionSheet } from "@/ui/components/ReflectionSheet";
import { Screen } from "@/ui/Screen";
import { MAX_FONT_SIZE_MULTIPLIER, ThemeTokens, useTheme } from "@/ui/theme";

const QUOTE_SNIPPET_LENGTH = 60;
const REFLECTION_SNIPPET_LENGTH = 100;

function formatDayKey(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return dayKey;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trimEnd() + "…";
}

function buildMinimalQuoteView(item: ReflectionWithQuote): QuoteView {
  const { quote, reflection } = item;
  return {
    id: quote.id,
    text: quote.text,
    author: quote.author,
    tags: reflection.topic ? [reflection.topic] : [],
    authorId: getAuthorIdFromName(quote.author),
    primaryTag: reflection.topic ?? null,
    saved: false,
  };
}

export function ReflectionsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [items, setItems] = useState<ReflectionWithQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ReflectionWithQuote | null>(null);

  const loadReflections = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllReflectionsOrderedByDate();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReflections();
  }, [loadReflections]);

  const handleCloseSheet = useCallback(() => {
    setSelectedItem(null);
    void loadReflections();
  }, [loadReflections]);

  if (loading) {
    return (
      <Screen edges={[]} scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.loadingText}>
            Loading reflections…
          </Text>
        </View>
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen edges={[]}>
        <View style={styles.emptyWrap}>
          <EmptyState
            title="No reflections yet"
            body="Reflect on quotes from Today to see them here. Your thoughts are saved and you can revisit or edit them anytime."
            fillVertical
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={[]} scroll>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.reflection.id}
            accessibilityRole="button"
            accessibilityLabel={`Reflection from ${formatDayKey(item.reflection.dayKey)}`}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setSelectedItem(item)}
          >
            <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.date}>
              {formatDayKey(item.reflection.dayKey)}
            </Text>
            <Text
              maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
              style={styles.quoteSnippet}
              numberOfLines={1}
            >
              "{truncate(item.quote.text, QUOTE_SNIPPET_LENGTH)}"
            </Text>
            <Text
              maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
              style={styles.reflectionSnippet}
              numberOfLines={2}
            >
              {truncate(item.reflection.text, REFLECTION_SNIPPET_LENGTH)}
            </Text>
            {item.reflection.topic ? (
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.topicBadge}>
                #{item.reflection.topic}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
      <ReflectionSheet
        visible={selectedItem !== null}
        quote={selectedItem ? buildMinimalQuoteView(selectedItem) : null}
        onClose={handleCloseSheet}
        dayKey={selectedItem?.reflection.dayKey}
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: 15,
      color: colors.textMuted,
    },
    emptyWrap: {
      flex: 1,
      minHeight: 200,
    },
    list: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 24,
      gap: 12,
    },
    row: {
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    rowPressed: {
      opacity: 0.85,
    },
    date: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.accent,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    quoteSnippet: {
      fontSize: 15,
      lineHeight: 20,
      color: colors.text,
      fontStyle: "italic",
    },
    reflectionSnippet: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    topicBadge: {
      alignSelf: "flex-start",
      fontSize: 12,
      fontWeight: "600",
      color: colors.accent,
      marginTop: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.background,
      borderRadius: 999,
    },
  });
