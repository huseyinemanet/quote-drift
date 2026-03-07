import { Bookmark, CloudSun, Settings } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useAdBanner } from "@/core/ads/useAdBanner";
import { BottomChrome } from "@/features/layout/BottomChrome";
import { BottomChromeInsetProvider } from "@/features/layout/BottomChromeInset";
import { useTheme } from "@/ui/theme";

/** iOS nav bar: native-style blur + subtle tint (blur visible, light mode not washed out). */
function HeaderBlurBackground() {
  const { isDark, colors } = useTheme();
  const tint = isDark ? "dark" : "light";
  const overlayColor = isDark ? "rgba(0,0,0,0.15)" : "rgba(246, 239, 225, 0.9)";
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <BlurView
        tint={tint}
        intensity={60}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor }]}
        pointerEvents="none"
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            top: undefined,
            bottom: 0,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

function TabBarBlurBackground() {
  const { isDark, colors } = useTheme();
  const tint = isDark ? "dark" : "light";
  const overlayColor = isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.05)";
  const fallbackBg = Platform.OS === "android" ? colors.surface : undefined;
  return (
    <View style={[StyleSheet.absoluteFillObject, fallbackBg && { backgroundColor: fallbackBg }]}>
      <BlurView
        tint={tint}
        intensity={60}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor }]}
        pointerEvents="none"
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            top: undefined,
            bottom: 0,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

function TabIcon({
  focused,
  color,
  size,
  IconComponent,
}: {
  focused: boolean;
  color: string;
  size: number;
  IconComponent: React.ComponentType<{ size: number; color: string }>;
}) {
  return <IconComponent size={size} color={color} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const [bottomInset, setBottomInset] = useState(0);
  const adBannerState = useAdBanner();

  return (
    <BottomChromeInsetProvider value={bottomInset}>
      <Tabs
        tabBar={(props) => (
          <BottomChrome
            {...props}
            adBannerState={adBannerState}
            onInsetChange={setBottomInset}
          />
        )}
        screenOptions={{
          headerShown: true,
          headerStyle: Platform.select({
            ios: {
              backgroundColor: "transparent",
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
            default: {
              backgroundColor: colors.surface,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          }),
          ...(Platform.OS === "ios" && {
            headerTransparent: true,
            headerBackground: () => <HeaderBlurBackground />,
          }),
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: "600",
            color: colors.text,
          },
          sceneStyle: { marginBottom: 0, paddingBottom: 0 },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.tabBarBorder,
          },
          tabBarBackground: () => <TabBarBlurBackground />,
        }}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: "Today",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={24}
                IconComponent={CloudSun}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={24}
                IconComponent={Bookmark}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={24}
                IconComponent={Settings}
              />
            ),
          }}
        />
      </Tabs>
    </BottomChromeInsetProvider>
  );
}
