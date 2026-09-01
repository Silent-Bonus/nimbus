import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import ThemeContext from "@/contexts/ThemeContext";
import { getBodyVitalsTrends } from "@/features/self-care/services/bodyVitalsTrendService";
import { resolveBodyVitalsTypography } from "@/features/self-care/utils/bodyVitalsTheme";
import type {
  BodyVitalsTrendMetric,
  BodyVitalsTrendRange,
  BodyVitalsTrendResponse,
  BodyVitalsTrendTimelinePoint,
} from "@/features/self-care/types/bodyVitals";
import type { ColorSet, Spacing } from "@/theme/types";

const RANGE_OPTIONS: BodyVitalsTrendRange[] = ["7d", "30d", "90d"];
const METRIC_OPTIONS: BodyVitalsTrendMetric[] = ["all", "weight", "waist"];

function formatMetricLabel(metric: BodyVitalsTrendMetric) {
  if (metric === "all") return "All Metrics";
  if (metric === "weight") return "Weight";
  return "Waist";
}

function formatRangeLabel(range: BodyVitalsTrendRange) {
  if (range === "7d") return "7 Days";
  if (range === "30d") return "30 Days";
  return "90 Days";
}

function formatChange(value: number | null | undefined, unit: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${unit}`;
}

function formatSnapshotDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getMetricValues(
  timeline: BodyVitalsTrendTimelinePoint[],
  metric: "weight_kg" | "waist_cm"
) {
  return timeline
    .map((point) => point[metric])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function getBarHeight(value: number | null | undefined, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.28;
  }

  if (max === min) {
    return 0.62;
  }

  return 0.28 + ((value - min) / (max - min)) * 0.58;
}

function TrendChart({
  title,
  metricKey,
  unit,
  accent,
  timeline,
}: {
  title: string;
  metricKey: "weight_kg" | "waist_cm";
  unit: string;
  accent: string;
  timeline: BodyVitalsTrendTimelinePoint[];
}) {
  const { newTheme, spacing, typography, svaTypography } = useContext(ThemeContext);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
  const styles = useMemo(
    () => makeChartStyles(newTheme, spacing, t),
    [newTheme, spacing, t]
  );
  const values = useMemo(() => getMetricValues(timeline, metricKey), [timeline, metricKey]);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.valueHint, { color: accent }]}>
          {values.length ? `${values[values.length - 1]} ${unit}` : "No data"}
        </Text>
      </View>

      <View style={styles.chartRow}>
        {timeline.map((point) => {
          const value = point[metricKey];
          const barHeight = getBarHeight(value, min, max);

          return (
            <View key={`${metricKey}-${point.date}`} style={styles.barColumn}>
              <Text style={styles.metricValue}>
                {typeof value === "number" ? `${value}` : "--"}
              </Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: accent,
                      height: `${Math.round(barHeight * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dateLabel}>{formatSnapshotDate(point.date)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function makeChartStyles(
  theme: ColorSet,
  spacing: Spacing,
  t: ReturnType<typeof resolveBodyVitalsTypography>
) {
  return StyleSheet.create({
    card: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surface,
      padding: spacing.md,
      gap: spacing.md,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    title: {
      ...t.bodyMedium,
      color: theme.textPrimary,
    },
    valueHint: {
      ...t.label,
      letterSpacing: 1.2,
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: spacing.sm,
      minHeight: 152,
    },
    barColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: spacing.xs,
    },
    metricValue: {
      ...t.caption,
      color: theme.textSecondary,
      minHeight: 18,
    },
    track: {
      width: "100%",
      maxWidth: 28,
      height: 92,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    bar: {
      width: "100%",
      borderRadius: 999,
      minHeight: 10,
    },
    dateLabel: {
      ...t.caption,
      color: theme.textSecondary,
      fontSize: 11,
      textAlign: "center",
    },
  });
}

export default function BodyVitalsTrendsScreen() {
  const { newTheme, spacing, typography, svaTypography } = useContext(ThemeContext);
  const [range, setRange] = useState<BodyVitalsTrendRange>("30d");
  const [metric, setMetric] = useState<BodyVitalsTrendMetric>("all");
  const [data, setData] = useState<BodyVitalsTrendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
  const styles = useMemo(
    () => styling(newTheme, spacing, t),
    [newTheme, spacing, t]
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

  const summaryCards = useMemo(
    () => [
      {
        key: "weight",
        label: "Weight Shift",
        value: formatChange(data?.summary.weight_change_30d, " kg"),
        accent: newTheme.chart3 ?? newTheme.warning,
        icon:
          (data?.summary.weight_change_30d ?? 0) <= 0
            ? "trending-down-outline"
            : "trending-up-outline",
      },
      {
        key: "waist",
        label: "Waist Shift",
        value: formatChange(data?.summary.waist_change_30d, " cm"),
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
            {formatRangeLabel(range)} • {formatMetricLabel(metric)}
          </Text>
          <Text style={styles.heroBody}>
            Review changes across saved body vitals only, without mixing in partial local edits.
          </Text>
        </View>

        <View style={styles.filterBlock}>
          <Text style={styles.filterLabel}>Range</Text>
          <View style={styles.filterRow}>
            {RANGE_OPTIONS.map((option) => {
              const active = option === range;

              return (
                <Pressable
                  key={option}
                  onPress={() => setRange(option)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {option.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.filterLabel}>Metric</Text>
          <View style={styles.filterRow}>
            {METRIC_OPTIONS.map((option) => {
              const active = option === metric;

              return (
                <Pressable
                  key={option}
                  onPress={() => setMetric(option)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {formatMetricLabel(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
            <View style={styles.summaryGrid}>
              {summaryCards.map((item) => (
                <View key={item.key} style={styles.summaryCard}>
                  <View style={[styles.summaryIconWrap, { backgroundColor: `${item.accent}22` }]}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={item.accent} />
                  </View>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.chartStack}>
              {(metric === "all" || metric === "weight") && (
                <TrendChart
                  title="Weight Timeline"
                  metricKey="weight_kg"
                  unit="kg"
                  accent={newTheme.chart3 ?? newTheme.warning}
                  timeline={timeline}
                />
              )}

              {(metric === "all" || metric === "waist") && (
                <TrendChart
                  title="Waist Timeline"
                  metricKey="waist_cm"
                  unit="cm"
                  accent={newTheme.chart4 ?? newTheme.success}
                  timeline={timeline}
                />
              )}
            </View>

            <View style={styles.timelineCard}>
              <Text style={styles.timelineTitle}>Snapshot Timeline</Text>
              {timeline.length ? (
                timeline.map((point, index) => (
                  <View key={`${point.date}-${index}`} style={styles.timelineRow}>
                    <View style={styles.timelineDotColumn}>
                      <View style={styles.timelineDot} />
                      {index < timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineDate}>{formatSnapshotDate(point.date)}</Text>
                      <Text style={styles.timelineMetrics}>
                        {typeof point.weight_kg === "number"
                          ? `${point.weight_kg} kg`
                          : "--"}
                        {" • "}
                        {typeof point.waist_cm === "number"
                          ? `${point.waist_cm} cm`
                          : "--"}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No persisted snapshots found for this filter.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenView>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: ReturnType<typeof resolveBodyVitalsTypography>
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
      ...t.label,
      color: theme.chart2 ?? theme.info,
      letterSpacing: 2.2,
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
    filterLabel: {
      ...t.label,
      color: theme.textSecondary,
      letterSpacing: 1.5,
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
    },
    filterChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterChipText: {
      ...t.action,
      color: theme.textPrimary,
    },
    filterChipTextActive: {
      color: theme.background,
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
      fontSize: 12,
      letterSpacing: 1,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    summaryCard: {
      flex: 1,
      minHeight: 118,
      borderRadius: 22,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.md,
      justifyContent: "space-between",
    },
    summaryIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryLabel: {
      ...t.sectionLabel,
      color: theme.textSecondary,
    },
    summaryValue: {
      ...t.heroDisplay,
      color: theme.textPrimary,
      fontSize: 20,
      lineHeight: 24,
    },
    chartStack: {
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    timelineCard: {
      borderRadius: 24,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    timelineTitle: {
      ...t.sectionTitle,
      color: theme.textPrimary,
      fontSize: 22,
      lineHeight: 26,
      marginBottom: spacing.md,
    },
    timelineRow: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    timelineDotColumn: {
      width: 20,
      alignItems: "center",
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 5,
      backgroundColor: theme.accent,
    },
    timelineLine: {
      flex: 1,
      width: 1,
      backgroundColor: theme.borderMuted ?? theme.border,
      marginTop: 6,
      marginBottom: 2,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: spacing.md,
      paddingLeft: spacing.sm,
    },
    timelineDate: {
      ...t.body,
      color: theme.textPrimary,
      fontWeight: "700",
      marginBottom: 2,
    },
    timelineMetrics: {
      ...t.caption,
      color: theme.textSecondary,
    },
    emptyText: {
      ...t.body,
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
