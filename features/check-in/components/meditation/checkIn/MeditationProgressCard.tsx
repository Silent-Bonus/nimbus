import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
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
  onAddMinutes: (step: number) => void;
  onAnchorHold: () => void;
};

const getDisplayFont = (svaTypography: any) =>
  svaTypography?.textStyle.displayMedium?.fontFamily ??
  svaTypography?.textStyle.authTitle?.fontFamily ??
  undefined;

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
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
      minHeight: 420,
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
    goalChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 70,
    },
    goalChipValue: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "800",
    },
    goalChipLabel: {
      ...svaTypography.textStyle.authTinyLabel,
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
      borderColor: "rgba(255,255,255,0.05)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
    },
    ringValue: {
      textAlign: "center",
      color: theme.textPrimary,
    },
    ringValueMain: {
      ...svaTypography.textStyle.heading1,
      color: theme.textPrimary,
      fontFamily: displayFont,
      letterSpacing: -0.8,
    },
    ringValueGoal: {
      ...svaTypography.textStyle.authLabel,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    ringLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      letterSpacing: 2,
      marginTop: 6,
      textAlign: "center",
    },
    anchorStamp: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      marginTop: 10,
      textAlign: "center",
    },
    anchorStampMuted: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      opacity: 0.86,
      marginTop: 10,
      textAlign: "center",
      lineHeight: 18,
    },
    quickAddHeader: {
      marginTop: spacing.lg,
    },
    quickAddLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.5,
    },
    quickAddHint: {
      ...svaTypography.textStyle.caption,
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
      borderColor: "rgba(255,255,255,0.08)",
      backgroundColor: "rgba(255,255,255,0.04)",
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
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.6,
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
      backgroundColor: "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
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
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
    },
    anchorButtonLabel: {
      ...svaTypography.textStyle.button,
      color: theme.textPrimary,
      textTransform: "uppercase",
      letterSpacing: 1.4,
      marginTop: 12,
    },
    anchorButtonSubLabel: {
      ...svaTypography.textStyle.caption,
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
  onAnchorHold,
}: MeditationProgressCardProps) => {
  const {
    newTheme: theme,
    spacing,
    svaTypography,
  } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
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
          ) : (
            <Text style={styles.anchorStampMuted}>
              Hold the anchor to lock in the session.
            </Text>
          )}
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
            style={({ pressed }) => [
              styles.quickAddChip,
              pressed && styles.quickAddChipPressed,
            ]}
          >
            <Text style={styles.quickAddChipText}>+{step}m</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.anchorStage}>
        <Pressable
          onLongPress={onAnchorHold}
          delayLongPress={650}
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
