import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";

import { AdBanner } from "@/core/ads/AdBanner";
import type { AdBannerState } from "@/core/ads/useAdBanner";
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
  const showBannerGap = adBannerState.bannerHeight > 0;

  return (
    <View
      style={styles.container}
      onLayout={(event) => onInsetChange(event.nativeEvent.layout.height)}
    >
      <AdBanner state={adBannerState} />
      {showBannerGap ? <View style={styles.gap} /> : null}
      <BottomTabBar {...tabBarProps} />
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingTop: 4,
    },
    gap: {
      height: AD_GAP,
    },
  });
