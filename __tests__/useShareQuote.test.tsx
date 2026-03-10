jest.mock("@/core/sharecard/renderQuoteStoryCard", () => {
  const actual = jest.requireActual<typeof import("@/core/sharecard/renderQuoteStoryCard")>(
    "@/core/sharecard/renderQuoteStoryCard"
  );
  return { ...actual, renderQuoteStoryCard: jest.fn() };
});

jest.mock("@/core/sharecard/shareImage", () => {
  const actual = jest.requireActual<typeof import("@/core/sharecard/shareImage")>(
    "@/core/sharecard/shareImage"
  );
  return { ...actual, shareImage: jest.fn() };
});

jest.mock("@/core/sharecard/shareToInstagramStory", () => ({
  shareToInstagramStory: jest.fn(),
}));

jest.mock("react-native-view-shot", () => {
  const React = require("react");
  const { View } = require("react-native");

  return React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({}));
    return <View {...props} />;
  });
});

import { act, render, renderHook } from "@testing-library/react-native";

import { BlankImageError, renderQuoteStoryCard } from "@/core/sharecard/renderQuoteStoryCard";
import { shareImage, ShareFailedError } from "@/core/sharecard/shareImage";
import { useShareQuote } from "@/features/today/share/useShareQuote";

describe("useShareQuote", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const quote = {
    id: "q1",
    text: "A clear mind invites good decisions.",
    author: "Marcus Aurelius",
    primaryTag: "clarity",
  };

  it("captures and shares an image", async () => {
    (renderQuoteStoryCard as jest.Mock).mockResolvedValue("file:///tmp/story.png");

    const { result } = renderHook(() => useShareQuote(quote));
    render(result.current.captureTarget!);

    await act(async () => {
      const sharePromise = result.current.share();
      await jest.runAllTimersAsync();
      await sharePromise;
    });

    expect(renderQuoteStoryCard).toHaveBeenCalled();
    expect(shareImage).toHaveBeenCalledWith("file:///tmp/story.png");
  });

  it("shows toast when capture fails with BlankImageError", async () => {
    (renderQuoteStoryCard as jest.Mock).mockRejectedValue(
      new BlankImageError("Captured image too small")
    );

    const { result } = renderHook(() => useShareQuote(quote));
    render(result.current.captureTarget!);

    await act(async () => {
      const sharePromise = result.current.share();
      await jest.advanceTimersByTimeAsync(1000);
      await sharePromise;
    });

    expect(result.current.toastMessage).toBe("Image came out empty. Please try again.");
  });

  it("shows toast when share fails with ShareFailedError", async () => {
    (renderQuoteStoryCard as jest.Mock).mockResolvedValue("file:///tmp/story.png");
    (shareImage as jest.Mock).mockRejectedValue(new ShareFailedError("Sharing failed.", new Error()));

    const { result } = renderHook(() => useShareQuote(quote));
    render(result.current.captureTarget!);

    await act(async () => {
      const sharePromise = result.current.share();
      await jest.advanceTimersByTimeAsync(1000);
      await sharePromise;
    });

    expect(result.current.toastMessage).toBe("Sharing failed. Please try again.");
  });

  it("shows toast on generic capture error", async () => {
    (renderQuoteStoryCard as jest.Mock).mockRejectedValue(new Error("Capture failed"));

    const { result } = renderHook(() => useShareQuote(quote));
    render(result.current.captureTarget!);

    await act(async () => {
      const sharePromise = result.current.share();
      await jest.advanceTimersByTimeAsync(1000);
      await sharePromise;
    });

    expect(result.current.toastMessage).toBe("Image capture failed. Please try again.");
  });

  it("does nothing when quote is null", async () => {
    const { result } = renderHook(() => useShareQuote(null));

    await act(async () => {
      await result.current.share();
    });

    expect(renderQuoteStoryCard).not.toHaveBeenCalled();
    expect(shareImage).not.toHaveBeenCalled();
  });
});
