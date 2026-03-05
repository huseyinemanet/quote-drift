import { StyleSheet, Text, View } from "react-native";

import { colors } from "./theme";

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
