import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Heart, Share2, PenLine, Lightbulb } from "lucide-react-native";

import { useAppState } from "@/core/bootstrap";
import { getDayKey } from "@/core/date";
import { selectionHaptic } from "@/core/haptics";
import type { QuoteView } from "@/core/types";
import { getReflectionStreak } from "@/core/reflections";
import { updateStreak, type UpdateStreakResult } from "@/core/streak/streak";
import {
  getQuoteCardBackgroundIndex,
  QUOTE_CARD_BACKGROUNDS,
} from "@/features/today/quoteCardBackgrounds";
import { useShareQuote } from "@/features/today/share/useShareQuote";
import { useOneMoreGate } from "@/features/today/useOneMoreGate";
import { Button } from "@/ui/Button";
import { BUTTON_BORDER_RADIUS, BUTTON_PADDING_VERTICAL } from "@/ui/buttonMetrics";
import { Banner } from "@/ui/Banner";
import { EmptyState } from "@/ui/EmptyState";
import { QuoteCard } from "@/ui/QuoteCard";
import { Screen } from "@/ui/Screen";
import { ReflectionSheet } from "@/ui/components/ReflectionSheet";
import { RewardedGateModal } from "@/ui/components/RewardedGateModal";
import { QuoteExplanationSheet } from "@/ui/components/QuoteExplanationSheet";
import { ToastMessage } from "@/ui/components/ToastMessage";
import { MAX_FONT_SIZE_MULTIPLIER, ThemeTokens, useTheme } from "@/ui/theme";

function hasQuoteExplanation(quote: QuoteView | null): quote is QuoteView {
  if (!quote) return false;
  return Boolean(
    quote.explanation?.trim() || quote.context?.trim() || quote.takeaway?.trim()
  );
}

const COMPACT_LAYOUT_THRESHOLD = 680;

/** Set to true to show "Understand this quote" button and explanation sheet (feature kept for later / AI content). */
const SHOW_UNDERSTAND_QUOTE = false;

