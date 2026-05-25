import React, { useContext, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import OverviewSurfaceCard from "./OverviewSurfaceCard";
import type { CoreVitalMetric } from "./overviewTypes";
import type { SvaColorSet } from "@/theme/types";

type CoreVitalsBlockProps = {
  metrics: CoreVitalMetric[];
};

type CoreVitalsTypography = {
  monoFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
};

type CoreVitalsStyles = ReturnType<typeof createStyles>;

type ToneName = CoreVitalMetric["tone"];

const TONE_MAP: Record<
  ToneName,
  { accentKey: keyof SvaColorSet["chart"] }
> = {
  blue: { accentKey: "blue" },
  amber: { accentKey: "amber" },
  violet: { accentKey: "lavender" },
  green: { accentKey: "seafoam" },
};

export default function CoreVitalsBlock({ metrics }: CoreVitalsBlockProps) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);

  const fonts = useMemo<CoreVitalsTypography>(
    () => ({
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Outfit_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Outfit_600SemiBold",
    }),
    [svaTypography, typography]
  );

  const styles: CoreVitalsStyles = useMemo(
    () => createStyles(svaColors, fonts),
    [svaColors, fonts]
  );

  const left = metrics[0];
  const topRight = metrics[1];
  const bottomRight = metrics[2];

  return (
    <OverviewSurfaceCard>
      <View style={styles.grid}>
        {left ? (
          <VitalTile
            metric={left}
            styles={styles}
            colors={svaColors}
            fonts={fonts}
            size="large"
          />
        ) : null}

        <View style={styles.rightColumn}>
          {topRight ? (
            <VitalTile
              metric={topRight}
              styles={styles}
              colors={svaColors}
              fonts={fonts}
              size="compact"
            />
          ) : null}

          {bottomRight ? (
            <VitalTile
              metric={bottomRight}
              styles={styles}
              colors={svaColors}
              fonts={fonts}
              size="compact"
            />
          ) : null}
        </View>
      </View>
    </OverviewSurfaceCard>
  );
}

function VitalTile({
  metric,
  colors,
  fonts,
  styles,
  size,
}: {
  metric: CoreVitalMetric;
  colors: SvaColorSet;
  fonts: CoreVitalsTypography;
  styles: CoreVitalsStyles;
  size: "large" | "compact";
}) {
  const tone = TONE_MAP[metric.tone];
  const accentColor = colors.chart[tone.accentKey] ?? colors.brand.primary;
  const isLarge = size === "large";

  return (
    <LinearGradient
      colors={[colors.surface.raised, colors.surface.base]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tile, isLarge ? styles.largeTile : styles.compactTile]}
    >
      <View
        style={[
          styles.accentGlow,
          { backgroundColor: accentColor, opacity: isLarge ? 0.14 : 0.1 },
        ]}
      />

      <View style={styles.iconRing}>
        <Ionicons name={metric.icon} size={isLarge ? 18 : 16} color={accentColor} />
      </View>

      <View style={styles.metricCopy}>
        <Text
          style={[styles.metricValue, isLarge ? styles.metricValueLarge : styles.metricValueCompact]}
          numberOfLines={1}
        >
          {metric.value}
        </Text>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {metric.label.toUpperCase()}
        </Text>
        <Text style={styles.metricDetail} numberOfLines={2}>
          {metric.detail}
        </Text>
      </View>
    </LinearGradient>
  );
}

function createStyles(colors: SvaColorSet, fonts: CoreVitalsTypography) {
  return StyleSheet.create({
    grid: {
      flexDirection: "row",
      gap: 12,
      alignItems: "stretch",
    },
    rightColumn: {
      flex: 0.92,
      gap: 12,
    },
    tile: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: 14,
      justifyContent: "space-between",
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    largeTile: {
      flex: 1.08,
      minHeight: 194,
    },
    compactTile: {
      minHeight: 91,
    },
    accentGlow: {
      position: "absolute",
      right: -10,
      top: -8,
      width: 90,
      height: 90,
      borderRadius: 45,
    },
    iconRing: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    metricCopy: {
      flex: 1,
      justifyContent: "flex-end",
    },
    metricValue: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      letterSpacing: -0.3,
    },
    metricValueLarge: {
      fontSize: 36,
      lineHeight: 38,
      marginTop: 10,
    },
    metricValueCompact: {
      fontSize: 24,
      lineHeight: 28,
      marginTop: 10,
    },
    metricLabel: {
      marginTop: 2,
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      textTransform: "uppercase",
    },
    metricDetail: {
      marginTop: 5,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 11.5,
      lineHeight: 15,
    },
  });
}
