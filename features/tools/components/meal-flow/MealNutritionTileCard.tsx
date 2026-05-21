import React, { useContext, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import { MealCardSurface } from "./MealCardSurface";
import type {
  SvaColorSet,
  Spacing,
  Typography,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

export type MealNutritionMetricKey = "protein" | "carbs" | "fiber";

export type MealNutritionMetric = {
  key: MealNutritionMetricKey;
  label: string;
  consumed: number;
};

export type MealNutritionTileCardProps = {
  title: string;
  eyebrow?: string;
  metrics: readonly MealNutritionMetric[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function MealNutritionTileCard({
  title,
  eyebrow = "Status",
  metrics,
  style,
  testID,
}: MealNutritionTileCardProps) {
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
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View key={metric.key} style={styles.tile}>
            <Text style={styles.tileLabel} numberOfLines={1}>
              {metric.label}
            </Text>
            <Text style={styles.tileValue} numberOfLines={1}>
              {Math.round(metric.consumed)}g
            </Text>
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
      padding: spacing.md,
      marginBottom: spacing.xl,
      gap: spacing.md,
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
      gap: 4,
    },
    eyebrow: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      opacity: 0.9,
    },
    title: {
      ...(svaTypography?.textStyle.title ?? typography.bodyStrong),
      color: theme.text.primary,
      fontSize: 18,
      lineHeight: 22,
    },
    grid: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    tile: {
      flex: 1,
      minHeight: 92,
      borderRadius: tokens.radius.card,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      backgroundColor: theme.bg.subtle,
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
      gap: 2,
    },
    tileLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      fontSize: 10,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      textAlign: "center",
    },
    tileValue: {
      ...(svaTypography?.textStyle.heading2 ?? typography.h3),
      color: theme.text.primary,
      fontSize: 20,
      lineHeight: 24,
      letterSpacing: -0.2,
      textAlign: "center",
    },
  });
