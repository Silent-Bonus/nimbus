import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import ThemeContext from "../../../../contexts/ThemeContext";
import type { ColorSet, Spacing, Typography } from "../../../../theme/types";
import { getAverage, type WeeklyPoint } from "../../utils/hydration";

type HydrationTrendCardProps = {
  data: WeeklyPoint[];
};

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
      shadowOffset: { width: 0, height: 10 },
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
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.7,
      textTransform: "uppercase",
    },
    cardSubTitle: {
      ...typography.caption,
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
    trendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    trendBadgeText: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      flexShrink: 1,
    },
    weekLegend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.xs,
      paddingHorizontal: 2,
    },
    weekLegendItem: {
      flex: 1,
      alignItems: "center",
    },
    weekLegendText: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      textAlign: "center",
    },
    trendFooter: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
      marginTop: 4,
    },
    trendFooterValue: {
      ...typography.h3,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    trendFooterLabel: {
      ...typography.caption,
      color: theme.textSecondary,
      opacity: 0.78,
    },
  });

export const HydrationTrendCard = ({ data }: HydrationTrendCardProps) => {
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography),
    [theme, spacing, typography]
  );

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        value: item.percent,
        label: "",
        dataPointColor: theme.chart2 ?? theme.accent,
        dataPointRadius: item.percent > 0 ? 4 : 3,
      })),
    [data, theme]
  );

  const average = getAverage(data);
  const trendLabel =
    average >= 75 ? "Optimal hydration reached" : "Keep sipping";
  const accent = theme.chart2 ?? theme.accent;
  const gradient = theme.chart5 ?? theme.gradBlue ?? accent;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>PAST 7 DAYS</Text>
          <Text style={styles.cardSubTitle}>Weekly hydration trend.</Text>
        </View>

        <View style={styles.trendBadge}>
          <View
            style={[
              styles.trendDot,
              {
                backgroundColor: accent,
              },
            ]}
          />
          <Text style={styles.trendBadgeText}>{trendLabel}</Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        curved
        height={170}
        thickness={4}
        areaChart
        hideRules
        hideYAxisText
        yAxisColor="transparent"
        xAxisColor="transparent"
        color={accent}
        startFillColor={accent}
        endFillColor={gradient}
        startOpacity={0.2}
        endOpacity={0.03}
        dataPointsColor={accent}
        dataPointsRadius={4}
        initialSpacing={10}
        endSpacing={10}
        backgroundColor="transparent"
        isAnimated
      />

      <View style={styles.weekLegend} accessibilityLabel="Past 7 days">
        {data.map((item) => (
          <View key={item.day} style={styles.weekLegendItem}>
            <Text style={styles.weekLegendText}>{item.day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.trendFooter}>
        <Text style={styles.trendFooterValue}>{Math.round(average)}%</Text>
        <Text style={styles.trendFooterLabel}>average completion</Text>
      </View>
    </View>
  );
};
