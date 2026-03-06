import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { ChoiceChip } from "@/ui/ChoiceChip";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

export function FrequencyScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams<{ topics?: string; skipNotifications?: string }>();
  const [frequency, setFrequency] = useState<1 | 2 | 3>(1);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>How often should reminders appear?</Text>
        <Text style={styles.body}>
          One reminder per day is the calm default. You can change this later.
        </Text>
      </View>
      <View style={styles.choices}>
        {[1, 2, 3].map((count) => (
          <ChoiceChip
            key={count}
            label={`${count}/day`}
            selected={frequency === count}
            onPress={() => setFrequency(count as 1 | 2 | 3)}
          />
        ))}
      </View>
      <Button
        label="Set active hours"
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
    choices: {
      flexDirection: "row",
      gap: 12,
    },
  });
