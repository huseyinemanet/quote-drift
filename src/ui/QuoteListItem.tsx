import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { selectionHaptic } from "@/core/haptics";
import type { QuoteView } from "@/core/types";

import { ThemeTokens, useTheme } from "./theme";

type Props = {
  quote: QuoteView;
  onToggleSave: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  isCopyConfirmed?: boolean;
  onPressAuthor?: () => void;
  showAuthor?: boolean;
  showShare?: boolean;
  compact?: boolean;
  saving?: boolean;
};

export function QuoteListItem({
  quote,
  onToggleSave,
  onShare,
  onCopy,
  isCopyConfirmed = false,
  onPressAuthor,
  showAuthor = true,
  showShare = true,
  compact = false,
  saving = false,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const authorLabel = (
    <Text style={styles.quoteAuthor}>{quote.author}</Text>
  );

  return (
    <View style={styles.quoteRow}>
      <View style={styles.topRow}>
        <View style={styles.quoteMeta}>
          {quote.primaryTag ? <Text style={styles.meta}>#{quote.primaryTag}</Text> : null}
        </View>
        <View style={styles.iconActions}>
          {onCopy ? (
            <Pressable accessibilityRole="button" onPress={onCopy} style={styles.iconButton}>
              <Ionicons
                name={isCopyConfirmed ? "checkmark" : "copy-outline"}
                size={18}
                color={isCopyConfirmed ? colors.text : colors.textMuted}
              />
            </Pressable>
          ) : null}
          {showShare && onShare ? (
            <Pressable accessibilityRole="button" onPress={onShare} style={styles.iconButton}>
              <Ionicons name="share-outline" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => {
              void selectionHaptic();
              onToggleSave();
            }}
            style={styles.iconButton}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <Ionicons
                name={quote.saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={quote.saved ? colors.text : colors.textMuted}
              />
            )}
          </Pressable>
        </View>
      </View>
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
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    quoteRow: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
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
      flex: 1,
    },
    meta: {
      alignSelf: "flex-start",
      color: colors.textMuted,
      fontSize: 12,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: colors.background,
    },
    iconActions: {
      flexDirection: "row",
      gap: 2,
      alignItems: "center",
    },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
  });
