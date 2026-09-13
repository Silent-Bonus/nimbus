import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import {
  clamp,
  formatClockTime,
  formatMinutes,
  getProgressLabel,
} from "@/features/check-in/utils/meditationCheckin";

type MeditationProgressCardProps = {
  completedMinutes: number;
  goalMinutes: number;
  anchoredAt: Date | null;
  onAddMinutes: (step: number) => Promise<void> | void;
  onResetMinutes: () => void;
  onAnchorHold: () => void;
};

const getDisplayFont = (svaTypography?: TypographyTokens) =>
  svaTypography?.textStyle.displayMedium?.fontFamily ??
  svaTypography?.textStyle.authTitle?.fontFamily ??
  undefined;

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography?: TypographyTokens
) => {
  const displayFont = getDisplayFont(svaTypography);

  return StyleSheet.create({
    card: {
      marginTop: spacing.lg,
      borderRadius: 28,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 20,
      elevation: 8,
    },
    heroGlow: {
      position: "absolute",
      top: -120,
      right: -80,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(163,190,140,0.16)",
    },
    heroGlowSecondary: {
      position: "absolute",
      bottom: -100,
      left: -80,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: "rgba(121,169,242,0.08)",
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
    },
    cardSubTitle: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
    goalChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: theme.borderMuted,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 70,
    },
    goalChipValue: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "800",
    },
    goalChipLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      marginTop: 1,
    },
    ringStage: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    ringInner: {
      position: "absolute",
      width: 176,
      height: 176,
      borderRadius: 88,
      backgroundColor: "rgba(0,0,0,0.10)",
      borderWidth: 1,
      borderColor: theme.borderMuted,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
    },
    ringValue: {
      textAlign: "center",
      color: theme.textPrimary,
    },
    ringValueMain: {
      ...typography.h1,
      color: theme.textPrimary,
      fontFamily: displayFont,
      letterSpacing: -0.8,
    },
    ringValueGoal: {
      ...typography.h4,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    ringLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 2,
      marginTop: 6,
      textAlign: "center",
    },
    anchorStamp: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      marginTop: 10,
      textAlign: "center",
    },
    quickAddHeader: {
      marginTop: spacing.lg,
    },
    quickAddLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.5,
    },
    quickAddHint: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    quickAddRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    quickAddChip: {
      flex: 1,
      minHeight: 44,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.borderMuted,
      backgroundColor: theme.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    quickAddChipPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    quickAddChipText: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.6,
    },
    resetButton: {
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.borderMuted,
    },
    resetButtonText: {
      ...typography.button,
      color: theme.textSecondary,
      fontSize: 14,
    },
    anchorStage: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    anchorButton: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted,
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    anchorButtonPressed: {
      transform: [{ scale: 0.98 }],
    },
    anchorButtonActive: {
      borderColor: theme.accent,
    },
    anchorButtonCore: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted,
    },
    anchorButtonLabel: {
      ...typography.button,
      color: theme.textPrimary,
      textTransform: "uppercase",
      letterSpacing: 1.4,
      marginTop: 12,
    },
    anchorButtonSubLabel: {
      ...typography.caption,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 18,
    },
  });
};

export const MeditationProgressCard = ({
  completedMinutes,
  goalMinutes,
  anchoredAt,
  onAddMinutes,
  onResetMinutes,
  onAnchorHold,
}: MeditationProgressCardProps) => {
  const {
    newTheme: theme,
    spacing,
    typography,
    svaTypography,
  } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography, svaTypography),
    [theme, spacing, typography, svaTypography]
  );

  const progress = clamp(completedMinutes / Math.max(goalMinutes, 1), 0, 1);
  const ringSize = 220;
  const strokeWidth = 15;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const statusLabel = getProgressLabel(progress);
  const accent = theme.chart5 ?? theme.accent;

  return (
    <View style={styles.card}>
      <View style={styles.heroGlow} />
      <View style={styles.heroGlowSecondary} />

      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>MINUTES TODAY</Text>
          <Text style={styles.cardSubTitle}>
            Build the session in small, premium increments.
          </Text>
        </View>

        <View style={styles.goalChip}>
          <Text style={styles.goalChipValue}>{formatMinutes(goalMinutes)}</Text>
          <Text style={styles.goalChipLabel}>goal</Text>
        </View>
      </View>

      <View style={styles.ringStage}>
        <Svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
        >
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={theme.borderMuted ?? "rgba(255,255,255,0.08)"}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={accent}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            fill="none"
          />
        </Svg>

        <View style={styles.ringInner}>
          <Text style={styles.ringValue}>
            <Text style={styles.ringValueMain}>
              {formatMinutes(completedMinutes)}
            </Text>
            <Text style={styles.ringValueGoal}>
              {" "}
              / {formatMinutes(goalMinutes)}
            </Text>
          </Text>

          <Text style={styles.ringLabel}>{statusLabel}</Text>

          {anchoredAt ? (
            <Text style={styles.anchorStamp}>
              Anchored · {formatClockTime(anchoredAt)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.quickAddHeader}>
        <Text style={styles.quickAddLabel}>ADD MORE MINUTES</Text>
        <Text style={styles.quickAddHint}>
          Use short, clean steps to extend the session.
        </Text>
      </View>

      <View style={styles.quickAddRow}>
        {[5, 10, 15].map((step) => (
          <Pressable
            key={step}
            onPress={() => onAddMinutes(step)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${step} meditation minutes`}
            style={({ pressed }) => [
              styles.quickAddChip,
              pressed && styles.quickAddChipPressed,
            ]}
          >
            <Text style={styles.quickAddChipText}>+{step}m</Text>
          </Pressable>
        ))}
      </View>

      {/*
      <Pressable
        onPress={onResetMinutes}
        accessibilityRole="button"
        accessibilityLabel="Reset meditation minutes"
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.quickAddChipPressed,
        ]}
      >
        <Text style={styles.resetButtonText}>Reset to 0 minutes</Text>
      </Pressable>
      */}

      <View style={styles.anchorStage}>
        <Pressable
          onLongPress={onAnchorHold}
          delayLongPress={650}
          accessibilityRole="button"
          accessibilityLabel="Hold to anchor meditation session"
          accessibilityHint="Press and hold to seal the session."
          style={({ pressed }) => [
            styles.anchorButton,
            pressed && styles.anchorButtonPressed,
            anchoredAt && styles.anchorButtonActive,
          ]}
        >
          <View style={styles.anchorButtonCore}>
            <Ionicons name="magnet-outline" size={24} color={accent} />
          </View>
        </Pressable>
        <Text style={styles.anchorButtonLabel}>Hold to anchor</Text>
        <Text style={styles.anchorButtonSubLabel}>
          {anchoredAt
            ? `Anchored at ${formatClockTime(anchoredAt)}.`
            : "Press and hold to seal the session."}
        </Text>
      </View>
    </View>
  );
};
