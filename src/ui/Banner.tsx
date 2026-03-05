import { StyleSheet, Text, View } from "react-native";

import { colors } from "./theme";

export function Banner({
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
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
