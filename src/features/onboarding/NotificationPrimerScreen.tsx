import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Banner } from "@/ui/Banner";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

export function NotificationPrimerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams<{ topics?: string }>();

  return (
    <Screen>
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.progressLabel}>Step 2 of 3</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Use reminders only if you want them.</Text>
        <Text style={styles.body}>
          The app works fully without notifications. If you turn them on, you&apos;ll
          choose when and how often they appear.
        </Text>
        <Text style={styles.benefit}>
          Get a gentle quote prompt during the day, on your schedule.
        </Text>
      </View>
      <Banner
        title="What changes if you say no?"
        body="Nothing essential changes. Today, Library, favourites, and About still work as normal."
      />
      <View style={styles.helperBlock}>
        <Text style={styles.helperText}>
          You&apos;ll be asked for notification permission next.
        </Text>
        <Text style={styles.helperText}>
          Reminders stay quiet outside the hours you set.
        </Text>
      </View>
      <Button
        label="Set up reminders"
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/frequency",
            params: { topics: params.topics ?? "[]" },
          })
        }
      />
      <Button
        label="Skip for now"
        variant="ghost"
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/frequency",
            params: { topics: params.topics ?? "[]", skipNotifications: "true" },
          })
        }
      />
      <Text style={styles.footerNote}>
        You can change this anytime in Settings. Reminders stay on this device.
      </Text>
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
    benefit: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.accent,
    },
    helperBlock: {
      gap: 6,
    },
    helperText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    footerNote: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      color: colors.textMuted,
    },
  });
