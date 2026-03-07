import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBottomChromeInset } from "@/features/layout/BottomChromeInset";

import { ThemeTokens, useTheme } from "./theme";

type Props = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  /** Rendered at the bottom of the screen, outside scroll (sticky). */
  stickyFooter?: ReactNode;
}>;

const STICKY_FOOTER_PADDING_BOTTOM = 160;

export function Screen({ children, scroll = true, padded = true, stickyFooter }: Props) {
  const { colors } = useTheme();
  const bottomChromeInset = useBottomChromeInset();
  const styles = createStyles(colors);
  const content = padded ? (
    <View
      style={[
        styles.content,
        !scroll ? { paddingBottom: 12 + bottomChromeInset, flex: 1 } : null,
      ]}
    >
      {children}
    </View>
  ) : scroll ? (
    children
  ) : (
    <View style={{ paddingBottom: bottomChromeInset }}>{children}</View>
  );

  const scrollContent = (
    <ScrollView
      style={stickyFooter ? styles.scrollViewFlex : undefined}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: stickyFooter
            ? 24 + STICKY_FOOTER_PADDING_BOTTOM + bottomChromeInset
            : 16 + bottomChromeInset,
        },
      ]}
    >
      {content}
    </ScrollView>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {scroll ? (stickyFooter ? <View style={styles.scrollWrap}>{scrollContent}</View> : scrollContent) : content}
      {stickyFooter ? (
        <View style={[styles.stickyFooter, { paddingBottom: 24 + bottomChromeInset }]}>
          {stickyFooter}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollWrap: {
      flex: 1,
    },
    scrollViewFlex: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 16,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 14,
    },
    stickyFooter: {
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 10,
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  });
