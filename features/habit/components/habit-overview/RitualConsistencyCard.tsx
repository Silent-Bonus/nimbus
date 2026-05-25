import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";

import ThemeContext from "@/contexts/ThemeContext";
import OverviewSurfaceCard from "./OverviewSurfaceCard";
import type { SvaColorSet } from "@/theme/types";
import type { TrendPoint } from "./overviewTypes";

type RitualConsistencyCardProps = {
  data: TrendPoint[];
  completionLabel?: string;
};

type RitualConsistencyTypography = {
  monoFamily: string;
  bodyStrongFamily: string;
};

type RitualConsistencyStyles = ReturnType<typeof createStyles>;

export default function RitualConsistencyCard({
  data,
  completionLabel = "Average completion",
}: RitualConsistencyCardProps) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);

  const fonts = useMemo<RitualConsistencyTypography>(
    () => ({
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Outfit_600SemiBold",
    }),
    [svaTypography, typography]
  );

  const styles: RitualConsistencyStyles = useMemo(
    () => createStyles(svaColors, fonts),
    [svaColors, fonts]
  );

  const latestValue = data[data.length - 1]?.value ?? 0;

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        value: item.value,
        label: item.label,
        dataPointRadius: index === data.length - 1 ? 5 : 3.5,
        dataPointColor:
          index === data.length - 1
            ? svaColors.brand.primary
            : svaColors.chart.blue,
        hideDataPoint: false,
      })),
    [data, svaColors.brand.primary, svaColors.chart.blue]
  );

  return (
    <OverviewSurfaceCard>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.value}>{latestValue}%</Text>
          <Text style={styles.label}>{completionLabel.toUpperCase()}</Text>
        </View>

        <View style={styles.menuPill}>
          <Ionicons
            name="ellipsis-horizontal"
            size={16}
            color={svaColors.text.secondary}
          />
        </View>
      </View>

      <View style={styles.chartWrap}>
        <LineChart
          data={chartData}
          curved
          areaChart
          height={180}
          thickness={3}
          hideRules
          hideYAxisText
          yAxisColor="transparent"
          xAxisColor="transparent"
          color={svaColors.chart.blue}
          startFillColor={svaColors.chart.blue}
          endFillColor={svaColors.brand.primary}
          startOpacity={0.24}
          endOpacity={0.04}
          initialSpacing={12}
          endSpacing={12}
          noOfSections={4}
          xAxisLabelTextStyle={styles.xAxisLabel}
          isAnimated
        />
      </View>
    </OverviewSurfaceCard>
  );
}

function createStyles(
  colors: SvaColorSet,
  fonts: RitualConsistencyTypography
) {
  return StyleSheet.create({
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 8,
    },
    value: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 34,
      lineHeight: 36,
      letterSpacing: -0.6,
    },
    label: {
      marginTop: 2,
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10.5,
      lineHeight: 13,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    menuPill: {
      width: 32,
      height: 32,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    chartWrap: {
      marginTop: 4,
    },
    xAxisLabel: {
      fontSize: 10.5,
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      marginTop: 4,
      letterSpacing: 1,
    },
  });
}
