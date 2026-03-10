import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useIsTablet } from "@/features/layout/useBreakpoint";
import { Button } from "@/ui/Button";
import { ThemeTokens, useTheme } from "@/ui/theme";

type Props = {
  visible: boolean;
  isPreparing: boolean;
  onClose: () => void;
  onShareToInstagramStory: () => void;
  onShareImage: () => void;
  onCopyText: () => void;
};

export function ShareSheet({
  visible,
  isPreparing,
  onClose,
  onShareToInstagramStory,
  onShareImage,
  onCopyText,
}: Props) {
  const { colors } = useTheme();
  const isTablet = useIsTablet();
  const styles = createStyles(colors);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      {...(Platform.OS === "ios" && isTablet && { presentationStyle: "formSheet" })}
    >
      <View style={[styles.root, isTablet && styles.rootTablet]}>
        <Pressable style={styles.scrim} onPress={isPreparing ? undefined : onClose} />
        <SafeAreaView edges={["bottom"]} style={[styles.sheetWrap, isTablet && styles.sheetWrapTablet]}>
          <View style={[styles.sheet, isTablet && styles.sheetTablet]}>
            <View style={styles.handle} />
            <Text style={styles.title}>Share quote</Text>
            <Text style={styles.body}>
              {isPreparing
                ? "Preparing your story image..."
                : "Choose how you want to share this quote."}
            </Text>
            <View style={styles.actions}>
              <Button
                label={isPreparing ? "Preparing..." : "Share to Instagram Story"}
                onPress={onShareToInstagramStory}
                disabled={isPreparing}
              />
              <Button
                label="Share image…"
                variant="secondary"
                onPress={onShareImage}
                disabled={isPreparing}
              />
              <Button
                label="Copy text"
                variant="ghost"
                onPress={onCopyText}
                disabled={isPreparing}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: "flex-end",
    },
    rootTablet: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.28)",
    },
    sheetWrap: {
      justifyContent: "flex-end",
    },
    sheetWrapTablet: {
      justifyContent: "center",
      width: "100%",
      maxWidth: 400,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 16,
      gap: 12,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    sheetTablet: {
      borderRadius: 28,
      borderTopWidth: 1,
      alignSelf: "center",
    },
    handle: {
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 2,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },
    body: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
    },
    actions: {
      gap: 12,
      paddingTop: 4,
    },
  });
