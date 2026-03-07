import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Appearance,
  Dimensions,
  Easing,
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
import { ChevronRight, Circle, CircleDot, Clock } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useAppState } from "@/core/bootstrap";
import { dateToMinute, minuteToDate, minutesToLabel } from "@/core/date";
import { createOnboardingProgressStyles } from "@/features/onboarding/onboardingProgressStyles";
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

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(Dimensions.get("window").height)).current;

  const showTimePicker = activeField !== null;

  useEffect(() => {
    if (activeField != null) {
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(Dimensions.get("window").height);
      const openAnim = Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      openAnim.start();
      return () => openAnim.stop();
    }
  }, [activeField, overlayOpacity, sheetTranslateY]);

  const runCloseAnimation = (onDone?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: Dimensions.get("window").height,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveField(null);
      onDone?.();
    });
  };

  const showInfo = () => {
    Alert.alert(
      "If you skip reminders",
      "Nothing changes. Today, Library, Settings — everything works as usual.",
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

  const closeTimePicker = () => runCloseAnimation();

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
    runCloseAnimation();
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
        <View style={styles.ctaBlock}>
          <Button label="Continue" onPress={finish} />
          {remindersEnabled ? (
            <Text style={styles.footerText}>
              You can change this anytime in Settings.
            </Text>
          ) : null}
        </View>
      }
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressRow}>
          <View style={styles.progressDots}>
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Use reminders if you want.</Text>
          <Text style={styles.body}>
            Get a gentle quote prompt during the day.
          </Text>
        </View>
        {!remindersEnabled ? (
          <View style={styles.toggleGroup}>
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
            <Text style={styles.toggleHelper}>
              Optional. Set this up now or later in Settings.
            </Text>
            <Pressable
              onPress={showInfo}
              style={({ pressed }) => [
                styles.disclosureRow,
                pressed && styles.disclosureRowPressed,
              ]}
            >
              <Text style={styles.disclosureLabel}>Set this up later</Text>
              <ChevronRight size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.toggleRow, styles.toggleRowFirst]}>
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
            <View style={styles.settingsBlock}>
            <Text style={styles.sectionLabel}>How often</Text>
            <View style={styles.radioGroup}>
              {FREQUENCY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.radioRow,
                    pressed && styles.radioRowPressed,
                  ]}
                  onPress={() => setFrequency(option.value)}
                >
                  {frequency === option.value ? (
                    <CircleDot size={20} color={colors.accent} />
                  ) : (
                    <Circle
                      size={20}
                      color={colors.border}
                      strokeWidth={2}
                    />
                  )}
                  <Text
                    style={[
                      styles.radioLabel,
                      frequency === option.value
                        ? styles.radioLabelSelected
                        : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
              Reminder hours
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.timeRow,
                pressed && styles.timeRowPressed,
              ]}
              onPress={openStartPicker}
            >
              <Text style={styles.timeRowLabel}>Start</Text>
              <View style={styles.timeRowRight}>
                <Text style={styles.timeValue}>
                  {minutesToLabel(startMinute)}
                </Text>
                <Clock size={18} color={colors.textMuted} />
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.timeRow,
                styles.timeRowSecond,
                pressed && styles.timeRowPressed,
              ]}
              onPress={openEndPicker}
            >
              <Text style={styles.timeRowLabel}>End</Text>
              <View style={styles.timeRowRight}>
                <Text style={styles.timeValue}>
                  {minutesToLabel(endMinute)}
                </Text>
                <Clock size={18} color={colors.textMuted} />
              </View>
            </Pressable>
          </View>
        </>
        )}
      </ScrollView>
      {showTimePicker ? (
        Platform.OS === "ios" ? (
          <Modal
            visible
            transparent
            animationType="none"
            onRequestClose={closeTimePicker}
          >
            <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeTimePicker} />
              <Animated.View
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: sheetTranslateY }] },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Pressable
                    onPress={closeTimePicker}
                    hitSlop={12}
                    style={({ pressed }) => [pressed && styles.modalButtonPressed]}
                  >
                    <Text style={[styles.modalButton, styles.modalCancel]}>Cancel</Text>
                  </Pressable>
                  <Text style={styles.modalTitle}>
                    {activeField === "start" ? "Start time" : "End time"}
                  </Text>
                  <Pressable
                    onPress={confirmTimePicker}
                    hitSlop={12}
                    style={({ pressed }) => [pressed && styles.modalButtonPressed]}
                  >
                    <Text style={[styles.modalButton, styles.modalDone]}>Done</Text>
                  </Pressable>
                </View>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.picker}
                    themeVariant={
                      (Appearance.getColorScheme() === "dark" ? "dark" : "light") as "light" | "dark"
                    }
                  />
                </View>
              </Animated.View>
            </Animated.View>
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
    ...createOnboardingProgressStyles(colors),
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    header: {
      marginTop: 12,
      gap: 5,
    },
    title: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: "700",
      fontFamily: "SourceSerif4_400Regular",
      letterSpacing: -0.5,
      color: colors.text,
    },
    body: {
      fontSize: 17,
      lineHeight: 22,
      color: colors.textMuted,
    },
    toggleGroup: {
      marginTop: 14,
      paddingVertical: 8,
      paddingHorizontal: 0,
      gap: 0,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    toggleLabel: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    toggleRowFirst: {
      marginTop: 10,
    },
    toggleHelper: {
      marginTop: 0,
      fontSize: 17,
      lineHeight: 20,
      color: colors.textMuted,
    },
    disclosureRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
      paddingVertical: 16,
      paddingHorizontal: 0,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    disclosureRowPressed: {
      opacity: 0.5,
    },
    disclosureLabel: {
      fontSize: 17,
      color: colors.text,
    },
    settingsBlock: {
      marginTop: 2,
      padding: 10,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 0,
      gap: 0,
    },
    sectionLabel: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    sectionLabelSpaced: {
      marginTop: 6,
    },
    radioGroup: {
      gap: 0,
    },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 5,
    },
    radioRowPressed: {
      opacity: 0.5,
    },
    radioLabel: {
      fontSize: 17,
      color: colors.text,
      opacity: 0.92,
    },
    radioLabelSelected: {
      color: colors.text,
      opacity: 1,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 0,
    },
    timeRowSecond: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timeRowLabel: {
      fontSize: 17,
      color: colors.textMuted,
    },
    timeRowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
    },
    timeRowPressed: {
      opacity: 0.5,
    },
    timeValue: {
      color: colors.text,
      fontSize: 17,
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
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    modalButton: {
      fontSize: 17,
      minWidth: 64,
    },
    modalButtonPressed: {
      opacity: 0.5,
    },
    modalCancel: {
      color: colors.textMuted,
    },
    modalDone: {
      fontWeight: "600",
      color: colors.accent,
      textAlign: "right",
    },
    pickerContainer: {
      height: 216,
      width: "100%",
      justifyContent: "center",
    },
    picker: {
      backgroundColor: colors.background,
    },
    ctaBlock: {
      paddingTop: 0,
      gap: 12,
    },
    footerText: {
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
      color: colors.textMuted,
    },
  });
