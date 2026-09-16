import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";
import {
  getAverage,
  type WeeklyPoint,
} from "@/features/check-in/utils/meditationCheckin";

type MeditationTrendCardProps = {
  data: WeeklyPoint[];
  currentStreak: number;
  longestStreak: number;
};

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    card: {
      marginTop: spacing.lg,
      borderRadius: 28,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 8,
    },
    cardHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    sectionLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.7,
    },
    cardSubTitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
    trendBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
      flexShrink: 1,
    },
    trendBadgeText: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      flexShrink: 1,
    },
    trendFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.06)",
    },
    trendMetric: {
      flex: 1,
    },
    trendMetricValue: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      letterSpacing: -0.3,
    },
    trendMetricLabel: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      opacity: 0.78,
      marginTop: 4,
    },
    trendDivider: {
      width: 1,
      height: 42,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
  });

export const MeditationTrendCard = ({
  data,
  currentStreak,
  longestStreak,
}: MeditationTrendCardProps) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        value: item.percent,
        label: item.day,
        dataPointColor: theme.chart5 ?? theme.accent,
        dataPointRadius: item.percent > 0 ? 4 : 3,
      })),
    [data, theme]
  );

  const average = getAverage(data);
  const streakLabel =
    currentStreak > 0 ? `${currentStreak} day streak` : "Build momentum";
  const accent = theme.chart5 ?? theme.accent;
  const gradient = theme.chart1 ?? accent;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>PAST 7 DAYS</Text>
          <Text style={styles.cardSubTitle}>
            Weekly meditation trend with room to breathe.
          </Text>
        </View>

        <View style={styles.trendBadge}>
          <Ionicons name="trending-up-outline" size={14} color={accent} />
          <Text style={styles.trendBadgeText}>{streakLabel}</Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        curved
        height={180}
        thickness={4}
        areaChart
        hideRules
        hideYAxisText
        yAxisColor="transparent"
        xAxisColor="transparent"
        maxValue={100}
        noOfSections={4}
        color={accent}
        startFillColor={accent}
        endFillColor={gradient}
        startOpacity={0.24}
        endOpacity={0.04}
        dataPointsColor={accent}
        dataPointsRadius={4}
        initialSpacing={8}
        endSpacing={8}
        backgroundColor="transparent"
        isAnimated
        xAxisLabelTextStyle={{
          ...svaTypography.textStyle.caption,
          color: theme.textSecondary,
          marginTop: 6,
        }}
      />

      <View style={styles.trendFooter}>
        <View style={styles.trendMetric}>
          <Text style={styles.trendMetricValue}>{Math.round(average)}%</Text>
          <Text style={styles.trendMetricLabel}>weekly average</Text>
        </View>

        <View style={styles.trendDivider} />

        <View style={styles.trendMetric}>
          <Text style={styles.trendMetricValue}>{longestStreak}</Text>
          <Text style={styles.trendMetricLabel}>best streak</Text>
        </View>
      </View>
    </View>
  );
};
