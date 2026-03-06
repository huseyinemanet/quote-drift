jest.mock("@/core/quoteEngine", () => ({
  getRemainingQuoteCount: jest.fn(),
}));

jest.mock("@/core/ads/rewarded", () => ({
  preloadRewardedAd: jest.fn(),
  getRewardedAdSnapshot: jest.fn(() => ({
    status: "ready",
    isReady: true,
    lastError: null,
  })),
  showRewardedAd: jest.fn(),
  subscribeRewardedAd: jest.fn(() => jest.fn()),
}));

import { act, renderHook } from "@testing-library/react-native";

import { getRemainingQuoteCount } from "@/core/quoteEngine";
import { showRewardedAd } from "@/core/ads/rewarded";
import { useOneMoreGate } from "@/features/today/useOneMoreGate";

describe("useOneMoreGate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does not open the modal when an extra quote already exists", async () => {
    const { result } = renderHook(() =>
      useOneMoreGate({
        extraQuote: {
          id: "q-2",
          text: "Already here.",
          author: "Author",
          authorId: "author-000001",
          tags: [],
          primaryTag: null,
          saved: false,
        },
        claimExtraQuote: jest.fn(),
        onExhausted: jest.fn(),
      })
    );

    await act(async () => {
      await result.current.handleOneMorePress();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.toastMessage).toBe("Already unlocked today.");
  });

  it("unlocks exactly one extra quote after a rewarded completion", async () => {
    (getRemainingQuoteCount as jest.Mock).mockResolvedValue(12);
    (showRewardedAd as jest.Mock).mockResolvedValue("reward-earned");
    const claimExtraQuote = jest.fn().mockResolvedValue("success");
    const onExhausted = jest.fn();

    const { result } = renderHook(() =>
      useOneMoreGate({
        extraQuote: null,
        claimExtraQuote,
        onExhausted,
      })
    );

    await act(async () => {
      await result.current.handleOneMorePress();
    });
    expect(result.current.isOpen).toBe(true);

    await act(async () => {
      await result.current.handleWatchAd();
    });

    expect(claimExtraQuote).toHaveBeenCalledTimes(1);
    expect(onExhausted).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
    expect(result.current.toastMessage).toBe("Unlocked one more quote.");
  });

  it("handles ad failures without unlocking", async () => {
    (getRemainingQuoteCount as jest.Mock).mockResolvedValue(8);
    (showRewardedAd as jest.Mock).mockResolvedValue("error");
    const claimExtraQuote = jest.fn().mockResolvedValue("success");

    const { result } = renderHook(() =>
      useOneMoreGate({
        extraQuote: null,
        claimExtraQuote,
        onExhausted: jest.fn(),
      })
    );

    await act(async () => {
      await result.current.handleOneMorePress();
      await result.current.handleWatchAd();
    });

    expect(claimExtraQuote).not.toHaveBeenCalled();
    expect(result.current.toastMessage).toBe("A short ad is unavailable right now.");
  });
});
