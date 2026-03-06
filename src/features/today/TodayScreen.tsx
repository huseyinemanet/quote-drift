import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useAppState } from "@/core/bootstrap";
import { useShareQuote } from "@/features/today/share/useShareQuote";
import { useOneMoreGate } from "@/features/today/useOneMoreGate";
import { Button } from "@/ui/Button";
import { Banner } from "@/ui/Banner";
import { EmptyState } from "@/ui/EmptyState";
import { QuoteCard } from "@/ui/QuoteCard";
import { Screen } from "@/ui/Screen";
import { RewardedGateModal } from "@/ui/components/RewardedGateModal";
import { ToastMessage } from "@/ui/components/ToastMessage";
import { ThemeTokens, useTheme } from "@/ui/theme";

export function TodayScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    todayQuote,
    extraQuote,
    streak,
    notificationSettings,
    claimExtraQuote,
    toggleSave,
  } = useAppState();
  const todayShare = useShareQuote(todayQuote);
  const extraShare = useShareQuote(extraQuote);
  const oneMore = useOneMoreGate({
    extraQuote,
    claimExtraQuote,
    onExhausted: () => router.push("/exhausted"),
  });
  const openAuthor = (authorId: string) => router.push(`/author/${authorId}`);

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
      <QuoteCard
        quote={todayQuote}
        eyebrow="Quote of the day"
        onPressAuthor={() => openAuthor(todayQuote.authorId)}
      />
      <View style={styles.row}>
        <Button
          label={todayQuote.saved ? "Unsave" : "Save"}
          variant="secondary"
          onPress={() => toggleSave(todayQuote.id)}
        />
        <Button
          label={todayShare.isPreparing ? "Preparing..." : "Share"}
          variant="ghost"
          disabled={todayShare.isPreparing}
          onPress={todayShare.share}
        />
      </View>
      <Button
        label={oneMore.isAlreadyUnlocked ? "Already unlocked today" : "One more"}
        disabled={oneMore.isAlreadyUnlocked}
        onPress={oneMore.handleOneMorePress}
      />
      {extraQuote ? (
        <View style={styles.extraSection}>
          <QuoteCard
            quote={extraQuote}
            eyebrow="One more for today"
            onPressAuthor={() => openAuthor(extraQuote.authorId)}
          />
          <View style={styles.row}>
            <Button
              label={extraQuote.saved ? "Unsave" : "Save"}
              variant="secondary"
              onPress={() => toggleSave(extraQuote.id)}
            />
            <Button
              label={extraShare.isPreparing ? "Preparing..." : "Share"}
              variant="ghost"
              disabled={extraShare.isPreparing}
              onPress={extraShare.share}
            />
          </View>
        </View>
      ) : null}
      {todayShare.captureTarget}
      {extraShare.captureTarget}
      <RewardedGateModal
        visible={oneMore.isOpen}
        status={oneMore.modalStatus}
        isSubmitting={oneMore.isSubmitting}
        onWatchAd={oneMore.handleWatchAd}
        onClose={oneMore.handleClose}
      />
      {todayShare.toastMessage ? <ToastMessage message={todayShare.toastMessage} /> : null}
      {extraShare.toastMessage ? <ToastMessage message={extraShare.toastMessage} /> : null}
      {oneMore.toastMessage ? <ToastMessage message={oneMore.toastMessage} /> : null}
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
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
    extraSection: {
      gap: 12,
    },
  });
