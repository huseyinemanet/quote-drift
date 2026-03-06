import * as FileSystem from "expo-file-system/legacy";
import { captureRef } from "react-native-view-shot";

import { getSharecardDirectory } from "./cleanupTempFiles";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

async function ensureDirectory() {
  const directory = getSharecardDirectory();
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true }).catch(() => undefined);
  return directory;
}

async function waitForFrame() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function renderQuoteStoryCard(
  viewRef: Parameters<typeof captureRef>[0]
) {
  await waitForFrame();

  const tempCaptureUri = await captureRef(viewRef, {
    format: "png",
    quality: 1,
    result: "tmpfile",
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
  });

  const directory = await ensureDirectory();
  const finalUri = `${directory}/quote-drift-story-${Date.now()}.png`;

  await FileSystem.copyAsync({ from: tempCaptureUri, to: finalUri });

  if (tempCaptureUri !== finalUri) {
    await FileSystem.deleteAsync(tempCaptureUri, { idempotent: true }).catch(() => undefined);
  }

  return finalUri;
}
