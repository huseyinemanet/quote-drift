import { useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import ViewShot from "react-native-view-shot";

import { renderQuoteStoryCard } from "@/core/sharecard/renderQuoteStoryCard";
import { scheduleTempFileCleanup } from "@/core/sharecard/cleanupTempFiles";
import { shareImage as shareImageFile } from "@/core/sharecard/shareImage";
import type { ShareableQuote } from "@/core/types";
import { StoryCard } from "@/ui/components/StoryCard";

export function useShareQuote(quote: ShareableQuote | null) {
  const captureRef = useRef<ViewShot | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const captureImage = async () => {
    if (!quote || !captureRef.current) {
      throw new Error("Quote story capture is not ready.");
    }

    return renderQuoteStoryCard(captureRef.current as Parameters<
      typeof renderQuoteStoryCard
    >[0]);
  };

  const share = async () => {
    if (!quote) {
      return;
    }

    setIsPreparing(true);

    try {
      const uri = await captureImage();
      await shareImageFile(uri);
      scheduleTempFileCleanup(uri);
    } catch {
      showToast("Couldn't prepare the story image. Please try again.");
    } finally {
      setIsPreparing(false);
    }
  };

  const captureTarget = useMemo(
    () =>
      quote ? (
        <View pointerEvents="none" style={styles.captureRoot}>
          <View collapsable={false}>
            <ViewShot ref={captureRef} style={styles.captureShot}>
              <StoryCard quote={quote} />
            </ViewShot>
          </View>
        </View>
      ) : null,
    [quote]
  );

  return {
    isPreparing,
    toastMessage,
    share,
    captureTarget,
  };
}

const styles = StyleSheet.create({
  captureRoot: {
    position: "absolute",
    top: -10_000,
    left: -10_000,
    opacity: 0,
  },
  captureShot: {
    width: 1080,
    height: 1920,
  },
});
