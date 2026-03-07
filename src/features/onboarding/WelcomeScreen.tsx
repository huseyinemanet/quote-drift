import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Lock, UserCircle, Wifi } from "lucide-react-native";

import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const PREVIEW_QUOTE = {
  text: "The happiness of your life depends upon the quality of your thoughts.",
  author: "Marcus Aurelius",
  topics: ["Stoicism", "Focus", "Clarity"],
} as const;

const TRUST_POINTS: { Icon: React.ComponentType<{ size: number; color: string }>; label: string }[] = [
  { Icon: Wifi, label: "Works offline" },
  { Icon: UserCircle, label: "No account needed" },
  { Icon: Lock, label: "Reminders stay on device" },
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
          <Text style={styles.ctaMicrocopy}>Takes 10 seconds</Text>
        </View>
      }
    >
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.progressLabel}>Step 1 of 3</Text>
      </View>
      <View style={styles.hero}>
        <View style={styles.kickerBlock}>
          <Text style={styles.kicker}>Quotify</Text>
          <Text style={styles.eyebrow}>A calm daily quote app, even offline.</Text>
        </View>
        <Text style={styles.title}>
          Daily quotes that match your mood.
        </Text>
        <Text style={styles.body}>
          Choose topics, save favourites. Reminders stay optional.
        </Text>
      </View>
      <View style={styles.previewPanel}>
        <Text style={styles.previewTopicLabel}>Popular topics</Text>
        <Text style={styles.previewTopicChips}>
          {PREVIEW_QUOTE.topics.join(" · ")}
        </Text>
        <View style={styles.previewQuoteWrap}>
          <View style={styles.previewQuoteBlock}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>{PREVIEW_QUOTE.text}</Text>
          <Text style={styles.quoteAuthor}>{PREVIEW_QUOTE.author}</Text>
          </View>
        </View>
      </View>
      <View style={styles.trustList}>
        {TRUST_POINTS.map((point) => {
          const Icon = point.Icon;
          return (
            <View key={point.label} style={styles.trustRow}>
              <View style={styles.trustCheck}>
                <Icon size={20} color={colors.accent} />
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
    progressLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
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
    hero: {
      marginTop: 22,
      gap: 14,
    },
    kickerBlock: {
      gap: 8,
    },
    kicker: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color: colors.accent,
    },
    eyebrow: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.textMuted,
    },
    title: {
      fontSize: 35,
      lineHeight: 38,
      fontWeight: "700",
      fontFamily: "SourceSerif4_400Regular",
      letterSpacing: -0.5,
      color: colors.text,
    },
    body: {
      fontSize: 18,
      lineHeight: 27,
      color: colors.textMuted,
    },
    ctaBlock: {
      marginTop: 4,
      gap: 4,
    },
    ctaMicrocopy: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: "center",
    },
    previewPanel: {
      gap: 10,
      marginTop: 6,
      padding: 14,
      paddingTop: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewTopicLabel: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color: colors.textMuted,
    },
    previewTopicChips: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    previewQuoteWrap: {
      transform: [{ scale: 0.72 }],
      alignSelf: "center",
      width: "100%",
    },
    previewQuoteBlock: {
      gap: 6,
      marginTop: -2,
    },
    quoteMark: {
      fontSize: 32,
      lineHeight: 32,
      color: colors.accent,
    },
    quoteText: {
      fontSize: 20,
      lineHeight: 29,
      fontWeight: "600",
      color: colors.text,
    },
    quoteAuthor: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
    trustList: {
      gap: 5,
      marginTop: 4,
    },
    trustRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    trustCheck: {
      marginTop: 2,
    },
    trustText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
  });
