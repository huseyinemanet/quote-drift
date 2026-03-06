import { StyleSheet, Text, View } from "react-native";

import type { ShareableQuote } from "@/core/types";
import { getStoryTypographyPreset } from "@/core/sharecard/storyTypography";
import { lightTheme } from "@/ui/theme";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

export function StoryCard({ quote }: { quote: ShareableQuote }) {
  const preset = getStoryTypographyPreset(quote.text);

  return (
    <View style={styles.frame}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Quote Drift</Text>
        <View style={styles.content}>
          <Text
            style={[
              styles.quote,
              {
                fontSize: preset.fontSize,
                lineHeight: preset.lineHeight,
                letterSpacing: preset.letterSpacing,
              },
            ]}
          >
            {quote.text}
          </Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.author}>{quote.author}</Text>
          {quote.primaryTag ? <Text style={styles.tag}>#{quote.primaryTag}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    backgroundColor: lightTheme.background,
    paddingHorizontal: 88,
    paddingTop: 180,
    paddingBottom: 260,
  },
  card: {
    flex: 1,
    backgroundColor: lightTheme.surface,
    borderColor: lightTheme.border,
    borderWidth: 2,
    borderRadius: 64,
    paddingHorizontal: 76,
    paddingTop: 86,
    paddingBottom: 96,
  },
  eyebrow: {
    color: lightTheme.accent,
    fontSize: 38,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 4,
    marginBottom: 64,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  quote: {
    color: lightTheme.text,
    fontFamily: "SourceSerif4_400Regular",
  },
  metaBlock: {
    minHeight: 220,
    justifyContent: "flex-end",
    gap: 14,
  },
  author: {
    color: lightTheme.text,
    fontSize: 50,
    fontWeight: "700",
  },
  tag: {
    color: lightTheme.accent,
    fontSize: 32,
    fontWeight: "600",
  },
});
