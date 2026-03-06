jest.mock("@react-navigation/bottom-tabs", () => ({
  BottomTabBar: () => null,
}));

jest.mock("@/core/ads/AdBanner", () => ({
  AdBanner: () => null,
}));

import { fireEvent, render } from "@testing-library/react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Fragment } from "react";

import { BottomChrome } from "@/features/layout/BottomChrome";
import { ThemeProvider } from "@/ui/theme";

describe("BottomChrome", () => {
  const tabBarProps: BottomTabBarProps = {
    state: {
      key: "tabs",
      index: 0,
      routeNames: ["today"],
      routes: [{ key: "today-key", name: "today" }],
      type: "tab",
      stale: false,
      history: [],
      preloadedRouteKeys: [],
    },
    descriptors: {
      "today-key": {
        route: { key: "today-key", name: "today" },
        navigation: {} as never,
        options: {},
        render: () => <Fragment />,
      },
    },
    navigation: {
      emit: jest.fn(),
      dispatch: jest.fn(),
      navigate: jest.fn(),
    } as never,
    insets: { top: 0, right: 0, bottom: 34, left: 0 },
  };

  it("uses tab bar height only when the banner is hidden", () => {
    const onInsetChange = jest.fn();
    const view = render(
      <ThemeProvider>
        <BottomChrome
          {...tabBarProps}
          adBannerState={{
            shouldRender: false,
            bannerHeight: 0,
            isHiddenByUser: true,
            dismissFor24Hours: jest.fn(),
            onLoaded: jest.fn(),
            onError: jest.fn(),
          }}
          onInsetChange={onInsetChange}
        />
      </ThemeProvider>
    );

    fireEvent(view.getByTestId("bottom-chrome-tab-bar"), "layout", {
      nativeEvent: { layout: { height: 64 } },
    });

    expect(onInsetChange).toHaveBeenLastCalledWith(64);
  });

  it("removes exactly the banner height and gap after dismiss", () => {
    const onInsetChange = jest.fn();
    const view = render(
      <ThemeProvider>
        <BottomChrome
          {...tabBarProps}
          adBannerState={{
            shouldRender: true,
            bannerHeight: 62,
            isHiddenByUser: false,
            dismissFor24Hours: jest.fn(),
            onLoaded: jest.fn(),
            onError: jest.fn(),
          }}
          onInsetChange={onInsetChange}
        />
      </ThemeProvider>
    );

    fireEvent(view.getByTestId("bottom-chrome-tab-bar"), "layout", {
      nativeEvent: { layout: { height: 64 } },
    });

    expect(onInsetChange).toHaveBeenLastCalledWith(134);

    view.rerender(
      <ThemeProvider>
        <BottomChrome
          {...tabBarProps}
          adBannerState={{
            shouldRender: false,
            bannerHeight: 0,
            isHiddenByUser: true,
            dismissFor24Hours: jest.fn(),
            onLoaded: jest.fn(),
            onError: jest.fn(),
          }}
          onInsetChange={onInsetChange}
        />
      </ThemeProvider>
    );

    expect(onInsetChange).toHaveBeenLastCalledWith(64);
  });
});
