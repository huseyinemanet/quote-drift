jest.mock("expo-linking", () => ({
  canOpenURL: jest.fn(),
}));

jest.mock("@/core/sharecard/shareImage", () => ({
  shareImage: jest.fn(),
}));

import * as Linking from "expo-linking";

import { shareImage } from "@/core/sharecard/shareImage";
import { shareToInstagramStory } from "@/core/sharecard/shareToInstagramStory";

describe("shareToInstagramStory", () => {
  it("falls back when Instagram is unavailable", async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    const result = await shareToInstagramStory("file:///tmp/story.png");

    expect(shareImage).toHaveBeenCalledWith("file:///tmp/story.png", "Share image");
    expect(result).toEqual({
      usedFallback: true,
      reason: "instagram-unavailable",
    });
  });

  it("still uses the image share flow when Instagram is available", async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

    const result = await shareToInstagramStory("file:///tmp/story.png");

    expect(shareImage).toHaveBeenCalledWith(
      "file:///tmp/story.png",
      "Share to Instagram Story"
    );
    expect(result).toEqual({
      usedFallback: true,
      reason: "direct-unsupported",
    });
  });
});
