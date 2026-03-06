import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

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
  const [bottomInset, setBottomInset] = useState(88);

  return (
    <BottomChromeInsetProvider value={bottomInset}>
      <Tabs
        tabBar={(props) => (
          <View onLayout={(event) => setBottomInset(event.nativeEvent.layout.height)}>
            <BottomTabBar {...props} />
          </View>
        )}
        screenOptions={{
          headerShown: false,
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
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size}
                activeName="sunny"
                inactiveName="sunny-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size}
                activeName="book"
                inactiveName="book-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size}
                activeName="settings"
                inactiveName="settings-outline"
              />
            ),
          }}
        />
      </Tabs>
    </BottomChromeInsetProvider>
  );
}
