import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

import { selectionHaptic } from "@/core/haptics";
import {
  BUTTON_BORDER_RADIUS,
  BUTTON_FONT_SIZE,
  BUTTON_FONT_WEIGHT,
  BUTTON_PADDING_VERTICAL,
} from "@/ui/buttonMetrics";
import { ThemeTokens, useTheme } from "./theme";

export function ChoiceChip({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: disabled ? 0.98 : 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: disabled ? 0.4 : 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, scale, opacity]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => {
          void selectionHaptic();
          onPress();
        }}
        style={[
          styles.chip,
          selected ? styles.selected : null,
          disabled ? styles.disabled : null,
        ]}
      >
        <Text
          style={[
            styles.label,
            selected ? styles.selectedLabel : null,
            disabled ? styles.disabledLabel : null,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "transparent",
      paddingHorizontal: 18,
      paddingVertical: BUTTON_PADDING_VERTICAL,
      borderRadius: BUTTON_BORDER_RADIUS,
    },
    selected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      borderWidth: 0,
      opacity: 0.9,
    },
    disabled: {
      opacity: 1,
    },
    label: {
      color: colors.text,
      fontWeight: BUTTON_FONT_WEIGHT,
      fontSize: BUTTON_FONT_SIZE,
    },
    selectedLabel: {
      color: colors.background,
    },
    disabledLabel: {
      color: colors.textMuted,
    },
  });
