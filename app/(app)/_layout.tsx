import { Tabs } from "expo-router";

import { colors } from "@/ui/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen name="today" options={{ title: "Today" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
