import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Lock, UserCircle, Wifi } from "lucide-react-native";

import { createOnboardingProgressStyles } from "@/features/onboarding/onboardingProgressStyles";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const PREVIEW_QUOTE = {
  text: "The happiness of your life depends upon the quality of your thoughts.",
  author: "Marcus Aurelius",
  topics: ["Stoicism", "Focus", "Clarity"],
} as const;

const TRUST_POINTS: { Icon: React.ComponentType<{ size: number; color: string }>; label: string }[] = [
  { Icon: Wifi, label: "Read and save offline" },
  { Icon: UserCircle, label: "No account needed" },
  { Icon: Lock, label: "Your quotes and favourites stay on device" },
];

export function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Screen
      useChromeInset={false}
      stickyFooter={
        <View style={styles.ctaBlock}>
          <Button
            label="Get started"
            onPress={() => router.push("/(onboarding)/topics")}
          />
        </View>
      }
    >
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
      </View>
      <View style={styles.hero}>
        <Text style={styles.title}>
          Daily quotes that match your mood.
        </Text>
        <Text style={styles.body}>
          Choose topics, save favourites, keep reminders optional.
        </Text>
      </View>
      <View style={styles.previewPanel}>
        <Text style={styles.previewQuoteText}>
          "{PREVIEW_QUOTE.text}"
        </Text>
        <Text style={styles.previewQuoteAuthor}>{PREVIEW_QUOTE.author}</Text>
        <Text style={styles.previewTopicsTag}>
          {PREVIEW_QUOTE.topics.join(" · ")}
        </Text>
      </View>
      <View style={styles.trustList}>
        {TRUST_POINTS.map((point) => {
          const Icon = point.Icon;
          return (
            <View key={point.label} style={styles.trustRow}>
              <View style={styles.trustIconWrap}>
                <Icon size={24} strokeWidth={2} color={colors.accent} />
              </View>
              <Text style={styles.trustText}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    ...createOnboardingProgressStyles(colors),
    hero: {
      marginTop: 28,
      gap: 10,
    },
    title: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: "700",
      fontFamily: "SourceSerif4_400Regular",
      letterSpacing: -0.5,
      color: colors.text,
    },
    body: {
      fontSize: 17,
      lineHeight: 22,
      color: colors.textMuted,
    },
    ctaBlock: {
      paddingTop: 0,
    },
    previewPanel: {
      gap: 1,
      marginTop: 20,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      alignSelf: "center"
    },
    previewQuoteText: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "500",
      color: colors.text,
    },
    previewQuoteAuthor: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textMuted,
    },
    previewTopicsTag: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: "400",
      letterSpacing: 0,
      color: colors.textMuted,
    },
    trustList: {
      gap: 12,
      marginTop: 10,
    },
    trustRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    trustIconWrap: {
      width: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    trustText: {
      flex: 1,
      fontSize: 17,
      fontWeight: "400",
      lineHeight: 22,
      color: colors.text,
    },
  });
