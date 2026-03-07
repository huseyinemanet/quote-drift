import { StyleSheet, Text, View } from "react-native";

import { ThemeTokens, useTheme } from "./theme";

export function Banner({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 16,
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
