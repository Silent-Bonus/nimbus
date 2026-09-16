import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "../../../../contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "../../../../theme/types";
import {
  WATER_STEP_ML,
  clamp,
  formatLiters,
} from "../../utils/hydration";

type HydrationHeroCardProps = {
  currentMl: number;
  goalMl: number;
  onChange: (value: number) => void;
};

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
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
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 20,
      elevation: 8,
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroEyebrow: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.72,
      letterSpacing: 1.6,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    heroAmount: {
      color: theme.textPrimary,
    },
    heroAmountValue: {
      ...svaTypography.textStyle.heading1,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: -0.6,
    },
    heroAmountGoal: {
      ...svaTypography.textStyle.authLabel,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.selected ?? "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
      alignSelf: "flex-start",
    },
    heroBadgeText: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    jarStage: {
      alignItems: "center",
      marginTop: spacing.lg,
    },
    jarHint: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.74,
      letterSpacing: 2.4,
      marginBottom: spacing.sm,
      textTransform: "uppercase",
    },
    jarShell: {
      width: 132,
      height: 220,
      borderRadius: 36,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      backgroundColor: "rgba(255,255,255,0.02)",
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    jarFill: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },
    jarSurfaceSheen: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
    jarRim: {
      position: "absolute",
      top: 12,
      left: 16,
      right: 16,
      height: 1,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    jarGlossLeft: {
      position: "absolute",
      top: 26,
      left: 10,
      bottom: 18,
      width: 16,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    jarGlossRight: {
      position: "absolute",
      top: 26,
      right: 10,
      bottom: 18,
      width: 12,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    sliderWrap: {
      marginTop: spacing.xl,
    },
    slider: {
      width: "100%",
      height: 28,
    },
    scaleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 2,
    },
    scaleLabel: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      opacity: 0.74,
    },
  });

export const HydrationHeroCard = ({
  currentMl,
  goalMl,
  onChange,
}: HydrationHeroCardProps) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const progress = goalMl > 0 ? clamp(currentMl / goalMl, 0, 1) : 0;
  const accent = theme.chart2 ?? theme.accent;
  const gradientAccent = theme.chart5 ?? theme.gradBlue ?? accent;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", "rgba(121,169,242,0.16)"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.heroTopRow}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroEyebrow}>TODAY&apos;S BALANCE</Text>
          <Text style={styles.heroAmount}>
            <Text style={styles.heroAmountValue}>{formatLiters(currentMl)}</Text>
            <Text style={styles.heroAmountGoal}> / {formatLiters(goalMl)}</Text>
          </Text>
        </View>

        <View style={styles.heroBadge}>
          <Ionicons name="water-outline" size={15} color={accent} />
          <Text style={styles.heroBadgeText}>250ml steps</Text>
        </View>
      </View>

      <View style={styles.jarStage}>
        <Text style={styles.jarHint}>SLIDE TO FILL</Text>

        <View style={styles.jarShell}>
          <LinearGradient
            colors={["rgba(255,255,255,0.03)", "rgba(255,255,255,0.00)"]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />

          <View
            style={[
              styles.jarFill,
              {
                height: `${Math.max(0, progress * 100)}%`,
              },
            ]}
          >
            <LinearGradient
              colors={[accent, gradientAccent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.jarSurfaceSheen} />
          </View>

          <View style={styles.jarRim} />
          <View style={styles.jarGlossLeft} />
          <View style={styles.jarGlossRight} />
        </View>
      </View>

      <View style={styles.sliderWrap}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={goalMl}
          step={WATER_STEP_ML}
          value={currentMl}
          minimumTrackTintColor={accent}
          maximumTrackTintColor={theme.borderMuted ?? "rgba(255,255,255,0.12)"}
          thumbTintColor={accent}
          onValueChange={onChange}
        />
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleLabel}>0</Text>
        <Text style={styles.scaleLabel}>{formatLiters(goalMl / 2)}</Text>
        <Text style={styles.scaleLabel}>{formatLiters(goalMl)}</Text>
      </View>
    </View>
  );
};
