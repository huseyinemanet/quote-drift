import * as Application from "expo-application";
import { useMemo } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

import { appConfig } from "@/core/config";
import { minutesToLabel } from "@/core/date";
import { openSystemSettings } from "@/core/notifications";
import { useAppState } from "@/core/bootstrap";
import { Banner } from "@/ui/Banner";
import { Button } from "@/ui/Button";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

export function SettingsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    notificationSettings,
    requestNotifications,
    updateNotificationSettings,
    pauseNotificationsForDays,
    sendTestReminder,
  } = useAppState();

  const version = useMemo(
    () =>
      `${Application.applicationName ?? "Quotify"} ${Application.nativeApplicationVersion ?? "1.0.0"} (${Application.nativeBuildVersion ?? "1"})`,
    []
  );

  const denied = notificationSettings.permission_status === "denied";

  const handleToggleNotifications = async () => {
    if (notificationSettings.enabled) {
      await updateNotificationSettings({ enabled: false });
      return;
    }

    if (notificationSettings.permission_status === "granted") {
      await updateNotificationSettings({ enabled: true });
      return;
    }

    await requestNotifications();
  };

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      {denied ? (
        <Banner
          title="Reminders are denied at the system level"
          body="The app still works fully. Re-enable reminders in system settings if you want them back."
        />
      ) : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <Button
          label={notificationSettings.enabled ? "Turn reminders off" : "Turn reminders on"}
          onPress={handleToggleNotifications}
        />
        <View style={styles.inline}>
          {[1, 2, 3].map((value) => (
            <ChoiceChip
              key={value}
              label={`${value}/day`}
              selected={notificationSettings.frequency_per_day === value}
              onPress={() =>
                updateNotificationSettings({
                  frequency_per_day: value as 1 | 2 | 3,
                })
              }
            />
          ))}
        </View>
        <Text style={styles.caption}>
          Active hours: {minutesToLabel(notificationSettings.active_start_minute)} to{" "}
          {minutesToLabel(notificationSettings.active_end_minute)}
        </Text>
        <View style={styles.inline}>
          {[570, 630].map((value) => (
            <ChoiceChip
              key={`start-${value}`}
              label={`Start ${minutesToLabel(value)}`}
              selected={notificationSettings.active_start_minute === value}
              onPress={() => updateNotificationSettings({ active_start_minute: value })}
            />
          ))}
        </View>
        <View style={styles.inline}>
          {[1230, 1290].map((value) => (
            <ChoiceChip
              key={`end-${value}`}
              label={`End ${minutesToLabel(value)}`}
              selected={notificationSettings.active_end_minute === value}
              onPress={() => updateNotificationSettings({ active_end_minute: value })}
            />
          ))}
        </View>
        <View style={styles.inline}>
          <Button label="Pause 1 day" variant="secondary" onPress={() => pauseNotificationsForDays(1)} />
          <Button label="Pause 7 days" variant="secondary" onPress={() => pauseNotificationsForDays(7)} />
        </View>
        <Button label="Send test notification" variant="ghost" onPress={sendTestReminder} />
        {denied ? (
          <Button label="Open system settings" variant="ghost" onPress={openSystemSettings} />
        ) : null}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Button label="Support" variant="secondary" onPress={() => Linking.openURL(appConfig.supportUrl)} />
        <Button
          label="Privacy policy"
          variant="secondary"
          onPress={() => Linking.openURL(appConfig.privacyUrl)}
        />
        <Button label="Sources" variant="secondary" onPress={() => Linking.openURL(appConfig.sourcesUrl)} />
        <Text style={styles.caption}>{version}</Text>
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
    },
    section: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      padding: 18,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    inline: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    caption: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });
