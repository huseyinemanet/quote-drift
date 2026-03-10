import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAppState } from "@/core/bootstrap";
import { Button } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";
import { Screen } from "@/ui/Screen";
import { MAX_FONT_SIZE_MULTIPLIER, ThemeTokens, useTheme } from "@/ui/theme";

export function LoadingScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.title}>Preparing your offline collection</Text>
        <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.body}>
          Validating the bundled quote library and loading durable state.
        </Text>
      </View>
    </Screen>
  );
}

export function FatalCorpusScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { invalidIssues, hasLibraryContent } = useAppState();

  return (
    <Screen>
      <EmptyState
        title="The bundled quote file could not be trusted"
        body="Scheduling stays disabled until the corpus is corrected. If an older library exists in the database, you can still browse it."
      />
      {invalidIssues.map((issue) => (
        <Text key={issue} maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.issue}>
          • {issue}
        </Text>
      ))}
      {hasLibraryContent ? (
        <Button label="Open library" onPress={() => router.replace("/(app)/library")} />
      ) : null}
    </Screen>
  );
}

export function ExhaustedScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { restartQuoteCollection, updateNotificationSettings } = useAppState();

  return (
    <Screen>
      <EmptyState
        title="All quotes are currently exhausted"
        body="Every quote has already been used or reserved. Restarting the collection will allow repeats to begin again."
      />
      <Button
        label="Restart collection"
        onPress={async () => {
          await restartQuoteCollection();
          router.replace("/(app)/today");
        }}
      />
      <Button
        label="Keep notifications off"
        variant="ghost"
        onPress={async () => {
          await updateNotificationSettings({ enabled: false });
          router.replace("/(app)/settings");
        }}
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 28,
      gap: 16,
    },
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
      textAlign: "center",
    },
    issue: {
      color: colors.textMuted,
      lineHeight: 22,
    },
  });
