import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import OverviewSurfaceCard from "./OverviewSurfaceCard";
import RadarChart from "./RadarChart";
import type { RadarAxisPoint } from "./overviewTypes";
import type { SvaColorSet } from "@/theme/types";

type RitualRadarCardProps = {
  data: RadarAxisPoint[];
};

type RitualRadarTypography = {
  monoFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
};

type RitualRadarStyles = ReturnType<typeof createStyles>;

export default function RitualRadarCard({ data }: RitualRadarCardProps) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);

  const fonts = useMemo<RitualRadarTypography>(
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

  const styles: RitualRadarStyles = useMemo(
    () => createStyles(svaColors, fonts),
    [svaColors, fonts]
  );

  const highest = data.reduce(
    (best, item) => (item.value > best.value ? item : best),
    data[0] ?? { label: "", value: 0 }
  );

  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <OverviewSurfaceCard>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryLabel}>Most consistent</Text>
          <Text style={styles.summaryValue}>{highest.label}</Text>
        </View>
        <Text style={styles.summaryMetric}>{Math.round(highest.value)}%</Text>
      </View>

      <View style={styles.chartWrap}>
        <RadarChart data={data} colors={svaColors} />
      </View>

      <View style={styles.chipsRow}>
        {sorted.map((item, index) => {
          const toneColor =
            item.color ??
            [svaColors.chart.blue, svaColors.brand.primary, svaColors.chart.lavender][
              index % 3
            ];

          return (
            <View key={item.label} style={styles.chip}>
              <View style={[styles.chipDot, { backgroundColor: toneColor }]} />
              <Text style={styles.chipLabel} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.chipValue}>{Math.round(item.value)}%</Text>
            </View>
          );
        })}
      </View>
    </OverviewSurfaceCard>
  );
}

function createStyles(colors: SvaColorSet, fonts: RitualRadarTypography) {
  return StyleSheet.create({
    summaryRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 10,
    },
    summaryCopy: {
      flex: 1,
    },
    summaryLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    summaryValue: {
      marginTop: 2,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 18,
      lineHeight: 22,
    },
    summaryMetric: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.brand.primary,
      fontSize: 28,
      lineHeight: 30,
      letterSpacing: -0.4,
    },
    chartWrap: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      marginBottom: 6,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "space-between",
    },
    chip: {
      flexBasis: "31%",
      minWidth: 84,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    chipDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 8,
    },
    chipLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.text.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    chipValue: {
      marginTop: 4,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
    },
  });
}
