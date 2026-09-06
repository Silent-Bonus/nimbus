import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import {
  BodyVitalsTrendChart,
  BodyVitalsTrendFilterGroup,
  BodyVitalsTrendSummaryGrid,
  BodyVitalsTrendTimelineCard,
  type BodyVitalsTrendSummaryItem,
} from "@/features/self-care/components/body-vitals";
import { getBodyVitalsTrends } from "@/features/self-care/services/body-vitals/trends";
import {
  useBodyVitalsTheme,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import {
  BODY_VITALS_TREND_METRIC_OPTIONS,
  BODY_VITALS_TREND_RANGE_OPTIONS,
  formatBodyVitalsTrendChange,
  formatBodyVitalsTrendMetricLabel,
  formatBodyVitalsTrendRangeLabel,
} from "@/features/self-care/utils/bodyVitalsTrends";
import type {
  BodyVitalsTrendMetric,
  BodyVitalsTrendRange,
  BodyVitalsTrendResponse,
} from "@/features/self-care/types/bodyVitals";
import type { ColorSet, Spacing } from "@/theme/types";

export default function BodyVitalsTrendsScreen() {
  const { newTheme, spacing, bodyVitalsTypography } = useBodyVitalsTheme();
  const [range, setRange] = useState<BodyVitalsTrendRange>("30d");
  const [metric, setMetric] = useState<BodyVitalsTrendMetric>("all");
  const [data, setData] = useState<BodyVitalsTrendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(
    () => styling(newTheme, spacing, bodyVitalsTypography),
    [newTheme, spacing, bodyVitalsTypography]
  );

  const loadTrends = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextData = await getBodyVitalsTrends(range, metric);
      setData(nextData);
    } catch (fetchError: any) {
      setError(fetchError?.message ?? "Unable to load trends.");
    } finally {
      setIsLoading(false);
    }
  }, [metric, range]);

  useEffect(() => {
    void loadTrends();
  }, [loadTrends]);

  const summaryCards = useMemo<BodyVitalsTrendSummaryItem[]>(
    () => [
      {
        key: "weight",
        label: "Weight Shift",
        value: formatBodyVitalsTrendChange(data?.summary.weight_change_30d, " kg"),
        accent: newTheme.chart3 ?? newTheme.warning,
        icon:
          (data?.summary.weight_change_30d ?? 0) <= 0
            ? "trending-down-outline"
            : "trending-up-outline",
      },
      {
        key: "waist",
        label: "Waist Shift",
        value: formatBodyVitalsTrendChange(data?.summary.waist_change_30d, " cm"),
        accent: newTheme.chart4 ?? newTheme.success,
        icon:
          (data?.summary.waist_change_30d ?? 0) <= 0
            ? "remove-outline"
            : "add-outline",
      },
      {
        key: "runs",
        label: "Snapshots",
        value: data?.summary.snapshots_count?.toString() ?? "0",
        accent: newTheme.chart2 ?? newTheme.info,
        icon: "albums-outline",
      },
    ],
    [
      data?.summary.snapshots_count,
      data?.summary.waist_change_30d,
      data?.summary.weight_change_30d,
      newTheme.chart2,
      newTheme.chart3,
      newTheme.chart4,
      newTheme.info,
      newTheme.success,
      newTheme.warning,
    ]
  );

  const timeline = data?.timeline ?? [];

  return (
    <ScreenView padding={0} bgColor={newTheme.background} style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppHeader
          title="Vitals Trends"
          subtitle="Tracked from persisted snapshots through September 2, 2026."
          onBack={() => router.back()}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          rightAction={{
            icon: "refresh-outline",
            onPress: () => {
              void loadTrends();
            },
            accessibilityLabel: "Refresh trends",
          }}
          containerStyle={styles.header}
        />

        <View style={styles.heroCard}>
          <LinearGradient
            colors={["rgba(94,129,172,0.18)", "rgba(163,190,140,0.08)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.heroEyebrow}>PERSISTED SNAPSHOTS</Text>
          <Text style={styles.heroTitle}>
            {formatBodyVitalsTrendRangeLabel(range)} •{" "}
            {formatBodyVitalsTrendMetricLabel(metric)}
          </Text>
          <Text style={styles.heroBody}>
            Review changes across saved body vitals only, without mixing in partial local edits.
          </Text>
        </View>

        <View style={styles.filterBlock}>
          <BodyVitalsTrendFilterGroup
            label="Range"
            options={BODY_VITALS_TREND_RANGE_OPTIONS}
            selectedValue={range}
            onSelect={setRange}
            getOptionLabel={(option) => option.toUpperCase()}
          />
          <BodyVitalsTrendFilterGroup
            label="Metric"
            options={BODY_VITALS_TREND_METRIC_OPTIONS}
            selectedValue={metric}
            onSelect={setMetric}
            getOptionLabel={formatBodyVitalsTrendMetricLabel}
          />
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={newTheme.accent} />
            <Text style={styles.stateText}>Loading trends...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={newTheme.warning}
            />
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => void loadTrends()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <BodyVitalsTrendSummaryGrid items={summaryCards} />

            <View style={styles.chartStack}>
              {(metric === "all" || metric === "weight") && (
                <BodyVitalsTrendChart
                  title="Weight Timeline"
                  metricKey="weight_kg"
                  unit="kg"
                  accent={newTheme.chart3 ?? newTheme.warning}
                  timeline={timeline}
                />
              )}

              {(metric === "all" || metric === "waist") && (
                <BodyVitalsTrendChart
                  title="Waist Timeline"
                  metricKey="waist_cm"
                  unit="cm"
                  accent={newTheme.chart4 ?? newTheme.success}
                  timeline={timeline}
                />
              )}
            </View>

            <BodyVitalsTrendTimelineCard timeline={timeline} />
          </>
        )}
      </ScrollView>
    </ScreenView>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: BodyVitalsTypography
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2.4,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...t.screenTitle,
      color: theme.textPrimary,
    },
    headerSubtitle: {
      ...t.screenSubtitle,
      color: theme.textSecondary,
      opacity: 0.9,
    },
    heroCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      padding: spacing.lg,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      marginBottom: spacing.lg,
    },
    heroEyebrow: {
      ...t.sectionLabel,
      color: theme.chart2 ?? theme.info,
      marginBottom: spacing.xs,
    },
    heroTitle: {
      ...t.screenTitle,
      color: theme.textPrimary,
      marginBottom: spacing.xs,
    },
    heroBody: {
      ...t.body,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    filterBlock: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    stateCard: {
      borderRadius: 22,
      padding: spacing.lg,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      alignItems: "center",
      gap: spacing.sm,
    },
    stateText: {
      ...t.body,
      color: theme.textSecondary,
      textAlign: "center",
    },
    retryButton: {
      marginTop: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
    },
    retryButtonText: {
      ...t.action,
      color: theme.textPrimary,
    },
    chartStack: {
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
  });
