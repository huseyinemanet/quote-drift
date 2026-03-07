import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";

import { useAdBanner } from "@/core/ads/useAdBanner";
import { BottomChrome } from "@/features/layout/BottomChrome";
import { BottomChromeInsetProvider } from "@/features/layout/BottomChromeInset";
import { useTheme } from "@/ui/theme";

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
            backgroundColor: colors.surface,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
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
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
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
