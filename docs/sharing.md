# Quote Drift Sharing

## Overview
Quote Drift can generate a shareable Story image from the current Today quote. The image is rendered as a fixed `1080x1920` PNG so it fits Instagram Story dimensions and is handed off through the native OS share sheet.

## Generation Method
- The app renders a hidden `StoryCard` React Native view off-screen.
- `react-native-view-shot` captures that view to a PNG file.
- The image uses an opaque light background and fixed layout margins.
- The file is stored in the cache directory under a `quote-drift-story-*.png` prefix.

## Share Flow
- Tapping `Share` prepares the image, copies that generated PNG to the clipboard on a best-effort basis, and opens the native OS share sheet.
- Instagram is handled by the native share destinations the user already has installed.
- There is no in-app custom share menu; the app hands off directly to the platform share UI.

## Typography And Layout
- Story rendering always uses the light Quote Drift share palette.
- Quote text auto-fits through bounded size presets so long quotes shrink before overflowing.
- Author visibility is preserved by reserving a dedicated meta block near the bottom.
- Bottom padding is intentionally large so Instagram Story chrome is less likely to cover the text.

## Cleanup
- Generated files are stored in cache, not documents.
- Startup cleanup removes old `quote-drift-story-*.png` files.
- After each share attempt, the app schedules best-effort deletion of the temp file after a short delay.

## Known Limitations
- Direct Instagram Story APIs are not relied on in this MVP because they are fragile in Expo managed apps and differ by platform.
- The generic image share sheet is the safe fallback on both iOS and Android.
- Very long quotes are auto-fitted, but extremely long quotes may still look denser than the in-app card because the image must keep the author visible.
