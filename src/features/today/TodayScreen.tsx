import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppState } from "@/core/bootstrap";
import { selectionHaptic } from "@/core/haptics";
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
  const openAuthor = (authorId: string) =>
    router.push({
      pathname: "/author/[authorId]",
      params: { authorId, backLabel: "Today" },
    });
  const [isTodayExpanded, setIsTodayExpanded] = useState(false);
  const [isExtraExpanded, setIsExtraExpanded] = useState(false);
  const handleToggleSave = async (quoteId: string) => {
    void selectionHaptic();
    await toggleSave(quoteId);
  };

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
  const streakLabel =
    streak > 0 ? `${streak} day read streak` : "Day 1 starts today";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>{streakLabel}</Text>
      </View>
      {reminderOff ? (
        <Banner
          title="Reminders are currently off"
          body="That is fine. Quotify works fully without them, and you can enable local reminders anytime in Settings."
        />
      ) : null}
      <QuoteCard
        quote={todayQuote}
        eyebrow="Quote of the day"
        isExpanded={isTodayExpanded}
        onToggleExpanded={() => setIsTodayExpanded((current) => !current)}
        onPressAuthor={() => openAuthor(todayQuote.authorId)}
      />
      <View style={styles.actionsBlock}>
        <View style={styles.row}>
          <Button
            label={todayQuote.saved ? "Saved" : "Save"}
            variant="secondary"
            onPress={() => handleToggleSave(todayQuote.id)}
          />
          <Button
            label={todayShare.isPreparing ? "Preparing..." : "Share"}
            variant="ghost"
            disabled={todayShare.isPreparing}
            onPress={todayShare.share}
          />
        </View>
      </View>
      <View style={styles.exploreBlock}>
        <Button
          label={
            oneMore.isAlreadyUnlocked ? "Extra quote unlocked" : "One more for today"
          }
          variant="secondary"
          disabled={oneMore.isAlreadyUnlocked}
          onPress={oneMore.handleOneMorePress}
        />
        <Text style={styles.exploreHint}>
          Unlock one extra quote if you want more today.
        </Text>
      </View>
      {extraQuote ? (
        <View style={styles.extraSection}>
          <QuoteCard
            quote={extraQuote}
            eyebrow="One more for today"
            isExpanded={isExtraExpanded}
            onToggleExpanded={() => setIsExtraExpanded((current) => !current)}
            onPressAuthor={() => openAuthor(extraQuote.authorId)}
          />
          <View style={styles.actionsBlock}>
            <View style={styles.row}>
              <Button
                label={extraQuote.saved ? "Saved" : "Save"}
                variant="secondary"
                onPress={() => handleToggleSave(extraQuote.id)}
              />
              <Button
                label={extraShare.isPreparing ? "Preparing..." : "Share"}
                variant="ghost"
                disabled={extraShare.isPreparing}
                onPress={extraShare.share}
              />
            </View>
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
    actionsBlock: {
      gap: 12,
      marginTop: 4,
    },
    exploreBlock: {
      gap: 10,
    },
    exploreHint: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    extraSection: {
      gap: 12,
    },
  });
