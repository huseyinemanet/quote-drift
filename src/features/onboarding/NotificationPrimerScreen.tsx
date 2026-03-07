import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useAppState } from "@/core/bootstrap";
import { dateToMinute, minuteToDate, minutesToLabel } from "@/core/date";
import { Button } from "@/ui/Button";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

const FREQUENCY_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: "Once" },
  { value: 2, label: "Twice" },
  { value: 3, label: "Three times" },
];

const DEFAULT_START_MINUTE = 540; // 9:00
const DEFAULT_END_MINUTE = 1260; // 21:00

export function NotificationPrimerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams<{ topics?: string }>();
  const {
    completeOnboarding,
    requestNotifications,
    updateNotificationSettings,
  } = useAppState();

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [frequency, setFrequency] = useState<1 | 2 | 3>(1);
  const [startMinute, setStartMinute] = useState(DEFAULT_START_MINUTE);
  const [endMinute, setEndMinute] = useState(DEFAULT_END_MINUTE);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const showInfo = () => {
    Alert.alert(
      "What changes if you say no?",
      "Nothing essential changes. Today, Library, favourites, and About still work as normal."
    );
  };

  const finish = async () => {
    const topics = params.topics ? (JSON.parse(params.topics) as string[]) : [];
    await updateNotificationSettings({
      enabled: remindersEnabled,
      frequency_per_day: frequency,
      active_start_minute: startMinute,
      active_end_minute: endMinute,
    });

    if (remindersEnabled) {
      await requestNotifications();
    }

    await completeOnboarding(topics);
    router.replace("/(app)/today");
  };

  const onStartChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowStartPicker(false);
    if (selectedDate) {
      const min = dateToMinute(selectedDate);
      if (min < endMinute) setStartMinute(min);
    }
  };

  const onEndChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowEndPicker(false);
    if (selectedDate) {
      const min = dateToMinute(selectedDate);
      if (min > startMinute) setEndMinute(min);
    }
  };

  return (
    <Screen
      useChromeInset={false}
      stickyFooter={
        <>
          <Button
            label={remindersEnabled ? "Enable reminders" : "Continue"}
            onPress={finish}
          />
          {remindersEnabled ? (
            <Text style={styles.footerText}>
              You can change this later in Settings.
            </Text>
          ) : null}
        </>
      }
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressRow}>
          <View style={styles.progressDots}>
            <View style={[styles.progressDot, styles.progressDotComplete]} />
            <View style={[styles.progressDot, styles.progressDotComplete]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
          <Text style={styles.progressLabel}>Step 3 of 3</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Use reminders if you want.</Text>
          <Text style={styles.body}>
            Get a gentle quote prompt during the day.
          </Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Enable reminders</Text>
          <Switch
            value={remindersEnabled}
            onValueChange={(value) => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setRemindersEnabled(value);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.background}
          />
        </View>
        <Pressable onPress={showInfo} style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={styles.infoText}>What changes if you say no?</Text>
        </Pressable>
        {remindersEnabled ? (
          <>
            <Text style={styles.sectionLabel}>How often</Text>
            <View style={styles.radioGroup}>
              {FREQUENCY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.radioRow}
                  onPress={() => setFrequency(option.value)}
                >
                  <Ionicons
                    name={frequency === option.value ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={frequency === option.value ? colors.text : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.radioLabel,
                      frequency === option.value ? styles.radioLabelSelected : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.sectionLabel}>Reminder hours</Text>
            <View style={styles.hoursCard}>
              <Text style={styles.hoursLabel}>Start</Text>
              {Platform.OS === "ios" ? (
                <>
                  <Pressable
                    style={styles.timeValueRow}
                    onPress={() => {
                      setShowEndPicker(false);
                      setShowStartPicker(true);
                    }}
                  >
                    <Text style={styles.timeValueText}>{minutesToLabel(startMinute)}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                  {showStartPicker && (
                    <DateTimePicker
                      value={minuteToDate(startMinute)}
                      mode="time"
                      display="spinner"
                      onChange={(_, selectedDate) => {
                        onStartChange(_, selectedDate);
                        setShowStartPicker(false);
                      }}
                      maximumDate={minuteToDate(endMinute - 30)}
                    />
                  )}
                </>
              ) : (
                <>
                  <Pressable
                    style={styles.timeRow}
                    onPress={() => {
                      setShowEndPicker(false);
                      setShowStartPicker(true);
                    }}
                  >
                    <Text style={styles.timeValue}>{minutesToLabel(startMinute)}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                  {showStartPicker && (
                    <DateTimePicker
                      value={minuteToDate(startMinute)}
                      mode="time"
                      display="default"
                      onChange={onStartChange}
                      maximumDate={minuteToDate(endMinute - 30)}
                    />
                  )}
                </>
              )}
              <Text style={styles.hoursLabel}>End</Text>
              {Platform.OS === "ios" ? (
                <>
                  <Pressable
                    style={styles.timeValueRow}
                    onPress={() => {
                      setShowStartPicker(false);
                      setShowEndPicker(true);
                    }}
                  >
                    <Text style={styles.timeValueText}>{minutesToLabel(endMinute)}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                  {showEndPicker && (
                    <DateTimePicker
                      value={minuteToDate(endMinute)}
                      mode="time"
                      display="spinner"
                      onChange={(_, selectedDate) => {
                        onEndChange(_, selectedDate);
                        setShowEndPicker(false);
                      }}
                      minimumDate={minuteToDate(startMinute + 30)}
                    />
                  )}
                </>
              ) : (
                <>
                  <Pressable
                    style={styles.timeRow}
                    onPress={() => {
                      setShowStartPicker(false);
                      setShowEndPicker(true);
                    }}
                  >
                    <Text style={styles.timeValue}>{minutesToLabel(endMinute)}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                  {showEndPicker && (
                    <DateTimePicker
                      value={minuteToDate(endMinute)}
                      mode="time"
                      display="default"
                      onChange={onEndChange}
                      minimumDate={minuteToDate(startMinute + 30)}
                    />
                  )}
                </>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    progressRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    progressDots: {
      flexDirection: "row",
      gap: 8,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.border,
    },
    progressDotComplete: {
      backgroundColor: colors.accent,
    },
    progressDotActive: {
      width: 26,
      backgroundColor: colors.text,
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
    },
    header: {
      marginTop: 20,
      gap: 8,
    },
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "700",
      fontFamily: "SourceSerif4_400Regular",
      letterSpacing: -0.3,
      color: colors.text,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      paddingVertical: 12,
    },
    toggleLabel: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginTop: 28,
      marginBottom: 8,
    },
    radioGroup: {
      gap: 8,
    },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
    },
    radioLabel: {
      fontSize: 16,
      color: colors.textMuted,
    },
    radioLabelSelected: {
      color: colors.text,
      fontWeight: "600",
    },
    hoursCard: {
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hoursLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    timeValueText: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    timeValueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeValue: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    footerText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 8,
    },
  });
