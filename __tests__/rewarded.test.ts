describe("rewarded ad manager", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("uses non-personalized requests and resolves one reward per ad session", async () => {
    const handlers: Record<string, (...args: any[]) => void> = {};
    const createForAdRequest = jest.fn(() => ({
      addAdEventListener: jest.fn((eventType, handler) => {
        handlers[eventType] = handler;
        return jest.fn();
      }),
      load: jest.fn(() => {
        handlers.loaded?.();
      }),
      show: jest.fn(async () => {
        handlers.opened?.();
        handlers.earned_reward?.();
        handlers.earned_reward?.();
        handlers.closed?.();
      }),
    }));

    jest.doMock("@/core/ads/admob", () => ({
      admobConfig: { isTestEnv: true },
      getGoogleMobileAdsModule: () => ({
        AdEventType: { OPENED: "opened", CLOSED: "closed", ERROR: "error" },
        RewardedAdEventType: {
          LOADED: "loaded",
          EARNED_REWARD: "earned_reward",
        },
        RewardedAd: {
          createForAdRequest,
        },
      }),
      getRewardedUnitId: () => "test-rewarded-unit",
    }));

    const rewarded = require("@/core/ads/rewarded") as typeof import("@/core/ads/rewarded");

    await rewarded.preloadRewardedAd();
    expect(rewarded.getRewardedAdSnapshot().status).toBe("ready");

    const result = await rewarded.showRewardedAd();

    expect(result).toBe("reward-earned");
    expect(createForAdRequest).toHaveBeenCalledWith(
      "test-rewarded-unit",
      expect.objectContaining({
        requestNonPersonalizedAdsOnly: true,
      })
    );
  });

  it("fails closed when an ad is not ready", async () => {
    jest.doMock("@/core/ads/admob", () => ({
      admobConfig: { isTestEnv: true },
      getGoogleMobileAdsModule: () => null,
      getRewardedUnitId: () => null,
    }));

    const rewarded = require("@/core/ads/rewarded") as typeof import("@/core/ads/rewarded");

    const result = await rewarded.showRewardedAd();

    expect(result).toBe("not-ready");
    expect(rewarded.getRewardedAdSnapshot().status).toBe("idle");
  });

  it("sets status to error when preload never receives LOADED or ERROR (timeout)", async () => {
    jest.useFakeTimers();
    const createForAdRequest = jest.fn(() => ({
      addAdEventListener: jest.fn((_eventType: string, _handler: () => void) => jest.fn()),
      load: jest.fn(/* never calls LOADED or ERROR */),
    }));

    jest.doMock("@/core/ads/admob", () => ({
      admobConfig: { isTestEnv: true },
      getGoogleMobileAdsModule: () => ({
        AdEventType: { OPENED: "opened", CLOSED: "closed", ERROR: "error" },
        RewardedAdEventType: { LOADED: "loaded", EARNED_REWARD: "earned_reward" },
        RewardedAd: { createForAdRequest },
      }),
      getRewardedUnitId: () => "test-rewarded-unit",
    }));

    const rewarded = require("@/core/ads/rewarded") as typeof import("@/core/ads/rewarded");

    const preloadPromise = rewarded.preloadRewardedAd();
    expect(rewarded.getRewardedAdSnapshot().status).toBe("loading");

    await jest.advanceTimersByTimeAsync(18000);

    await preloadPromise;
    expect(rewarded.getRewardedAdSnapshot().status).toBe("error");

    jest.useRealTimers();
  });

  it("resolves show with closed when CLOSED never fires (show timeout)", async () => {
    jest.useFakeTimers();
    const handlers: Record<string, (...args: unknown[]) => void> = {};
    const createForAdRequest = jest.fn(() => ({
      addAdEventListener: jest.fn((eventType: string, handler: () => void) => {
        handlers[eventType] = handler;
        return jest.fn();
      }),
      load: jest.fn(() => {
        handlers.loaded?.();
      }),
      show: jest.fn(() => {
        handlers.opened?.();
        /* never call handlers.closed - simulates SDK hang */
      }),
    }));

    jest.doMock("@/core/ads/admob", () => ({
      admobConfig: { isTestEnv: true },
      getGoogleMobileAdsModule: () => ({
        AdEventType: { OPENED: "opened", CLOSED: "closed", ERROR: "error" },
        RewardedAdEventType: { LOADED: "loaded", EARNED_REWARD: "earned_reward" },
        RewardedAd: { createForAdRequest },
      }),
      getRewardedUnitId: () => "test-rewarded-unit",
    }));

    const rewarded = require("@/core/ads/rewarded") as typeof import("@/core/ads/rewarded");

    await rewarded.preloadRewardedAd();
    expect(rewarded.getRewardedAdSnapshot().status).toBe("ready");

    const showPromise = rewarded.showRewardedAd();

    await jest.advanceTimersByTimeAsync(120000);

    const result = await showPromise;
    expect(result).toBe("closed");
    // finishShow("closed") sets status to "idle" then triggers preload(); preload may set "ready" again
    expect(["idle", "ready", "loading"]).toContain(rewarded.getRewardedAdSnapshot().status);

    jest.useRealTimers();
  });
});
