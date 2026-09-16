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
import { getHabitDetailsByDate } from "@/features/check-in/services/dailyCheckinService";
import { DailyCheckInDetailResponse } from "@/features/check-in/types/dailyCheckin";
import { toMinutes } from "@/features/check-in/utils/dailyCheckin";
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
  CircadianAlignmentCard,
  ReminderBufferCard,
  SleepErrorState,
  SleepLoadingState,
  SleepPatternCard,
  SleepTipCard,
} from "@/features/check-in/components/sleep/checkIn";
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
      marginTop: 16,
    },
    refreshingText: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      fontWeight: "700",
    },
  });

export const SleepCheckInScreen = () => {
  const navigation = useNavigation();
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const templateId = useMemo(() => Number(id), [id]);
  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DailyCheckInDetailResponse | null>(null);
  const [bedMinutes, setBedMinutes] = useState(DEFAULT_BED_MINUTES);
  const [wakeMinutes, setWakeMinutes] = useState(DEFAULT_WAKE_MINUTES);
  const [reminderIndex, setReminderIndex] = useState(1);

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
          : "Failed to load sleep data"
      );
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [date, templateId]);

  useEffect(() => {
    loadSleep();
  }, [loadSleep]);

  useEffect(() => {
    const data = detail?.data;
    if (!data) return;

    setBedMinutes(parseTimeToMinutes(data.start_time, DEFAULT_BED_MINUTES));
    setWakeMinutes(parseTimeToMinutes(data.end_time, DEFAULT_WAKE_MINUTES));

    const reminderValue = Number(
      String(data.reminder_time ?? "").match(/\d+/)?.[0] ?? NaN
    );
    if (Number.isFinite(reminderValue)) {
      const index = REMINDER_OPTIONS.indexOf(reminderValue);
      if (index >= 0) {
        setReminderIndex(index);
      }
    }
  }, [detail]);

  const sleepSummary = useMemo(() => {
    const data = detail?.data;
    const goalMinutes = SLEEP_GOAL_MINUTES;
    const asleepMinutes = data
      ? Math.max(0, toMinutes(data.completed_unit ?? 0, data.metric_unit ?? "hours"))
      : 0;
    const targetHours = goalMinutes / 60;
    const weeklySeries = data
      ? buildWeeklySleepSeries(data.last_7_days_completion, targetHours)
      : MOCK_WEEKLY_SLEEP;

    return {
      goalMinutes,
      asleepMinutes,
      weeklySeries: hasMeaningfulSleepData(weeklySeries)
        ? weeklySeries
        : MOCK_WEEKLY_SLEEP,
    };
  }, [detail]);

  const sleepProgress = useMemo(() => {
    if (!sleepSummary.goalMinutes) return 0;
    return Math.min(
      1,
      Math.max(0, sleepSummary.asleepMinutes / sleepSummary.goalMinutes)
    );
  }, [sleepSummary.asleepMinutes, sleepSummary.goalMinutes]);

  const sleepStatusLabel =
    sleepProgress >= 0.92
      ? "Aligned recovery"
      : sleepProgress >= 0.75
      ? "Recovery in progress"
      : "Deep recovery in progress";

  const refreshing = loading && loaded && !error;

  const handleRefresh = useCallback(() => {
    loadSleep();
  }, [loadSleep]);

  const scrollToTip = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

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
              icon: "refresh-outline",
              accessibilityLabel: "Refresh sleep data",
              onPress: handleRefresh,
            },
            {
              icon: "information-circle-outline",
              accessibilityLabel: "Jump to tip",
              onPress: scrollToTip,
            },
          ]}
        />

        {loading && !loaded ? (
          <SleepLoadingState />
        ) : error ? (
          <SleepErrorState message={error} onRetry={handleRefresh} />
        ) : (
          <>
            <SleepPerformanceCard
              asleepMinutes={sleepSummary.asleepMinutes}
              goalMinutes={sleepSummary.goalMinutes}
              ratingLabel={sleepStatusLabel}
            />

            <View style={{ height: 18 }} />

            <CircadianAlignmentCard
              bedMinutes={bedMinutes}
              wakeMinutes={wakeMinutes}
              onChangeBed={setBedMinutes}
              onChangeWake={setWakeMinutes}
            />

            <View style={{ height: 18 }} />

            <ReminderBufferCard
              reminderIndex={reminderIndex}
              onChange={setReminderIndex}
            />

            <View style={{ height: 18 }} />

            <SleepPatternCard data={sleepSummary.weeklySeries} />

            <View style={{ height: 18 }} />

            <SleepTipCard />
          </>
        )}

        {refreshing ? (
          <View style={styles.refreshingRow}>
            <ActivityIndicator size="small" color={theme.chart2 ?? theme.accent} />
            <Text style={styles.refreshingText}>Refreshing sleep data…</Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenView>
  );
};

export default SleepCheckInScreen;
