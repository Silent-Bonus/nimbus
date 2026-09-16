/**
 * Hydration daily check-in screen.
 * Loads the selected habit date, displays normalized progress, and submits
 * water increments in the backend's expected milliliter format.
 */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { toApiDate } from "@/utils/date-time";
import { getErrorMessage } from "@/utils/helper";
import {
  HydrationErrorState,
  HydrationHeroCard,
  HydrationLoadingState,
  HydrationTipCard,
  HydrationTrendCard,
} from "../components/hydration";
import RitualReminderSettingsModal from "../components/common/RitualReminderSettingsModal";
import {
  getHabitDetailsByDate,
  incrementHabitProgress,
  updateHabitReminderFrequency,
} from "../services/dailyCheckinService";
import {
  DEFAULT_WEEKLY_SERIES,
  MOCK_WEEKLY_SERIES,
  WATER_GOAL_ML,
  buildWeeklySeries,
  clamp,
  hasMeaningfulWeeklyData,
  REMINDER_OPTIONS,
  toHydrationIncrement,
  toHydrationMl,
  type WeeklyPoint,
} from "../utils/hydration";
import type { ColorSet, Spacing, TypographyTokens } from "../../../theme/types";

export const HydrationCheckInScreen = () => {
  const navigation = useNavigation();
  const toast = useNimbusToast();
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  // Expo Router can return a route param as either a string or an array.
  // Normalize it once so the data request always receives a stable value.
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const templateId = useMemo(() => {
    const rawId = Array.isArray(id) ? id[0] : id;
    return Number(rawId);
  }, [id]);
  const selectedDate = useMemo(
    () => (Array.isArray(date) ? date[0] : date),
    [date]
  );
  const scrollRef = useRef<ScrollView | null>(null);

  // The UI uses ml for consistent progress calculations, while the API unit
  // is preserved so increments can be sent as ml or liters when required.
  const [hydrationMl, setHydrationMl] = useState(0);
  const [metricUnit, setMetricUnit] = useState<string | null>(null);
  const [weeklySeries, setWeeklySeries] = useState<WeeklyPoint[]>(
    DEFAULT_WEEKLY_SERIES
  );
  const [reminderIndex, setReminderIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // The increment endpoint accepts deltas, so keep the last committed amount
  // separate from the slider's temporary value.
  const committedHydrationMlRef = useRef(0);

  // Load the habit detail whenever the selected habit/date changes.
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
      const normalizedResponse = await getHabitDetailsByDate(
        templateId,
        selectedDate
      );
      const { metric_details: metricDetails } =
        normalizedResponse.data.goal_details;
      const { progress } = normalizedResponse.data;
      // Normalize backend completion into ml for the visual balance and jar.
      const nextHydrationMl = clamp(
        toHydrationMl(metricDetails.completed, metricDetails.unit),
        0,
        WATER_GOAL_ML
      );

      setHydrationMl(nextHydrationMl);
      committedHydrationMlRef.current = nextHydrationMl;
      setMetricUnit(metricDetails.unit);

      const series = buildWeeklySeries(progress.last_7_days_completion);
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

  // Keep the chart and hero card synchronized with the latest API progress.
  useEffect(() => {
    loadHydration();
  }, [loadHydration]);

  const refreshing = loading && loaded && !error;

  const handleRefresh = useCallback(() => {
    loadHydration();
  }, [loadHydration]);

  const handleReminderChange = useCallback(
    async (nextIndex: number) => {
      const reminderFrequency = REMINDER_OPTIONS[nextIndex];
      if (!templateId || reminderFrequency === undefined) return;

      try {
        console.log("[Hydration] reminder frequency update", {
          habitId: templateId,
          reminder_frequency: reminderFrequency,
        });
        await updateHabitReminderFrequency(templateId, reminderFrequency);
        setReminderIndex(nextIndex);
        toast.show({
          variant: "success",
          title: "Reminder updated",
          message: `Hydration reminders set to every ${reminderFrequency} minutes.`,
        });
      } catch (error) {
        console.warn("[Hydration] reminder frequency update failed", error);
        toast.show({
          variant: "error",
          title: "Reminder update failed",
          message: getErrorMessage(error),
        });
      }
    },
    [templateId, toast]
  );

  const handleHydrationChange = useCallback((value: number) => {
    setHydrationMl(clamp(value, 0, WATER_GOAL_ML));
  }, []);

  const handleHydrationCommit = useCallback(
    async (value: number) => {
      const nextHydrationMl = clamp(value, 0, WATER_GOAL_ML);
      const previousHydrationMl = committedHydrationMlRef.current;
      const deltaMl = nextHydrationMl - previousHydrationMl;

      if (deltaMl <= 0 || !templateId) {
        setHydrationMl(previousHydrationMl);
        return;
      }

      // The backend expects 300 for ml habits and 0.3 for liter habits.
      const incrementBy = toHydrationIncrement(deltaMl, metricUnit);
      const entry = {
        date: toApiDate(new Date()),
        increment_by: incrementBy,
      };
      committedHydrationMlRef.current = nextHydrationMl;

      try {
        // Progress is recorded for today, using Nimbus's shared API date
        // formatter rather than constructing a date string locally.
        console.log("[Hydration] increment entry", {
          habitId: templateId,
          ...entry,
        });
        const response = await incrementHabitProgress(
          templateId,
          entry.date,
          entry.increment_by
        );
        console.log("[Hydration] increment success", {
          habitId: templateId,
          entry,
          response,
        });
        toast.show({
          variant: "success",
          title: "Hydration updated",
          message: "Your hydration entry was recorded.",
        });
      } catch (error) {
        committedHydrationMlRef.current = previousHydrationMl;
        setHydrationMl(previousHydrationMl);
        console.warn("[Hydration] increment failed", {
          habitId: templateId,
          entry,
          error,
        });
        toast.show({
          variant: "error",
          title: "Hydration update failed",
          message: getErrorMessage(error),
        });
      }
    },
    [metricUnit, templateId, toast]
  );

  // Render loading, error, and hydrated states through the same themed shell.
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
              icon: "settings-outline",
              accessibilityLabel: "Open settings",
              onPress: () => setShowSettingsModal(true),
            },
          ]}
        />

        {/* Keep loading, error, and loaded states mutually exclusive. */}
        {loading && !loaded ? (
          <HydrationLoadingState />
        ) : error ? (
          <HydrationErrorState message={error} onRetry={handleRefresh} />
        ) : (
          <>
            <HydrationHeroCard
              currentMl={hydrationMl}
              goalMl={WATER_GOAL_ML}
              onChange={handleHydrationChange}
              onCommit={handleHydrationCommit}
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
            <Text style={styles.refreshingText}>
              Refreshing hydration data…
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <RitualReminderSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Hydration reminders"
        reminderOptions={REMINDER_OPTIONS}
        selectedIndex={reminderIndex}
        onSelectIndex={handleReminderChange}
      />
    </ScreenView>
  );
};

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) =>
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
