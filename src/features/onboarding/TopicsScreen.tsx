import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  CheckCircle,
  Clock,
  Compass,
  Flame,
  Gift,
  Heart,
  Lightbulb,
  Palette,
  Scale,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react-native";

import { selectionHaptic } from "@/core/haptics";
import { TOPIC_OPTIONS } from "@/core/constants";
import { createOnboardingProgressStyles } from "@/features/onboarding/onboardingProgressStyles";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ToastMessage } from "@/ui/components/ToastMessage";
import { ThemeTokens, useTheme } from "@/ui/theme";

const TOPIC_ICONS: Record<(typeof TOPIC_OPTIONS)[number], React.ComponentType<{ size?: number; color: string }>> = {
  resilience: Shield,
  creativity: Palette,
  focus: Target,
  kindness: Heart,
  growth: TrendingUp,
  courage: Flame,
  clarity: Lightbulb,
  gratitude: Gift,
  balance: Scale,
  patience: Clock,
  curiosity: Compass,
  discipline: CheckCircle,
};

const MAX_TOPICS = 3;

export function TopicsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selected, setSelected] = useState<string[]>([
    "growth",
    "clarity",
    "resilience",
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const toggleTopic = (topic: string) => {
    if (selected.includes(topic)) {
      setSelected((current) => current.filter((item) => item !== topic));
      return;
    }
    if (selected.length >= MAX_TOPICS) {
      void selectionHaptic();
      setToastMessage("Maximum 3 topics");
      return;
    }
    setSelected((current) => [...current, topic]);
  };

  const continueWithTopics = (topics: string[]) =>
    router.push({
      pathname: "/(onboarding)/notifications",
      params: { topics: JSON.stringify(topics) },
    });

  const hasSelection = selected.length > 0;

  return (
    <Screen
      useChromeInset={false}
      stickyFooter={
        <Button
          label="Continue"
          onPress={() => continueWithTopics(selected)}
        />
      }
    >
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
        {!hasSelection && (
          <Pressable
            onPress={() => continueWithTopics([])}
            style={({ pressed }) => [
              styles.skipLink,
              pressed && styles.skipLinkPressed,
            ]}
          >
            <Text style={styles.skipLinkLabel}>Skip</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Pick your topics</Text>
        <Text style={styles.body}>
          Pick up to 3 topics. We&apos;ll show more quotes like these first.
        </Text>
      </View>
      <View style={styles.grid}>
        {TOPIC_OPTIONS.map((topic) => (
          <View key={topic} style={styles.chipWrap}>
            <ChoiceChip
              label={topic}
              selected={selected.includes(topic)}
              disabled={false}
              compact
              leftIcon={TOPIC_ICONS[topic]}
              onPress={() => toggleTopic(topic)}
            />
          </View>
        ))}
      </View>
      {toastMessage ? (
        <ToastMessage message={toastMessage} variant="hud" />
      ) : null}
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    ...createOnboardingProgressStyles(colors),
    progressRow: {
      ...createOnboardingProgressStyles(colors).progressRow,
      justifyContent: "space-between",
    },
    header: {
      marginTop: 16,
      gap: 6,
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
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 24,
    },
    chipWrap: {
      width: "48%",
      minWidth: 0,
    },
    skipLink: {
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    skipLinkPressed: {
      opacity: 0.5,
    },
    skipLinkLabel: {
      fontSize: 17,
      fontWeight: "400",
      color: colors.textMuted,
    },
  });
