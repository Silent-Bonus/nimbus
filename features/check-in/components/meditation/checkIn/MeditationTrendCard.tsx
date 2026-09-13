import React, { useContext, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, Typography } from "@/theme/types";
import {
  getAverage,
  type WeeklyPoint,
} from "@/features/check-in/utils/meditationCheckin";

type MeditationTrendCardProps = {
  data: WeeklyPoint[];
  currentStreak: number;
  longestStreak: number;
};

const CHART_HORIZONTAL_INSET = 14;
const CHART_EDGE_SPACING = 22;

const makeStyles = (theme: ColorSet, spacing: Spacing, typography: Typography) =>
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
    headerCopy: {
      flex: 1,
      minWidth: 0,
    },
    sectionLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.9,
      letterSpacing: 1.7,
    },
    cardSubTitle: {
      ...typography.caption,
      color: theme.textPrimary,
      marginTop: 6,
      lineHeight: 20,
      opacity: 0.72,
    },
    trendBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted,
      flexShrink: 0,
      maxWidth: 170,
    },
    trendBadgeText: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      flexShrink: 1,
    },
    chartWrap: {
      marginTop: spacing.xs,
      paddingHorizontal: CHART_HORIZONTAL_INSET,
      paddingTop: spacing.xs,
    },
    weekLegend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
      paddingHorizontal: 4,
    },
    weekLegendItem: {
      flex: 1,
      alignItems: "center",
    },
    weekLegendText: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      opacity: 0.74,
      textAlign: "center",
    },
    trendFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      marginTop: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    trendMetric: {
      flex: 1,
    },
    trendMetricValue: {
      ...typography.h3,
      color: theme.textPrimary,
      letterSpacing: -0.3,
    },
    trendMetricLabel: {
      ...typography.caption,
      color: theme.textSecondary,
      opacity: 0.9,
      marginTop: 4,
    },
    trendDivider: {
      width: 1,
      height: 42,
      backgroundColor: theme.divider,
    },
  });

export const MeditationTrendCard = ({
  data,
  currentStreak,
  longestStreak,
}: MeditationTrendCardProps) => {
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography),
    [theme, spacing, typography]
  );
  const [chartWidth, setChartWidth] = useState<number | null>(null);

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        value: item.percent,
        label: "",
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
  const chartInnerWidth =
    chartWidth === null
      ? undefined
      : Math.max(chartWidth - CHART_HORIZONTAL_INSET * 2, 0);
  const chartPointSpacing =
    chartInnerWidth && data.length > 1
      ? Math.max(
          (chartInnerWidth - CHART_EDGE_SPACING * 2) / (data.length - 1),
          1
        )
      : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.headerCopy}>
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

      <View
        style={styles.chartWrap}
        onLayout={({ nativeEvent }) => {
          const nextWidth = Math.round(nativeEvent.layout.width);
          if (nextWidth > 0 && nextWidth !== chartWidth) {
            setChartWidth(nextWidth);
          }
        }}
      >
        <LineChart
          data={chartData}
          curved
          height={180}
          width={chartInnerWidth}
          thickness={4}
          areaChart
          hideRules
          hideYAxisText
          yAxisColor="transparent"
          xAxisColor="transparent"
          maxValue={110}
          noOfSections={4}
          color={accent}
          startFillColor={accent}
          endFillColor={gradient}
          startOpacity={0.24}
          endOpacity={0.04}
          dataPointsColor={accent}
          dataPointsRadius={4}
          spacing={chartPointSpacing}
          initialSpacing={CHART_EDGE_SPACING}
          endSpacing={CHART_EDGE_SPACING}
          backgroundColor="transparent"
          isAnimated
        />
      </View>

      <View style={styles.weekLegend} accessibilityLabel="Past 7 days">
        {data.map((item) => (
          <View key={item.day} style={styles.weekLegendItem}>
            <Text style={styles.weekLegendText}>{item.day}</Text>
          </View>
        ))}
      </View>

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
