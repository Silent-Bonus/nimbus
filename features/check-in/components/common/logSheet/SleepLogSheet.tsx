import React, { useContext, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";
import { Tab } from "./components/Tabs";
import { TimeRow } from "./components/TimeRow";
import { GhostButton } from "./components/GhostButton";
import { PrimaryButton } from "./components/PrimaryButton";
import { DurationPill } from "./components/DurationPill";
import { InfoRow } from "./components/InfoRow";
import {
  addDays,
  addMinutes,
  diffMinutes,
  formatHM,
  formatSleepClock,
  formatSleepDateChip,
  getPastSleepDates,
  mergeHM,
  setHM,
} from "@/features/check-in/utils/sleepLog";

export type LogPayload = {
  bedTime: Date; // local date with hours/mins
  wakeTime: Date; // local date with hours/mins
  durationMin: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;

  /** Called when user taps Sleep Now */
  onSleepNow?: () => void;

  /** Called when user saves manual log */
  onSaveManual?: (payload: LogPayload) => void | Promise<void>;

  /** Optional defaults for manual tab */
  defaultBed?: Date;
  defaultWake?: Date;
  // NEW: copy overrides (optional)
  titleText?: string; // default: "Log sleep"
  tabNowText?: string; // default: "Sleep Now"
  manualTitleText?: string; // default: "Add a past sleep"
  manualSubtitleText?: string; // default: "Pick yesterday’s bed time …"
  saveText?: string;
  nowTitle?: string;
  nowSubtitle?: string;
  showNowTab?: boolean;
  initialTab?: "now" | "manual";
  manualMode?: "range" | "duration";
  manualDateSelection?: "none" | "pastWeek";
  defaultDurationMinutes?: number;
};

export default function LogSheet({
  visible,
  onClose,
  onSleepNow,
  onSaveManual,
  defaultBed,
  defaultWake,
  titleText = "Log sleep", // default: "Log sleep"
  tabNowText = "Sleep Now", // default: "Sleep Now"
  nowTitle = "Start sleeping now",
  nowSubtitle = "We will track your sleep from this moment until you wake up.",
  manualTitleText = "Add a past sleep", // default: "Add a past sleep"

  manualSubtitleText = "Pick yesterday’s bed time and today’s wake time (or any range). Duration is calculated automatically.", // default: "Pick yesterday’s bed time …"
  saveText = "Save log",
  showNowTab = true,
  initialTab = "now",
  manualMode = "range",
  manualDateSelection = "none",
  defaultDurationMinutes = 8 * 60,
}: Props) {
  // simple tabs
  const [tab, setTab] = useState<"now" | "manual">(
    showNowTab ? initialTab : "manual"
  );

  // Manual state
  const initBed = defaultBed ?? setHM(new Date(), 23, 0);
  const initWake = defaultWake ?? addDays(setHM(new Date(), 7, 0), 1); // next morning 07:00
  // Show the five most recent past dates; the date picker below allows any
  // date from this range forward, including future dates.
  const pastDateOptions = useMemo(() => getPastSleepDates(5), []);
  const minimumSelectableDate = pastDateOptions[pastDateOptions.length - 1];
  const [selectedDate, setSelectedDate] = useState<Date>(
    pastDateOptions[0] ?? initBed
  );
  const [bedTime, setBedTime] = useState<Date>(initBed);
  const [wakeTime, setWakeTime] = useState<Date>(initWake);
  const [durationMinutes, setDurationMinutes] = useState(
    Math.max(0, Math.min(12 * 60, defaultDurationMinutes))
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const durationMin = useMemo(
    () => diffMinutes(bedTime, wakeTime),
    [bedTime, wakeTime]
  );

  const durationTargetBed = useMemo(
    () => mergeHM(selectedDate, initBed),
    [initBed, selectedDate]
  );
  const durationTargetWake = useMemo(
    () => addMinutes(durationTargetBed, durationMinutes),
    [durationMinutes, durationTargetBed]
  );

  React.useEffect(() => {
    if (!visible) return;
    setTab(showNowTab ? initialTab : "manual");
    setSelectedDate(pastDateOptions[0] ?? initBed);
    setBedTime(initBed);
    setWakeTime(initWake);
    setDurationMinutes(Math.max(0, Math.min(12 * 60, defaultDurationMinutes)));
    setShowDatePicker(false);
  }, [
    visible,
    showNowTab,
    initialTab,
    pastDateOptions,
    initBed,
    initWake,
    defaultDurationMinutes,
  ]);

  const onChange =
    (kind: "bed" | "wake") => (e: DateTimePickerEvent, d?: Date) => {
      if (!d) return;
      if (kind === "bed") setBedTime(mergeHM(bedTime, d));
      else setWakeTime(mergeHM(wakeTime, d));
    };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (!date) return;

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    setSelectedDate(normalizedDate);

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header + Tabs */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{titleText}</Text>
            {showNowTab ? (
              <View style={styles.tabs}>
                <Tab
                  label={tabNowText}
                  active={tab === "now"}
                  onPress={() => setTab("now")}
                />
                <Tab
                  label={manualTitleText}
                  active={tab === "manual"}
                  onPress={() => setTab("manual")}
                />
              </View>
            ) : null}
          </View>

          <View style={{ height: 20 }} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {showNowTab && tab === "now" ? (
              <View style={{ gap: 24 }}>
                <InfoRow title={nowTitle} subtitle={nowSubtitle} />
                <PrimaryButton
                  label={tabNowText}
                  onPress={() => {
                    onSleepNow?.();
                    onClose();
                  }}
                />
                <GhostButton label="Cancel" onPress={onClose} />
              </View>
            ) : (
              manualMode === "duration" ? (
                <View style={{ gap: 14 }}>
                  <InfoRow
                    title={manualTitleText}
                    subtitle={manualSubtitleText}
                  />

                  {manualDateSelection === "pastWeek" ? (
                    <View
                      style={[
                        styles.dateStripCard,
                        {
                          borderColor: newTheme.border,
                          backgroundColor: newTheme.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationDialLabel,
                          { color: newTheme.textSecondary },
                        ]}
                      >
                        Select date
                      </Text>
                      <View style={styles.dateStripRow}>
                        {pastDateOptions.map((date) => {
                          const active =
                            selectedDate.toDateString() === date.toDateString();
                          const parts = formatSleepDateChip(date);
                          return (
                            <Pressable
                              key={date.toISOString()}
                              onPress={() => setSelectedDate(date)}
                              style={({ pressed }) => [
                                styles.dateChip,
                                active && styles.dateChipActive,
                                pressed && styles.dateChipPressed,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dateChipDay,
                                  active && styles.dateChipDayActive,
                                ]}
                              >
                                {parts.day}
                              </Text>
                              <Text
                                style={[
                                  styles.dateChipValue,
                                  active && styles.dateChipValueActive,
                                ]}
                              >
                                {parts.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      <Pressable
                        onPress={() => setShowDatePicker(true)}
                        style={({ pressed }) => [
                          styles.datePickerButton,
                          pressed && styles.dateChipPressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Choose another sleep date"
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={newTheme.accent}
                        />
                        <Text style={styles.datePickerButtonText}>
                          Choose another date
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={newTheme.textSecondary}
                        />
                      </Pressable>

                      {showDatePicker ? (
                        <View style={styles.datePickerPanel}>
                          <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            minimumDate={minimumSelectableDate}
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onDateChange}
                            accentColor={newTheme.accent}
                            textColor={newTheme.textPrimary}
                            themeVariant={Platform.OS === "ios" ? "dark" : undefined}
                          />
                          {Platform.OS === "ios" ? (
                            <Pressable
                              onPress={() => setShowDatePicker(false)}
                              style={styles.datePickerDoneButton}
                            >
                              <Text style={styles.datePickerDoneText}>Done</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.durationDialCard,
                      { borderColor: newTheme.border, backgroundColor: newTheme.card },
                    ]}
                  >
                    <Text
                      style={[
                        styles.durationDialLabel,
                        { color: newTheme.textSecondary },
                      ]}
                    >
                      Sleep duration
                    </Text>
                    <Text
                      style={[
                        styles.durationDialValue,
                        { color: newTheme.textPrimary },
                      ]}
                    >
                      {Math.floor(durationMinutes / 60)}h{" "}
                      {String(durationMinutes % 60).padStart(2, "0")}m
                    </Text>
                    <Slider
                      style={styles.durationSlider}
                      minimumValue={0}
                      maximumValue={12 * 60}
                      step={15}
                      value={durationMinutes}
                      minimumTrackTintColor={newTheme.chart2 ?? newTheme.accent}
                      maximumTrackTintColor={newTheme.borderMuted ?? "rgba(255,255,255,0.12)"}
                      thumbTintColor={newTheme.chart2 ?? newTheme.accent}
                      onValueChange={setDurationMinutes}
                    />
                    <View style={styles.durationScaleRow}>
                      <Text style={[styles.durationScaleText, { color: newTheme.textSecondary }]}>
                        0h
                      </Text>
                      <Text style={[styles.durationScaleText, { color: newTheme.textSecondary }]}>
                        6h
                      </Text>
                      <Text style={[styles.durationScaleText, { color: newTheme.textSecondary }]}>
                        12h
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.durationPreview,
                        { borderColor: newTheme.borderMuted, backgroundColor: newTheme.surface },
                      ]}
                    >
                      <Text style={[styles.durationPreviewLabel, { color: newTheme.textSecondary }]}>
                        Estimated range
                      </Text>
                      <Text style={[styles.durationPreviewValue, { color: newTheme.textPrimary }]}>
                        {selectedDate.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {formatSleepClock(durationTargetBed)} → {formatSleepClock(durationTargetWake)}
                      </Text>
                    </View>
                  </View>

                  <PrimaryButton
                    label={saveText}
                    onPress={async () => {
                      await onSaveManual?.({
                        bedTime: durationTargetBed,
                        wakeTime: durationTargetWake,
                        durationMin: durationMinutes,
                      });
                      onClose();
                    }}
                  />
                  <GhostButton label="Cancel" onPress={onClose} />
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  <InfoRow
                    title={manualTitleText}
                    subtitle={manualSubtitleText}
                  />

                  <TimeRow
                    label="Bed time"
                    value={formatHM(bedTime)}
                    onChange={(d) => setBedTime(mergeHM(bedTime, d))}
                  >
                    <DateTimePicker
                      mode="time"
                      textColor="#E6E6E6"
                      themeVariant="dark"
                      value={bedTime}
                      onChange={onChange("bed")}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                    />
                  </TimeRow>

                  <TimeRow
                    label="Wake time"
                    value={formatHM(wakeTime)}
                    onChange={(d) => setWakeTime(mergeHM(wakeTime, d))}
                  >
                    <DateTimePicker
                      mode="time"
                      textColor="#E6E6E6"
                      themeVariant="dark"
                      value={wakeTime}
                      onChange={onChange("wake")}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                    />
                  </TimeRow>

                  <DurationPill minutes={durationMin} />

                  <PrimaryButton
                    label={saveText}
                    onPress={async () => {
                      await onSaveManual?.({ bedTime, wakeTime, durationMin });
                      onClose();
                    }}
                  />
                  <GhostButton label="Cancel" onPress={onClose} />
                </View>
              )
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------- styles ---------- */

const styling = (
  newTheme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: newTheme.overlay,
    },
    container: { flex: 1, justifyContent: "flex-end" },
    sheet: {
      backgroundColor: newTheme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: newTheme.border,
      paddingHorizontal: spacing.md,
      paddingTop: 8,
      paddingBottom: spacing.sm,
      maxHeight: "86%",
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -8 },
      elevation: 16,
    },
    handle: {
      width: 44,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: newTheme.borderMuted,
      alignSelf: "center",
      marginBottom: 15,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    title: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
      fontWeight: "800",
    },
    tabs: { flexDirection: "row", gap: 8 },
    dateStripCard: {
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
      gap: 10,
    },
    dateStripRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    dateChip: {
      flex: 1,
      minWidth: 42,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    dateChipActive: {
      backgroundColor: "rgba(121,169,242,0.14)",
      borderColor: "rgba(121,169,242,0.28)",
    },
    dateChipPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    dateChipDay: {
      ...svaTypography.textStyle.authTinyLabel,
      color: newTheme.textSecondary,
      fontWeight: "800",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    dateChipDayActive: {
      color: newTheme.textPrimary,
    },
    dateChipValue: {
      ...svaTypography.textStyle.bodyMedium,
      marginTop: 2,
      color: newTheme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.1,
    },
    dateChipValueActive: {
      color: newTheme.textPrimary,
    },
    durationDialCard: {
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 16,
      gap: 10,
    },
    durationDialLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    durationDialValue: {
      ...svaTypography.textStyle.heading2,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    durationSlider: {
      height: 34,
    },
    durationScaleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    durationScaleText: {
      ...svaTypography.textStyle.authTinyLabel,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    durationPreview: {
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 3,
    },
    durationPreviewLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      fontWeight: "700",
      letterSpacing: 0.7,
      textTransform: "uppercase",
    },
    durationPreviewValue: {
      ...svaTypography.textStyle.bodyMedium,
      fontWeight: "800",
      letterSpacing: 0.1,
    },
    datePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      minHeight: 48,
      marginTop: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: 16,
      backgroundColor: newTheme.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: newTheme.borderMuted,
    },
    datePickerButtonText: {
      ...svaTypography.textStyle.bodyMedium,
      flex: 1,
      color: newTheme.textPrimary,
    },
    datePickerPanel: {
      alignItems: "center",
      marginTop: spacing.sm,
      paddingTop: spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: newTheme.borderMuted,
    },
    datePickerDoneButton: {
      alignSelf: "stretch",
      alignItems: "center",
      marginTop: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: 14,
      backgroundColor: newTheme.accent,
    },
    datePickerDoneText: {
      ...svaTypography.textStyle.button,
      color: newTheme.background,
      fontWeight: "800",
    },
  });
