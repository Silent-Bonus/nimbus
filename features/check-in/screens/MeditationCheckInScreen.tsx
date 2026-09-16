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
import TimePickerSheet from "@/components/ui/picker/TimePickerSheet";
import { ROUTES } from "@/constants/routes";
import { getHabitDetailsByDate } from "@/features/check-in/services/dailyCheckinService";
import { DailyCheckInDetailResponse } from "@/features/check-in/types/dailyCheckin";
import { toMinutes } from "@/features/check-in/utils/dailyCheckin";
import {
  DEFAULT_COMPLETED_MINUTES,
  DEFAULT_GOAL_MINUTES,
  DEFAULT_START_TIME_MINUTES,
  MOCK_WEEKLY_MEDITATION,
  buildWeeklyMeditationSeries,
  formatMinutes,
  hasMeaningfulWeeklyData,
  parseReminderIndex,
  parseTimeToDate,
  type WeeklyPoint,
} from "@/features/check-in/utils/meditationCheckin";
import {
  MeditationErrorState,
  MeditationLoadingState,
  MeditationProgressCard,
  MeditationScheduleCard,
  MeditationTipCard,
  MeditationTrendCard,
} from "@/features/check-in/components/meditation/checkIn";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === "ios" ? 140 : 160,
    },
    refreshingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: spacing.md,
    },
    refreshingText: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      fontWeight: "700",
    },
  });

export const MeditationCheckInScreen = () => {
  const navigation = useNavigation();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const templateId = useMemo(() => Number(id), [id]);

  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DailyCheckInDetailResponse | null>(null);
  const [completedMinutes, setCompletedMinutes] = useState(
    DEFAULT_COMPLETED_MINUTES
  );
  const [goalMinutes, setGoalMinutes] = useState(DEFAULT_GOAL_MINUTES);
  const [startTime, setStartTime] = useState(() =>
    parseTimeToDate(null, DEFAULT_START_TIME_MINUTES)
  );
  const [reminderIndex, setReminderIndex] = useState(1);
  const [weeklySeries, setWeeklySeries] = useState<WeeklyPoint[]>(
    MOCK_WEEKLY_MEDITATION
  );
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [anchoredAt, setAnchoredAt] = useState<Date | null>(null);
  const [showStartTimeSheet, setShowStartTimeSheet] = useState(false);

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
      const res: DailyCheckInDetailResponse = await getHabitDetailsByDate(
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

  useEffect(() => {
    loadMeditation();
  }, [loadMeditation]);

  useEffect(() => {
    const data = detail?.data;
    if (!data) return;

    const nextGoal = toMinutes(
      data.target_unit ?? data.metric_count ?? DEFAULT_GOAL_MINUTES,
      data.metric_unit ?? "min"
    );
    const nextCompleted = toMinutes(
      data.completed_unit ?? 0,
      data.metric_unit ?? "min"
    );

    const weekly = buildWeeklyMeditationSeries(data.last_7_days_completion);

    setGoalMinutes(Math.max(5, nextGoal || DEFAULT_GOAL_MINUTES));
    setCompletedMinutes(Math.max(0, nextCompleted));
    setStartTime(parseTimeToDate(data.start_time, DEFAULT_START_TIME_MINUTES));
    setReminderIndex(parseReminderIndex(data.reminder_time));
    setWeeklySeries(
      hasMeaningfulWeeklyData(weekly) ? weekly : MOCK_WEEKLY_MEDITATION
    );
    setCurrentStreak(Number(data.current_streak ?? 0));
    setLongestStreak(Number(data.longest_streak ?? 0));
    setAnchoredAt(null);
  }, [detail]);

  const refreshing = loading && loaded && !error;

  const handleRefresh = useCallback(() => {
    loadMeditation();
  }, [loadMeditation]);

  const scrollToTips = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleAddMinutes = useCallback((step: number) => {
    setCompletedMinutes((prev) => prev + step);
  }, []);

  const handleAnchorHold = useCallback(() => {
    const now = new Date();
    setAnchoredAt(now);
    router.push({
      pathname: ROUTES.AUTH.CHECK_IN_MEDITATION_ANCHOR,
      params: {
        goal: String(goalMinutes),
        anchorAt: now.toISOString(),
      },
    });
  }, [goalMinutes]);

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
              icon: "refresh-outline",
              accessibilityLabel: "Refresh meditation data",
              onPress: handleRefresh,
            },
            {
              icon: "information-circle-outline",
              accessibilityLabel: "Jump to tips",
              onPress: scrollToTips,
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
              onAnchorHold={handleAnchorHold}
            />

            <View style={{ height: 18 }} />

            <MeditationScheduleCard
              startTime={startTime}
              reminderIndex={reminderIndex}
              onOpenTimePicker={() => setShowStartTimeSheet(true)}
              onReminderChange={setReminderIndex}
            />

            <View style={{ height: 18 }} />

            <MeditationTrendCard
              data={weeklySeries}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />

            <View style={{ height: 18 }} />

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

        <View style={{ height: 24 }} />
      </ScrollView>

      <TimePickerSheet
        visible={showStartTimeSheet}
        value={startTime}
        title="Meditation start"
        onClose={() => setShowStartTimeSheet(false)}
        onChange={setStartTime}
        is24Hour={false}
      />
    </ScreenView>
  );
};

export default MeditationCheckInScreen;
