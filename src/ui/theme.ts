import {
  createElement,
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import * as SystemUI from "expo-system-ui";

export type ThemeTokens = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  border: string;
  danger: string;
  success: string;
  tabActive: string;
  tabInactive: string;
  tabBarBorder: string;
};

export const lightTheme: ThemeTokens = {
  background: "#f5efe2",
  surface: "#fbf7ee",
  surfaceMuted: "#efe6d4",
  text: "#1c2421",
  textMuted: "#5d675f",
  accent: "#8b5e3c",
  accentSoft: "#d8b998",
  border: "#e0d7c7",
  danger: "#8c3d39",
  success: "#4d6b4e",
  tabActive: "#8b5e3c",
  tabInactive: "#5d675f",
  tabBarBorder: "#e0d7c7",
};

export const darkTheme: ThemeTokens = {
  background: "#141915",
  surface: "#1c231d",
  surfaceMuted: "#253027",
  text: "#eff3ec",
  textMuted: "#b0bbaf",
  accent: "#d7b18a",
  accentSoft: "#7c6348",
  border: "#314035",
  danger: "#dd8e88",
  success: "#9ec4a1",
  tabActive: "#d7b18a",
  tabInactive: "#9ba89d",
  tabBarBorder: "#252d28",
};

type ThemeContextValue = {
  colors: ThemeTokens;
  isDark: boolean;
  scheme: NonNullable<ColorSchemeName>;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightTheme,
  isDark: false,
  scheme: "light",
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const value = useMemo(
    () => ({
      colors: isDark ? darkTheme : lightTheme,
      isDark,
      scheme,
    }),
    [isDark, scheme]
  );

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(value.colors.background);
  }, [value.colors.background]);

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