export function TodayScreen() {
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight < COMPACT_LAYOUT_THRESHOLD;
  const styles = createStyles(colors, isCompact, windowHeight);
  const {
    todayQuote,
    extraQuote,
    notificationSettings,
    claimExtraQuote,
    toggleSave,
  } = useAppState();
  const [streakResult, setStreakResult] = useState<UpdateStreakResult | null>(null);
  const [visibleMilestone, setVisibleMilestone] = useState<number | null>(null);
  const [reflectionStreak, setReflectionStreak] = useState<number>(0);
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
  const [explanationQuote, setExplanationQuote] = useState<QuoteView | null>(null);
  const [reflectionQuote, setReflectionQuote] = useState<QuoteView | null>(null);

  const openQuoteExplanationModal = (quote: QuoteView) => {
    void selectionHaptic();
    setExplanationQuote(quote);
  };

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

  useEffect(() => {
    getReflectionStreak().then(setReflectionStreak);
  }, [reflectionQuote]);

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
      <Screen edges={[]} scroll={false}>
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
    <Screen edges={[]} scroll>
      {reminderOff ? (
        <Banner
          title="Reminders are currently off"
          body="That is fine. Quotify works fully without them, and you can enable local reminders anytime in Settings."
        />
      ) : null}
      <View style={styles.cardSlot}>
        <QuoteCard
          quote={todayQuote}
          eyebrow="Quote of the day"
          isExpanded={isTodayExpanded}
          onToggleExpanded={() => setIsTodayExpanded((current) => !current)}
          onPressAuthor={() => openAuthor(todayQuote.authorId)}
          background={QUOTE_CARD_BACKGROUNDS[getQuoteCardBackgroundIndex(getDayKey())]}
          hideAttribution
          style={styles.quoteCardFill}
          fillHeight
        />
      </View>
      <View style={styles.lowerBlock}>
        <View style={styles.iconRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={todayQuote.saved ? "Remove from saved" : "Save quote"}
            accessibilityState={{ disabled: savingQuoteId === todayQuote.id }}
            style={({ pressed }) => [
              styles.iconButton,
              todayQuote.saved && styles.iconButtonSaved,
              savingQuoteId === todayQuote.id && styles.iconButtonDisabled,
              pressed && savingQuoteId !== todayQuote.id && styles.iconButtonPressed,
            ]}
            onPress={() => handleToggleSave(todayQuote.id)}
            disabled={savingQuoteId === todayQuote.id}
          >
            {savingQuoteId === todayQuote.id ? (
              <ActivityIndicator size="small" color={colors.text} style={styles.iconSpinner} />
            ) : (
              <Heart
                size={22}
                color={todayQuote.saved ? colors.accent : colors.text}
              />
            )}
            <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={[styles.iconLabel, todayQuote.saved && styles.iconLabelSaved]}>
              {todayQuote.saved ? "Saved" : "Save"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share quote"
            accessibilityState={{ disabled: todayShare.isPreparing }}
            style={({ pressed }) => [
              styles.iconButton,
              todayShare.isPreparing && styles.iconButtonDisabled,
              pressed && !todayShare.isPreparing && styles.iconButtonPressed,
            ]}
            onPress={() => { void selectionHaptic(); todayShare.share(); }}
            disabled={todayShare.isPreparing}
          >
            {todayShare.isPreparing ? (
              <ActivityIndicator size="small" color={colors.text} style={styles.iconSpinner} />
            ) : (
              <Share2 size={22} color={colors.text} />
            )}
            <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.iconLabel}>Share</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reflect on this quote"
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => { void selectionHaptic(); setReflectionQuote(todayQuote); }}
          >
            <PenLine size={22} color={colors.text} />
            <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.iconLabel}>Reflect</Text>
          </Pressable>
          {SHOW_UNDERSTAND_QUOTE ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Understand this quote"
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              onPress={() => openQuoteExplanationModal(todayQuote)}
            >
              <Lightbulb size={22} color={colors.text} />
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.iconLabel}>Understand</Text>
            </Pressable>
          ) : null}
        </View>
        {streakLabel != null ? (
          <Text style={styles.streakLabel}>{streakLabel}</Text>
        ) : null}
        {reflectionStreak > 0 ? (
          <Text style={styles.streakLabel}>🧠 {reflectionStreak}-day reflection streak</Text>
        ) : null}
        {visibleMilestone != null && MILESTONE_MESSAGES[visibleMilestone] ? (
          <Banner
            title={`🔥 ${visibleMilestone}-day streak`}
            body={MILESTONE_MESSAGES[visibleMilestone]}
          />
        ) : null}
        <View style={styles.exploreBlock}>
          <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.exploreCopy}>
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
          <>
            <View style={styles.extraSection}>
              <QuoteCard
              quote={extraQuote}
              eyebrow="One more for today"
              isExpanded={isExtraExpanded}
              onToggleExpanded={() => setIsExtraExpanded((current) => !current)}
              onPressAuthor={() => openAuthor(extraQuote.authorId)}
              hideAttribution
            />
            <View style={styles.iconRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={extraQuote.saved ? "Remove from saved" : "Save quote"}
                accessibilityState={{ disabled: savingQuoteId === extraQuote.id }}
                style={({ pressed }) => [
                  styles.iconButton,
                  extraQuote.saved && styles.iconButtonSaved,
                  savingQuoteId === extraQuote.id && styles.iconButtonDisabled,
                  pressed && savingQuoteId !== extraQuote.id && styles.iconButtonPressed,
                ]}
                onPress={() => handleToggleSave(extraQuote.id)}
                disabled={savingQuoteId === extraQuote.id}
              >
                {savingQuoteId === extraQuote.id ? (
                  <ActivityIndicator size="small" color={colors.text} style={styles.iconSpinner} />
                ) : (
                  <Heart size={22} color={extraQuote.saved ? colors.accent : colors.text} />
                )}
                <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={[styles.iconLabel, extraQuote.saved && styles.iconLabelSaved]}>
                  {extraQuote.saved ? "Saved ✓" : "Save"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share quote"
                accessibilityState={{ disabled: extraShare.isPreparing }}
                style={({ pressed }) => [
                  styles.iconButton,
                  extraShare.isPreparing && styles.iconButtonDisabled,
                  pressed && !extraShare.isPreparing && styles.iconButtonPressed,
                ]}
                onPress={() => { void selectionHaptic(); extraShare.share(); }}
                disabled={extraShare.isPreparing}
              >
                {extraShare.isPreparing ? (
                  <ActivityIndicator size="small" color={colors.text} style={styles.iconSpinner} />
                ) : (
                  <Share2 size={22} color={colors.text} />
                )}
                <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.iconLabel}>Share</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reflect on this quote"
                style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                onPress={() => { void selectionHaptic(); setReflectionQuote(extraQuote); }}
              >
                <PenLine size={22} color={colors.text} />
                <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.iconLabel}>Reflect</Text>
              </Pressable>
              {SHOW_UNDERSTAND_QUOTE ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Understand this quote"
                  style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                  onPress={() => openQuoteExplanationModal(extraQuote)}
                >
                  <Lightbulb size={22} color={colors.text} />
                  <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.iconLabel}>Understand</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </>
        ) : null}
      </View>
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
      {SHOW_UNDERSTAND_QUOTE ? (
        <QuoteExplanationSheet
          visible={explanationQuote !== null}
          quote={explanationQuote}
          onClose={() => setExplanationQuote(null)}
        />
      ) : null}
      <ReflectionSheet
        visible={reflectionQuote !== null}
        quote={reflectionQuote}
        onClose={() => {
          setReflectionQuote(null);
          getReflectionStreak().then(setReflectionStreak);
        }}
      />
    </Screen>
  );
}

