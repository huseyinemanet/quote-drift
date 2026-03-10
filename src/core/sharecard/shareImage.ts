import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";

const CLIPBOARD_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export class ShareFailedError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ShareFailedError";
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export async function shareImage(uri: string, dialogTitle = "Share image") {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        UTI: "public.png",
        dialogTitle,
      });
    } else {
      await Share.share({
        url: uri,
        message: "Quotify story image",
      });
    }
  } catch (err) {
    if (__DEV__ && err instanceof Error) {
      console.warn("[shareImage] share failed:", err.message);
    }
    throw new ShareFailedError("Sharing failed.", err);
  }

  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    const size = "size" in info && typeof info.size === "number" ? info.size : 0;
    if (size > CLIPBOARD_MAX_FILE_SIZE_BYTES || size <= 0) {
      return;
    }
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Clipboard.setImageAsync(base64Image);
  } catch {
    // Clipboard image copy is best-effort and should never block sharing.
  }
}
