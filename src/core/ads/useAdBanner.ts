import { useEffect, useMemo, useState } from "react";

import { APP_STATE_KEYS } from "@/core/constants";
import { getAppState, setAppState } from "@/core/db";

import { hasBannerRuntimeConfig } from "./admob";

const HIDE_DURATION_MS = 24 * 60 * 60 * 1000;

export type AdBannerState = {
  shouldRender: boolean;
  bannerHeight: number;
  isHiddenByUser: boolean;
  dismissFor24Hours: () => Promise<void>;
  onLoaded: (height: number) => void;
  onError: (error: unknown) => void;
};

export function useAdBanner(): AdBannerState {
  const [isHiddenByUser, setIsHiddenByUser] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const raw = await getAppState(APP_STATE_KEYS.adBannerHiddenUntil);
      const hiddenUntil = raw ? Number(raw) : 0;

      if (!isMounted) {
        return;
      }

      if (hiddenUntil > Date.now()) {
        setIsHiddenByUser(true);
      } else if (raw) {
        await setAppState(APP_STATE_KEYS.adBannerHiddenUntil, null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const dismissFor24Hours = async () => {
    const hiddenUntil = Date.now() + HIDE_DURATION_MS;
    setIsHiddenByUser(true);
    setIsLoaded(false);
    setBannerHeight(0);
    await setAppState(APP_STATE_KEYS.adBannerHiddenUntil, String(hiddenUntil));
  };

  return useMemo(
    () => ({
      shouldRender:
        hasBannerRuntimeConfig() && !isHiddenByUser && !hasLoadError,
      bannerHeight: isLoaded && !isHiddenByUser && !hasLoadError ? bannerHeight : 0,
      isHiddenByUser,
      dismissFor24Hours,
      onLoaded: (height: number) => {
        setHasLoadError(false);
        setIsLoaded(true);
        setBannerHeight(height);
      },
      onError: (error: unknown) => {
        console.info("Banner ad failed to load.", error);
        setHasLoadError(true);
        setIsLoaded(false);
        setBannerHeight(0);
      },
    }),
    [bannerHeight, hasLoadError, isHiddenByUser, isLoaded]
  );
}
