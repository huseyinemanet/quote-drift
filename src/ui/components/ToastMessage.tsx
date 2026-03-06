import { StyleSheet, Text, View } from "react-native";

import { useBottomChromeInset } from "@/features/layout/BottomChromeInset";
import { ThemeTokens, useTheme } from "@/ui/theme";

export function ToastMessage({ message }: { message: string }) {
  const { colors } = useTheme();
  const bottomChromeInset = useBottomChromeInset();
  const styles = createStyles(colors);

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { bottom: bottomChromeInset + 28 }]}
    >
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 20,
      right: 20,
      alignItems: "center",
    },
    toast: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 18,
      paddingVertical: 12,
      minWidth: 180,
    },
    text: {
      color: colors.text,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
    },
  });
