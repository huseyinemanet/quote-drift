import { SourceSerif4_400Regular } from "@expo-google-fonts/source-serif-4";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";

import { AppProvider } from "@/core/bootstrap";
import { darkTheme, lightTheme, ThemeProvider, useTheme } from "@/ui/theme";

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SourceSerif4_400Regular,
  });

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
    <AppProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AppProvider>
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
