jest.mock("@/core/db", () => ({
  getAppState: jest.fn(),
  setAppState: jest.fn(),
}));

jest.mock("@/core/ads/admob", () => ({
  hasBannerRuntimeConfig: jest.fn(() => true),
}));

import { act, renderHook } from "@testing-library/react-native";

import { getAppState, setAppState } from "@/core/db";
import { APP_STATE_KEYS } from "@/core/constants";
import { useAdBanner } from "@/core/ads/useAdBanner";

describe("useAdBanner", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("collapses when the hide timestamp is still in the future", async () => {
    (getAppState as jest.Mock).mockResolvedValue(String(Date.now() + 60_000));

    const { result } = renderHook(() => useAdBanner());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isHiddenByUser).toBe(true);
    expect(result.current.bannerHeight).toBe(0);
  });

  it("clears expired hide state and allows banner loading again", async () => {
    (getAppState as jest.Mock).mockResolvedValue(String(Date.now() - 60_000));

    const { result } = renderHook(() => useAdBanner());

    await act(async () => {
      await Promise.resolve();
    });

    expect(setAppState).toHaveBeenCalledWith(APP_STATE_KEYS.adBannerHiddenUntil, null);
    expect(result.current.isHiddenByUser).toBe(false);
  });

  it("stores a 24h hide timestamp when dismissed", async () => {
    (getAppState as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAdBanner());

    await act(async () => {
      await result.current.dismissFor24Hours();
    });

    expect(setAppState).toHaveBeenCalledWith(
      APP_STATE_KEYS.adBannerHiddenUntil,
      expect.any(String)
    );
    expect(result.current.bannerHeight).toBe(0);
  });

  it("collapses to zero after a load error", async () => {
    (getAppState as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAdBanner());

    act(() => {
      result.current.onLoaded(58);
    });
    expect(result.current.bannerHeight).toBe(58);

    act(() => {
      result.current.onError(new Error("no fill"));
    });
    expect(result.current.bannerHeight).toBe(0);
  });
});
