import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { TOPIC_OPTIONS } from "@/core/constants";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

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
        : [...current, topic]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>What should drift into view more often?</Text>
        <Text style={styles.body}>
          These topics gently influence which unused quote is picked first.
        </Text>
      </View>
      <View style={styles.grid}>
        {TOPIC_OPTIONS.map((topic) => (
          <ChoiceChip
            key={topic}
            label={topic}
            selected={selected.includes(topic)}
            onPress={() => toggleTopic(topic)}
          />
        ))}
      </View>
      <Button
        label="Continue to reminders"
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/notifications",
            params: { topics: JSON.stringify(selected) },
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
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
  });
