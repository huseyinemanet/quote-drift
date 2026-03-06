import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { useAppState } from "@/core/bootstrap";
import { minutesToLabel } from "@/core/date";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { colors } from "@/ui/theme";

export function HoursScreen() {
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
      <View style={styles.header}>
        <Text style={styles.title}>Choose your reminder window.</Text>
        <Text style={styles.body}>
          Notifications will only be scheduled inside this range.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Start</Text>
        <View style={styles.row}>
          {[510, 570, 630].map((value) => (
            <Button
              key={value}
              label={minutesToLabel(value)}
              variant={value === startMinute ? "primary" : "secondary"}
              onPress={() => setStartMinute(value)}
            />
          ))}
        </View>
        <Text style={styles.label}>End</Text>
        <View style={styles.row}>
          {[1170, 1230, 1290].map((value) => (
            <Button
              key={value}
              label={minutesToLabel(value)}
              variant={value === endMinute ? "primary" : "secondary"}
              onPress={() => setEndMinute(value)}
            />
          ))}
        </View>
      </View>
      <Button
        label={
          shouldEnableNotifications
            ? "Finish and enable reminders"
            : "Finish setup"
        }
        onPress={finish}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
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
  card: {
    gap: 14,
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
});
