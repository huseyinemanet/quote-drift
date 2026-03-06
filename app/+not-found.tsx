import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      router.replace("/");
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <Screen>
        <View style={styles.container}>
          <Text style={styles.title}>Opening Quotify…</Text>
          <Text style={styles.body}>
            Returning you to the correct screen.
          </Text>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </Screen>
    </>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      gap: 10,
      alignItems: "flex-start",
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
  });
