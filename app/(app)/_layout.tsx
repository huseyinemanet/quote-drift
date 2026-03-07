import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useAdBanner } from "@/core/ads/useAdBanner";
import { BottomChrome } from "@/features/layout/BottomChrome";
import { BottomChromeInsetProvider } from "@/features/layout/BottomChromeInset";
import { useTheme } from "@/ui/theme";

function HeaderBlurBackground() {
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
    </View>
  );
}

function TabIcon({
  focused,
  color,
  size,
  activeName,
  inactiveName,
}: {
  focused: boolean;
  color: string;
  size: number;
  activeName: React.ComponentProps<typeof Ionicons>["name"];
  inactiveName: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <Ionicons
      name={focused ? activeName : inactiveName}
      size={size}
      color={color}
    />
  );
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
          headerStyle: {
            backgroundColor: "transparent",
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
          headerBackground: () => <HeaderBlurBackground />,
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: "600",
            color: colors.text,
          },
          headerLargeTitle: false,
          headerBlurEffect: undefined,
          contentStyle: { backgroundColor: colors.background },
          sceneStyle: { marginBottom: 0, paddingBottom: 0 },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarSafeAreaInsets: { bottom: 0 },
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "transparent",
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            elevation: 0,
            shadowOpacity: 0,
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
                activeName="partly-sunny"
                inactiveName="partly-sunny-outline"
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
                activeName="bookmark"
                inactiveName="bookmark-outline"
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
                activeName="cog"
                inactiveName="cog-outline"
              />
            ),
          }}
        />
      </Tabs>
    </BottomChromeInsetProvider>
  );
}
