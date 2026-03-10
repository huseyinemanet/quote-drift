import { X } from "lucide-react-native";
import type { ComponentType } from "react";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useIsTablet } from "@/features/layout/useBreakpoint";
import { BUTTON_BORDER_RADIUS } from "@/ui/buttonMetrics";
import { ThemeTokens, useTheme } from "@/ui/theme";

import { getBannerUnitId, getGoogleMobileAdsModule } from "./admob";
import type { AdBannerState } from "./useAdBanner";

const BANNER_VERTICAL_PADDING = 6;
const CLOSE_BUTTON_WIDTH = 32;
const BANNER_HEIGHT = 50;
const BANNER_WIDTH = 320;

export function AdBanner({ state }: { state: AdBannerState }) {
  const { colors } = useTheme();
  const isTablet = useIsTablet();
  const styles = createStyles(colors, isTablet);
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
    <View testID="ad-banner-root" style={containerStyle}>
      <View style={styles.row}>
        <View
          style={[
            styles.bannerSlot,
            state.bannerHeight === 0 ? styles.collapsed : null,
          ]}
        >
          {canRenderBanner ? (
            <View style={styles.bannerFrame}>
              <ResolvedBannerAd
                unitId={unitId!}
                size={BannerAdSize!.BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                onAdLoaded={() => {
                  state.onLoaded(BANNER_HEIGHT + BANNER_VERTICAL_PADDING * 2);
                }}
                onAdFailedToLoad={state.onError}
              />
            </View>
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
          <X size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeTokens, isTablet: boolean) =>
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
      ...(isTablet && { justifyContent: "center" }),
    },
    bannerSlot: {
      minHeight: 0,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      ...(isTablet ? {} : { flex: 1 }),
    },
    bannerFrame: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      overflow: "hidden",
    },
    closeButton: {
      width: CLOSE_BUTTON_WIDTH,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: BUTTON_BORDER_RADIUS,
    },
    closeButtonPressed: {
      opacity: 0.7,
    },
  });
