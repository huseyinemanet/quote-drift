import type { ExpoConfig } from "expo/config";

const baseConfig: ExpoConfig = {
  name: "Quotify",
  slug: "quotify",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  scheme: "quotify",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#f5efe2",
    dark: {
      image: "./assets/splash-icon.png",
      backgroundColor: "#141915",
    },
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.huseyinemanet.quotify",
    googleServicesFile: "./GoogleService-Info.plist",
  },
  android: {
    package: "com.huseyinemanet.quotify",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#ECE0CD",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    "expo-sharing",
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#1c2421",
        defaultChannel: "daily-quotes",
        sounds: [],
      },
    ],
    "expo-asset",
    "@react-native-firebase/app",
    "@react-native-firebase/crashlytics",
    [
      "expo-build-properties",
      {
        ios: { useFrameworks: "static" },
      },
    ],
  ],
  extra: {
    supportUrl: "https://www.example.com/",
    // Before release: set to your real Privacy Policy URL. Policy should mention AdMob and Firebase (Crashlytics). See docs/app-privacy-declaration.md.
    privacyUrl: "https://www.example.com/",
    sourcesUrl: "https://yaba.studio/quotify/sources",
    photoCreditsUrl: "https://yaba.studio/quotify/photo-credits",
  },
};

const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";
const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/2435281174";
const TEST_ANDROID_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_IOS_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/1712485313";
const TEST_ANDROID_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

const isProductionAds = process.env.EXPO_PUBLIC_ADS_ENV === "production";

const iosAppId =
  (isProductionAds
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID
    : process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || TEST_IOS_APP_ID) ?? TEST_IOS_APP_ID;
const androidAppId =
  (isProductionAds
    ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || TEST_ANDROID_APP_ID) ??
  TEST_ANDROID_APP_ID;

const iosRewardedUnitId = isProductionAds
  ? process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID ?? null
  : process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID ||
    TEST_IOS_REWARDED_UNIT_ID;
const androidRewardedUnitId = isProductionAds
  ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID ?? null
  : process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID ||
    TEST_ANDROID_REWARDED_UNIT_ID;
const iosBannerUnitId = isProductionAds
  ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID ?? null
  : process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID || TEST_IOS_BANNER_UNIT_ID;
const androidBannerUnitId = isProductionAds
  ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID ?? null
  : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID ||
    TEST_ANDROID_BANNER_UNIT_ID;

const rawTestDeviceIds =
  process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS ??
  process.env.ADMOB_TEST_DEVICE_IDS ??
  "";
const testDeviceIdentifiers = rawTestDeviceIds
  .split(",")
  .map((value: string) => value.trim())
  .filter(Boolean);
const iosBundleIdentifier = baseConfig.ios?.bundleIdentifier;
const widgetBundleIdentifier = iosBundleIdentifier
  ? `${iosBundleIdentifier}.widgets`
  : undefined;
const widgetGroupIdentifier = iosBundleIdentifier
  ? `group.${iosBundleIdentifier}`
  : undefined;

export default (): ExpoConfig => ({
  ...baseConfig,
  scheme: baseConfig.scheme ?? "quotify",
  plugins: [
    ...(baseConfig.plugins ?? []),
    [
      "expo-widgets",
      {
        bundleIdentifier: widgetBundleIdentifier,
        groupIdentifier: widgetGroupIdentifier,
        widgets: [
          {
            name: "DailyQuoteWidget",
            displayName: "Daily Quote",
            description: "See today's Quotify reflection on your Home Screen and Lock Screen.",
            supportedFamilies: [
              "systemSmall",
              "systemMedium",
              "accessoryRectangular",
              "accessoryInline",
              "accessoryCircular",
            ],
          },
        ],
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        iosAppId,
        androidAppId,
      },
    ],
    "./plugins/withQuotifyWatch.js",
    "./plugins/withQuotifySiriIntent.js",
  ],
  extra: {
    ...baseConfig.extra,
    eas: {
      projectId: "ad0c469b-93c6-4453-a38d-3be8be8bf96f",
    },
    admob: {
      iosAppId,
      androidAppId,
      iosBannerUnitId,
      androidBannerUnitId,
      iosRewardedUnitId,
      androidRewardedUnitId,
      isTestEnv: !isProductionAds,
      testDeviceIdentifiers,
    },
  },
});
