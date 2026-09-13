/**
 * Nidra/sleep daily check-in screen.
 * Tracks sleep sessions, converts durations to backend hours, and displays
 * normalized weekly sleep architecture and recovery guidance.
 */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import RitualReminderSettingsModal from "@/features/check-in/components/common/RitualReminderSettingsModal";
import {
  getHabitDetailsByDate,
  incrementHabitProgress,
  updateHabitReminderFrequency,
} from "@/features/check-in/services/dailyCheckinService";
import { toApiDate } from "@/utils/date-time";
import { NormalizedHabitDetailResponse } from "@/features/check-in/types/dailyCheckin";
import { toMinutes } from "@/features/check-in/utils/dailyCheckin";
import { sanitizeHabitIncrement } from "@/features/check-in/utils/dailyCheckin";
import SleepPerformanceCard from "@/features/check-in/components/sleep/SleepPerformance";
import {
  DEFAULT_BED_MINUTES,
  DEFAULT_WAKE_MINUTES,
  MOCK_WEEKLY_SLEEP,
  REMINDER_OPTIONS,
  SLEEP_GOAL_MINUTES,
  buildWeeklySleepSeries,
  hasMeaningfulSleepData,
  parseTimeToMinutes,
} from "@/features/check-in/utils/sleepCheckin";
import {
  SleepErrorState,
  SleepLoadingState,
  SleepPatternCard,
  SleepTipCard,
} from "@/features/check-in/components/sleep/checkIn";
import type { ColorSet, Spacing, Typography } from "@/theme/types";

const makeStyles = (theme: ColorSet, spacing: Spacing, typography: Typography) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === "ios" ? 140 : 160,
    },
    refreshingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    refreshingText: {
      ...typography.caption,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    sectionSpacer: {
      height: spacing.md,
    },
    bottomSpacer: {
      height: spacing.md,
    },
  });

