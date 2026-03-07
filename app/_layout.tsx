import { SourceSerif4_400Regular } from "@expo-google-fonts/source-serif-4";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider } from "@/core/bootstrap";
import { RootErrorBoundary } from "@/ui/RootErrorBoundary";
import { darkTheme, lightTheme, ThemeProvider, useTheme } from "@/ui/theme";

/** Neutral background used before bridge is ready (no native hooks). */
const PLACEHOLDER_BG = "#f2f2f2";

/**
 * Renders nothing but a placeholder until after a short delay so the React Native
 * bridge can register RCTEventEmitter. Avoids "Module has not been registered as
 * callable" when native sends events (e.g. from useColorScheme, safe-area, screens).
 */
function BridgeReadyGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 250);
    return () => clearTimeout(t);
  }, []);
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: PLACEHOLDER_BG }} />;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <BridgeReadyGate>
      <RootLayoutContent />
    </BridgeReadyGate>
  );
}

function RootLayoutContent() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    SourceSerif4_400Regular,
  });

  if (fontError && !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: scheme === "dark" ? darkTheme.background : lightTheme.background,
        }}
      />
    );
  }

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: scheme === "dark" ? darkTheme.background : lightTheme.background,
        }}
      />
    );
  }

  return (
    <RootErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}

function RootNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="loading" />
          <Stack.Screen name="fatal-data" />
          <Stack.Screen name="exhausted" />
          <Stack.Screen name="author/[authorId]" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </View>
    </>
  );
}
