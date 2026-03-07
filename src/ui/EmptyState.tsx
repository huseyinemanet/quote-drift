import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { ThemeTokens, useTheme } from "./theme";

export function EmptyState({
  title,
  body,
  icon,
  fillVertical,
}: {
  title: string;
  body: string;
  icon?: ReactNode;
  fillVertical?: boolean;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, fillVertical && styles.containerFill]}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.title, fillVertical && styles.titleCentered]}>{title}</Text>
      <Text style={[styles.body, fillVertical && styles.bodyCentered]}>{body}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    containerFill: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 200,
    },
    iconWrap: {
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    titleCentered: {
      textAlign: "center",
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    bodyCentered: {
      textAlign: "center",
    },
  });
