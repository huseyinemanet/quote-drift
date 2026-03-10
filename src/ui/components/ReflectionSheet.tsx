import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { X } from "lucide-react-native";

import { getReflection, saveReflection } from "@/core/reflections";
import { getReflectionPrompt, getReflectionHints } from "@/core/reflectionPrompts";
import { successHaptic } from "@/core/haptics";
import type { QuoteView } from "@/core/types";
import { getDayKey } from "@/core/date";

import { Button } from "../Button";
import { MAX_FONT_SIZE_MULTIPLIER, ThemeTokens, useTheme } from "../theme";

type Props = {
  visible: boolean;
  quote: QuoteView | null;
  onClose: () => void;
  /** When provided, load/save reflection for this day instead of today (e.g. when opening from My reflections). */
  dayKey?: string;
};

export function ReflectionSheet({ visible, quote, onClose, dayKey: dayKeyProp }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(visible && !!quote);
  const displayedQuoteRef = useRef<QuoteView | null>(null);
  if (visible && quote) displayedQuoteRef.current = quote;
  const displayedQuote = displayedQuoteRef.current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;

  const effectiveDayKey = dayKeyProp ?? getDayKey();

  const loadInitialReflection = useCallback(async () => {
    if (!quote) return;
    setIsLoading(true);
    try {
      const reflection = await getReflection(quote.id, effectiveDayKey);
      setText(reflection?.text ?? "");
    } finally {
      setIsLoading(false);
    }
  }, [quote?.id, effectiveDayKey]);

  useEffect(() => {
    if (visible && quote) {
      setIsMounted(true);
      displayedQuoteRef.current = quote;
      setText("");
      setSaveSuccess(false);
      void loadInitialReflection();
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
        setText("");
        setSaveSuccess(false);
      }
    });
    return () => closeSeq.stop();
  }, [visible, quote?.id, backdropOpacity, sheetTranslateY, loadInitialReflection]);

  const handleSave = async () => {
    if (!displayedQuote || isSaving) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveReflection(
        displayedQuote.id,
        effectiveDayKey,
        trimmed,
        displayedQuote.primaryTag ?? null
      );
      setSaveSuccess(true);
      await successHaptic();
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted || !displayedQuote) {
    return null;
  }

  const prompt = getReflectionPrompt(displayedQuote.primaryTag);
  const hints = getReflectionHints(displayedQuote.primaryTag);

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
              Reflect
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
          <View style={styles.content}>
            <View style={styles.quoteBlock}>
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.quoteText}>
                "{displayedQuote.text}"
              </Text>
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.author}>
                — {displayedQuote.author}
              </Text>
            </View>
            <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.prompt}>
              {prompt}
            </Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Write what this quote made you think about..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading && !saveSuccess}
              accessibilityLabel="Reflection text"
              maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
            />
            <View style={styles.hintsBlock}>
              <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.hintsTitle}>
                Think about:
              </Text>
              {hints.map((hint, index) => (
                <Text
                  key={index}
                  maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                  style={styles.hintItem}
                >
                  • {hint}
                </Text>
              ))}
            </View>
            {saveSuccess ? (
              <View style={styles.successBlock}>
                <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.successText}>
                  ✔ Reflection saved
                </Text>
                <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.successSubtext}>
                  Come back tomorrow to continue your streak.
                </Text>
              </View>
            ) : (
              <Button
                label="Save reflection"
                onPress={handleSave}
                loading={isSaving}
                disabled={isLoading || !text.trim()}
              />
            )}
          </View>
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
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 16,
    },
    quoteBlock: {
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
    prompt: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    input: {
      minHeight: 120,
      padding: 14,
      fontSize: 16,
      lineHeight: 22,
      color: colors.text,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
    },
    hintsBlock: {
      gap: 4,
    },
    hintsTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
    },
    hintItem: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
    },
    successBlock: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
      alignItems: "center",
    },
    successText: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.accent,
    },
    successSubtext: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });
