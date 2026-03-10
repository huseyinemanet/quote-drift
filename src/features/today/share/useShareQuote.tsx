import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import ViewShot from "react-native-view-shot";

import {
  BlankImageError,
  renderQuoteStoryCard,
} from "@/core/sharecard/renderQuoteStoryCard";
import { scheduleTempFileCleanup } from "@/core/sharecard/cleanupTempFiles";
import { shareImage as shareImageFile, ShareFailedError } from "@/core/sharecard/shareImage";
import { STORY_HEIGHT, STORY_WIDTH } from "@/core/sharecard/dimensions";
import type { ShareableQuote } from "@/core/types";
import { StoryCard } from "@/ui/components/StoryCard";

const LAYOUT_WAIT_MS = 400;
const RETRY_DELAY_MS = 200;

export function useShareQuote(quote: ShareableQuote | null) {
  const captureRef = useRef<ViewShot | null>(null);
  const cancelTempCleanupRef = useRef<(() => void) | null>(null);
  const layoutResolveRef = useRef<(() => void) | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      cancelTempCleanupRef.current?.();
      cancelTempCleanupRef.current = null;
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const waitForLayout = (): Promise<void> =>
    new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, LAYOUT_WAIT_MS);
      const done = () => {
        clearTimeout(timeoutId);
        if (layoutResolveRef.current === done) {
          layoutResolveRef.current = null;
        }
        resolve();
      };
      layoutResolveRef.current = done;
    });

  const handleCaptureLayout = () => {
    layoutResolveRef.current?.();
    layoutResolveRef.current = null;
  };

  const captureImage = async (): Promise<string> => {
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

    cancelTempCleanupRef.current?.();
    cancelTempCleanupRef.current = null;

    setIsPreparing(true);

    try {
      await new Promise<void>((r) => setTimeout(r, 0));
      await waitForLayout();

      let uri: string;
      try {
        uri = await captureImage();
      } catch (captureErr) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        await waitForLayout();
        uri = await captureImage();
      }

      await shareImageFile(uri);
      cancelTempCleanupRef.current = scheduleTempFileCleanup(uri);
    } catch (err) {
      if (err instanceof BlankImageError) {
        showToast("Image came out empty. Please try again.");
        return;
      }
      if (err instanceof ShareFailedError) {
        showToast("Sharing failed. Please try again.");
        return;
      }
      showToast("Image capture failed. Please try again.");
    } finally {
      setIsPreparing(false);
    }
  };

  const captureTarget = useMemo(
    () =>
      quote ? (
        <View
          pointerEvents="none"
          style={styles.captureRoot}
          onLayout={handleCaptureLayout}
          collapsable={false}
        >
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
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
  },
});
