import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { ChoiceChip } from "@/ui/ChoiceChip";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const FREQUENCY_OPTIONS = [
  {
    value: 1 as const,
    label: "Once a day",
    note: "A gentle nudge once a day",
  },
  {
    value: 2 as const,
    label: "Twice a day",
    note: "A couple of touchpoints",
  },
  {
    value: 3 as const,
    label: "Three times a day",
    note: "More frequent check-ins",
  },
] as const;

export function FrequencyScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams<{ topics?: string; skipNotifications?: string }>();
  const [frequency, setFrequency] = useState<1 | 2 | 3>(1);
  const selectedOption =
    FREQUENCY_OPTIONS.find((option) => option.value === frequency) ??
    FREQUENCY_OPTIONS[0];

  return (
    <Screen>
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
        <Text style={styles.progressLabel}>Step 3 of 3</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>How often should reminders appear?</Text>
        <Text style={styles.body}>
          Choose how many reminder prompts you&apos;d like each day. You can
          change this later.
        </Text>
        <Text style={styles.helper}>
          Next, you&apos;ll choose the hours when reminders can appear.
        </Text>
      </View>
      <View style={styles.choices}>
        {FREQUENCY_OPTIONS.map((option) => (
          <View key={option.value} style={styles.choiceOption}>
            <ChoiceChip
              label={option.label}
              selected={frequency === option.value}
              onPress={() => setFrequency(option.value)}
            />
            <Text
              style={[
                styles.choiceNote,
                frequency === option.value ? styles.choiceNoteSelected : null,
              ]}
            >
              {option.note}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Current setting</Text>
        <Text style={styles.summaryText}>
          {selectedOption.label} selected. Reminders stay within the hours you
          choose, and you can turn them off anytime.
        </Text>
      </View>
      <Button
        label="Next: active hours"
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/hours",
            params: {
              topics: params.topics ?? "[]",
              frequency: String(frequency),
              skipNotifications: params.skipNotifications ?? "false",
            },
          })
        }
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
    progressDotComplete: {
      backgroundColor: colors.accent,
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
      color: colors.accent,
      fontWeight: "600",
    },
    choices: {
      flexDirection: "column",
      gap: 12,
    },
    choiceOption: {
      gap: 6,
    },
    choiceNote: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
      paddingHorizontal: 4,
    },
    choiceNoteSelected: {
      color: colors.text,
    },
    summaryCard: {
      gap: 6,
      padding: 16,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryLabel: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.accent,
    },
    summaryText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
  });
