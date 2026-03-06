import type { ExpoConfig } from "expo/config";

const baseConfig = require("./app.json").expo as ExpoConfig;

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

export default (): ExpoConfig => ({
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins ?? []),
    [
      "react-native-google-mobile-ads",
      {
        iosAppId,
        androidAppId,
      },
    ],
  ],
  extra: {
    ...baseConfig.extra,
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
