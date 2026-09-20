import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { Share, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenView } from "@/components/ui/Themed";
import AppHeader from "@/components/layout/AppHeader";
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

type HabitOverviewStyles = ReturnType<typeof createStyles>;

export const HabitOverviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles: HabitOverviewStyles = useMemo(
    () => createStyles(spacing, insets.bottom, svaTypography),
    [spacing, insets.bottom, svaTypography]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const trendData = useMemo<TrendPoint[]>(
    () => [
      { label: "Mon", value: 74 },
      { label: "Tue", value: 69 },
      { label: "Wed", value: 71 },
      { label: "Thu", value: 77 },
      { label: "Fri", value: 73 },
      { label: "Sat", value: 86 },
      { label: "Sun", value: 92 },
    ],
    []
  );

  const coreVitals = useMemo<CoreVitalMetric[]>(
    () => [
      {
        key: "zen",
        label: "Zen Minutes",
        value: "482",
        detail: "Quiet focused time logged this week.",
        icon: "leaf-outline",
        tone: "blue",
        emphasis: "primary",
      },
      {
        key: "sleep",
        label: "Sleep Quality",
        value: "84%",
        detail: "Stable recovery and cleaner evenings.",
        icon: "moon-outline",
        tone: "violet",
      },
      {
        key: "intensity",
        label: "Intensity",
        value: "7.2",
        detail: "Effort is up, but still sustainable.",
        icon: "flash-outline",
        tone: "amber",
      },
    ],
    []
  );

  const monthlyPulse = useMemo<MonthlyPulsePoint[]>(
    () => [
      { label: "W1", value: 58, color: svaColors.chart.blue },
      { label: "W2", value: 84, color: svaColors.chart.lavender },
      { label: "W3", value: 62, color: svaColors.chart.amber },
      { label: "W4", value: 76, color: svaColors.brand.primary },
    ],
    [svaColors.brand.primary, svaColors.chart.amber, svaColors.chart.blue, svaColors.chart.lavender]
  );

  const radarData = useMemo<RadarAxisPoint[]>(
    () => [
      { label: "Move", value: 76, color: svaColors.chart.blue },
      { label: "Mind", value: 91, color: svaColors.brand.primary },
      { label: "Body", value: 84, color: svaColors.chart.lavender },
    ],
    [svaColors.brand.primary, svaColors.chart.blue, svaColors.chart.lavender]
  );

  const shareSummary = useMemo(
    () =>
      [
        "Holistic Overview",
        "",
        "Ritual consistency: 92% current completion across the week.",
        "Core vitals: Zen Minutes 482, Sleep Quality 84%, Intensity 7.2.",
        "Monthly pulse: W2 is the strongest month segment.",
        "Ritual balance: Mind is the most consistent category.",
      ].join("\n"),
    []
  );

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        title: "Holistic Overview",
        message: shareSummary,
      });
    } catch (error) {
      console.warn("overview share failed", error);
    }
  }, [shareSummary]);

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppHeader
          title="Holistic Overview"
          subtitle="Quantifying your inner growth"
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "share-outline",
              accessibilityLabel: "Share overview",
              onPress: onShare,
            },
          ]}
          containerStyle={styles.header}
        />

        <View style={styles.sectionBlock}>
          <OverviewSectionHeader
            title="Ritual Consistency"
            accessoryLabel="Past 7 days"
          />
          <RitualConsistencyCard data={trendData} />
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
          <MonthlyPulseCard data={monthlyPulse} />
        </View>

        <View style={styles.sectionBlock}>
        <OverviewSectionHeader
            title="Ritual Balance"
            accessoryLabel="Move • Mind • Body"
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
    sectionBlock: {
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
  });
}

export default HabitOverviewScreen;
