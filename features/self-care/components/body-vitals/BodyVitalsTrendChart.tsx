import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { BodyVitalsTrendTimelinePoint } from "@/features/self-care/types/bodyVitals";
import {
  useBodyVitalsTheme,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import {
  formatBodyVitalsTrendSnapshotDate,
  getBodyVitalsTrendBarHeight,
  getBodyVitalsTrendMetricValues,
} from "@/features/self-care/utils/bodyVitalsTrends";
import type { ColorSet, Spacing } from "@/theme/types";

type BodyVitalsTrendChartProps = {
  title: string;
  metricKey: "weight_kg" | "waist_cm";
  unit: string;
  accent: string;
  timeline: BodyVitalsTrendTimelinePoint[];
};

export function BodyVitalsTrendChart({
  title,
  metricKey,
  unit,
  accent,
  timeline,
}: BodyVitalsTrendChartProps) {
  const { newTheme, spacing, bodyVitalsTypography } = useBodyVitalsTheme();
  const styles = useMemo(
    () => styling(newTheme, spacing, bodyVitalsTypography),
    [newTheme, spacing, bodyVitalsTypography]
  );
  const values = useMemo(
    () => getBodyVitalsTrendMetricValues(timeline, metricKey),
    [timeline, metricKey]
  );
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.valueHint, { color: accent }]}>
          {values.length ? `${values[values.length - 1]} ${unit}` : "No data"}
        </Text>
      </View>

      <View style={styles.chartRow}>
        {timeline.map((point) => {
          const value = point[metricKey];
          const barHeight = getBodyVitalsTrendBarHeight(value, min, max);

          return (
            <View key={`${metricKey}-${point.date}`} style={styles.barColumn}>
              <Text style={styles.metricValue}>
                {typeof value === "number" ? `${value}` : "--"}
              </Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: accent,
                      height: `${Math.round(barHeight * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dateLabel}>
                {formatBodyVitalsTrendSnapshotDate(point.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: BodyVitalsTypography
) =>
  StyleSheet.create({
    card: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surface,
      padding: spacing.md,
      gap: spacing.md,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    title: {
      ...t.bodyMedium,
      color: theme.textPrimary,
    },
    valueHint: {
      ...t.sectionLabel,
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: spacing.sm,
      minHeight: 152,
    },
    barColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: spacing.xs,
    },
    metricValue: {
      ...t.caption,
      color: theme.textSecondary,
      minHeight: 18,
    },
    track: {
      width: "100%",
      maxWidth: 28,
      height: 92,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    bar: {
      width: "100%",
      borderRadius: 999,
      minHeight: 10,
    },
    dateLabel: {
      ...t.caption,
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
