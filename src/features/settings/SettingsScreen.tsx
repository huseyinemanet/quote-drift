import * as Application from "expo-application";
import { useMemo } from "react";
import {
  ActionSheetIOS,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { appConfig } from "@/core/config";
import { minutesToLabel } from "@/core/date";
import { selectionHaptic } from "@/core/haptics";
import { openSystemSettings } from "@/core/notifications";
import { useAppState } from "@/core/bootstrap";
import { Banner } from "@/ui/Banner";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const FREQUENCY_OPTIONS = [
  { value: 1 as const, label: "Once a day" },
  { value: 2 as const, label: "Twice a day" },
  { value: 3 as const, label: "Three times" },
] as const;

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

  const handleSetNotificationsEnabled = async (nextEnabled: boolean) => {
    void selectionHaptic();

    if (!nextEnabled) {
      await updateNotificationSettings({ enabled: false });
      return;
    }

    if (notificationSettings.permission_status === "granted") {
      await updateNotificationSettings({ enabled: true });
      return;
    }

    await requestNotifications();
  };

  const openFrequencyPicker = () => {
    const options = [
      ...FREQUENCY_OPTIONS.map((option) => option.label),
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    const selectFrequency = (index: number) => {
      const option = FREQUENCY_OPTIONS[index];
      if (!option) {
        return;
      }

      void updateNotificationSettings({ frequency_per_day: option.value });
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: "Reminder frequency",
          message: "Choose how often reminders can appear each day.",
        },
        (buttonIndex) => {
          if (buttonIndex === cancelButtonIndex) {
            return;
          }

          selectFrequency(buttonIndex);
        }
      );
      return;
    }
  };

  const openHoursPicker = () => {
    const startOptions = [570, 630].map((value) => ({
      label: `${minutesToLabel(value)} to ${minutesToLabel(
        notificationSettings.active_end_minute
      )}`,
      value,
    }));
    const endOptions = [1230, 1290].map((value) => ({
      label: `${minutesToLabel(notificationSettings.active_start_minute)} to ${minutesToLabel(
        value
      )}`,
      value,
    }));
    const options = [
      ...startOptions.map((option) => `Start at ${minutesToLabel(option.value)}`),
      ...endOptions.map((option) => `End at ${minutesToLabel(option.value)}`),
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    const applySelection = (index: number) => {
      if (index < startOptions.length) {
        const nextStartMinute = startOptions[index]?.value;
        if (typeof nextStartMinute === "number") {
          void updateNotificationSettings({ active_start_minute: nextStartMinute });
        }
        return;
      }

      const endIndex = index - startOptions.length;
      const nextEndMinute = endOptions[endIndex]?.value;
      if (typeof nextEndMinute === "number") {
        void updateNotificationSettings({ active_end_minute: nextEndMinute });
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: "Active hours",
          message: "Reminders will only appear during the hours you choose.",
        },
        (buttonIndex) => {
          if (buttonIndex === cancelButtonIndex) {
            return;
          }

          applySelection(buttonIndex);
        }
      );
      return;
    }
  };

  const openPauseOptions = () => {
    const options = ["Pause for 1 day", "Pause for 7 days"];
    const destructiveButtonIndex = 2;
    const allOptions = [...options, "Resume now", "Cancel"];
    const cancelButtonIndex = allOptions.length - 1;

    const applySelection = (index: number) => {
      if (index === 0) {
        void pauseNotificationsForDays(1);
        return;
      }

      if (index === 1) {
        void pauseNotificationsForDays(7);
        return;
      }

      if (index === destructiveButtonIndex) {
        void updateNotificationSettings({ pause_until: null });
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: allOptions,
          cancelButtonIndex,
          destructiveButtonIndex,
          title: "Pause reminders",
        },
        (buttonIndex) => {
          if (buttonIndex === cancelButtonIndex) {
            return;
          }

          applySelection(buttonIndex);
        }
      );
      return;
    }
  };

  const frequencyLabel =
    FREQUENCY_OPTIONS.find(
      (option) => option.value === notificationSettings.frequency_per_day
    )?.label ?? "Once a day";
  const activeHoursLabel = `${minutesToLabel(
    notificationSettings.active_start_minute
  )} — ${minutesToLabel(notificationSettings.active_end_minute)}`;
  const pauseSummary =
    typeof notificationSettings.pause_until === "number" &&
    notificationSettings.pause_until > Date.now()
      ? "Paused for now"
      : "No pause set";

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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <Switch
            value={notificationSettings.enabled}
            onValueChange={handleSetNotificationsEnabled}
            trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
            thumbColor={colors.background}
          />
        </View>
        <Pressable style={styles.settingRow} onPress={openFrequencyPicker}>
          <View style={styles.settingCopy}>
            <Text style={styles.rowTitle}>Frequency</Text>
            <Text style={styles.rowSubtitle}>{frequencyLabel}</Text>
          </View>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.settingRow} onPress={openHoursPicker}>
          <View style={styles.settingCopy}>
            <Text style={styles.rowTitle}>Active hours</Text>
            <Text style={styles.rowSubtitle}>{activeHoursLabel}</Text>
          </View>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.settingRow} onPress={openPauseOptions}>
          <View style={styles.settingCopy}>
            <Text style={styles.rowTitle}>Pause reminders</Text>
            <Text style={styles.rowSubtitle}>{pauseSummary}</Text>
          </View>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        {notificationSettings.enabled ? (
          <View style={styles.advancedBlock}>
            <Text style={styles.helperLabel}>Advanced</Text>
            <Pressable style={styles.linkRow} onPress={sendTestReminder}>
              <View style={styles.settingCopy}>
                <Text style={styles.linkLabel}>Send test notification</Text>
                <Text style={styles.rowSubtitle}>Optional check before relying on reminders.</Text>
              </View>
              <Text style={styles.linkChevron}>›</Text>
            </Pressable>
          </View>
        ) : null}
        {denied ? (
          <Pressable style={styles.linkRow} onPress={openSystemSettings}>
            <Text style={styles.linkLabel}>Open system settings</Text>
            <Text style={styles.linkChevron}>›</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.section, styles.aboutSection]}>
        <Text style={styles.sectionTitle}>About</Text>
        <Pressable style={styles.linkRow} onPress={() => Linking.openURL(appConfig.supportUrl)}>
          <Text style={styles.linkLabel}>Support</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => Linking.openURL(appConfig.privacyUrl)}>
          <Text style={styles.linkLabel}>Privacy policy</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => Linking.openURL(appConfig.sourcesUrl)}>
          <Text style={styles.linkLabel}>Sources</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
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
      gap: 16,
    },
    aboutSection: {
      gap: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 2,
    },
    settingBlock: {
      gap: 10,
    },
    settingBlockCompact: {
      marginTop: 2,
    },
    advancedBlock: {
      gap: 6,
      paddingTop: 4,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 6,
    },
    settingCopy: {
      flex: 1,
      gap: 4,
    },
    rowTitle: {
      fontSize: 17,
      lineHeight: 22,
      color: colors.text,
      fontWeight: "600",
    },
    rowSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      opacity: 0.6,
    },
    helperLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    linkLabel: {
      fontSize: 17,
      lineHeight: 22,
      color: colors.text,
    },
    linkChevron: {
      fontSize: 24,
      lineHeight: 24,
      color: colors.textMuted,
    },
    caption: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
      opacity: 0.86,
    },
  });
