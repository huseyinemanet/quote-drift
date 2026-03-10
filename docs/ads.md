# Ads

Quotify uses two optional AdMob surfaces:
- a sticky banner above the bottom tab bar on Today, Library, and Settings
- a rewarded ad for the optional `One more` bonus quote on Today

The daily quote, library, search, favourites, sharing, and notification settings remain free and fully usable without ads.

## Configuration
- `app.config.ts` configures the AdMob Expo plugin with app IDs.
- Runtime banner and rewarded unit IDs live in `extra.admob`.
- Environment variables:
  - `EXPO_PUBLIC_ADS_ENV=production`
  - `EXPO_PUBLIC_ADMOB_IOS_APP_ID`
  - `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`
  - `EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID`
  - `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID`
  - `EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID`
  - `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID`
  - `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS` as a comma-separated list

## Test vs Production
- Dev builds default to Google sample banner and rewarded IDs.
- Production builds require real banner and rewarded unit IDs.
- The rewarded request uses `requestNonPersonalizedAdsOnly: true` in v1.
- Banner requests also use non-personalized requests in v1.

## Why A Dev Build Is Required
- `react-native-google-mobile-ads` depends on native code and will not work in Expo Go.
- Test on iOS and Android with a dev client or release build.

## Review-Safe Behavior
- The sticky banner never overlaps content or the tab bar.
- If the banner ad fails or is not loaded, the banner area collapses completely.
- The user can close the banner with `X`, which hides it for 24 hours.
- `One more` is optional bonus content.
- The modal always includes `Not now`.
- No quote unlock occurs unless the rewarded ad completes and the reward is earned.
- If the ad is unavailable, skipped, closed early, or fails, the app stays usable and no extra quote is granted.

## Rewarded ad – failure handling
The app is written so that the user can always continue using it normally, and the extra quote is only granted when the rewarded ad completes and the reward is earned. All of the following are handled without breaking the app:

- **Ad failed to load** – Modal shows an error state; user can tap "Not now" and continue.
- **Ad closed early** – No reward; modal closes; optional toast explains that the ad was closed before completing.
- **Reward callback never fires** – Treated as closed without reward (no unlock).
- **Network offline** – Preload times out after ~18s; modal shows unavailable and user can close it.
- **Show hangs (CLOSED/ERROR never fire)** – A safety timeout (~2 minutes) resolves the flow as closed so the UI never stays stuck.

Implementation: [src/core/ads/rewarded.ts](../src/core/ads/rewarded.ts) (preload timeout, show timeout), [src/features/today/useOneMoreGate.ts](../src/features/today/useOneMoreGate.ts) (toast and modal state).
