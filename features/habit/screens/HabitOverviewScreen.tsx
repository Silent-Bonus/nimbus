import React, { useContext, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenView } from "@/components/ui/Themed";
import ScreenHeader from "@/components/layout/ScreenHeader";
import ThemeContext from "@/contexts/ThemeContext";
import OverviewSectionHeader from "@/features/habit/components/habit-overview/OverviewSectionHeader";
import RitualConsistencyCard from "@/features/habit/components/habit-overview/RitualConsistencyCard";
import CoreVitalsBlock from "@/features/habit/components/habit-overview/CoreVitalsBlock";
import MonthlyPulseCard from "@/features/habit/components/habit-overview/MonthlyPulseCard";
import RitualRadarCard from "@/features/habit/components/habit-overview/RitualRadarCard";
import type {
  CoreVitalMetric,
  MonthlyPulsePoint,
  RadarAxisPoint,
  TrendPoint,
} from "@/features/habit/components/habit-overview/overviewTypes";
import type { Spacing, TypographyTokens } from "@/theme/types";
import {
  getWellnessDashboard,
  type WellnessDashboard,
} from "@/features/habit/services/wellnessDashboardService";

type HabitOverviewStyles = ReturnType<typeof createStyles>;

export const HabitOverviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const [dashboard, setDashboard] = useState<WellnessDashboard | null>(null);
  const styles: HabitOverviewStyles = useMemo(
    () => createStyles(spacing, insets.bottom, svaTypography),
    [spacing, insets.bottom, svaTypography]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;
    void getWellnessDashboard("7d").then((nextDashboard) => {
      if (active) setDashboard(nextDashboard);
    });

    return () => {
      active = false;
    };
  }, []);

  const trendData = useMemo<TrendPoint[]>(
    () =>
      dashboard
        ? dashboard.ritual_consistency.timeline.map((point) => ({
            label: new Date(`${point.date}T00:00:00`).toLocaleDateString([], {
              weekday: "short",
            }),
            value: point.active ? 100 : 0,
          }))
        : [
            { label: "Mon", value: 74 },
            { label: "Tue", value: 69 },
            { label: "Wed", value: 71 },
            { label: "Thu", value: 77 },
            { label: "Fri", value: 73 },
            { label: "Sat", value: 86 },
            { label: "Sun", value: 92 },
          ],
    [dashboard]
  );

  const coreVitals = useMemo<CoreVitalMetric[]>(
    () =>
      dashboard
        ? [
            {
              key: "zen",
              label: "Zen Minutes",
              value: String(dashboard.core_vitals.zen_minutes),
              detail: "Completed mindful minutes in this period.",
              icon: "leaf-outline" as const,
              tone: "blue" as const,
              emphasis: "primary" as const,
            },
            {
              key: "sleep",
              label: "Sleep Consistency",
              value: dashboard.core_vitals.sleep_consistency.available
                ? `${dashboard.core_vitals.sleep_consistency.percentage}%`
                : "—",
              detail: dashboard.core_vitals.sleep_consistency.available
                ? `${dashboard.core_vitals.sleep_consistency.tracked_days} tracked days.`
                : "Sleep tracking is not available yet.",
              icon: "moon-outline" as const,
              tone: "violet" as const,
            },
            {
              key: "workouts",
              label: "Workout Sessions",
              value: String(dashboard.core_vitals.workout_sessions),
              detail: `${dashboard.core_vitals.daily_checkins_completed} daily check-ins completed.`,
              icon: "flash-outline" as const,
              tone: "amber" as const,
            },
          ]
        : [
            {
              key: "zen",
              label: "Zen Minutes",
              value: "482",
              detail: "Quiet focused time logged this week.",
              icon: "leaf-outline" as const,
              tone: "blue" as const,
              emphasis: "primary" as const,
            },
            {
              key: "sleep",
              label: "Sleep Quality",
              value: "84%",
              detail: "Stable recovery and cleaner evenings.",
              icon: "moon-outline" as const,
              tone: "violet" as const,
            },
            {
              key: "intensity",
              label: "Intensity",
              value: "7.2",
              detail: "Effort is up, but still sustainable.",
              icon: "flash-outline" as const,
              tone: "amber" as const,
            },
          ],
    [dashboard]
  );

  const monthlyPulse = useMemo<MonthlyPulsePoint[]>(
    () =>
      dashboard
        ? [
            { label: "Active days", value: dashboard.monthly_pulse.active_days, color: svaColors.chart.blue },
            { label: "Sessions", value: dashboard.monthly_pulse.session_count, color: svaColors.chart.lavender },
            { label: "Mood", value: dashboard.monthly_pulse.mood_checkins_completed, color: svaColors.chart.amber },
            { label: "Check-ins", value: dashboard.monthly_pulse.daily_checkins_completed, color: svaColors.brand.primary },
          ]
        : [
            { label: "W1", value: 58, color: svaColors.chart.blue },
            { label: "W2", value: 84, color: svaColors.chart.lavender },
            { label: "W3", value: 62, color: svaColors.chart.amber },
            { label: "W4", value: 76, color: svaColors.brand.primary },
          ],
    [dashboard, svaColors.brand.primary, svaColors.chart.amber, svaColors.chart.blue, svaColors.chart.lavender]
  );

  const radarData = useMemo<RadarAxisPoint[]>(
    () =>
      dashboard
        ? [
            { label: "Mind", value: dashboard.ritual_balance.percentages.mind, color: svaColors.brand.primary },
            { label: "Body", value: dashboard.ritual_balance.percentages.body, color: svaColors.chart.blue },
            { label: "Soul", value: dashboard.ritual_balance.percentages.soul, color: svaColors.chart.lavender },
          ]
        : [
            { label: "Move", value: 76, color: svaColors.chart.blue },
            { label: "Mind", value: 91, color: svaColors.brand.primary },
            { label: "Body", value: 84, color: svaColors.chart.lavender },
          ],
    [dashboard, svaColors.brand.primary, svaColors.chart.blue, svaColors.chart.lavender]
  );

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title="Holistic Overview"
          subtitle="Quantifying your inner growth"
          onBack={() => navigation.goBack()}
          containerStyle={styles.header}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />

        <View style={styles.sectionBlock}>
          <OverviewSectionHeader
            title="Ritual Consistency"
            accessoryLabel="Past 7 days"
          />
          <RitualConsistencyCard
            data={trendData}
            headlineValue={dashboard?.ritual_consistency.percentage}
          />
        </View>

        <View style={styles.sectionBlock}>
          <OverviewSectionHeader title="Core Vitals" />
          <CoreVitalsBlock metrics={coreVitals} />
        </View>

        <View style={styles.sectionBlock}>
          <OverviewSectionHeader
            title="Monthly Pulse"
            accessoryLabel="Activity split"
          />
          <MonthlyPulseCard
            data={monthlyPulse}
            valueSuffix={dashboard ? "" : "%"}
            caption={
              dashboard
                ? "Monthly activity across sessions, mood, and daily check-ins."
                : undefined
            }
          />
        </View>

        <View style={styles.sectionBlock}>
          <OverviewSectionHeader
            title="Ritual Balance"
            accessoryLabel={dashboard ? "Mind • Body • Soul" : "Move • Mind • Body"}
          />
          <RitualRadarCard data={radarData} />
        </View>
      </ScrollView>
    </ScreenView>
  );
};

function createStyles(
  spacing: Spacing,
  bottomInset: number,
  svaTypography: TypographyTokens
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: bottomInset + spacing.xl * 2,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...svaTypography.textStyle.authTitle,
      textAlign: "center",
    },
    headerSubtitle: {
      ...svaTypography.textStyle.authSubtitle,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    sectionBlock: {
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
  });
}

export default HabitOverviewScreen;
