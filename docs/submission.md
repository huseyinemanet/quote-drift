# App Store Submission Checklist

## Review Risk Focus
- The daily quote is always free.
- Library, search, favourites, and sharing are always free.
- `One more` is optional and gated only behind a rewarded ad after an explicit modal with a `Not now` exit.
- The app remains fully usable when ads fail or when notification permission is denied.
- The sticky banner is non-blocking, collapses when unavailable, and never covers content or navigation.

## Functional Checks
- Quotify launches into a real loading/import screen, not a blank screen.
- The bundled quote corpus validates on boot or shows the fatal-data recovery screen.
- Today, Library, favourites, and About work fully with notifications disabled or denied.
- Support URL and Privacy Policy URL open correctly from Settings > About.
- No placeholder routes, dead-end flows, or broken outbound links remain.
- Exhausted-state recovery works without ads or notifications.
- Local reminders stay inside configured active hours.
- Test notification uses fixed copy and does not consume a quote.

## Monetization Checks
- Sticky banner appears above the tab bar only when loaded.
- Sticky banner failure or dismissal leaves no empty gap.
- `One more` opens a modal with `Watch ad` and `Not now`.
- Rewarded ad success grants exactly one extra quote for that day.
- Skipping, closing, or ad failure grants nothing and does not block app use.

## Build Checks
- iOS and Android development builds pass on real devices.
- Release builds open without Metro and without crashes.
