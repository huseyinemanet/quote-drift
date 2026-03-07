# Quotify

Quotify is an offline-first daily quote app built with Expo, React Native, TypeScript, Expo Router, SQLite, local notifications, rewarded ads for a single optional extra quote, and an iOS home screen widget.

The core product is intentionally simple:

- one quote of the day
- local library search and topic filtering
- saved quotes
- optional reminders
- one optional extra quote gated by a rewarded ad
- no required account

## Product Overview

Quotify is designed around a calm daily reading ritual instead of an infinite feed.

Main surfaces:

- `Today`: the primary quote for the local calendar day, save/share actions, and one optional extra quote
- `Library`: browse-first archive with search, topic filters, and saved-only mode
- `Settings`: reminder controls, pause state, support/privacy/source links, and version info
- `Widget`: small and medium iOS home screen widgets for today’s quote

Core product rules:

- the daily quote is always free
- the library and saved quotes are always free
- notifications are optional
- one extra quote is optional
- quote selection avoids repeats until the local collection is exhausted
- core reading and browsing work offline

## Tech Stack

- Expo 55
- React Native 0.83
- React 19
- TypeScript
- Expo Router
- `expo-sqlite`
- `expo-notifications`
- `expo-sharing`
- `expo-widgets`
- `react-native-google-mobile-ads`
- `react-native-view-shot`
- Jest + React Native Testing Library

## Repository

- GitHub: [yabastudio/Quotify](https://github.com/yabastudio/Quotify)
- Clone URL: [https://github.com/yabastudio/Quotify.git](https://github.com/yabastudio/Quotify.git)

## Project Structure

```text
app/                    Expo Router routes
src/core/               DB, quote engine, ads, notifications, bootstrap, widget sync
src/features/           Today, Library, Settings, onboarding, layout
src/ui/                 Theme, primitives, presentational components
assets/                 App assets and bundled quotes.json
widgets/                Widget entrypoints
docs/                   Architecture, ads, sharing, QA, submission notes
scripts/                Quote corpus build utilities
__tests__/              Tests
ios/                    Native iOS project and widget target
```

## Local Development

### Prerequisites

- Node.js
- npm
- Xcode for iOS builds
- Android Studio for Android builds

Install dependencies:

```bash
npm install
```

Start Metro:

```bash
npm start
```

Run iOS:

```bash
npm run ios
```

Run Android:

```bash
npm run android
```

Start web:

```bash
npm run web
```

## Scripts

```bash
npm start
npm run ios
npm run android
npm run web
npm run build:quotes -- "/absolute/path/to/author-quote.txt" 5000
npm run typecheck
npm test
```

## Environment and Config

Primary app config lives in:

- [app.json](/Users/huseyinemanet/Projects/Quotify/app.json)
- [app.config.ts](/Users/huseyinemanet/Projects/Quotify/app.config.ts)

Current app identity:

- app name: `Quotify`
- scheme: `quotify`
- iOS bundle id: `com.huseyinemanet.quotify`
- Android package: `com.huseyinemanet.quotify`

Public URLs are currently read from Expo config:

- `expo.extra.supportUrl`
- `expo.extra.privacyUrl`
- `expo.extra.sourcesUrl`

Replace placeholder values before release.

## Ads

Rewarded ads unlock only one optional extra quote for the current day.

Banner ads are intentionally kept away from the most sensitive product surfaces. Rewarded ads require a native build or dev client and do not work in Expo Go.

Relevant public env vars:

- `EXPO_PUBLIC_ADS_ENV`
- `EXPO_PUBLIC_ADMOB_IOS_APP_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`
- `EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS`

In non-production ads mode, the app falls back to Google test IDs from [app.config.ts](/Users/huseyinemanet/Projects/Quotify/app.config.ts).

## Notifications

Notifications are local-only.

Current reminder model:

- reminders can be enabled or disabled
- frequency is 1-3 per day
- default active hours are `09:30` to `20:30`
- reminders can be paused temporarily
- quote reservations share the same no-repeat logic as the Today surface

The app remains fully usable if notification permission is denied.

## Widget

The iOS widget is configured through `expo-widgets` in [app.config.ts](/Users/huseyinemanet/Projects/Quotify/app.config.ts).

Current widget setup:

- target name: `DailyQuoteWidget`
- supported families: `systemSmall`, `systemMedium`
- deep link: `quotify://today`
- widget bundle id: `<ios bundle id>.widgets`
- app group id: `group.<ios bundle id>`

The widget mirrors today’s quote and refreshes again at the next local midnight.

## Quote Corpus

Quotify ships with a bundled local quote corpus in `assets/quotes.json`.

The corpus build script:

- reads tab-separated `author<TAB>quote` rows
- removes exact duplicates
- creates stable IDs
- derives fallback tags
- supports limiting the output size for iteration

Example:

```bash
npm run build:quotes -- "/Users/huseyinemanet/Downloads/author-quote.txt" 5000
```

## Quality Checks

Typecheck:

```bash
npm run typecheck
```

Tests:

```bash
npm test
```

Optional export check:

```bash
npx expo export --platform ios --platform android
```

## Release Notes

Before shipping:

- replace placeholder support/privacy/source URLs
- configure production AdMob IDs
- verify widget identifiers remain aligned with the iOS bundle id
- test reminder permission flow on a real device
- test rewarded ads on a native build
- test widget timeline refresh and deep linking

## Docs

- [Architecture](/Users/huseyinemanet/Projects/Quotify/docs/architecture.md)
- [Ads](/Users/huseyinemanet/Projects/Quotify/docs/ads.md)
- [Sharing](/Users/huseyinemanet/Projects/Quotify/docs/sharing.md)
- [QA Checklist](/Users/huseyinemanet/Projects/Quotify/docs/qa-checklist.md)
- [Review Notes](/Users/huseyinemanet/Projects/Quotify/docs/review-notes.md)
- [Submission Checklist](/Users/huseyinemanet/Projects/Quotify/docs/submission.md)
