# Quotify

Offline-first daily quote app for iOS and Android. One quote per day, a searchable library, optional reminders, and an optional extra quote. No account required.

**Stack:** Expo 55 · React Native 0.83 · TypeScript · Expo Router · SQLite · local notifications · rewarded ads (one extra quote) · iOS home screen widget

---

## What it does

- **Today** — Quote of the day, save/share, read streak, one optional extra quote (rewarded ad).
- **Library** — Search, topic filters, saved-only mode, author pages.
- **Settings** — Reminders (frequency, active hours, pause), test notification, support/privacy/sources, rate app.
- **Widget** — Small and medium iOS home screen widgets for today’s quote.

Everything works offline. Daily quote and library are free; the single extra quote per day is gated by an optional rewarded ad.

---

## Quick start

```bash
npm install
npm start
```

Then:

- **iOS:** `npm run ios` (Xcode required)
- **Android:** `npm run android` (Android Studio required)
- **Web:** `npm run web`

---

## Project layout

```
app/              Expo Router (screens, tabs, onboarding)
src/core/         DB, quote engine, ads, notifications, bootstrap, widget sync
src/features/     Today, Library, Settings, onboarding, layout
src/ui/           Theme, Screen, Button, QuoteCard, etc.
assets/           Bundled quotes.json and assets
widgets/           iOS widget entrypoints
docs/             Architecture, ads, sharing, QA, submission
scripts/          build-quotes (corpus from author-quote.txt)
```

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Start Metro |
| `npm run ios` | Run iOS app |
| `npm run android` | Run Android app |
| `npm run web` | Run web |
| `npm run typecheck` | TypeScript check |
| `npm test` | Jest tests |
| `npm run build:quotes -- "<path-to-tsv>" [limit]` | Build `assets/quotes.json` from author-quote file |

---

## Config

- **App identity:** `app.json` + `app.config.ts` (name Quotify, scheme `quotify`, bundle ids).
- **URLs:** Support, privacy, sources via `expo.extra` in config; set before release.
- **Ads:** `EXPO_PUBLIC_ADS_ENV`, AdMob app/unit IDs; see [docs/ads.md](docs/ads.md). Rewarded ads need a native build (not Expo Go).
- **Widget:** `expo-widgets` in `app.config.ts`; DailyQuoteWidget, systemSmall/systemMedium.

---

## Notifications

Local-only. Optional reminders: 1–3 per day, configurable active hours (default 9:00–21:00), pause. App works fully if permission is denied.

---

## Quote corpus

Bundled in `assets/quotes.json`. Build from a tab-separated file (author, quote):

```bash
npm run build:quotes -- "/path/to/author-quote.txt" 5000
```

---

## Docs

- [Architecture](docs/architecture.md)
- [Ads](docs/ads.md)
- [Sharing](docs/sharing.md)
- [QA checklist](docs/qa-checklist.md)
- [Review notes](docs/review-notes.md)
- [Submission checklist](docs/submission.md)
- [Standalone build](docs/standalone-build.md)

---

## Before release

- Set production support/privacy/source URLs.
- Configure production AdMob IDs.
- Test reminders and rewarded ads on a real device.
- Confirm widget bundle/group ids match iOS bundle id.

---

## Repo

**GitHub:** [yabastudio/Quotify](https://github.com/yabastudio/Quotify)  
**Clone:** `https://github.com/yabastudio/Quotify.git`
