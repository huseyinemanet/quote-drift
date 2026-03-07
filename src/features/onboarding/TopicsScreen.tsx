import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TOPIC_OPTIONS } from "@/core/constants";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const MAX_TOPICS = 3;

function formatTopicList(topics: string[]): string {
  if (topics.length <= 1) return topics[0] ?? "";
  const last = topics[topics.length - 1];
  const rest = topics.slice(0, -1).join(", ");
  return `${rest} and ${last}`;
}

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
    <Screen
      useChromeInset={false}
      stickyFooter={
        <Button
          label="Continue"
          onPress={() => continueWithTopics(selected)}
        />
      }
    >
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <View style={styles.progressRight}>
          <Text style={styles.progressLabel}>Step 2 of 3</Text>
          <Pressable
            onPress={() => continueWithTopics([])}
            style={({ pressed }) => [styles.skipLink, pressed && styles.skipLinkPressed]}
          >
            <Text style={styles.skipLinkLabel}>Skip</Text>
          </Pressable>
        </View>
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
          {selected.length >= MAX_TOPICS
            ? "You've picked 3 topics."
            : "Pick up to 3 topics."}
        </Text>
      </View>
      <View style={styles.grid}>
        {TOPIC_OPTIONS.map((topic) => (
          <View key={topic} style={styles.chipWrap}>
            <ChoiceChip
              label={topic}
              selected={selected.includes(topic)}
              disabled={selected.length >= MAX_TOPICS && !selected.includes(topic)}
              onPress={() => toggleTopic(topic)}
            />
          </View>
        ))}
      </View>
      <View style={styles.selectedPanel}>
        <Text style={styles.selectedLabel}>Your current mix</Text>
        <Text style={styles.selectedText}>
          {selected.length > 0
            ? `You'll see more quotes about ${formatTopicList(selected)} first.`
            : "You can skip for now and personalise later in Settings."}
        </Text>
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
    progressRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
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
      marginTop: 20,
      gap: 8,
    },
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "700",
      fontFamily: "SourceSerif4_400Regular",
      letterSpacing: -0.3,
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
      paddingVertical: 4,
    },
    selectionCount: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    chipWrap: {
      width: "31%",
      minWidth: 0,
    },
    selectedPanel: {
      gap: 6,
      padding: 14,
      borderRadius: 16,
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
    skipLink: {
      paddingVertical: 4,
      paddingHorizontal: 0,
    },
    skipLinkPressed: {
      opacity: 0.7,
    },
    skipLinkLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textMuted,
    },
  });
