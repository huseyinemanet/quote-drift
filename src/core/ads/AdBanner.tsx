import { Ionicons } from "@expo/vector-icons";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemeTokens, useTheme } from "@/ui/theme";

import { getBannerUnitId, getGoogleMobileAdsModule } from "./admob";
import type { AdBannerState } from "./useAdBanner";

const BANNER_VERTICAL_PADDING = 6;
const CLOSE_BUTTON_WIDTH = 32;

export function AdBanner({ state }: { state: AdBannerState }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [bannerWidth, setBannerWidth] = useState(0);
  const googleMobileAds = getGoogleMobileAdsModule();

  const BannerAdComponent = googleMobileAds?.BannerAd as
    | ComponentType<{
        unitId: string;
        size: string;
        requestOptions?: { requestNonPersonalizedAdsOnly?: boolean };
        onAdLoaded?: (dimensions: { width: number; height: number }) => void;
        onAdFailedToLoad?: (error: unknown) => void;
      }>
    | undefined;
  const BannerAdSize = googleMobileAds?.BannerAdSize;
  const unitId = getBannerUnitId();

  const canRenderBanner =
    state.shouldRender &&
    Boolean(BannerAdComponent) &&
    Boolean(BannerAdSize) &&
    Boolean(unitId);
  const ResolvedBannerAd = BannerAdComponent as NonNullable<typeof BannerAdComponent>;

  const containerStyle = useMemo(
    () => [
      styles.container,
      state.bannerHeight === 0 ? styles.collapsed : null,
    ],
    [state.bannerHeight, styles]
  );

  if (!state.shouldRender) {
    return null;
  }

  return (
    <View
      testID="ad-banner-root"
      style={containerStyle}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        if (nextWidth !== bannerWidth) {
          setBannerWidth(nextWidth);
        }
      }}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.bannerSlot,
            state.bannerHeight === 0 ? styles.collapsed : null,
          ]}
        >
          {canRenderBanner && bannerWidth > 0 ? (
            <ResolvedBannerAd
              unitId={unitId!}
              size={BannerAdSize!.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              onAdLoaded={({ height }: { width: number; height: number }) => {
                state.onLoaded(height + BANNER_VERTICAL_PADDING * 2);
              }}
              onAdFailedToLoad={state.onError}
            />
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hide ad"
          onPress={() => void state.dismissFor24Hours()}
          style={({ pressed }) => [
            styles.closeButton,
            pressed ? styles.closeButtonPressed : null,
          ]}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: BANNER_VERTICAL_PADDING,
      paddingLeft: 8,
      paddingRight: 4,
      overflow: "hidden",
    },
    collapsed: {
      height: 0,
      paddingVertical: 0,
      borderWidth: 0,
      opacity: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    bannerSlot: {
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
      justifyContent: "center",
    },
    closeButton: {
      width: CLOSE_BUTTON_WIDTH,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    closeButtonPressed: {
      opacity: 0.7,
    },
  });
