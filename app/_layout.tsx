import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProvider } from "@/core/bootstrap";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="loading" />
        <Stack.Screen name="fatal-data" />
        <Stack.Screen name="exhausted" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AppProvider>
  );
}
