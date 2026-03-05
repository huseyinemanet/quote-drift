import type { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { colors } from "./theme";

type Props = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
}>;

export function Screen({ children, scroll = true, padded = true }: Props) {
  const content = padded ? <View style={styles.content}>{children}</View> : children;

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
});
