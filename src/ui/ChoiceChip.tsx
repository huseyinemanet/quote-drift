import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "./theme";

export function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : null]}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  label: {
    color: colors.text,
    fontWeight: "600",
  },
  selectedLabel: {
    color: "#fff",
  },
});
