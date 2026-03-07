import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import {
  BUTTON_BORDER_RADIUS,
  BUTTON_FONT_SIZE,
  BUTTON_FONT_WEIGHT,
  BUTTON_PADDING_HORIZONTAL,
  BUTTON_PADDING_VERTICAL,
} from "./buttonMetrics";
import { ThemeTokens, useTheme } from "./theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  minWidth?: number;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  minWidth,
  style,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        minWidth != null ? { minWidth } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" || variant === "ghost" ? colors.text : colors.background}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "ghost" ? styles.ghostLabel : null,
            variant === "secondary" ? styles.secondaryLabel : null,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    base: {
      borderRadius: BUTTON_BORDER_RADIUS,
      paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
      paddingVertical: BUTTON_PADDING_VERTICAL,
      alignItems: "center",
      justifyContent: "center",
    },
    primary: {
      backgroundColor: colors.text,
    },
    secondary: {
      backgroundColor: colors.surfaceMuted,
    },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    danger: {
      backgroundColor: colors.danger,
    },
    pressed: {
      opacity: 0.82,
    },
    disabled: {
      opacity: 0.45,
    },
    label: {
      color: colors.background,
      fontWeight: BUTTON_FONT_WEIGHT,
      fontSize: BUTTON_FONT_SIZE,
    },
    secondaryLabel: {
      color: colors.text,
    },
    ghostLabel: {
      color: colors.text,
    },
  });
