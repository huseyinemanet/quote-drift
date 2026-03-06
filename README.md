# Quote Drift

Quote Drift is an offline-first daily quote app built with Expo, TypeScript, Expo Router, SQLite, and an iOS home screen widget.

The product is intentionally App Store review-safe:
- the daily quote is always free
- library, search, saved quotes, and sharing are always free
- notifications are optional
- ads are optional and only unlock one bonus quote for the current day
- quotes do not repeat until the collection is exhausted

## What The App Does

Quote Drift ships with a bundled quote corpus and works without a network connection for its core experience.

The main product surfaces are:
- `Today`: one primary quote per local calendar day, save, share as image, and an optional `One more` bonus quote
- `Library`: local search, saved quotes, and topic filtering
- `Settings`: reminders, pause controls, About, Support, Privacy Policy, widget-compatible app metadata, and version info
- `iOS widget`: small and medium home screen surfaces that mirror today's quote and deep-link into the app

## Core Product Rules

- Offline-first: core browsing and quote reading do not depend on network access.
- Optional reminders: the app remains fully usable if notification permission is denied.
- Rewarded-only monetization: `One more` is optional, has a `Not now` exit, and never blocks the core app.
- No repeats until exhausted: Today quotes and scheduled reminders share the same transactional claim engine.
- Local-day correctness: day keys and widget refresh timing follow local calendar boundaries instead of UTC day rollover.

## Feature Overview

### Daily Quote
- One primary quote per calendar day
- Serif quote presentation
- Save / unsave
- Native share flow with generated Instagram Story-sized image
- Small read streak

### One More
- Exactly one extra quote per day
- Gated by a rewarded ad in v1
- Unlock occurs only after the rewarded callback fires
- If ad fails, closes early, or is unavailable, nothing breaks and no quote is unlocked

### Library
- Offline search across quote text and author
- Saved-only filtering
- Topic chips for local exploration

### Notifications
- Optional local-only reminders
- 1-3 reminders per day
- Default active hours `09:30-20:30`
- Quiet-hour-safe scheduling
- Pre-reserved unique quotes so reminders also respect no-repeat rules

### iOS Widget
- Built with `expo-widgets`
- Supports `systemSmall` and `systemMedium`
- Uses light and dark payload variants
- Truncates long quotes deterministically to protect layout
- Syncs from app bootstrap and refreshes again at the next local midnight
- Deep-links into `quotedrift://today`, which redirects to `/(app)/today`

### Sharing
- Story image generation at `1080x1920`
- Native OS share sheet
- Temporary file cleanup after sharing

## Tech Stack

- Expo (managed workflow)
- TypeScript
- Expo Router
- expo-sqlite
- expo-notifications
- expo-widgets
- react-native-google-mobile-ads
- react-native-view-shot
- expo-sharing
- zod
- Jest + React Native Testing Library

## Project Structure

```text
app/                    Expo Router routes and deep-link entrypoints
src/core/               DB, quote engine, ads, notifications, bootstrap, widgets
src/features/           Today, Library, Settings, onboarding, layout
src/ui/                 Presentational components and theme system
assets/                 Static assets and bundled quotes.json
widgets/                Native widget entrypoint(s)
docs/                   Architecture, ads, sharing, QA, submission notes
scripts/                Corpus generation and utility scripts
__tests__/              Unit and integration-style tests
```

## Quote Corpus

The bundled corpus is generated from a local `author<TAB>quote` source file and written to `assets/quotes.json`.

The current generator:
- reads tab-separated rows
- removes exact duplicates
- creates stable IDs from author + quote text
- derives fallback topic tags from content heuristics
- supports limiting corpus size for faster local iteration

Rebuild the bundled quotes file:

```bash
npm run build:quotes -- "/Users/huseyinemanet/Downloads/author-quote.txt" 5000
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Xcode for iOS builds
- Android Studio for Android builds

Install dependencies:

```bash
npm install
```

### Start Metro

```bash
npm start
```

### Run Native Builds

iOS:

```bash
npm run ios
```

Android:

```bash
npm run android
```

## Development Notes

### Ads

Rewarded ads require a native build or dev client. They do not work in Expo Go.

Relevant docs:
- [Ads](/Users/huseyinemanet/Projects/Quote Drift/docs/ads.md)

### Notifications

Notifications are local only and optional. The app must still work if permission is never granted.

### Widgets

The home screen widget requires a native iOS build. It does not run inside Expo Go.

Current widget behavior:
- widget target name: `DailyQuoteWidget`
- supported families: `systemSmall`, `systemMedium`
- default deep link: `quotedrift://today`
- placeholder payload is used whenever today's quote is unavailable
- timeline includes an immediate entry and a second refresh entry at next local midnight

### Real Device Testing

For real iPhone testing, use a signed iOS build. Release builds embed the JS bundle and do not depend on Metro.

## Environment Configuration

App metadata and public URLs live in:
- [app.json](/Users/huseyinemanet/Projects/Quote Drift/app.json)
- [app.config.ts](/Users/huseyinemanet/Projects/Quote Drift/app.config.ts)

Before release, replace default values with real production values:
- `expo.extra.supportUrl`
- `expo.extra.privacyUrl`
- `expo.extra.sourcesUrl`

For rewarded ads, configure:
- `EXPO_PUBLIC_ADS_ENV`
- `EXPO_PUBLIC_ADMOB_IOS_APP_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`
- `EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS`

For widget builds, confirm these native identifiers stay aligned:
- `expo.ios.bundleIdentifier`
- `expo.android.package`
- generated widget bundle identifier: `<ios bundle id>.widgets`
- generated app group identifier: `group.<ios bundle id>`

## Quality Checks

Typecheck:

```bash
npm run typecheck
```

Run tests:

```bash
npm test -- --runInBand
```

Export app bundles:

```bash
npx expo export --platform ios --platform android
```

High-signal automated coverage currently includes:
- quote engine and notification scheduling
- share-to-story rendering flow
- widget payload truncation and timeline sync
- local day helpers for midnight rollover behavior

## Important Docs

- [Architecture](/Users/huseyinemanet/Projects/Quote Drift/docs/architecture.md)
- [Submission Checklist](/Users/huseyinemanet/Projects/Quote Drift/docs/submission.md)
- [Ads](/Users/huseyinemanet/Projects/Quote Drift/docs/ads.md)
- [Sharing](/Users/huseyinemanet/Projects/Quote Drift/docs/sharing.md)
- [QA Checklist](/Users/huseyinemanet/Projects/Quote Drift/docs/qa-checklist.md)
- [Review Notes](/Users/huseyinemanet/Projects/Quote Drift/docs/review-notes.md)

## App Store Safety Notes

- The app is not ads-only.
- The daily quote is always free.
- The library and saved quotes are always free.
- `One more` is optional and never mandatory.
- The rewarded gate always includes `Not now`.
- Notifications are optional and local-only.
- Privacy Policy and Support links are exposed in Settings > About.

## Repository

- GitHub: [yabastudio/quote-drift](https://github.com/yabastudio/quote-drift)
