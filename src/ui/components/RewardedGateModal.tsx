import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  const [isMounted, setIsMounted] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(64)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(64);

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 20,
        stiffness: 220,
        mass: 0.92,
        delay: 42,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.sequence([
      Animated.timing(sheetTranslateY, {
        toValue: 64,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [overlayOpacity, sheetTranslateY, visible]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>One more quote</Text>
          <Text style={styles.body}>
            Watch a short ad to continue.
          </Text>
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
            <Pressable
              accessibilityRole="button"
              disabled={!isReady}
              onPress={onWatchAd}
              style={({ pressed }) => [
                styles.primaryAction,
                pressed && isReady ? styles.primaryActionPressed : null,
                !isReady ? styles.primaryActionDisabled : null,
              ]}
            >
              <Text style={styles.primaryActionLabel}>
                {isSubmitting ? "Opening..." : "Watch ad"}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryAction} onPress={onClose}>
              <Text style={styles.secondaryActionLabel}>Not now</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(7, 9, 11, 0.56)",
      justifyContent: "flex-end",
      paddingHorizontal: 14,
      paddingBottom: 10,
    },
    card: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      gap: 8,
    },
    handle: {
      width: 42,
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 6,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    body: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 21,
    },
    note: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    actions: {
      gap: 2,
      marginTop: 2,
    },
    primaryAction: {
      minHeight: 50,
      borderRadius: 17,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
    },
    primaryActionPressed: {
      opacity: 0.88,
    },
    primaryActionDisabled: {
      opacity: 0.45,
    },
    primaryActionLabel: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryAction: {
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryActionLabel: {
      color: colors.textMuted,
      fontSize: 15,
      fontWeight: "600",
    },
  });