export const SleepCheckInScreen = () => {
  const navigation = useNavigation();
  const toast = useNimbusToast();
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography),
    [theme, spacing, typography]
  );

  // Normalize route values once because Expo Router may return array params.
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const templateId = useMemo(() => Number(id), [id]);
  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Keep the API response separate from derived sleep metrics so the cards
  // remain driven by a stable, theme-aware view model.
  const [detail, setDetail] = useState<NormalizedHabitDetailResponse | null>(null);
  const [bedMinutes, setBedMinutes] = useState(DEFAULT_BED_MINUTES);
  const [wakeMinutes, setWakeMinutes] = useState(DEFAULT_WAKE_MINUTES);
  const [reminderIndex, setReminderIndex] = useState(1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch the selected sleep habit and normalized daily progress.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const loadSleep = useCallback(async () => {
    if (!templateId || !date) {
      setError("Missing sleep check-in id or date.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the selected check-in date; reminder updates are handled
      // independently through the settings modal.
      const res = await getHabitDetailsByDate(
        templateId,
        date
      );
      setDetail(res);
      setLoaded(true);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Failed to load sleep data"
      );
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [date, templateId]);

  // Restore or clear the active sleep session when the route changes.
  useEffect(() => {
    loadSleep();
  }, [loadSleep]);

  // Keep the weekly chart aligned with the API's date/day progress records.
  useEffect(() => {
    const data = detail?.data;
    if (!data) return;

    setBedMinutes(
      parseTimeToMinutes(data.habit.start_time, DEFAULT_BED_MINUTES)
    );
    setWakeMinutes(
      parseTimeToMinutes(data.habit.end_time, DEFAULT_WAKE_MINUTES)
    );

    const reminderValue = Number(
      String(data.protocol_details.reminder_time ?? "").match(/\d+/)?.[0] ?? NaN
    );
    if (Number.isFinite(reminderValue)) {
      const index = REMINDER_OPTIONS.indexOf(reminderValue);
      if (index >= 0) {
        setReminderIndex(index);
      }
    }
  }, [detail]);

  const sleepSummary = useMemo(() => {
    const normalized = detail?.data;
    const goalMinutes = SLEEP_GOAL_MINUTES;
    const asleepMinutes = normalized
      ? Math.max(
          0,
          toMinutes(
            normalized.goal_details.metric_details.completed,
            normalized.goal_details.metric_details.unit ?? "hours"
          )
        )
      : 0;
    const targetHours = goalMinutes / 60;
    const weeklySeries = normalized
      ? buildWeeklySleepSeries(
          normalized.progress.last_7_days_completion,
          targetHours
        )
      : MOCK_WEEKLY_SLEEP;

    return {
      goalMinutes,
      asleepMinutes,
      weeklySeries: hasMeaningfulSleepData(weeklySeries)
        ? weeklySeries
        : MOCK_WEEKLY_SLEEP,
    };
  }, [detail]);

  const refreshing = loading && loaded && !error;

  const handleRefresh = useCallback(() => {
    loadSleep();
  }, [loadSleep]);

  const handleSleepSessionComplete = useCallback(
    async (durationHours: number) => {
      if (!templateId) {
        throw new Error("Missing sleep check-in id.");
      }

      const entry = {
        date: toApiDate(new Date()),
        increment_by: sanitizeHabitIncrement(durationHours, "hours", 8),
      };

      console.log("[Nidra Sync] sleep session entry", {
        habitId: templateId,
        ...entry,
      });

      try {
        await incrementHabitProgress(templateId, entry.date, entry.increment_by);
        await loadSleep();

        toast.show({
          variant: "success",
          title: "Sleep session saved",
          message: `${durationHours} hours added to Nidra Sync.`,
        });
      } catch (error) {
        console.warn("[Nidra Sync] sleep session save failed", error);
        toast.show({
          variant: "error",
          title: "Sleep session failed",
          message: "Please try again.",
        });
        throw error;
      }
    },
    [loadSleep, templateId, toast]
  );

  const handleSleepSessionStart = useCallback(
    (startedAt: Date) => {
      toast.show({
        variant: "info",
        title: "Sleep tracking started",
        message: `Started at ${startedAt.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}. Tap Wake up when you are ready.`,
      });
    },
    [toast]
  );

  const handleSleepSessionInvalid = useCallback(() => {
    toast.show({
      variant: "warning",
      title: "Wake up after sleeping",
      message: "Keep the session active long enough to record a duration.",
    });
  }, [toast]);

  const handlePastSleepComplete = useCallback(
    async (durationHours: number, sleepDate: Date) => {
      if (!templateId) {
        throw new Error("Missing sleep check-in id.");
      }

      // Sleep progress is sent in hours and capped at the 8-hour target.
      const entry = {
        date: toApiDate(sleepDate),
        increment_by: sanitizeHabitIncrement(durationHours, "hours", 8),
      };

      console.log("[Nidra Sync] past sleep entry", {
        habitId: templateId,
        ...entry,
      });

      try {
        await incrementHabitProgress(templateId, entry.date, entry.increment_by);
        await loadSleep();
        toast.show({
          variant: "success",
          title: "Past sleep saved",
          message: `${entry.increment_by} hours added to Nidra Sync.`,
        });
      } catch (error) {
        console.warn("[Nidra Sync] past sleep save failed", error);
        toast.show({
          variant: "error",
          title: "Past sleep failed",
          message: "Please try again.",
        });
        throw error;
      }
    },
    [loadSleep, templateId, toast]
  );

  const handleReminderChange = useCallback(
    async (nextIndex: number) => {
      const reminderFrequency = REMINDER_OPTIONS[nextIndex];
      if (!templateId || reminderFrequency === undefined) return;

      try {
        console.log("[Nidra Sync] reminder frequency update", {
          habitId: templateId,
          reminder_frequency: reminderFrequency,
        });
        // Only update the selected value after the server accepts the PATCH.
        await updateHabitReminderFrequency(templateId, reminderFrequency);
        setReminderIndex(nextIndex);
        toast.show({
          variant: "success",
          title: "Reminder updated",
          message: `Nidra reminders set to every ${reminderFrequency} minutes.`,
        });
      } catch (error) {
        console.warn("[Nidra Sync] reminder frequency update failed", error);
        toast.show({
          variant: "error",
          title: "Reminder update failed",
          message: "Please try again.",
        });
      }
    },
    [templateId, toast]
  );

  // Render loading, error, and sleep tracking states in the SVA shell.
  return (
    <ScreenView bgColor={theme.background} padding={0}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="Nidra Sync"
          subtitle="8h target • circadian alignment"
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "settings-outline",
              accessibilityLabel: "Open settings",
              onPress: () => setShowSettingsModal(true),
            },
          ]}
        />

        {/* Loading, error, and content states intentionally stay mutually exclusive. */}
        {loading && !loaded ? (
          <SleepLoadingState />
        ) : error ? (
          <SleepErrorState message={error} onRetry={handleRefresh} />
        ) : (
          <>
            {/* Lead with the primary sleep result and the weekly architecture view. */}
            <SleepPerformanceCard
              asleepMinutes={sleepSummary.asleepMinutes}
              goalMinutes={sleepSummary.goalMinutes}
              onSleepSessionStart={handleSleepSessionStart}
              onSleepSessionInvalid={handleSleepSessionInvalid}
              onSleepSessionComplete={handleSleepSessionComplete}
              onPastSleepComplete={handlePastSleepComplete}
            />

            <View style={styles.sectionSpacer} />

            <SleepPatternCard data={sleepSummary.weeklySeries} />

            <SleepTipCard />

          </>
        )}

        {refreshing ? (
          <View style={styles.refreshingRow}>
            <ActivityIndicator size="small" color={theme.chart2 ?? theme.accent} />
            <Text style={styles.refreshingText}>Refreshing sleep data…</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <RitualReminderSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Nidra Sync reminders"
        reminderOptions={REMINDER_OPTIONS}
        selectedIndex={reminderIndex}
        onSelectIndex={handleReminderChange}
        bedMinutes={bedMinutes}
        wakeMinutes={wakeMinutes}
        onChangeBed={setBedMinutes}
        onChangeWake={setWakeMinutes}
      />
    </ScreenView>
  );
};

export default SleepCheckInScreen;
