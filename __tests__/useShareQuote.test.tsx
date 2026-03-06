jest.mock("@/core/sharecard/renderQuoteStoryCard", () => ({
  renderQuoteStoryCard: jest.fn(),
}));

jest.mock("@/core/sharecard/shareImage", () => ({
  shareImage: jest.fn(),
}));

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

import { renderQuoteStoryCard } from "@/core/sharecard/renderQuoteStoryCard";
import { shareImage } from "@/core/sharecard/shareImage";
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
      await result.current.share();
    });

    expect(renderQuoteStoryCard).toHaveBeenCalled();
    expect(shareImage).toHaveBeenCalledWith("file:///tmp/story.png");
  });
});
