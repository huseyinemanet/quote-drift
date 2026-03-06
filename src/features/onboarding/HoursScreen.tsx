import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { useAppState } from "@/core/bootstrap";
import { minutesToLabel } from "@/core/date";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const START_OPTIONS = [510, 570, 630] as const;
const END_OPTIONS = [1170, 1230, 1290] as const;

export function HoursScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams<{
    topics?: string;
    frequency?: string;
    skipNotifications?: string;
  }>();
  const { completeOnboarding, requestNotifications, updateNotificationSettings } =
    useAppState();
  const [startMinute, setStartMinute] = useState(570);
  const [endMinute, setEndMinute] = useState(1230);
  const shouldEnableNotifications = params.skipNotifications !== "true";
  const summary = `${minutesToLabel(startMinute)} to ${minutesToLabel(endMinute)}`;

  const finish = async () => {
    const topics = params.topics ? (JSON.parse(params.topics) as string[]) : [];
    await updateNotificationSettings({
      enabled: shouldEnableNotifications,
      frequency_per_day: Number(params.frequency ?? "1") as 1 | 2 | 3,
      active_start_minute: startMinute,
      active_end_minute: endMinute,
    });

    if (shouldEnableNotifications) {
      await requestNotifications();
    }

    await completeOnboarding(topics);
    router.replace("/(app)/today");
  };

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
        <Text style={styles.title}>Set your reminder hours.</Text>
        <Text style={styles.body}>
          Reminders will only appear during the hours you choose.
        </Text>
        <Text style={styles.helper}>Recommended: 9:30 AM to 8:30 PM for a calm default.</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Reminder window</Text>
        <Text style={styles.summaryValue}>From {summary}</Text>
        <Text style={styles.summaryBody}>
          Choose one start time and one end time. End time must stay later than start.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Start</Text>
        <View style={styles.row}>
          {START_OPTIONS.map((value) => (
            <Button
              key={value}
              label={minutesToLabel(value)}
              variant={value === startMinute ? "primary" : "secondary"}
              onPress={() => setStartMinute(value)}
              disabled={value >= endMinute}
            />
          ))}
        </View>
        <Text style={styles.label}>End</Text>
        <View style={styles.row}>
          {END_OPTIONS.map((value) => (
            <Button
              key={value}
              label={minutesToLabel(value)}
              variant={value === endMinute ? "primary" : "secondary"}
              onPress={() => setEndMinute(value)}
              disabled={value <= startMinute}
            />
          ))}
        </View>
      </View>
      <Text style={styles.footerText}>
        You can change this later. We&apos;ll ask for notification permission when you enable reminders.
      </Text>
      <Button
        label={
          shouldEnableNotifications
            ? "Enable reminders"
            : "Finish setup"
        }
        onPress={finish}
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
    summaryCard: {
      gap: 6,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
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
    summaryValue: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "700",
      color: colors.text,
    },
    summaryBody: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    card: {
      gap: 18,
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    row: {
      gap: 10,
    },
    footerText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      color: colors.textMuted,
    },
  });
