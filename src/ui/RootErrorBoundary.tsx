import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Appearance, StyleSheet, Text, View } from "react-native";

import { recordError } from "@/core/crashlytics";
import { darkTheme, lightTheme, MAX_FONT_SIZE_MULTIPLIER } from "@/ui/theme";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error("RootErrorBoundary caught:", error, errorInfo);
    }
    recordError(error, errorInfo.componentStack ?? undefined);
  }

  render() {
    if (this.state.error) {
      const theme = Appearance.getColorScheme() === "dark" ? darkTheme : lightTheme;
      const styles = createErrorStyles(theme);
      return (
        <View style={styles.container}>
          <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.title}>Bir hata oluştu</Text>
          <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.message}>{this.state.error.message}</Text>
          {__DEV__ && (
            <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.stack} numberOfLines={10}>
              {this.state.error.stack}
            </Text>
          )}
        </View>
      );
    }
    return this.props.children;
  }
}

function createErrorStyles(theme: typeof lightTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
      justifyContent: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 16,
    },
    stack: {
      fontSize: 11,
      color: theme.textMuted,
      fontFamily: "monospace",
    },
  });
}
