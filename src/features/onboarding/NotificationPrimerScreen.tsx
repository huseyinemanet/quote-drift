import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Banner } from "@/ui/Banner";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { colors } from "@/ui/theme";

export function NotificationPrimerScreen() {
  const params = useLocalSearchParams<{ topics?: string }>();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Local reminders stay optional.</Text>
        <Text style={styles.body}>
          The app works fully without notifications. If you opt in, reminders stay
          quiet and inside your active hours.
        </Text>
      </View>
      <Banner
        title="What changes if you say no?"
        body="Nothing essential. Today, Library, favourites, feedback, and About stay available."
      />
      <Button
        label="Set reminder frequency"
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/frequency",
            params: { topics: params.topics ?? "[]" },
          })
        }
      />
      <Button
        label="Skip reminders for now"
        variant="ghost"
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/frequency",
            params: { topics: params.topics ?? "[]", skipNotifications: "true" },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
