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

import ThemeContext from "../../../contexts/ThemeContext";
import ScreenHeader from "../../../components/layout/ScreenHeader";
import { ScreenView } from "../../../components/ui/theme-components/ScreenView";
import {
  HydrationErrorState,
  HydrationHeroCard,
  HydrationLoadingState,
  HydrationReminderFrequencyCard,
  HydrationTipCard,
  HydrationTrendCard,
} from "../components/hydration";
import { getHabitDetailsByDate } from "../services/dailyCheckinService";
import {
  DEFAULT_WEEKLY_SERIES,
  MOCK_WEEKLY_SERIES,
  WATER_GOAL_ML,
  buildWeeklySeries,
  clamp,
  hasMeaningfulWeeklyData,
  toHydrationMl,
  type WeeklyPoint,
} from "../utils/hydration";
import type { ColorSet, Spacing, TypographyTokens } from "../../../theme/types";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Failed to load water data";
};

export const HydrationCheckInScreen = () => {
  const navigation = useNavigation();
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const templateId = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id;
    return Number(rawId);
  }, [id]);
  const selectedDate = useMemo(() => (Array.isArray(date) ? date[0] : date), [date]);
  const scrollRef = useRef<ScrollView | null>(null);

  const [hydrationMl, setHydrationMl] = useState(0);
  const [weeklySeries, setWeeklySeries] =
    useState<WeeklyPoint[]>(DEFAULT_WEEKLY_SERIES);
  const [reminderIndex, setReminderIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const loadHydration = useCallback(async () => {
    if (!templateId || !selectedDate) {
      setError("Missing water check-in id or date.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getHabitDetailsByDate(templateId, selectedDate);
      const detail = response.data;

      setHydrationMl(
        clamp(
          toHydrationMl(detail.completed_unit ?? 0, detail.metric_unit),
          0,
          WATER_GOAL_ML
        )
      );

      const series = buildWeeklySeries(detail.last_7_days_completion);
      setWeeklySeries(
        hasMeaningfulWeeklyData(series) ? series : MOCK_WEEKLY_SERIES
      );
      setLoaded(true);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, templateId]);

  useEffect(() => {
    loadHydration();
  }, [loadHydration]);

  const refreshing = loading && loaded && !error;

  const handleRefresh = useCallback(() => {
    loadHydration();
  }, [loadHydration]);

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
          title="Hydration"
          subtitle="3L target • 250ml steps"
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "refresh-outline",
              accessibilityLabel: "Refresh hydration data",
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
          <HydrationLoadingState />
        ) : error ? (
          <HydrationErrorState message={error} onRetry={handleRefresh} />
        ) : (
          <>
            <HydrationHeroCard
              currentMl={hydrationMl}
              goalMl={WATER_GOAL_ML}
              onChange={setHydrationMl}
            />

            <HydrationReminderFrequencyCard
              reminderIndex={reminderIndex}
              onChange={setReminderIndex}
            />

            <HydrationTrendCard data={weeklySeries} />

            <HydrationTipCard />
          </>
        )}

        {refreshing ? (
          <View style={styles.refreshingRow}>
            <ActivityIndicator
              size="small"
              color={theme.chart2 ?? theme.accent}
            />
            <Text style={styles.refreshingText}>Refreshing hydration data…</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenView>
  );
};

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
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    refreshingText: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
    },
    bottomSpacer: {
      height: 24,
    },
  });

export default HydrationCheckInScreen;
