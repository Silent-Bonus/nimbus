import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import ThemeContext from "@/contexts/ThemeContext";
import OverviewSurfaceCard from "./OverviewSurfaceCard";
import type { MonthlyPulsePoint } from "./overviewTypes";
import type { SvaColorSet } from "@/theme/types";

type MonthlyPulseCardProps = {
  data: MonthlyPulsePoint[];
};

type MonthlyPulseTypography = {
  monoFamily: string;
  bodyFamily: string;
};

type MonthlyPulseStyles = ReturnType<typeof createStyles>;

export default function MonthlyPulseCard({ data }: MonthlyPulseCardProps) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);

  const fonts = useMemo<MonthlyPulseTypography>(
    () => ({
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Outfit_400Regular",
    }),
    [svaTypography, typography]
  );

  const styles: MonthlyPulseStyles = useMemo(
    () => createStyles(svaColors, fonts),
    [svaColors, fonts]
  );

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        value: item.value,
        label: item.label,
        frontColor:
          item.color ??
          [svaColors.chart.blue, svaColors.chart.lavender, svaColors.chart.amber, svaColors.chart.seafoam][index % 4],
      })),
    [data, svaColors]
  );

  const peak = data.length > 0 ? Math.max(...data.map((item) => item.value)) : 0;

  return (
    <OverviewSurfaceCard>
      <View style={styles.headerRow}>
        <Text style={styles.badge}>ACTIVITY SPLIT</Text>
        <Text style={styles.peakLabel}>{peak}% peak</Text>
      </View>

      <BarChart
        data={chartData}
        height={180}
        barWidth={28}
        spacing={14}
        initialSpacing={10}
        endSpacing={10}
        barBorderRadius={10}
        noOfSections={4}
        maxValue={100}
        hideRules
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{ color: "transparent" }}
        xAxisLabelTextStyle={styles.axisLabel}
        isAnimated
      />

      <Text style={styles.caption}>
        W2 is carrying the strongest pulse while the middle of the month stays
        steady.
      </Text>
    </OverviewSurfaceCard>
  );
}

function createStyles(colors: SvaColorSet, fonts: MonthlyPulseTypography) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    badge: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    peakLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.chart.blue,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    axisLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1,
      marginTop: 4,
    },
    caption: {
      marginTop: 2,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
  });
}
