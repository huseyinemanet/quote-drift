import { Pressable, StyleSheet, Text } from "react-native";

import { selectionHaptic } from "@/core/haptics";
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

  return (
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
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
    },
    selected: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    disabled: {
      opacity: 0.4,
    },
    label: {
      color: colors.text,
      fontWeight: "600",
    },
    selectedLabel: {
      color: colors.background,
    },
    disabledLabel: {
      color: colors.textMuted,
    },
  });
