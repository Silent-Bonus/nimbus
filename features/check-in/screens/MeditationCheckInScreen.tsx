/**
 * Meditation daily check-in screen.
 * Reads normalized habit progress, lets the user add minutes, and persists
 * sanitized minute increments through the habit progress endpoint.
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
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { ROUTES } from "@/constants/routes";
import RitualReminderSettingsModal from "@/features/check-in/components/common/RitualReminderSettingsModal";
import {
  getHabitDetailsByDate,
  incrementHabitProgress,
  updateHabitReminderFrequency,
} from "@/features/check-in/services/dailyCheckinService";
import { toApiDate } from "@/utils/date-time";
import { NormalizedHabitDetailResponse } from "@/features/check-in/types/dailyCheckin";
import {
  sanitizeHabitIncrement,
  toMinutes,
} from "@/features/check-in/utils/dailyCheckin";
import {
  DEFAULT_COMPLETED_MINUTES,
  DEFAULT_GOAL_MINUTES,
  MOCK_WEEKLY_MEDITATION,
  REMINDER_OPTIONS,
  buildWeeklyMeditationSeries,
  formatMinutes,
  parseReminderIndex,
  type WeeklyPoint,
} from "@/features/check-in/utils/meditationCheckin";
import {
  MeditationErrorState,
  MeditationLoadingState,
  MeditationProgressCard,
  MeditationTipCard,
  MeditationTrendCard,
} from "@/features/check-in/components/meditation/checkIn";
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
  });

export const MeditationCheckInScreen = () => {
  const navigation = useNavigation();
  const toast = useNimbusToast();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const templateId = useMemo(() => Number(id), [id]);

  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography),
    [theme, spacing, typography]
  );

  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<NormalizedHabitDetailResponse | null>(null);
  const [completedMinutes, setCompletedMinutes] = useState(
    DEFAULT_COMPLETED_MINUTES
  );
  const [goalMinutes, setGoalMinutes] = useState(DEFAULT_GOAL_MINUTES);
  const [reminderIndex, setReminderIndex] = useState(1);
  const [weeklySeries, setWeeklySeries] = useState<WeeklyPoint[]>(
    MOCK_WEEKLY_MEDITATION
  );
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [anchoredAt, setAnchoredAt] = useState<Date | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch the selected meditation habit and its current daily progress.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const loadMeditation = useCallback(async () => {
    if (!templateId || !date) {
      setError("Missing meditation check-in id or date.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
          : "Failed to load meditation data"
      );
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [date, templateId]);

  // Reconcile local progress when the normalized detail response changes.
  useEffect(() => {
    loadMeditation();
  }, [loadMeditation]);

  // Keep the displayed weekly trend derived from API progress.
  useEffect(() => {
    const data = detail?.data;
    if (!data) return;

    const nextGoal = toMinutes(
      data.goal_details.metric_details.target ?? DEFAULT_GOAL_MINUTES,
      data.goal_details.metric_details.unit ?? "min"
    );
    const nextCompleted = toMinutes(
      data.goal_details.metric_details.completed ?? 0,
      data.goal_details.metric_details.unit ?? "min"
    );

    const weekly = buildWeeklyMeditationSeries(
      data.progress.last_7_days_completion
    );

    setGoalMinutes(Math.max(5, nextGoal || DEFAULT_GOAL_MINUTES));
    setCompletedMinutes(Math.max(0, nextCompleted));
    setReminderIndex(parseReminderIndex(detail?.data.protocol_details.reminder_time));
    // Keep real zero values from the API visible; they are meaningful data,
    // not a reason to replace the chart with mock progress.
    setWeeklySeries(weekly.length ? weekly : MOCK_WEEKLY_MEDITATION);
    setCurrentStreak(Number(detail?.data.streak.current_streak ?? 0));
    setLongestStreak(Number(detail?.data.streak.longest_streak ?? 0));
    setAnchoredAt(null);
  }, [detail]);

  const refreshing = loading && loaded && !error;

  const handleRefresh = useCallback(() => {
    loadMeditation();
  }, [loadMeditation]);

  const handleReminderChange = useCallback(
    async (nextIndex: number) => {
      const reminderFrequency = REMINDER_OPTIONS[nextIndex];
      if (!templateId || reminderFrequency === undefined) return;

      try {
        console.log("[Meditation Sync] reminder frequency update", {
          habitId: templateId,
          reminder_frequency: reminderFrequency,
        });
        await updateHabitReminderFrequency(templateId, reminderFrequency);
        setReminderIndex(nextIndex);
        toast.show({
          variant: "success",
          title: "Reminder updated",
          message: `Meditation reminders set to every ${reminderFrequency} minutes.`,
        });
      } catch (error) {
        console.warn(
          "[Meditation Sync] reminder frequency update failed",
          error
        );
        toast.show({
          variant: "error",
          title: "Reminder update failed",
          message: "Please try again.",
        });
      }
    },
    [templateId, toast]
  );

  const handleAddMinutes = useCallback(
    async (step: number) => {
      const nextCompletedMinutes = completedMinutes + step;

      if (nextCompletedMinutes > goalMinutes) {
        toast.show({
          variant: "warning",
          title: "Meditation goal exceeded",
          message: `Add ${formatMinutes(
            Math.max(0, goalMinutes - completedMinutes)
          )} or less to stay within today's goal.`,
        });
        return;
      }

      if (!templateId) {
        toast.show({
          variant: "error",
          title: "Meditation not saved",
          message: "This meditation habit is missing an id.",
        });
        return;
      }

      const entry = {
        date: toApiDate(new Date()),
        // Meditation increments are sent as whole minutes and capped at 15.
        increment_by: sanitizeHabitIncrement(step, "minutes", 15),
      };

      try {
        console.log("[Meditation Sync] increment entry", {
          habitId: templateId,
          ...entry,
        });
        const response = await incrementHabitProgress(
          templateId,
          entry.date,
          entry.increment_by
        );
        setCompletedMinutes(nextCompletedMinutes);
        console.log("[Meditation Sync] increment success", {
          habitId: templateId,
          entry,
          response,
        });
        toast.show({
          variant: "success",
          title: "Meditation updated",
          message: `${formatMinutes(entry.increment_by)} added to today's session.`,
        });
      } catch (error) {
        console.warn("[Meditation Sync] increment failed", {
          habitId: templateId,
          entry,
          error,
        });
        toast.show({
          variant: "error",
          title: "Meditation update failed",
          message:
            error instanceof Error ? error.message : "Please try again.",
        });
      }
    },
    [completedMinutes, goalMinutes, templateId, toast]
  );

  const handleResetMinutes = useCallback(() => {
    setCompletedMinutes(0);
    setAnchoredAt(null);
    toast.show({
      variant: "info",
      title: "Meditation reset",
      message: "Today's meditation progress was reset on this screen.",
    });
  }, [toast]);

  const handleAnchorHold = useCallback(() => {
    const now = new Date();
    setAnchoredAt(now);
    router.push({
      pathname: ROUTES.AUTH.CHECK_IN_MEDITATION_ANCHOR,
      params: {
        goal: String(goalMinutes),
        anchorAt: now.toISOString(),
        source: "daily-checkin",
        checkInId: String(templateId),
        date,
        autoStart: "true",
      },
    });
  }, [date, goalMinutes, templateId]);

  // Render the meditation progress flow inside the shared SVA screen shell.
  return (
    <ScreenView bgColor={theme.background} padding={0}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="Mindful Session"
          subtitle={`${formatMinutes(goalMinutes)} target • steady breath`}
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "settings-outline",
              accessibilityLabel: "Open settings",
              onPress: () => setShowSettingsModal(true),
            },
          ]}
        />

        {loading && !loaded ? (
          <MeditationLoadingState />
        ) : error ? (
          <MeditationErrorState message={error} onRetry={handleRefresh} />
        ) : (
          <>
            <MeditationProgressCard
              completedMinutes={completedMinutes}
              goalMinutes={goalMinutes}
              anchoredAt={anchoredAt}
              onAddMinutes={handleAddMinutes}
              onResetMinutes={handleResetMinutes}
              onAnchorHold={handleAnchorHold}
            />

            <View style={{ height: spacing.sm }} />

            <MeditationTrendCard
              data={weeklySeries}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />

            <MeditationTipCard />
          </>
        )}

        {refreshing ? (
          <View style={styles.refreshingRow}>
            <ActivityIndicator size="small" color={theme.chart5 ?? theme.accent} />
            <Text style={styles.refreshingText}>
              Refreshing mindful session…
            </Text>
          </View>
        ) : null}

        <View style={{ height: spacing.lg }} />
      </ScrollView>

      <RitualReminderSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Meditation reminders"
        reminderOptions={REMINDER_OPTIONS}
        selectedIndex={reminderIndex}
        onSelectIndex={handleReminderChange}
      />
    </ScreenView>
  );
};

export default MeditationCheckInScreen;
