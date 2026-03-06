import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { TOPIC_OPTIONS } from "@/core/constants";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const MAX_TOPICS = 3;

export function TopicsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selected, setSelected] = useState<string[]>([
    "growth",
    "clarity",
    "resilience",
  ]);

  const toggleTopic = (topic: string) => {
    setSelected((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : current.length >= MAX_TOPICS
          ? current
          : [...current, topic]
    );
  };

  const continueWithTopics = (topics: string[]) =>
    router.push({
      pathname: "/(onboarding)/notifications",
      params: { topics: JSON.stringify(topics) },
    });

  return (
    <Screen>
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.progressLabel}>Step 1 of 3</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Pick the topics you want to see more often</Text>
        <Text style={styles.body}>
          Choose up to 3 topics. We&apos;ll prioritise quotes around these themes
          first.
        </Text>
        <Text style={styles.helper}>You can change this anytime.</Text>
      </View>
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionCount}>
          {selected.length} selected
        </Text>
        <Text style={styles.selectionHint}>
          This changes priority, not what stays available in your library.
        </Text>
      </View>
      <View style={styles.grid}>
        {TOPIC_OPTIONS.map((topic) => (
          <ChoiceChip
            key={topic}
            label={topic}
            selected={selected.includes(topic)}
            disabled={selected.length >= MAX_TOPICS && !selected.includes(topic)}
            onPress={() => toggleTopic(topic)}
          />
        ))}
      </View>
      <View style={styles.selectedPanel}>
        <Text style={styles.selectedLabel}>Your current mix</Text>
        <Text style={styles.selectedText}>
          {selected.length > 0
            ? `We’ll show ${selected.join(", ")} quotes first.`
            : "You can skip for now and personalise later in Settings."}
        </Text>
      </View>
      <Button
        label="Next: reminders"
        onPress={() => continueWithTopics(selected)}
      />
      <Button
        label="Skip for now"
        variant="ghost"
        onPress={() => continueWithTopics([])}
      />
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
    header: {
      marginTop: 24,
      gap: 10,
    },
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "700",
      color: colors.text,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
    helper: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      color: colors.accent,
    },
    selectionSummary: {
      gap: 6,
      paddingVertical: 4,
    },
    selectionCount: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    selectionHint: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    selectedPanel: {
      gap: 6,
      padding: 16,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedLabel: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.accent,
    },
    selectedText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
  });
