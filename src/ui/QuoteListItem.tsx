import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Bookmark, Check, Copy, Share2 } from "lucide-react-native";

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
    <Text style={[styles.quoteAuthor, onPressAuthor && styles.quoteAuthorLink]}>
      {quote.author}
    </Text>
  );

  return (
    <View style={styles.quoteRow}>
      <View style={styles.topRow}>
        <View style={styles.quoteMeta}>
          {quote.primaryTag ? <Text style={styles.meta}>#{quote.primaryTag}</Text> : null}
        </View>
        <View style={styles.iconActions}>
          {onCopy ? (
            <Pressable
              accessibilityRole="button"
              onPress={onCopy}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            >
              {isCopyConfirmed ? (
                <Check size={16} color={colors.text} />
              ) : (
                <Copy size={16} color={colors.textMuted} />
              )}
            </Pressable>
          ) : null}
          {showShare && onShare ? (
            <Pressable
              accessibilityRole="button"
              onPress={onShare}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            >
              <Share2 size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => {
              void selectionHaptic();
              onToggleSave();
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <Bookmark
                size={20}
                color={quote.saved ? colors.accent : colors.textMuted}
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
          <Pressable
            accessibilityRole="button"
            onPress={onPressAuthor}
            style={({ pressed }) => [pressed && styles.authorLinkPressed]}
          >
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
    quoteAuthorLink: {
      color: colors.accent,
      textDecorationLine: "underline",
    },
    authorLinkPressed: {
      opacity: 0.82,
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
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    iconButtonPressed: {
      opacity: 0.82,
    },
  });
