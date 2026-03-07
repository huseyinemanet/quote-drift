import type { PropsWithChildren, ReactNode } from "react";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBottomChromeInset } from "@/features/layout/BottomChromeInset";

import { ThemeTokens, useTheme } from "./theme";

/** Fallback when tab bar height not yet reported (onLayout is async). */
const MIN_BOTTOM_CHROME_INSET = 84;

type Props = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  /** Safe area edges to apply. Default ["top"]. Use ["bottom"] when screen has a nav bar to avoid double top spacing. */
  edges?: ("top" | "bottom")[];
  /** Rendered at the bottom of the screen, outside scroll (sticky). */
  stickyFooter?: ReactNode;
  /** When false, do not add tab bar height to bottom spacing (e.g. onboarding has no tab bar). Default true. */
  useChromeInset?: boolean;
  /** When true, shows bottom inset values on screen and logs to console (for debugging tab bar cut-off).
   *  Enable on TodayScreen with: <Screen debugInsets> to see inset / paddingBottom on device. */
  debugInsets?: boolean;
}>;

const STICKY_FOOTER_PADDING_BOTTOM = 160;

export function Screen({ children, scroll = true, padded = true, edges = ["top"], stickyFooter, useChromeInset = true, debugInsets = false }: Props) {
  const { colors } = useTheme();
  const bottomChromeInset = useBottomChromeInset();
  const effectiveBottomInset = useChromeInset
    ? (bottomChromeInset > 0 ? bottomChromeInset : MIN_BOTTOM_CHROME_INSET)
    : bottomChromeInset;
  const paddingBottom = stickyFooter
    ? 24 + STICKY_FOOTER_PADDING_BOTTOM + effectiveBottomInset
    : 24 + effectiveBottomInset;
  const styles = createStyles(colors);

  useEffect(() => {
    if (__DEV__ && (debugInsets || bottomChromeInset !== effectiveBottomInset)) {
      console.log("[Screen] bottomChromeInset:", bottomChromeInset, "effectiveBottomInset:", effectiveBottomInset, "paddingBottom:", paddingBottom);
    }
  }, [bottomChromeInset, effectiveBottomInset, paddingBottom, debugInsets]);

  const content = padded ? (
    <View
      style={[
        styles.content,
        !scroll ? { paddingBottom: 12 + effectiveBottomInset, flex: 1 } : null,
      ]}
    >
      {children}
    </View>
  ) : scroll ? (
    children
  ) : (
    <View style={{ paddingBottom: effectiveBottomInset }}>{children}</View>
  );

  const scrollContent = (
    <ScrollView
      style={stickyFooter ? styles.scrollViewFlex : undefined}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom,
        },
      ]}
    >
      {content}
    </ScrollView>
  );

  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      {scroll ? (stickyFooter ? <View style={styles.scrollWrap}>{scrollContent}</View> : scrollContent) : content}
      {stickyFooter ? (
        <View style={[styles.stickyFooter, { paddingBottom: 24 + effectiveBottomInset }]}>
          {stickyFooter}
        </View>
      ) : null}
      {debugInsets ? (
        <View style={styles.debugBanner} pointerEvents="none">
          <Text style={styles.debugText}>
            inset: {bottomChromeInset} → effective: {effectiveBottomInset} | paddingBottom: {paddingBottom}
          </Text>
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
    debugBanner: {
      position: "absolute",
      bottom: 100,
      left: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.75)",
      padding: 8,
      borderRadius: 8,
    },
    debugText: {
      color: "#fff",
      fontSize: 11,
    },
  });