const MIN_CARD_HEIGHT_RATIO = 0.42;

const createStyles = (colors: ThemeTokens, isCompact = false, windowHeight?: number) =>
  StyleSheet.create({
    cardSlot: {
      flex: 1,
      minHeight: windowHeight != null ? Math.max(280, windowHeight * MIN_CARD_HEIGHT_RATIO) : 280,
    },
    quoteCardFill: {
      flex: 1,
    },
    lowerBlock: {
      gap: isCompact ? 8 : 14,
    },
    iconRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: isCompact ? 4 : 6,
    },
    iconButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: BUTTON_BORDER_RADIUS,
      backgroundColor: colors.surfaceMuted,
      minHeight: 52,
    },
    iconButtonSaved: {
      borderWidth: 1,
      borderColor: colors.accentSoft,
    },
    iconButtonPressed: {
      opacity: 0.82,
    },
    iconButtonDisabled: {
      opacity: 0.6,
    },
    iconLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    iconLabelSaved: {
      color: colors.accent,
    },
    iconSpinner: {
      marginBottom: 2,
    },
    header: {
      gap: 2,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    streakLabel: {
      fontSize: isCompact ? 13 : 14,
      color: colors.textMuted,
      marginTop: isCompact ? 4 : 8,
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
      minHeight: 44,
      paddingVertical: BUTTON_PADDING_VERTICAL,
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
    saveIcon: {},
    saveSpinner: {},
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
      minHeight: 44,
      paddingVertical: BUTTON_PADDING_VERTICAL,
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
    shareIcon: {},
    shareSpinner: {},
    shareLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    actionsBlock: {
      gap: 12,
      marginTop: isCompact ? 2 : 4,
    },
    exploreBlock: {
      gap: isCompact ? 2 : 4,
    },
    exploreCopy: {
      fontSize: isCompact ? 13 : 14,
      lineHeight: isCompact ? 18 : 20,
      color: colors.textMuted,
    },
    getAnotherQuoteDisabled: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    extraSection: {
      gap: isCompact ? 8 : 12,
    },
  });
