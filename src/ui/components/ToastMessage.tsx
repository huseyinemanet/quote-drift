import { StyleSheet, Text, View } from "react-native";

import { useBottomChromeInset } from "@/features/layout/BottomChromeInset";
import { ThemeTokens, useTheme } from "@/ui/theme";

type Props = {
  message: string;
  variant?: "default" | "hud";
};

export function ToastMessage({ message, variant = "default" }: Props) {
  const { colors } = useTheme();
  const bottomChromeInset = useBottomChromeInset();
  const styles = createStyles(colors);
  const isHud = variant === "hud";

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        isHud ? styles.containerHud : null,
        { bottom: bottomChromeInset + (isHud ? 22 : 28) },
      ]}
    >
      <View style={[styles.toast, isHud ? styles.toastHud : null]}>
        <Text style={[styles.text, isHud ? styles.textHud : null]}>{message}</Text>
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
    containerHud: {
      left: 0,
      right: 0,
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
    toastHud: {
      backgroundColor: "rgba(24, 28, 32, 0.86)",
      borderWidth: 0,
      borderColor: "transparent",
      borderRadius: 999,
      minWidth: 0,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    text: {
      color: colors.text,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
    },
    textHud: {
      color: colors.background,
      fontSize: 13,
      fontWeight: "600",
    },
  });
