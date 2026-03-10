# App Privacy declaration (App Store Connect)

This document maps Quotify’s third-party SDKs to the data types and purposes you must declare in **App Store Connect → App Privacy**. The most common rejection reason is: *SDK collects data but the developer does not declare it.*

## SDKs used in Quotify

| SDK | Usage | Collects data |
|-----|--------|----------------|
| **Google Mobile Ads (AdMob)** | Banner + rewarded ads ([src/core/ads/](../src/core/ads/)) | Yes |
| **Firebase App + Crashlytics** | Crash reporting ([src/core/crashlytics.ts](../src/core/crashlytics.ts), [RootErrorBoundary.tsx](../src/ui/RootErrorBoundary.tsx)) | Yes |
| **Firebase Analytics** | Not used in app code (transitive dependency only) | Verify in Firebase Console; if disabled, no extra declaration needed |

References: [AdMob iOS data disclosure](https://developers.google.com/admob/ios/privacy/data-disclosure), [Firebase iOS app-store data collection](https://firebase.google.com/docs/ios/app-store-data-collection).

---

## 1. Data types to declare in App Store Connect

In **App Store Connect → Your App → App Privacy**, under “Data collection” / “Data types”, add the following. For each type, set **Collected** = Yes and choose the appropriate **Purpose**, **Linked to User**, and **Used for Tracking** (see notes below).

### AdMob (Google Mobile Ads SDK)

| Data type (Apple category) | Purpose(s) | Notes |
|----------------------------|------------|--------|
| **Identifiers** (Device ID) | Third-Party Advertising, Analytics | Advertising identifier or app/developer-bounded device ID. Set “Used for Tracking” per your ATT/IDFA usage. |
| **Usage Data** | Analytics, Advertising | Ads shown, product interaction (e.g. app launch, video views). |
| **Diagnostics** | App Functionality, Analytics | Crash logs, performance (launch time, hang rate, energy). Used for ad delivery and diagnostics. |
| **Coarse Location** | Advertising or Analytics | From IP address; approximate location only. |

### Firebase Crashlytics + Firebase Core / Installations / GoogleDataTransport

| Data type (Apple category) | Purpose(s) | Notes |
|----------------------------|------------|--------|
| **Diagnostics** | App Functionality | Crash reports, device/OS info, stack traces, app state. Custom logs from `recordError` (e.g. context string) are not linked to user if no PII is added. |
| **Identifiers** | App Functionality, Analytics | Firebase Installation ID / app instance ID (Firebase user agent). |
| **Usage Data** | Analytics | GoogleDataTransport: SDK performance metadata (e.g. cache size, dropped events) for product quality. |

### Firebase Analytics (only if enabled)

If you enable Firebase Analytics later, add declarations per [Google Analytics App Privacy](https://support.google.com/analytics/answer/10285841) (e.g. additional Usage Data, Identifiers).

---

## 2. How to fill the form

- **Data Type**: Use Apple’s exact labels (Identifiers, Usage Data, Diagnostics, Coarse Location, etc.).
- **Linked to User**: Yes if the data can identify the user; No for anonymous crash/performance data unless you attach user IDs.
- **Used for Tracking**: Yes if used for cross-app/advertising tracking (e.g. IDFA); follow Apple’s definition.
- **Purpose**: Select all that apply (Third-Party Advertising, Analytics, App Functionality) as in the tables above.

Do **not** claim “We don’t collect data” if you use AdMob or Crashlytics; both collect data by default.

---

## 3. Firebase Analytics check

Quotify does **not** use Firebase Analytics in code (no `@react-native-firebase/analytics` or `logEvent` calls). To confirm it’s not collecting:

- In [Firebase Console](https://console.firebase.google.com/) → Project → Project settings, check whether Analytics is enabled for the Quotify app.
- If Analytics is off or not linked, no extra App Privacy declarations are needed for Analytics. If it’s on, add the data types from the Google Analytics App Privacy article above.

---

## 4. Privacy Policy URL

Before release:

- Update **Privacy Policy URL** in [app.config.ts](../app.config.ts) (`extra.privacyUrl`) with your real policy URL (replace `https://www.example.com/`).
- The policy should briefly state that you use **AdMob** (ads, performance, device identifiers, approximate location) and **Firebase Crashlytics** (crash and diagnostic data) and link to Google’s privacy policy where relevant.

See also [README.md](../README.md) (Support / Privacy / source URLs) and [docs/qa-checklist.md](qa-checklist.md).

---

## 5. Keeping declarations up to date

- When upgrading **react-native-google-mobile-ads** or **@react-native-firebase/\***, re-check Google’s and Firebase’s App Privacy / data disclosure pages and adjust App Store Connect if needed.
- After adding or removing an SDK, update this doc and the App Privacy form together.
