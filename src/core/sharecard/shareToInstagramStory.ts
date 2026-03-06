import * as Linking from "expo-linking";
import { Platform } from "react-native";

import { shareImage } from "./shareImage";

export type InstagramShareResult = {
  usedFallback: boolean;
  reason: "instagram-unavailable" | "direct-unsupported" | null;
};

async function isInstagramAvailable() {
  const scheme =
    Platform.OS === "ios" ? "instagram-stories://share" : "instagram://story-camera";

  try {
    return await Linking.canOpenURL(scheme);
  } catch {
    return false;
  }
}

export async function shareToInstagramStory(uri: string): Promise<InstagramShareResult> {
  const instagramAvailable = await isInstagramAvailable();

  await shareImage(uri, instagramAvailable ? "Share to Instagram Story" : "Share image");

  return {
    usedFallback: true,
    reason: instagramAvailable ? "direct-unsupported" : "instagram-unavailable",
  };
}
