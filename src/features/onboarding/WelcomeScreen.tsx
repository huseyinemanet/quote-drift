import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

export function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Quote Drift</Text>
        <Text style={styles.title}>An offline quote ritual that still works when reminders are off.</Text>
        <Text style={styles.body}>
          Choose your topics, keep a personal library, and let local reminders stay
          optional.
        </Text>
      </View>
      <Button
        label="Choose topics"
        onPress={() => router.push("/(onboarding)/topics")}
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    hero: {
      marginTop: 48,
      gap: 16,
    },
    kicker: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
      color: colors.accent,
    },
    title: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: "700",
      color: colors.text,
    },
    body: {
      fontSize: 17,
      lineHeight: 26,
      color: colors.textMuted,
    },
  });
