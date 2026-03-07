import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppState } from "@/core/bootstrap";
import { getDayKey } from "@/core/date";
import { selectionHaptic } from "@/core/haptics";
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
  const [savingQuoteId, setSavingQuoteId] = useState<string | null>(null);

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
      <Screen edges={["bottom"]}>
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
    streak >= 7
      ? `🔥 ${streak} day streak`
      : streak > 0
        ? `${streak} day read streak`
        : "Day 1 starts today";

  return (
    <Screen edges={["bottom"]}>
      <View style={styles.header}>
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
        background={QUOTE_CARD_BACKGROUNDS[getQuoteCardBackgroundIndex(getDayKey())]}
        hideAttribution
      />
      <View style={styles.actionsBlock}>
        <View style={styles.row}>
          <View style={styles.buttonSlot}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                savingQuoteId === todayQuote.id && styles.saveButtonDisabled,
                pressed && savingQuoteId !== todayQuote.id && styles.saveButtonPressed,
              ]}
              onPress={() => handleToggleSave(todayQuote.id)}
              disabled={savingQuoteId === todayQuote.id}
            >
              <Ionicons
                name={todayQuote.saved ? "heart" : "heart-outline"}
                size={24}
                color={todayQuote.saved ? colors.accent : colors.text}
                style={styles.saveIcon}
              />
              <Text style={[styles.saveLabel, todayQuote.saved && styles.saveLabelSaved]}>
                {savingQuoteId === todayQuote.id ? "..." : todayQuote.saved ? "Saved ✓" : "Save"}
              </Text>
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
              <Ionicons
                name="share-outline"
                size={24}
                color={colors.text}
                style={styles.shareIcon}
              />
              <Text style={styles.shareLabel}>
                {todayShare.isPreparing ? "Preparing..." : "Share"}
              </Text>
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
                    savingQuoteId === extraQuote.id && styles.saveButtonDisabled,
                    pressed && savingQuoteId !== extraQuote.id && styles.saveButtonPressed,
                  ]}
                  onPress={() => handleToggleSave(extraQuote.id)}
                  disabled={savingQuoteId === extraQuote.id}
                >
                  <Ionicons
                    name={extraQuote.saved ? "heart" : "heart-outline"}
                    size={24}
                    color={extraQuote.saved ? colors.accent : colors.text}
                    style={styles.saveIcon}
                  />
                  <Text style={[styles.saveLabel, extraQuote.saved && styles.saveLabelSaved]}>
                    {savingQuoteId === extraQuote.id ? "..." : extraQuote.saved ? "Saved ✓" : "Save"}
                  </Text>
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
                  <Ionicons
                    name="share-outline"
                    size={24}
                    color={colors.text}
                    style={styles.shareIcon}
                  />
                  <Text style={styles.shareLabel}>
                    {extraShare.isPreparing ? "Preparing..." : "Share"}
                  </Text>
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
    saveButtonPressed: {
      opacity: 0.82,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveIcon: {
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
      gap: 10,
    },
    exploreCopy: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    extraSection: {
      gap: 12,
    },
  });
