import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/ui/Button";
import { ThemeTokens, useTheme } from "@/ui/theme";

type Props = {
  visible: boolean;
  status: "loading" | "ready" | "error";
  isSubmitting: boolean;
  onWatchAd: () => void;
  onClose: () => void;
};

export function RewardedGateModal({
  visible,
  status,
  isSubmitting,
  onWatchAd,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isLoading = status === "loading" || isSubmitting;
  const isReady = status === "ready" && !isSubmitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <Text style={styles.title}>One extra quote</Text>
          <Text style={styles.body}>
            Optional. Watch a short ad to unlock one more quote today.
          </Text>
          <Text style={styles.microcopy}>Your daily quote is always free.</Text>
          {status === "error" ? (
            <Text style={styles.note}>A short ad is unavailable right now.</Text>
          ) : null}
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.note}>Preparing a short ad…</Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            <Button
              label={isSubmitting ? "Opening..." : "Watch ad"}
              onPress={onWatchAd}
              disabled={!isReady}
            />
            <Button label="Not now" variant="ghost" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.44)",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 28,
      paddingHorizontal: 20,
      paddingVertical: 22,
      gap: 12,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "700",
    },
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    microcopy: {
      color: colors.textMuted,
      fontSize: 13,
    },
    note: {
      color: colors.textMuted,
      fontSize: 14,
    },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    actions: {
      gap: 10,
      marginTop: 4,
    },
  });
