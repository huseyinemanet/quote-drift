import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Modal,
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
  { value: 1, label: "Once a day" },
  { value: 2, label: "Twice a day" },
  { value: 3, label: "Three times a day" },
];

const DEFAULT_START_MINUTE = 540; // 9:00
const DEFAULT_END_MINUTE = 1260; // 21:00

type TimeField = "start" | "end";

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
  const [activeField, setActiveField] = useState<TimeField | null>(null);
  const [tempTime, setTempTime] = useState<Date>(() => minuteToDate(DEFAULT_START_MINUTE));

  const showTimePicker = activeField !== null;

  const showInfo = () => {
    Alert.alert(
      "What happens if you skip reminders?",
      "Nothing essential changes.\n\n• Today still works\n• Library and favourites still work\n• About and Settings still work",
      [{ text: "Got it", style: "default" }]
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

  const openStartPicker = () => {
    setTempTime(minuteToDate(startMinute));
    setActiveField("start");
  };

  const openEndPicker = () => {
    setTempTime(minuteToDate(endMinute));
    setActiveField("end");
  };

  const closeTimePicker = () => setActiveField(null);

  const confirmTimePicker = () => {
    if (activeField == null) return;
    const minute = dateToMinute(tempTime);
    if (activeField === "start") {
      setStartMinute(minute);
      if (minute >= endMinute) {
        setEndMinute(Math.min(1439, minute + 30));
      }
    } else {
      setEndMinute(minute);
      if (minute <= startMinute) {
        setStartMinute(Math.max(0, minute - 30));
      }
    }
    setActiveField(null);
  };

  const handleTimeChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android" && activeField != null) {
      const minute = selectedDate ? dateToMinute(selectedDate) : (activeField === "start" ? startMinute : endMinute);
      if (activeField === "start") {
        setStartMinute(minute);
        if (minute >= endMinute) setEndMinute(Math.min(1439, minute + 30));
      } else {
        setEndMinute(minute);
        if (minute <= startMinute) setStartMinute(Math.max(0, minute - 30));
      }
      setActiveField(null);
      return;
    }
    if (selectedDate) setTempTime(selectedDate);
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
          ) : (
            <Text style={styles.footerText}>
              You can set reminders later in Settings.
            </Text>
          )}
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
        {!remindersEnabled ? (
          <Pressable onPress={showInfo} style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>What happens if you skip reminders?</Text>
          </Pressable>
        ) : null}
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
                    size={20}
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
              <Pressable
                style={styles.timeRow}
                onPress={openStartPicker}
              >
                <Text style={styles.timeValue}>{minutesToLabel(startMinute)}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
              <Text style={styles.hoursLabel}>End</Text>
              <Pressable
                style={styles.timeRow}
                onPress={openEndPicker}
              >
                <Text style={styles.timeValue}>{minutesToLabel(endMinute)}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
      {showTimePicker ? (
        Platform.OS === "ios" ? (
          <Modal
            visible
            transparent
            animationType="slide"
            onRequestClose={closeTimePicker}
          >
            <Pressable style={styles.modalOverlay} onPress={closeTimePicker}>
              <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                  <Pressable onPress={closeTimePicker} hitSlop={12}>
                    <Text style={[styles.modalButton, styles.modalCancel]}>Cancel</Text>
                  </Pressable>
                  <Text style={styles.modalTitle}>
                    {activeField === "start" ? "Start time" : "End time"}
                  </Text>
                  <Pressable onPress={confirmTimePicker} hitSlop={12}>
                    <Text style={[styles.modalButton, styles.modalDone]}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={styles.picker}
                />
              </Pressable>
            </Pressable>
          </Modal>
        ) : (
          <>
            <DateTimePicker
              value={activeField === "start" ? minuteToDate(startMinute) : minuteToDate(endMinute)}
              mode="time"
              display="default"
              onChange={handleTimeChange}
              maximumDate={activeField === "start" ? minuteToDate(endMinute - 1) : undefined}
              minimumDate={activeField === "end" ? minuteToDate(startMinute + 1) : undefined}
            />
          </>
        )
      ) : null}
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
      marginTop: 16,
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
      marginTop: 16,
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
      paddingVertical: 10,
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
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 34,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    modalButton: {
      fontSize: 16,
      minWidth: 64,
    },
    modalCancel: {
      color: colors.textMuted,
    },
    modalDone: {
      fontWeight: "600",
      color: colors.accent,
      textAlign: "right",
    },
    picker: {
      backgroundColor: colors.background,
    },
    footerText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 8,
    },
  });
