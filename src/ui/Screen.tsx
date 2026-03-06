import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBottomChromeInset } from "@/features/layout/BottomChromeInset";

import { ThemeTokens, useTheme } from "./theme";

type Props = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
}>;

export function Screen({ children, scroll = true, padded = true }: Props) {
  const { colors } = useTheme();
  const bottomChromeInset = useBottomChromeInset();
  const styles = createStyles(colors);
  const content = padded ? (
    <View
      style={[
        styles.content,
        !scroll ? { paddingBottom: 16 + bottomChromeInset } : null,
      ]}
    >
      {children}
    </View>
  ) : scroll ? (
    children
  ) : (
    <View style={{ paddingBottom: bottomChromeInset }}>{children}</View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 24 + bottomChromeInset },
          ]}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 16,
    },
  });
