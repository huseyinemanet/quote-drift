import { admobConfig, getGoogleMobileAdsModule, getRewardedUnitId } from "./admob";

export type RewardedShowResult =
  | "reward-earned"
  | "closed"
  | "error"
  | "not-ready";

export type RewardedStatus =
  | "disabled"
  | "idle"
  | "loading"
  | "ready"
  | "showing"
  | "error";

export type RewardedSnapshot = {
  status: RewardedStatus;
  isReady: boolean;
  lastError: string | null;
};

type Listener = (snapshot: RewardedSnapshot) => void;

class RewardedManager {
  private snapshot: RewardedSnapshot = {
    status: "idle",
    isReady: false,
    lastError: null,
  };

  private rewardedAd: any = null;
  private unsubscribeFns: Array<() => void> = [];
  private listeners = new Set<Listener>();
  private preloadPromise: Promise<void> | null = null;
  private showPromise: Promise<RewardedShowResult> | null = null;
  private resolveShow: ((result: RewardedShowResult) => void) | null = null;
  private activeSessionId = 0;
  private rewardEarnedSessionId: number | null = null;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.snapshot);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.snapshot;
  }

  async preload() {
    if (this.snapshot.status === "disabled" || this.snapshot.status === "ready") {
      return;
    }

    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    const googleMobileAds = getGoogleMobileAdsModule();
    const rewardedUnitId = getRewardedUnitId();

    if (!googleMobileAds || !rewardedUnitId) {
      this.updateSnapshot({
        status: "disabled",
        isReady: false,
        lastError: null,
      });
      return;
    }

    const { AdEventType, RewardedAd, RewardedAdEventType } = googleMobileAds;

    this.updateSnapshot({
      status: "loading",
      isReady: false,
      lastError: null,
    });

    this.preloadPromise = Promise.resolve().then(() => {
      this.cleanupCurrentAd();

      const rewardedAd = RewardedAd.createForAdRequest(rewardedUnitId, {
        requestNonPersonalizedAdsOnly: true,
        keywords: admobConfig.isTestEnv ? ["quote", "mindfulness"] : undefined,
      });

      this.rewardedAd = rewardedAd;
      this.unsubscribeFns = [
        rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
          this.preloadPromise = null;
          this.updateSnapshot({
            status: "ready",
            isReady: true,
            lastError: null,
          });
        }),
        rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          if (this.rewardEarnedSessionId === this.activeSessionId) {
            return;
          }

          this.rewardEarnedSessionId = this.activeSessionId;
        }),
        rewardedAd.addAdEventListener(AdEventType.OPENED, () => {
          this.updateSnapshot({
            status: "showing",
            isReady: false,
            lastError: null,
          });
        }),
        rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
          const result =
            this.rewardEarnedSessionId === this.activeSessionId
              ? "reward-earned"
              : "closed";
          this.finishShow(result);
        }),
        rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
          console.info("Rewarded ad failed.", error);
          this.finishShow("error", "A short ad is unavailable right now.");
        }),
      ];

      try {
        rewardedAd.load();
      } catch (error) {
        console.info("Rewarded ad load failed.", error);
        this.cleanupCurrentAd();
        this.preloadPromise = null;
        this.updateSnapshot({
          status: "error",
          isReady: false,
          lastError: "A short ad is unavailable right now.",
        });
      }
    });

    return this.preloadPromise;
  }

  async show(): Promise<RewardedShowResult> {
    if (this.snapshot.status !== "ready" || !this.rewardedAd) {
      return "not-ready";
    }

    if (this.showPromise) {
      return this.showPromise;
    }

    this.activeSessionId += 1;
    this.rewardEarnedSessionId = null;
    this.updateSnapshot({
      status: "showing",
      isReady: false,
      lastError: null,
    });

    this.showPromise = new Promise<RewardedShowResult>((resolve) => {
      this.resolveShow = resolve;
    });
    const pendingShow = this.showPromise;

    try {
      await this.rewardedAd.show();
    } catch (error) {
      console.info("Rewarded ad show failed.", error);
      this.finishShow("error", "A short ad is unavailable right now.");
    }

    return pendingShow;
  }

  private finishShow(result: RewardedShowResult, message: string | null = null) {
    this.resolveShow?.(result);
    this.resolveShow = null;
    this.showPromise = null;
    this.cleanupCurrentAd();
    this.preloadPromise = null;

    this.updateSnapshot({
      status: result === "error" ? "error" : "idle",
      isReady: false,
      lastError: message,
    });

    void this.preload();
  }

  private cleanupCurrentAd() {
    for (const unsubscribe of this.unsubscribeFns) {
      unsubscribe();
    }
    this.unsubscribeFns = [];
    this.rewardedAd = null;
  }

  private updateSnapshot(next: RewardedSnapshot) {
    this.snapshot = next;
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

const rewardedManager = new RewardedManager();

export function preloadRewardedAd() {
  return rewardedManager.preload();
}

export function showRewardedAd() {
  return rewardedManager.show();
}

export function subscribeRewardedAd(listener: Listener) {
  return rewardedManager.subscribe(listener);
}

export function getRewardedAdSnapshot() {
  return rewardedManager.getSnapshot();
}
