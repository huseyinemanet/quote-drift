/**
 * Share card dimensions. Story layout uses full size; capture can use a scale
 * factor to reduce memory on low-RAM devices (e.g. SHARE_CAPTURE_SCALE=0.75).
 */
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

const SCALE = typeof process !== "undefined" && process.env.EXPO_PUBLIC_SHARE_CAPTURE_SCALE != null
  ? Math.min(1, Math.max(0.5, Number(process.env.EXPO_PUBLIC_SHARE_CAPTURE_SCALE)))
  : 1;

export function getShareCaptureWidth(): number {
  return Math.round(STORY_WIDTH * SCALE);
}

export function getShareCaptureHeight(): number {
  return Math.round(STORY_HEIGHT * SCALE);
}
