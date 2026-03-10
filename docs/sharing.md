# Quotify Sharing

## Overview
Quotify can generate a shareable Story image from the current Today quote. The image is rendered as a fixed `1080x1920` PNG so it fits Instagram Story dimensions and is handed off through the native OS share sheet.

## Generation Method
- The app renders a hidden `StoryCard` React Native view off-screen.
- `react-native-view-shot` captures that view to a PNG file.
- The image uses an opaque light background and fixed layout margins.
- The file is stored in the cache directory under `quotify-sharecards/Quotify Image.png`.

## Share Flow
- Tapping `Share` prepares the image, opens the native OS share sheet with the generated PNG, then optionally copies the image to the clipboard (only if file size is under 2 MB to avoid memory spikes).
- Instagram is handled by the native share destinations the user already has installed.
- There is no in-app custom share menu; the app hands off directly to the platform share UI.

## Risks and mitigations
- **Image render fail:** Capture runs after layout is ready (onLayout + short timeout). One retry with an extra layout wait if the first capture fails. Errors are logged in dev; user sees specific toasts (“Image capture failed” vs “Sharing failed”).
- **Blank image:** The exported file is validated by minimum size (~20 KB). If too small, we treat it as blank/corrupt, throw, and the hook can retry or show “Image came out empty. Please try again.”
- **Memory crash:** Share sheet is opened first; clipboard is filled only after share and only when the file is under 2 MB, so we avoid loading a large base64 string into memory before or during share. Resolution can be reduced via `EXPO_PUBLIC_SHARE_CAPTURE_SCALE` (0.5–1) for low-RAM builds.

## Typography And Layout
- Story rendering always uses the light Quotify share palette.
- Quote text auto-fits through bounded size presets so long quotes shrink before overflowing.
- Author visibility is preserved by reserving a dedicated meta block near the bottom.
- Bottom padding is intentionally large so Instagram Story chrome is less likely to cover the text.

## Cleanup
- Generated files are stored in cache (directory `quotify-sharecards`), not documents.
- Startup cleanup removes old sharecard files.
- After each share attempt, the app schedules best-effort deletion of the temp file after a short delay.

## Known Limitations
- Direct Instagram Story APIs are not relied on in this MVP because they are fragile in Expo managed apps and differ by platform.
- The generic image share sheet is the safe fallback on both iOS and Android.
- Very long quotes are auto-fitted, but extremely long quotes may still look denser than the in-app card because the image must keep the author visible.
