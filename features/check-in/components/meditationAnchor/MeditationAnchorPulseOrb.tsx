import React, { useContext, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import {
  clamp,
  formatMinutes,
  formatTime,
} from "@/features/check-in/utils/meditationAnchor";
import { capSessionSeconds, formatSessionSeconds } from "@/utils/sessionTime";

type MeditationAnchorPulseOrbProps = {
  goalMinutes: number;
  elapsedSeconds: number;
  anchorAt: Date | null;
};

const getDisplayFont = (svaTypography?: TypographyTokens) =>
  svaTypography?.textStyle.authTitle?.fontFamily ??
  svaTypography?.textStyle.displayMedium?.fontFamily ??
  undefined;

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography?: TypographyTokens
) => {
  const displayFont = getDisplayFont(svaTypography) ?? typography.h1.fontFamily;

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
      minHeight: 470,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    sectionLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.7,
    },
    subTitle: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 18,
      maxWidth: 220,
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
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "800",
      fontSize: 13,
    },
    goalChipLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      marginTop: 1,
    },
    stage: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      minHeight: 300,
    },
    pulseRing: {
      position: "absolute",
      borderWidth: 1,
      borderRadius: 999,
      backgroundColor: "transparent",
    },
    orbCore: {
      position: "absolute",
      width: 168,
      height: 168,
      borderRadius: 84,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 7,
    },
    orbCoreSheen: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    orbMinutes: {
      ...typography.h1,
      color: theme.textPrimary,
      fontFamily: displayFont,
      fontSize: 40,
      lineHeight: 42,
      letterSpacing: -0.8,
    },
    orbGoal: {
      ...typography.body,
      color: theme.textSecondary,
      fontWeight: "700",
      marginTop: -2,
    },
    orbLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 2,
      marginTop: 8,
    },
    orbRemaining: {
      ...typography.caption,
      color: theme.textPrimary,
      opacity: 0.88,
      marginTop: 8,
      fontWeight: "700",
    },
    orbStatsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    orbStat: {
      flex: 1,
      alignItems: "center",
    },
    orbStatValue: {
      ...typography.h3,
      color: theme.textPrimary,
      fontFamily: displayFont,
      fontSize: 22,
      lineHeight: 24,
    },
    orbStatLabel: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 4,
    },
    orbStatDivider: {
      width: 1,
      height: 36,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
  });
};

export const MeditationAnchorPulseOrb = ({
  goalMinutes,
  elapsedSeconds,
  anchorAt,
}: MeditationAnchorPulseOrbProps) => {
  const { newTheme: theme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography, svaTypography),
    [theme, spacing, typography, svaTypography]
  );

  const pulseA = useRef(new Animated.Value(0)).current;
  const pulseB = useRef(new Animated.Value(0)).current;
  const pulseC = useRef(new Animated.Value(0)).current;
  const pulses = useMemo(() => [pulseA, pulseB, pulseC], [pulseA, pulseB, pulseC]);

  useEffect(() => {
    const animations = pulses.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 250),
          Animated.timing(value, {
            toValue: 1,
            duration: 1900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [pulses]);

  const goalSeconds = goalMinutes * 60;
  const displayedElapsedSeconds = capSessionSeconds(elapsedSeconds, goalSeconds);
  const fillProgress = clamp(displayedElapsedSeconds / Math.max(goalSeconds, 1), 0, 1);
  const filledMinutes = displayedElapsedSeconds / 60;
  const remainingMinutes = Math.max(goalMinutes - filledMinutes, 0);

  const orbSize = 280;
  const strokeWidth = 16;
  const ringRadius = (orbSize - strokeWidth) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference * (1 - fillProgress);

  const accent = theme.chart5 ?? theme.accent;
  const orbLabel = anchorAt ? `Anchored · ${formatTime(anchorAt)}` : "Anchoring...";

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", "rgba(163,190,140,0.12)"]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.sectionLabel}>PRESENCE FIELD</Text>
          <Text style={styles.subTitle}>
            A {goalMinutes}-minute anchor that breathes outward with you.
          </Text>
        </View>

        <View style={styles.goalChip}>
          <Text style={styles.goalChipValue}>{formatMinutes(goalMinutes)}</Text>
          <Text style={styles.goalChipLabel}>goal</Text>
        </View>
      </View>

      <View style={styles.stage}>
        {pulses.map((pulse, index) => {
          const scale = pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.84, 1.16 + index * 0.03],
          });
          const opacity = pulse.interpolate({
            inputRange: [0, 0.65, 1],
            outputRange: [0.24, 0.14, 0],
          });

          return (
            <Animated.View
              key={`pulse-${index}`}
              style={[
                styles.pulseRing,
                {
                  width: 170 + index * 28,
                  height: 170 + index * 28,
                  borderColor: accent,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            />
          );
        })}

        <Svg
          width={orbSize}
          height={orbSize}
          viewBox={`0 0 ${orbSize} ${orbSize}`}
        >
          <Circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={ringRadius}
            stroke={theme.borderMuted ?? "rgba(255,255,255,0.08)"}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={ringRadius}
            stroke={accent}
            strokeWidth={strokeWidth}
            strokeDasharray={`${ringCircumference} ${ringCircumference}`}
            strokeDashoffset={ringDashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${orbSize / 2} ${orbSize / 2})`}
            fill="none"
          />
        </Svg>

        <View style={styles.orbCore}>
          <LinearGradient
            colors={[
              "rgba(183, 222, 175, 0.26)",
              "rgba(163,190,140,0.18)",
              "rgba(18, 22, 16, 0.95)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.orbCoreSheen} />

          <Text style={styles.orbMinutes}>
            {formatSessionSeconds(displayedElapsedSeconds)}
          </Text>
          <Text style={styles.orbGoal}>/ {formatSessionSeconds(goalSeconds)}</Text>
          <Text style={styles.orbLabel}>{orbLabel}</Text>
          <Text style={styles.orbRemaining}>
            {formatMinutes(remainingMinutes)} remaining
          </Text>
        </View>
      </View>

      <View style={styles.orbStatsRow}>
        <View style={styles.orbStat}>
          <Text style={styles.orbStatValue}>{Math.round(fillProgress * 100)}%</Text>
          <Text style={styles.orbStatLabel}>filled</Text>
        </View>
        <View style={styles.orbStatDivider} />
        <View style={styles.orbStat}>
          <Text style={styles.orbStatValue}>{formatMinutes(remainingMinutes)}</Text>
          <Text style={styles.orbStatLabel}>left</Text>
        </View>
      </View>
    </View>
  );
};
