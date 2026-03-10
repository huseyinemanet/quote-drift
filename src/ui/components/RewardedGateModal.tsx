import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PlayCircle } from "lucide-react-native";

import { useIsTablet } from "@/features/layout/useBreakpoint";
import {
  BUTTON_BORDER_RADIUS,
  BUTTON_FONT_SIZE,
  BUTTON_FONT_WEIGHT,
  BUTTON_PADDING_HORIZONTAL,
  BUTTON_PADDING_VERTICAL,
} from "@/ui/buttonMetrics";
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
  const isTablet = useIsTablet();
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
      sheetTranslateY.setValue(isTablet ? 0 : 64);

      const a1 = Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
      const a2 = Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 20,
        stiffness: 220,
        mass: 0.92,
        delay: isTablet ? 0 : 42,
        useNativeDriver: true,
      });
      a1.start();
      a2.start();
      return () => {
        a1.stop();
        a2.stop();
      };
    }

    const closeSeq = Animated.sequence([
      Animated.timing(sheetTranslateY, {
        toValue: isTablet ? 0 : 64,
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
    ]);
    closeSeq.start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
    return () => {
      closeSeq.stop();
    };
  }, [overlayOpacity, sheetTranslateY, visible, isTablet]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      {...(Platform.OS === "ios" && isTablet && { presentationStyle: "formSheet" })}
    >
      <Animated.View style={[styles.backdrop, isTablet && styles.backdropCentered, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.card,
            isTablet && styles.cardTablet,
            {
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.headerBlock}>
            <PlayCircle
              size={56}
              color={colors.accent}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>One more quote</Text>
            <Text style={styles.body}>
              Watch a short ad to continue.
            </Text>
          </View>
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
              accessibilityLabel="Watch ad"
              accessibilityState={{ disabled: !isReady }}
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Not now"
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed && styles.secondaryActionPressed,
              ]}
              onPress={onClose}
            >
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
    },
    backdropCentered: {
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
      gap: 14,
    },
    cardTablet: {
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderRadius: 16,
      maxWidth: 400,
      width: "100%",
    },
    headerBlock: {
      gap: 6,
      alignItems: "center",
    },
    headerIcon: {
      marginBottom: 2,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    body: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 21,
      textAlign: "center",
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
      gap: 14,
      marginTop: 8,
    },
    primaryAction: {
      borderRadius: BUTTON_BORDER_RADIUS,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
      paddingVertical: BUTTON_PADDING_VERTICAL,
    },
    primaryActionPressed: {
      opacity: 0.88,
    },
    primaryActionDisabled: {
      opacity: 0.45,
    },
    primaryActionLabel: {
      color: colors.background,
      fontSize: BUTTON_FONT_SIZE,
      fontWeight: BUTTON_FONT_WEIGHT,
    },
    secondaryAction: {
      paddingVertical: BUTTON_PADDING_VERTICAL,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryActionPressed: {
      opacity: 0.82,
    },
    secondaryActionLabel: {
      color: colors.textMuted,
      fontSize: BUTTON_FONT_SIZE,
      fontWeight: BUTTON_FONT_WEIGHT,
    },
  });
