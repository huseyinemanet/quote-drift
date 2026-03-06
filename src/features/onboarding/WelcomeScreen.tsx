import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const PREVIEW_QUOTES = [
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    topics: ["Stoicism", "Focus", "Clarity"],
  },
  {
    text: "You do not have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
    topics: ["Courage", "Growth", "Resilience"],
  },
] as const;

const TRUST_POINTS = [
  "Works offline",
  "No account needed",
  "Reminders stay on device",
] as const;

const FEATURE_POINTS = [
  "Daily quotes shaped by the topics you choose",
  "Save the lines you want to revisit later",
  "Keep reminders optional from the very start",
] as const;

export function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [previewIndex, setPreviewIndex] = useState(0);
  const preview = PREVIEW_QUOTES[previewIndex];

  return (
    <Screen>
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.progressLabel}>Onboarding</Text>
      </View>
      <View style={styles.hero}>
        <View style={styles.kickerBlock}>
          <Text style={styles.kicker}>Quotify</Text>
          <Text style={styles.eyebrow}>A calm daily quote app, even offline.</Text>
        </View>
        <Text style={styles.title}>
          Quotes for the moods, topics, and seasons that matter to you.
        </Text>
        <Text style={styles.body}>
          Choose a few topics, save the lines you love, and keep reminders
          optional.
        </Text>
        <View style={styles.featureList}>
          {FEATURE_POINTS.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.ctaBlock}>
        <Button
          label="Get started"
          onPress={() => router.push("/(onboarding)/topics")}
        />
        <Button
          label="See example quotes"
          variant="ghost"
          onPress={() =>
            setPreviewIndex((current) => (current + 1) % PREVIEW_QUOTES.length)
          }
        />
        <Text style={styles.supportingCopy}>
          Takes less than a minute. You will pick a few topics next.
        </Text>
      </View>
      <View style={styles.previewPanel}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Text style={styles.previewHint}>Saved quotes and reminders stay optional.</Text>
        </View>
        <View style={styles.topicRow}>
          {preview.topics.map((topic) => (
            <View key={topic} style={styles.topicChip}>
              <Text style={styles.topicChipText}>{topic}</Text>
            </View>
          ))}
        </View>
        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>{preview.text}</Text>
          <Text style={styles.quoteAuthor}>{preview.author}</Text>
        </View>
      </View>
      <View style={styles.trustRow}>
        {TRUST_POINTS.map((point) => (
          <View key={point} style={styles.trustChip}>
            <Text style={styles.trustChipText}>{point}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    progressRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    progressDots: {
      flexDirection: "row",
      gap: 8,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.border,
    },
    progressDotActive: {
      width: 26,
      backgroundColor: colors.text,
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
    },
    hero: {
      marginTop: 28,
      gap: 18,
    },
    kickerBlock: {
      gap: 8,
    },
    kicker: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
      color: colors.accent,
    },
    eyebrow: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.textMuted,
    },
    title: {
      fontSize: 35,
      lineHeight: 42,
      fontWeight: "700",
      color: colors.text,
    },
    body: {
      fontSize: 18,
      lineHeight: 27,
      color: colors.textMuted,
    },
    featureList: {
      gap: 10,
      marginTop: 6,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    featureBullet: {
      width: 8,
      height: 8,
      borderRadius: 999,
      marginTop: 8,
      backgroundColor: colors.accent,
    },
    featureText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 23,
      color: colors.text,
    },
    ctaBlock: {
      gap: 12,
      marginTop: 8,
    },
    supportingCopy: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      color: colors.textMuted,
    },
    previewPanel: {
      gap: 16,
      marginTop: 8,
      padding: 18,
      borderRadius: 28,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewHeader: {
      gap: 6,
    },
    previewLabel: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: colors.accent,
    },
    previewHint: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
    topicRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    topicChip: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surfaceMuted,
    },
    topicChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    quoteCard: {
      gap: 10,
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 20,
      backgroundColor: colors.background,
    },
    quoteMark: {
      fontSize: 32,
      lineHeight: 32,
      color: colors.accent,
    },
    quoteText: {
      fontSize: 20,
      lineHeight: 29,
      fontWeight: "600",
      color: colors.text,
    },
    quoteAuthor: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
    trustRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    trustChip: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    trustChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
    },
  });
