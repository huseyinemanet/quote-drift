import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AdBanner } from "@/core/ads/AdBanner";
import type { AdBannerState } from "@/core/ads/useAdBanner";
import { selectionHaptic } from "@/core/haptics";
import { ThemeTokens, useTheme } from "@/ui/theme";

const AD_GAP = 8;

export function BottomChrome({
  adBannerState,
  onInsetChange,
  ...tabBarProps
}: BottomTabBarProps & {
  adBannerState: AdBannerState;
  onInsetChange: (height: number) => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const previousTabIndex = useRef<number | null>(null);
  const currentRouteName =
    tabBarProps.state.routes[tabBarProps.state.index]?.name ?? "";
  const shouldShowBanner =
    currentRouteName !== "today" &&
    currentRouteName !== "library" &&
    currentRouteName !== "settings" &&
    currentRouteName !== "reflections";
  const showBannerGap = shouldShowBanner && adBannerState.bannerHeight > 0;
  const chromeHeight =
    tabBarHeight + (showBannerGap ? adBannerState.bannerHeight + AD_GAP : 0);

  useEffect(() => {
    onInsetChange(chromeHeight);
    if (__DEV__ && chromeHeight > 0) {
      console.log("[BottomChrome] tabBarHeight:", tabBarHeight, "chromeHeight:", chromeHeight);
    }
  }, [chromeHeight, onInsetChange, tabBarHeight]);

  useEffect(() => {
    if (previousTabIndex.current === null) {
      previousTabIndex.current = tabBarProps.state.index;
      return;
    }

    if (previousTabIndex.current !== tabBarProps.state.index) {
      previousTabIndex.current = tabBarProps.state.index;
      void selectionHaptic();
    }
  }, [tabBarProps.state.index]);

  return (
    <View style={styles.container}>
      {shouldShowBanner ? <AdBanner state={adBannerState} /> : null}
      {showBannerGap ? <View style={styles.gap} /> : null}
      <View
        testID="bottom-chrome-tab-bar"
        onLayout={(event) => setTabBarHeight(event.nativeEvent.layout.height)}
      >
        <BottomTabBar {...tabBarProps} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    gap: {
      height: AD_GAP,
    },
  });
