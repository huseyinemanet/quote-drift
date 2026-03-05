# Quote Drift

Quote Drift is an offline-first quote app built with Expo, TypeScript, Expo Router, SQLite, and optional local notifications.

The app is designed around a hard no-repeat rule:
- a quote cannot appear again in Today or scheduled reminders until the available collection is exhausted
- the guarantee is enforced with SQLite claims and unique constraints
- the app remains fully usable when notifications are denied or disabled

## Features

- Offline bundled quote library sourced from `author-quote.txt`
- First-launch corpus validation with Zod
- Today screen with primary quote, one extra quote, favourites, sharing, and feedback
- Library search by quote text and author
- Topic preferences and local weighting
- Optional local reminders with quiet-hour scheduling
- Exhausted-state recovery flow
- About section with configurable support and privacy links

## Tech Stack

- Expo (managed workflow)
- TypeScript
- Expo Router
- expo-sqlite
- expo-notifications
- zod

## Project Structure

```text
app/           Expo Router routes
src/core/      DB, import, quote engine, scheduler, bootstrap
src/features/  Today, Library, Settings, Onboarding flows
src/ui/        Reusable presentational components
assets/        App assets and bundled quotes.json
docs/          Architecture and submission notes
scripts/       Utility scripts such as quote corpus generation
__tests__/     Unit tests
```

## Quote Source

The bundled corpus is generated from:

- `/Users/huseyinemanet/Downloads/author-quote.txt`

To rebuild `assets/quotes.json` from that source:

```bash
npm run build:quotes -- "/Users/huseyinemanet/Downloads/author-quote.txt" 5000
```

The generator:
- reads tab-separated `author<TAB>quote` rows
- removes exact duplicates
- creates stable IDs from author + quote text
- derives fallback topic tags from content keywords
- caps the bundled app corpus to a configurable size so first-launch import stays responsive

## Getting Started

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Run on iOS:

```bash
npm run ios
```

Run on Android:

```bash
npm run android
```

## Quality Checks

Typecheck:

```bash
npm run typecheck
```

Run tests:

```bash
npm test
```

Export bundles:

```bash
npx expo export --platform ios --platform android
```

## App Configuration

App metadata lives in `app.json`.

Before release, replace these default values with real production URLs:
- `expo.extra.supportUrl`
- `expo.extra.privacyUrl`
- `expo.extra.sourcesUrl`

## Important Product Rules

- Notifications are optional and local-only
- The app must not depend on permission grants for minimum functionality
- Invalid corpus data routes to a safe fatal-data screen
- Exhaustion routes to a recovery screen with restart or keep-off actions

## Documentation

- [Architecture](/Users/huseyinemanet/Projects/Quote%20Drift/docs/architecture.md)
- [Submission Checklist](/Users/huseyinemanet/Projects/Quote%20Drift/docs/submission.md)

## Status

Current checks completed:
- `npm run typecheck`
- `npm test`
- `npx expo export --platform ios --platform android`

Interactive simulator smoke testing should still be run before App Store submission.
