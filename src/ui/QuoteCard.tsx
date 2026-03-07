import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { QuoteView } from "@/core/types";
import type { QuoteCardBackground } from "@/features/today/quoteCardBackgrounds";

import { ThemeTokens, useTheme } from "./theme";

const OVERLAY_GRADIENT = ["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.6)"] as const;
const OVERLAY_LOCATIONS = [0, 0.5, 1] as const;

export function QuoteCard({
  quote,
  eyebrow,
  hideAuthor = false,
  hideAttribution = false,
  onPressAuthor,
  isExpanded = true,
  onToggleExpanded,
  maxCollapsedLines = 8,
  background,
}: {
  quote: QuoteView;
  eyebrow: string;
  hideAuthor?: boolean;
  onPressAuthor?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  maxCollapsedLines?: number;
  /** When set, card shows this image as background with dark overlay, white text, and Unsplash attribution. */
  background?: QuoteCardBackground;
  /** When true, hides the photo attribution (e.g. for use when credit is shown in Settings/About). */
  hideAttribution?: boolean;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const overlay = Boolean(background);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const showAttribution = overlay && !imageLoadFailed && !hideAttribution;
  const authorLabel = <Text style={[styles.author, overlay && styles.overlayText]}>{quote.author}</Text>;
  const [isTruncated, setIsTruncated] = useState(false);
  const canCollapse = quote.text.length > 150 || isTruncated || isExpanded;

  return (
    <View style={[styles.card, overlay && styles.cardOverlay]}>
      {background ? (
        <>
          {imageLoadFailed ? (
            background.fallbackLocal != null ? (
              <Image
                source={background.fallbackLocal}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.fallbackBackground} />
            )
          ) : (
            <Image
              source={{
                uri: background.uri,
                headers: {
                  Accept: "image/*",
                  "User-Agent": "Quotify/1.0 (iOS; quote app)",
                },
              }}
              style={styles.backgroundImage}
              resizeMode="cover"
              onError={() => setImageLoadFailed(true)}
            />
          )}
          <LinearGradient
            colors={[...OVERLAY_GRADIENT]}
            locations={[...OVERLAY_LOCATIONS]}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      ) : null}
      <View style={styles.content}>
        <Text style={[styles.eyebrow, overlay && styles.overlayEyebrow]}>{eyebrow}</Text>
        <Text
          onTextLayout={(event) => {
            if (isExpanded) return;
            setIsTruncated(event.nativeEvent.lines.length > maxCollapsedLines);
          }}
          numberOfLines={isExpanded ? undefined : maxCollapsedLines}
          style={[styles.text, overlay && styles.overlayText]}
        >
          {quote.text}
        </Text>
        {canCollapse && onToggleExpanded ? (
          <Pressable
            accessibilityRole="button"
            onPress={onToggleExpanded}
            style={({ pressed }) => [pressed && styles.expandPressed]}
          >
            <Text style={[styles.expandLabel, overlay && styles.overlayMuted]}>
              {isExpanded ? "Show less" : "Read full quote"}
            </Text>
          </Pressable>
        ) : null}
        {!hideAuthor ? (
          onPressAuthor ? (
            <Pressable
              accessibilityRole="button"
              onPress={onPressAuthor}
              style={({ pressed }) => [pressed && styles.authorPressed]}
            >
              {authorLabel}
            </Pressable>
          ) : (
            authorLabel
          )
        ) : null}
        <View style={styles.metaRow}>
          {quote.primaryTag ? (
            <Text style={[styles.meta, overlay && styles.overlayMeta]}>
              #{quote.primaryTag}
            </Text>
          ) : null}
        </View>
        {showAttribution ? (
          <Pressable
            style={({ pressed }) => [
              styles.attributionWrap,
              pressed && styles.attributionPressed,
            ]}
            onPress={() => background.attributionUrl && Linking.openURL(background.attributionUrl)}
            accessibilityRole="link"
            accessibilityLabel={background.attribution}
          >
            <Text style={styles.attribution} numberOfLines={1}>
              {background.attribution}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    cardOverlay: {
      backgroundColor: "transparent",
      borderWidth: 0,
      borderColor: "transparent",
      overflow: "hidden",
    },
    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
    },
    /** Shown when network image fails or user is offline; keeps same dark look. */
    fallbackBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#1a1a1a",
    },
    content: {
      gap: 14,
      zIndex: 1,
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.accent,
    },
    overlayEyebrow: {
      color: "rgba(255,255,255,0.9)",
    },
    text: {
      fontSize: 30,
      lineHeight: 38,
      letterSpacing: -0.45,
      color: colors.text,
      fontFamily: "SourceSerif4_400Regular",
    },
    overlayText: {
      color: "#fff",
    },
    author: {
      fontSize: 17,
      color: colors.text,
      fontWeight: "600",
    },
    authorPressed: {
      opacity: 0.82,
    },
    expandLabel: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500",
      color: colors.textMuted,
    },
    expandPressed: {
      opacity: 0.82,
    },
    overlayMuted: {
      color: "rgba(255,255,255,0.82)",
    },
    metaRow: {
      gap: 4,
      marginTop: 2,
    },
    meta: {
      alignSelf: "flex-start",
      fontSize: 13,
      color: colors.text,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor: colors.background,
    },
    overlayMeta: {
      color: "rgba(255,255,255,0.95)",
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    attributionWrap: {
      marginTop: 8,
      alignSelf: "flex-start",
    },
    attributionPressed: {
      opacity: 0.82,
    },
    attribution: {
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      textDecorationLine: "underline",
    },
  });
