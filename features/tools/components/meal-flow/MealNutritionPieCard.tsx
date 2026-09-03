import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";

import ThemeContext from "@/contexts/ThemeContext";
import { MealCardSurface } from "./MealCardSurface";
import type {
  SvaColorSet,
  Spacing,
  Typography,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

export type MealNutritionPieMetricKey =
  | "calories"
  | "protein"
  | "carbs"
  | "fats"
  | "fiber";

export type MealNutritionPieMetric = {
  key: MealNutritionPieMetricKey;
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  color: string;
};

export type MealNutritionPieCardProps = {
  title: string;
  statusLabel?: string;
  caption?: string;
  metrics: readonly MealNutritionPieMetric[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const METRIC_CHART_SIZE = 72;
const METRIC_RADIUS = 24;
const METRIC_STROKE_WIDTH = 8;

const clamp = (value: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.min(Math.max(value, min), max);

const formatMetricSummary = (metric: MealNutritionPieMetric) =>
  `${Math.round(metric.consumed)}${metric.unit} / ${Math.round(metric.goal)}${metric.unit}`;

export function MealNutritionPieCard({
  title,
  statusLabel = "Today",
  caption,
  metrics,
  style,
  testID,
}: MealNutritionPieCardProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  const metricCards = useMemo(
    () =>
      metrics.map((metric) => {
        const safeConsumed = clamp(metric.consumed);
        const safeGoal = clamp(metric.goal);
        const progressPercent =
          safeGoal > 0 ? clamp((safeConsumed / safeGoal) * 100, 0, 100) : 0;
        const circumference = 2 * Math.PI * METRIC_RADIUS;
        const strokeDashoffset =
          circumference - (progressPercent / 100) * circumference;
        const remaining = Math.max(safeGoal - safeConsumed, 0);

        return {
          ...metric,
          consumed: safeConsumed,
          goal: safeGoal,
          progressPercent: Math.round(progressPercent),
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset,
          remaining,
        };
      }),
    [metrics]
  );

  return (
    <MealCardSurface
      testID={testID}
      tone="surface"
      radius={28}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.status}>{statusLabel.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
          {caption ? (
            <Text style={styles.caption} numberOfLines={3}>
              {caption}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.legendGrid}>
        {metricCards.map((metric) => (
          <View key={metric.key} style={styles.metricCard}>
            <View style={styles.metricChartBlock}>
              <View style={styles.metricChartWrap}>
                <Svg width={METRIC_CHART_SIZE} height={METRIC_CHART_SIZE}>
                  <Circle
                    cx={METRIC_CHART_SIZE / 2}
                    cy={METRIC_CHART_SIZE / 2}
                    r={METRIC_RADIUS}
                    fill="none"
                    stroke={svaColors.border.default}
                    strokeWidth={METRIC_STROKE_WIDTH}
                    opacity={0.22}
                  />
                  <Circle
                    cx={METRIC_CHART_SIZE / 2}
                    cy={METRIC_CHART_SIZE / 2}
                    r={METRIC_RADIUS}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth={METRIC_STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeDasharray={metric.strokeDasharray}
                    strokeDashoffset={metric.strokeDashoffset}
                    rotation={-90}
                    origin={`${METRIC_CHART_SIZE / 2}, ${METRIC_CHART_SIZE / 2}`}
                  />
                </Svg>
                <View style={styles.metricChartCenter}>
                  <Text style={styles.centerValue}>{metric.progressPercent}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.metricCopy}>
              <View style={styles.metricHeaderRow}>
                <View style={styles.legendLabelRow}>
                  <View
                    style={[styles.legendDot, { backgroundColor: metric.color }]}
                  />
                  <Text style={styles.legendLabel}>{metric.label}</Text>
                </View>
                <View style={styles.metricProgressPill}>
                  <Text style={[styles.metricProgressText, { color: metric.color }]}>
                    {metric.progressPercent}%
                  </Text>
                </View>
              </View>
              <Text style={styles.legendValue}>{formatMetricSummary(metric)}</Text>
              <Text style={styles.metricSubtext}>
                {metric.remaining > 0
                  ? `${Math.round(metric.remaining)}${metric.unit} remaining`
                  : "Goal reached"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </MealCardSurface>
  );
}

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  tokens: SvaTokens
) =>
  StyleSheet.create({
    card: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      marginBottom: spacing.xl,
      gap: spacing.lg,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    headerCopy: {
      flex: 1,
      gap: spacing.xs + 2,
    },
    status: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      opacity: 0.92,
    },
    title: {
      ...(svaTypography?.textStyle.title ?? typography.h3),
      color: theme.text.primary,
    },
    caption: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.secondary,
      maxWidth: "96%",
    },
    centerValue: {
      ...(svaTypography?.textStyle.heading1 ?? typography.h2),
      color: theme.text.primary,
      fontSize: 12,
      lineHeight: 14,
    },
    legendGrid: {
      gap: spacing.sm,
    },
    metricCard: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 96,
      borderRadius: tokens.radius.card,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      backgroundColor: theme.bg.subtle,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      gap: spacing.md,
    },
    metricChartBlock: {
      alignItems: "center",
      justifyContent: "center",
    },
    metricChartWrap: {
      width: METRIC_CHART_SIZE,
      height: METRIC_CHART_SIZE,
      alignItems: "center",
      justifyContent: "center",
    },
    metricChartCenter: {
      position: "absolute",
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.bg.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      alignItems: "center",
      justifyContent: "center",
    },
    metricCopy: {
      flex: 1,
      gap: 4,
    },
    metricHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    legendLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 99,
    },
    legendLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    metricProgressPill: {
      minWidth: 48,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 1,
      borderRadius: tokens.radius.chip,
      backgroundColor: theme.surface.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      alignItems: "center",
      justifyContent: "center",
    },
    metricProgressText: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    legendValue: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
    },
    metricSubtext: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
    },
  });
