import { render } from "@testing-library/react-native";

import { StoryCard } from "@/ui/components/StoryCard";
import { getStoryTypographyPreset } from "@/core/sharecard/storyTypography";

describe("StoryCard", () => {
  it("renders quote, author, and tag", () => {
    const { getByText } = render(
      <StoryCard
        quote={{
          id: "q1",
          text: "Stay close to what sharpens your mind.",
          author: "Seneca",
          primaryTag: "clarity",
        }}
      />
    );

    expect(getByText("Quote Drift")).toBeTruthy();
    expect(getByText("Stay close to what sharpens your mind.")).toBeTruthy();
    expect(getByText("Seneca")).toBeTruthy();
    expect(getByText("#clarity")).toBeTruthy();
  });

  it("uses smaller typography presets for longer quotes", () => {
    const shortPreset = getStoryTypographyPreset("Short quote.");
    const longPreset = getStoryTypographyPreset(
      "This is a much longer quote that should force the Story card typography down into a smaller preset so that the author line stays visible within the reserved safe area."
    );

    expect(longPreset.fontSize).toBeLessThan(shortPreset.fontSize);
    expect(longPreset.lineHeight).toBeLessThan(shortPreset.lineHeight);
  });
});
