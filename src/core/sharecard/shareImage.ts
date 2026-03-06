import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";

export async function shareImage(uri: string, dialogTitle = "Share image") {
  try {
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Clipboard.setImageAsync(base64Image);
  } catch {
    // Clipboard image copy is best-effort and should never block sharing.
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      UTI: "public.png",
      dialogTitle,
    });
    return;
  }

  await Share.share({
    url: uri,
    message: "Quotify story image",
  });
}
