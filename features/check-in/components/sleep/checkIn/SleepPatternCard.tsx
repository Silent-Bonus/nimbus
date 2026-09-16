import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";
import {
  getSleepStatusColor,
  type SleepPoint,
} from "@/features/check-in/utils/sleepCheckin";

type SleepPatternCardProps = {
  data: SleepPoint[];
};

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 28,
      overflow: "hidden",
      padding: 18,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
      shadowColor: theme.shadow ?? "#000",
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: spacing.sm,
    },
    sectionLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      fontWeight: "800",
      letterSpacing: 1.8,
      opacity: 0.88,
    },
    cardSubTitle: {
      ...svaTypography.textStyle.caption,
      marginTop: 4,
      color: theme.textSecondary,
      lineHeight: 16,
      opacity: 0.86,
    },
    patternBadge: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    patternBadgeValue: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.1,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      paddingHorizontal: 6,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
      justifyContent: "center",
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      letterSpacing: 1,
    },
  });

export const SleepPatternCard = ({ data }: SleepPatternCardProps) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        value: item.hours,
        label: item.day,
        frontColor: getSleepStatusColor(item.status, theme),
      })),
    [data, theme]
  );

  const average = useMemo(() => {
    if (!data.length) return 0;
    const total = data.reduce((sum, item) => sum + item.hours, 0);
    return Math.round((total / data.length) * 10) / 10;
  }, [data]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>SLEEP ARCHITECTURE</Text>
          <Text style={styles.cardSubTitle}>
            Weekly sleep pattern with recovery zones.
          </Text>
        </View>

        <View style={styles.patternBadge}>
          <Text style={styles.patternBadgeValue}>{average.toFixed(1)}h</Text>
        </View>
      </View>

      <BarChart
        data={chartData}
        barWidth={18}
        spacing={16}
        initialSpacing={12}
        endSpacing={12}
        height={188}
        barBorderRadius={10}
        hideRules
        yAxisThickness={0}
        xAxisThickness={0}
        noOfSections={4}
        maxValue={12}
        isAnimated
        xAxisLabelTextStyle={{
          ...svaTypography.textStyle.caption,
          color: theme.textSecondary,
          marginTop: 8,
        }}
        yAxisTextStyle={{ color: "transparent" }}
      />

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: getSleepStatusColor("under", theme) },
            ]}
          />
          <Text style={styles.legendText}>UNDER</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: getSleepStatusColor("proper", theme) },
            ]}
          />
          <Text style={styles.legendText}>PROPER</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: getSleepStatusColor("over", theme) },
            ]}
          />
          <Text style={styles.legendText}>OVER</Text>
        </View>
      </View>
    </View>
  );
};
