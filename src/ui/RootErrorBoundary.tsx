import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { StyleSheet, Text, View } from "react-native";

import { lightTheme } from "@/ui/theme";

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
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir hata oluştu</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          {__DEV__ && (
            <Text style={styles.stack} numberOfLines={10}>
              {this.state.error.stack}
            </Text>
          )}
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: lightTheme.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: lightTheme.textMuted,
    marginBottom: 16,
  },
  stack: {
    fontSize: 11,
    color: lightTheme.textMuted,
    fontFamily: "monospace",
  },
});
