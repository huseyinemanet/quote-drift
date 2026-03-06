import Constants from "expo-constants";
import { Platform } from "react-native";

type GoogleMobileAdsModule = typeof import("react-native-google-mobile-ads");

const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";
const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/1712485313";
const TEST_ANDROID_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

type AdMobExtraConfig = {
  iosAppId?: string;
  androidAppId?: string;
  iosRewardedUnitId?: string | null;
  androidRewardedUnitId?: string | null;
  isTestEnv?: boolean;
  testDeviceIdentifiers?: string[];
};

const extraConfig = (Constants.expoConfig?.extra?.admob ?? {}) as AdMobExtraConfig;

export const admobConfig = {
  isTestEnv: extraConfig.isTestEnv ?? true,
  iosAppId: extraConfig.iosAppId ?? TEST_IOS_APP_ID,
  androidAppId: extraConfig.androidAppId ?? TEST_ANDROID_APP_ID,
  iosRewardedUnitId:
    extraConfig.iosRewardedUnitId ?? TEST_IOS_REWARDED_UNIT_ID,
  androidRewardedUnitId:
    extraConfig.androidRewardedUnitId ?? TEST_ANDROID_REWARDED_UNIT_ID,
  testDeviceIdentifiers: extraConfig.testDeviceIdentifiers ?? [],
};

let cachedModule: GoogleMobileAdsModule | null | undefined;
let initPromise: Promise<void> | null = null;

export function getGoogleMobileAdsModule(): GoogleMobileAdsModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    cachedModule = require("react-native-google-mobile-ads") as GoogleMobileAdsModule;
  } catch (error) {
    console.info("AdMob disabled: native module unavailable.", error);
    cachedModule = null;
  }

  return cachedModule;
}

export function getRewardedUnitId() {
  return Platform.OS === "ios"
    ? admobConfig.iosRewardedUnitId
    : admobConfig.androidRewardedUnitId;
}

export function hasRewardedRuntimeConfig() {
  return Boolean(getRewardedUnitId());
}

export async function initializeMobileAds() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const googleMobileAds = getGoogleMobileAdsModule();

    if (!googleMobileAds || !hasRewardedRuntimeConfig()) {
      return;
    }

    const { default: mobileAds } = googleMobileAds;

    try {
      await mobileAds().setRequestConfiguration({
        testDeviceIdentifiers: admobConfig.isTestEnv
          ? admobConfig.testDeviceIdentifiers
          : undefined,
      });
      await mobileAds().initialize();
    } catch (error) {
      console.info("AdMob initialization skipped.", error);
    }
  })();

  return initPromise;
}
