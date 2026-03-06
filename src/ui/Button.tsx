import { Pressable, StyleSheet, Text } from "react-native";

import { ThemeTokens, useTheme } from "./theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "ghost" ? styles.ghostLabel : null,
          variant === "secondary" ? styles.secondaryLabel : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    base: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
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
      fontWeight: "600",
      fontSize: 16,
    },
    secondaryLabel: {
      color: colors.text,
    },
    ghostLabel: {
      color: colors.text,
    },
  });
