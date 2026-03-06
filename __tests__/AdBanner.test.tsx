jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("@/core/ads/admob", () => ({
  getGoogleMobileAdsModule: () => ({
    BannerAd: ({ onAdLoaded }: { onAdLoaded: (dims: { height: number; width: number }) => void }) => {
      onAdLoaded({ width: 320, height: 50 });
      return null;
    },
    BannerAdSize: {
      ANCHORED_ADAPTIVE_BANNER: "adaptive",
    },
  }),
  getBannerUnitId: () => "test-banner-unit",
}));

import { fireEvent, render } from "@testing-library/react-native";

import { AdBanner } from "@/core/ads/AdBanner";
import { ThemeProvider } from "@/ui/theme";

describe("AdBanner", () => {
  it("stays collapsed until the ad reports loaded height", () => {
    const state = {
      shouldRender: true,
      bannerHeight: 0,
      isHiddenByUser: false,
      dismissFor24Hours: jest.fn(),
      onLoaded: jest.fn(),
      onError: jest.fn(),
    };

    const view = render(
      <ThemeProvider>
        <AdBanner state={state} />
      </ThemeProvider>
    );

    fireEvent(view.getByTestId("ad-banner-root"), "layout", {
      nativeEvent: { layout: { width: 360 } },
    });

    expect(state.onLoaded).toHaveBeenCalled();
  });

  it("allows close when rendered", () => {
    const dismissFor24Hours = jest.fn().mockResolvedValue(undefined);
    const view = render(
      <ThemeProvider>
        <AdBanner
          state={{
            shouldRender: true,
            bannerHeight: 62,
            isHiddenByUser: false,
            dismissFor24Hours,
            onLoaded: jest.fn(),
            onError: jest.fn(),
          }}
        />
      </ThemeProvider>
    );

    fireEvent.press(view.getByLabelText("Hide ad"));
    expect(dismissFor24Hours).toHaveBeenCalled();
  });
});
