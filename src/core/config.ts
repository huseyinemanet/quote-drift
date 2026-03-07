import Constants from "expo-constants";

export const appConfig = {
  supportUrl:
    Constants.expoConfig?.extra?.supportUrl ?? "https://www.example.com/",
  privacyUrl:
    Constants.expoConfig?.extra?.privacyUrl ?? "https://www.example.com/",
  sourcesUrl:
    Constants.expoConfig?.extra?.sourcesUrl ?? "https://www.example.com/",
  /** Set in app.config.ts extra.storeReviewUrl for Rate the app (e.g. https://apps.apple.com/app/id123456789) */
  storeReviewUrl: (Constants.expoConfig?.extra as { storeReviewUrl?: string } | undefined)?.storeReviewUrl ?? null,
};
