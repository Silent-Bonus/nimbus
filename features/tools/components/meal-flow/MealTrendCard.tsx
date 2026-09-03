import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { MealCardSurface } from "./MealCardSurface";
import type {
  SvaColorSet,
  Spacing,
  Typography,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

export type MealTrendDirection = "up" | "down" | "steady";

export type MealTrendMetric = {
  key: "calories" | "protein" | "fiber";
  label: string;
  averageValue: number;
  unit: string;
  direction: MealTrendDirection;
  hitRate: number;
  color: string;
};

export type MealTrendCardProps = {
  title: string;
  eyebrow?: string;
  caption?: string;
  metrics: readonly MealTrendMetric[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const getDirectionIcon = (direction: MealTrendDirection) => {
  switch (direction) {
    case "up":
      return "arrow-up";
    case "down":
      return "arrow-down";
    default:
      return "remove";
  }
};

const getDirectionLabel = (direction: MealTrendDirection) =>
  direction === "steady" ? "steady" : direction;

export function MealTrendCard({
  title,
  eyebrow = "Trend Signals",
  caption,
  metrics,
  style,
  testID,
}: MealTrendCardProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  return (
    <MealCardSurface
      testID={testID}
      tone="raised"
      radius={28}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons
            name="pulse-outline"
            size={14}
            color={svaColors.brand.primary}
          />
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {caption}
          </Text>
        ) : null}
      </View>

      <View style={styles.summaryBand}>
        {metrics.map((metric) => (
          <View key={`${metric.key}-summary`} style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {Math.round(metric.averageValue)}
              <Text style={styles.summaryUnit}>{metric.unit}</Text>
            </Text>
            <Text style={styles.summaryLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View key={metric.key} style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <View
                style={[styles.metricDot, { backgroundColor: metric.color }]}
              />
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>

            <View style={styles.metricValueBlock}>
              <Text style={styles.metricValue}>
                {Math.round(metric.averageValue)}
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </Text>
              <Text style={styles.metricMeta}>{metric.hitRate}% hit rate</Text>
            </View>

            <View style={styles.directionChip}>
              <Ionicons
                name={getDirectionIcon(metric.direction)}
                size={12}
                color={metric.color}
              />
              <Text style={[styles.directionLabel, { color: metric.color }]}>
                {getDirectionLabel(metric.direction)}
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
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      marginBottom: spacing.xl,
      gap: spacing.md,
      overflow: "hidden",
    },
    header: {
      gap: 6,
    },
    headerBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: spacing.xs + 2,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 1,
      borderRadius: tokens.radius.chip,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    eyebrow: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.primary,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    title: {
      ...(svaTypography?.textStyle.title ?? typography.h3),
      color: theme.text.primary,
    },
    caption: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.secondary,
      maxWidth: "94%",
    },
    summaryBand: {
      flexDirection: "row",
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: tokens.radius.card,
      backgroundColor: theme.surface.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    summaryItem: {
      flex: 1,
      minHeight: 58,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.radius.card,
      backgroundColor: theme.bg.subtle,
      paddingHorizontal: spacing.xs,
      gap: spacing.xs - 1,
    },
    summaryValue: {
      ...(svaTypography?.textStyle.heading2 ?? typography.h3),
      color: theme.text.primary,
    },
    summaryUnit: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
    },
    summaryLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      letterSpacing: 0.9,
      textTransform: "uppercase",
    },
    grid: {
      gap: spacing.xs,
    },
    metricCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: tokens.radius.card,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.base,
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: spacing.sm + 2,
      gap: spacing.sm,
    },
    metricLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 82,
    },
    metricDot: {
      width: 8,
      height: 8,
      borderRadius: 99,
    },
    metricLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    directionChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs + 1,
      borderRadius: tokens.radius.chip,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    directionLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    metricValueBlock: {
      flex: 1,
      gap: 1,
      paddingRight: spacing.xs,
    },
    metricValue: {
      ...(svaTypography?.textStyle.heading2 ?? typography.h3),
      color: theme.text.primary,
    },
    metricUnit: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
    },
    metricMeta: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
    },
  });
