# Apple Watch App

Quotify includes a native watchOS app that shows the daily quote and supports swiping to the next (extra) quote. Data is synced from the iPhone app via WatchConnectivity.

## Structure

- **iOS app**: When today’s quote (and optional extra) is loaded, `syncQuotesToWatch()` is called from bootstrap. The local Expo module `quotify-watch` sends the payload via `WCSession.updateApplicationContext`.
- **Watch app**: Native SwiftUI app in `ios/QuotifyWatch/`. It activates `WCSession`, receives `applicationContext` in `QuoteStore`, and displays quotes in a paged view.

## Building

1. Open the project in Xcode: `ios/Quotify.xcworkspace` (or `.xcodeproj`).
2. The **Quotify Watch App** target is added by the `withQuotifyWatch` config plugin when you run `npx expo prebuild`. Ensure `ios/QuotifyWatch/` exists with the Swift and plist files.
3. Select the **Quotify** scheme and a paired Watch simulator or device, then run. The Watch app is embedded in the iOS app and installs to the Watch when you run the main app.

## After `expo prebuild --clean`

If you run `expo prebuild --clean`, the `ios` folder is regenerated and the Watch target is re-added by the plugin. The `ios/QuotifyWatch/` source files must still be present (they are part of the repo). If that folder was removed, restore it from version control.

## Payload

The iPhone sends an `applicationContext` dictionary:

- `dayKey`: date key (YYYY-MM-DD)
- `quotes`: array of `{ id, text, author }` (text truncated for Watch)

The Watch app shows a placeholder if no context has been received yet (“Open Quotify on iPhone to sync today’s quote.”).
