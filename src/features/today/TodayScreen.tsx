import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, Share2 } from "lucide-react-native";

import { useAppState } from "@/core/bootstrap";
import { getDayKey } from "@/core/date";
import { selectionHaptic } from "@/core/haptics";
import { updateStreak, type UpdateStreakResult } from "@/core/streak/streak";
import {
  getQuoteCardBackgroundIndex,
  QUOTE_CARD_BACKGROUNDS,
} from "@/features/today/quoteCardBackgrounds";
import { useShareQuote } from "@/features/today/share/useShareQuote";
import { useOneMoreGate } from "@/features/today/useOneMoreGate";
import { Button } from "@/ui/Button";
import { BUTTON_BORDER_RADIUS } from "@/ui/buttonMetrics";
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
    notificationSettings,
    claimExtraQuote,
    toggleSave,
  } = useAppState();
  const [streakResult, setStreakResult] = useState<UpdateStreakResult | null>(null);
  const [visibleMilestone, setVisibleMilestone] = useState<number | null>(null);
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
  const [savingQuoteId, setSavingQuoteId] = useState<string | null>(null);

  // Streak is updated when the Today quote becomes available (not on generic app launch); at most once per calendar day.
  useEffect(() => {
    if (!todayQuote) return;
    let cancelled = false;
    updateStreak().then((result) => {
      if (!cancelled) {
        setStreakResult(result);
        // Milestone only when streak actually increased this session (isNewDay); same-day revisits don't re-trigger.
        if (result.isNewDay && result.milestoneReached != null) {
          setVisibleMilestone(result.milestoneReached);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [todayQuote]);

  // Auto-hide milestone celebration after a few seconds.
  useEffect(() => {
    if (visibleMilestone == null) return;
    const t = setTimeout(() => setVisibleMilestone(null), 5000);
    return () => clearTimeout(t);
  }, [visibleMilestone]);

  const handleToggleSave = async (quoteId: string) => {
    void selectionHaptic();
    setSavingQuoteId(quoteId);
    try {
      await toggleSave(quoteId);
    } finally {
      setSavingQuoteId(null);
    }
  };

  if (!todayQuote) {
    return (
      <Screen edges={[]}>
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
    streakResult == null
      ? null
      : `🔥 ${streakResult.currentStreak}-day streak`;

  const MILESTONE_MESSAGES: Record<number, string> = {
    3: "Nice start.",
    7: "A full week of inspiration.",
    14: "Two weeks strong.",
    30: "You're building a habit.",
    100: "Now that's consistency.",
  };

  return (
    <Screen edges={[]}>
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
        background={QUOTE_CARD_BACKGROUNDS[getQuoteCardBackgroundIndex(getDayKey())]}
        hideAttribution
      />
      {streakLabel != null ? (
        <Text style={styles.streakLabel}>{streakLabel}</Text>
      ) : null}
      {visibleMilestone != null && MILESTONE_MESSAGES[visibleMilestone] ? (
        <Banner
          title={`🔥 ${visibleMilestone}-day streak`}
          body={MILESTONE_MESSAGES[visibleMilestone]}
        />
      ) : null}
      <View style={styles.actionsBlock}>
        <View style={styles.row}>
          <View style={styles.buttonSlot}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                todayQuote.saved && styles.saveButtonSaved,
                savingQuoteId === todayQuote.id && styles.saveButtonDisabled,
                pressed && savingQuoteId !== todayQuote.id && styles.saveButtonPressed,
              ]}
              onPress={() => handleToggleSave(todayQuote.id)}
              disabled={savingQuoteId === todayQuote.id}
            >
              {savingQuoteId === todayQuote.id ? (
                <ActivityIndicator size="small" color={colors.text} style={styles.saveSpinner} />
              ) : (
                <>
                  <Heart
                    size={24}
                    color={todayQuote.saved ? colors.accent : colors.text}
                    style={styles.saveIcon}
                  />
                  <Text style={[styles.saveLabel, todayQuote.saved && styles.saveLabelSaved]}>
                    {todayQuote.saved ? "Saved" : "Save"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
          <View style={styles.buttonSlot}>
            <Pressable
              style={({ pressed }) => [
                styles.shareButton,
                todayShare.isPreparing && styles.shareButtonDisabled,
                pressed && !todayShare.isPreparing && styles.shareButtonPressed,
              ]}
              onPress={() => {
                void selectionHaptic();
                todayShare.share();
              }}
              disabled={todayShare.isPreparing}
            >
              {todayShare.isPreparing ? (
                <ActivityIndicator size="small" color={colors.text} style={styles.shareSpinner} />
              ) : (
                <>
                  <Share2
                    size={24}
                    color={colors.text}
                    style={styles.shareIcon}
                  />
                  <Text style={styles.shareLabel}>Share</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.exploreBlock}>
        <Text style={styles.exploreCopy}>
          {oneMore.isAlreadyUnlocked
            ? "New quote tomorrow"
            : "Want another quote today? Unlock one more."}
        </Text>
        <Button
          label="Get another quote"
          variant="secondary"
          disabled={oneMore.isAlreadyUnlocked}
          onPress={oneMore.handleOneMorePress}
          style={oneMore.isAlreadyUnlocked ? styles.getAnotherQuoteDisabled : undefined}
        />
      </View>
      {extraQuote ? (
        <View style={styles.extraSection}>
          <QuoteCard
            quote={extraQuote}
            eyebrow="One more for today"
            isExpanded={isExtraExpanded}
            onToggleExpanded={() => setIsExtraExpanded((current) => !current)}
            onPressAuthor={() => openAuthor(extraQuote.authorId)}
            hideAttribution
          />
          <View style={styles.actionsBlock}>
            <View style={styles.row}>
              <View style={styles.buttonSlot}>
                <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                extraQuote.saved && styles.saveButtonSaved,
                savingQuoteId === extraQuote.id && styles.saveButtonDisabled,
                pressed && savingQuoteId !== extraQuote.id && styles.saveButtonPressed,
              ]}
                  onPress={() => handleToggleSave(extraQuote.id)}
                  disabled={savingQuoteId === extraQuote.id}
                >
                  {savingQuoteId === extraQuote.id ? (
                    <ActivityIndicator size="small" color={colors.text} style={styles.saveSpinner} />
                  ) : (
                    <>
                      <Heart
                        size={24}
                        color={extraQuote.saved ? colors.accent : colors.text}
                        style={styles.saveIcon}
                      />
                      <Text style={[styles.saveLabel, extraQuote.saved && styles.saveLabelSaved]}>
                        {extraQuote.saved ? "Saved ✓" : "Save"}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
              <View style={styles.buttonSlot}>
                <Pressable
                  style={({ pressed }) => [
                    styles.shareButton,
                    extraShare.isPreparing && styles.shareButtonDisabled,
                    pressed && !extraShare.isPreparing && styles.shareButtonPressed,
                  ]}
                  onPress={() => {
                    void selectionHaptic();
                    extraShare.share();
                  }}
                  disabled={extraShare.isPreparing}
                >
                  {extraShare.isPreparing ? (
                    <ActivityIndicator size="small" color={colors.text} style={styles.shareSpinner} />
                  ) : (
                    <>
                      <Share2
                        size={24}
                        color={colors.text}
                        style={styles.shareIcon}
                      />
                      <Text style={styles.shareLabel}>Share</Text>
                    </>
                  )}
                </Pressable>
              </View>
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
      gap: 2,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    streakLabel: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 8,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    buttonSlot: {
      flex: 1,
    },
    flexButton: {
      flex: 1,
    },
    saveButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: BUTTON_BORDER_RADIUS,
      backgroundColor: colors.surfaceMuted,
    },
    saveButtonSaved: {
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    saveButtonPressed: {
      opacity: 0.82,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveIcon: {
      marginTop: 1,
    },
    saveSpinner: {
      marginTop: 1,
    },
    saveLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    saveLabelSaved: {
      color: colors.accent,
    },
    shareButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: BUTTON_BORDER_RADIUS,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    shareButtonPressed: {
      opacity: 0.82,
    },
    shareButtonDisabled: {
      opacity: 0.45,
    },
    shareIcon: {
      marginTop: 1,
    },
    shareSpinner: {
      marginTop: 1,
    },
    shareLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    actionsBlock: {
      gap: 12,
      marginTop: 4,
    },
    exploreBlock: {
      gap: 4,
    },
    exploreCopy: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    getAnotherQuoteDisabled: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    extraSection: {
      gap: 12,
    },
  });
