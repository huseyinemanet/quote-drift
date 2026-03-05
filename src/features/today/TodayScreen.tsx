import { router } from "expo-router";
import { Share, StyleSheet, Text, View } from "react-native";

import { FEEDBACK_OPTIONS } from "@/core/constants";
import { useAppState } from "@/core/bootstrap";
import { Button } from "@/ui/Button";
import { Banner } from "@/ui/Banner";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { EmptyState } from "@/ui/EmptyState";
import { QuoteCard } from "@/ui/QuoteCard";
import { Screen } from "@/ui/Screen";
import { colors } from "@/ui/theme";

async function shareQuote(text: string, author: string) {
  await Share.share({
    message: `"${text}" — ${author}`,
  });
}

export function TodayScreen() {
  const {
    todayQuote,
    extraQuote,
    streak,
    notificationSettings,
    claimExtraQuote,
    toggleSave,
    saveFeedback,
  } = useAppState();

  if (!todayQuote) {
    return (
      <Screen>
        <EmptyState
          title="Today is waiting on a quote"
          body="The collection may be exhausted. Open the recovery screen to restart with repeats."
        />
        <Button
          label="Open exhausted screen"
          onPress={() => router.push("/exhausted")}
        />
      </Screen>
    );
  }

  const reminderOff =
    !notificationSettings.enabled ||
    notificationSettings.permission_status !== "granted";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>{streak} day read streak</Text>
      </View>
      {reminderOff ? (
        <Banner
          title="Reminders are currently off"
          body="That is fine. Quote Drift works fully without them, and you can enable local reminders anytime in Settings."
        />
      ) : null}
      <QuoteCard quote={todayQuote} eyebrow="Quote of the day" />
      <View style={styles.row}>
        <Button
          label={todayQuote.saved ? "Unsave" : "Save"}
          variant="secondary"
          onPress={() => toggleSave(todayQuote.id)}
        />
        <Button
          label="Share"
          variant="ghost"
          onPress={() => shareQuote(todayQuote.text, todayQuote.author)}
        />
      </View>
      <View style={styles.feedbackRow}>
        {FEEDBACK_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.key}
            label={option.label}
            selected={todayQuote.feedback === option.key}
            onPress={() => saveFeedback(todayQuote.id, option.key)}
          />
        ))}
      </View>
      <Button
        label="One more"
        onPress={async () => {
          const result = await claimExtraQuote();
          if (result === "exhausted") {
            router.push("/exhausted");
          }
        }}
      />
      {extraQuote ? (
        <View style={styles.extraSection}>
          <QuoteCard quote={extraQuote} eyebrow="One more for today" />
          <View style={styles.row}>
            <Button
              label={extraQuote.saved ? "Unsave" : "Save"}
              variant="secondary"
              onPress={() => toggleSave(extraQuote.id)}
            />
            <Button
              label="Share"
              variant="ghost"
              onPress={() => shareQuote(extraQuote.text, extraQuote.author)}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  feedbackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  extraSection: {
    gap: 12,
  },
});
