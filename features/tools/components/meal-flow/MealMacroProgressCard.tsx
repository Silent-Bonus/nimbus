import React, { useContext, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Circle, Svg } from "react-native-svg";

import ThemeContext from "@/contexts/ThemeContext";
import { MealCardSurface } from "./MealCardSurface";
import type {
  SvaColorSet,
  Spacing,
  Typography,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

export type MealMacroProgressMetricKey = "carbs" | "protein" | "fiber";

export type MealMacroProgressMetric = {
  key: MealMacroProgressMetricKey;
  label: string;
  consumed: number;
  goal: number;
  color: string;
  letter?: string;
};

export type MealMacroProgressCardProps = {
  title: string;
  statusLabel?: string;
  progressLabel: string;
  metrics: readonly MealMacroProgressMetric[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const DEFAULT_RING_SIZE = 72;
const DEFAULT_STROKE_WIDTH = 4;

const formatAmount = (value: number) => `${Math.round(value)}g`;

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export function MealMacroProgressCard({
  title,
  statusLabel = "Status",
  progressLabel,
  metrics,
  style,
  testID,
}: MealMacroProgressCardProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
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
        </View>
        <Text style={styles.progressLabel} numberOfLines={1}>
          {progressLabel}
        </Text>
      </View>

      <View style={styles.ringRow}>
        {metrics.map((metric) => (
          <View key={metric.key} style={styles.ringItem}>
            <MacroRing
              size={DEFAULT_RING_SIZE}
              strokeWidth={DEFAULT_STROKE_WIDTH}
              progress={metric.goal > 0 ? metric.consumed / metric.goal : 0}
              color={metric.color}
              letter={(metric.letter ?? metric.label.charAt(0)).toUpperCase()}
              styles={styles}
              theme={svaColors}
            />
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        {metrics.map((metric) => (
          <View key={`${metric.key}-legend`} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: metric.color }]}
            />
            <Text style={styles.legendText} numberOfLines={1}>
              {formatAmount(metric.consumed)} {metric.label}
            </Text>
          </View>
        ))}
      </View>
    </MealCardSurface>
  );
}

type MacroRingProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  letter: string;
  styles: ReturnType<typeof styling>;
  theme: SvaColorSet;
};

function MacroRing({
  size,
  strokeWidth,
  progress,
  color,
  letter,
  styles,
  theme,
}: MacroRingProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamp(progress));

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.divider}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.ringLetterWrap}>
        <Text style={styles.ringLetter}>{letter}</Text>
      </View>
    </View>
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
      gap: 6,
    },
    status: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      opacity: 0.92,
    },
    title: {
      ...(svaTypography?.textStyle.title ?? typography.h3),
      color: theme.text.primary,
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.2,
    },
    progressLabel: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.brand.primary,
      fontSize: 14,
      lineHeight: 18,
      textAlign: "right",
      paddingTop: 2,
    },
    ringRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.md,
      paddingTop: spacing.sm,
    },
    ringItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    ringWrap: {
      width: DEFAULT_RING_SIZE,
      height: DEFAULT_RING_SIZE,
      justifyContent: "center",
      alignItems: "center",
    },
    ringLetterWrap: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
    },
    ringLetter: {
      ...(svaTypography?.textStyle.title ?? typography.bodyStrong),
      color: theme.text.primary,
      fontSize: 15,
      lineHeight: 18,
      letterSpacing: 0.6,
    },
    legendRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
      paddingTop: spacing.xs,
    },
    legendItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    legendDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
    },
    legendText: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "600",
    },
  });
