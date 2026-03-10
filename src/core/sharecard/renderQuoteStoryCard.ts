import * as FileSystem from "expo-file-system/legacy";
import { captureRef } from "react-native-view-shot";

import { getSharecardDirectory } from "./cleanupTempFiles";
import { getShareCaptureHeight, getShareCaptureWidth } from "./dimensions";

const MIN_VALID_IMAGE_SIZE_BYTES = 20_000;

export class BlankImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlankImageError";
  }
}

async function ensureDirectory() {
  const directory = getSharecardDirectory();
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true }).catch(() => undefined);
  return directory;
}

async function waitForFrame() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function validateImageFile(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  const size = "size" in info && typeof info.size === "number" ? info.size : 0;
  if (size < MIN_VALID_IMAGE_SIZE_BYTES) {
    throw new BlankImageError(
      `Captured image too small (${size} bytes), likely blank or corrupt.`
    );
  }
}

export async function renderQuoteStoryCard(
  viewRef: Parameters<typeof captureRef>[0]
) {
  await waitForFrame();

  const width = getShareCaptureWidth();
  const height = getShareCaptureHeight();
  let tempCaptureUri: string;
  try {
    tempCaptureUri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      width,
      height,
    });
  } catch (err) {
    if (__DEV__ && err instanceof Error) {
      console.warn("[renderQuoteStoryCard] captureRef failed:", err.message);
    }
    throw err;
  }

  const directory = await ensureDirectory();
  const finalUri = `${directory}/Quotify Image.png`;

  try {
    await FileSystem.copyAsync({ from: tempCaptureUri, to: finalUri });
  } catch (err) {
    if (tempCaptureUri !== finalUri) {
      await FileSystem.deleteAsync(tempCaptureUri, { idempotent: true }).catch(() => undefined);
    }
    if (__DEV__ && err instanceof Error) {
      console.warn("[renderQuoteStoryCard] copyAsync failed:", err.message);
    }
    throw err;
  }

  if (tempCaptureUri !== finalUri) {
    await FileSystem.deleteAsync(tempCaptureUri, { idempotent: true }).catch(() => undefined);
  }

  await validateImageFile(finalUri);
  return finalUri;
}
