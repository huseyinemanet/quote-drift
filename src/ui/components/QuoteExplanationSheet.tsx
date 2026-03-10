import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { X } from "lucide-react-native";

import type { QuoteView } from "@/core/types";

import { MAX_FONT_SIZE_MULTIPLIER, ThemeTokens, useTheme } from "../theme";

type Props = {
  visible: boolean;
  quote: QuoteView | null;
  onClose: () => void;
};

function Section({
  title,
  body,
  styles,
}: {
  title: string;
  body: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.sectionTitle}>
        {title}
      </Text>
      <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.sectionBody}>
        {body}
      </Text>
    </View>
  );
}

export function QuoteExplanationSheet({ visible, quote, onClose }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isMounted, setIsMounted] = useState(visible && !!quote);
  const displayedQuoteRef = useRef<QuoteView | null>(null);
  if (visible && quote) displayedQuoteRef.current = quote;
  const displayedQuote = displayedQuoteRef.current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible && quote) {
      setIsMounted(true);
      displayedQuoteRef.current = quote;
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(600);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 32,
          stiffness: 280,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
      return () => {
        backdropOpacity.stopAnimation();
        sheetTranslateY.stopAnimation();
      };
    }

    const closeSeq = Animated.sequence([
      Animated.timing(sheetTranslateY, {
        toValue: 600,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    closeSeq.start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
        displayedQuoteRef.current = null;
      }
    });
    return () => closeSeq.stop();
  }, [visible, quote?.id, backdropOpacity, sheetTranslateY]);

  if (!isMounted || !displayedQuote) {
    return null;
  }

  const hasExplanation = Boolean(displayedQuote.explanation?.trim());
  const hasContext = Boolean(displayedQuote.context?.trim());
  const hasTakeaway = Boolean(displayedQuote.takeaway?.trim());
  const hasAny = hasExplanation || hasContext || hasTakeaway;

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdropWrap}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.header}>
            <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.title}>
              Understand this quote
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <X size={24} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.quoteBlock}>
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.quoteText}>
                "{displayedQuote.text}"
              </Text>
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.author}>
                — {displayedQuote.author}
              </Text>
            </View>
            {hasAny ? (
              <View style={styles.sections}>
                {hasExplanation ? (
                  <Section
                    title="Quote meaning"
                    body={displayedQuote.explanation!}
                    styles={styles}
                  />
                ) : null}
                {hasContext ? (
                  <Section
                    title="Historical context"
                    body={displayedQuote.context!}
                    styles={styles}
                  />
                ) : null}
                {hasTakeaway ? (
                  <Section
                    title="Practical takeaway"
                    body={displayedQuote.takeaway!}
                    styles={styles}
                  />
                ) : null}
              </View>
            ) : (
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.empty}>
                No explanation available for this quote.
              </Text>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    backdropWrap: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(7, 9, 11, 0.5)",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: "88%",
      maxHeight: "88%",
      paddingTop: 12,
      paddingBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    closeButton: {
      padding: 8,
      margin: -8,
    },
    closeButtonPressed: {
      opacity: 0.7,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
    },
    quoteBlock: {
      marginBottom: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quoteText: {
      fontSize: 17,
      lineHeight: 24,
      color: colors.text,
      fontFamily: "SourceSerif4_400Regular",
    },
    author: {
      fontSize: 15,
      color: colors.textMuted,
      marginTop: 8,
      fontWeight: "500",
    },
    sections: {
      gap: 20,
    },
    section: {
      gap: 6,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: colors.accent,
    },
    sectionBody: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },
    empty: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
  });
