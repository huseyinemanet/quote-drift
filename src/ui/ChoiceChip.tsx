import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

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
  compact = false,
  leftIcon: LeftIcon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
  leftIcon?: React.ComponentType<{ size?: number; color: string }>;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors, compact);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const iconColor = disabled ? colors.textMuted : colors.text;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: disabled ? 0.99 : 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: disabled ? 0.82 : 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, scale, opacity]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        disabled={disabled}
        onPress={() => {
          void selectionHaptic();
          onPress();
        }}
        style={({ pressed }) => [
          styles.chip,
          selected ? styles.selected : null,
          disabled ? styles.disabled : null,
          pressed && !disabled ? styles.chipPressed : null,
        ]}
      >
        {LeftIcon ? (
          <View style={styles.iconWrap}>
            <LeftIcon size={compact ? 20 : 18} color={iconColor} />
          </View>
        ) : null}
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

const createStyles = (colors: ThemeTokens, compact: boolean) =>
  StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: compact ? 8 : 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "transparent",
      paddingHorizontal: compact ? 12 : 18,
      paddingVertical: compact ? 12 : BUTTON_PADDING_VERTICAL,
      borderRadius: compact ? 12 : BUTTON_BORDER_RADIUS,
    },
    selected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentSoft,
      borderWidth: 1,
    },
    disabled: {
      opacity: 1,
    },
    chipPressed: {
      opacity: 0.5,
    },
    label: {
      color: colors.text,
      fontWeight: compact ? "400" : BUTTON_FONT_WEIGHT,
      fontSize: compact ? 17 : BUTTON_FONT_SIZE,
      textAlign: "center",
      lineHeight: 20
    },
    selectedLabel: {
      color: colors.text,
      fontWeight: "500",
    },
    disabledLabel: {
      color: colors.textMuted,
    },
    iconWrap: {
      marginTop: compact ? 0 : 1,
    },
  });
