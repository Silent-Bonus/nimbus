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
  BodyVitalsTrendSummaryGrid,
  type BodyVitalsTrendSummaryItem,
} from "@/features/self-care/components/body-vitals";
import { getBodyVitalsTrends } from "@/features/self-care/services/body-vitals/trends";
import {
  useBodyVitalsTheme,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import {
  formatBodyVitalsTrendChange,
} from "@/features/self-care/utils/bodyVitalsTrends";
import type { BodyVitalsTrendResponse } from "@/features/self-care/types/bodyVitals";
import type { ColorSet, Spacing } from "@/theme/types";

export default function BodyVitalsTrendsScreen() {
  const { newTheme, spacing, bodyVitalsTypography } = useBodyVitalsTheme();
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
      const nextData = await getBodyVitalsTrends();
      setData(nextData);
    } catch (fetchError: any) {
      setError(fetchError?.message ?? "Unable to load trends.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrends();
  }, [loadTrends]);

  const summaryCards = useMemo<BodyVitalsTrendSummaryItem[]>(
    () => [
      {
        key: "weight",
        label: "Weight Shift",
        value: formatBodyVitalsTrendChange(data?.summary.weight_change_30d ?? data?.summary.metrics?.weight?.change, " kg"),
        accent: newTheme.chart3 ?? newTheme.warning,
        icon:
          (data?.summary.weight_change_30d ?? data?.summary.metrics?.weight?.change ?? 0) <= 0
            ? "trending-down-outline"
            : "trending-up-outline",
      },
      {
        key: "waist",
        label: "Waist Shift",
        value: formatBodyVitalsTrendChange(data?.summary.waist_change_30d ?? data?.summary.metrics?.waist?.change, " cm"),
        accent: newTheme.chart4 ?? newTheme.success,
        icon:
          (data?.summary.waist_change_30d ?? data?.summary.metrics?.waist?.change ?? 0) <= 0
            ? "remove-outline"
            : "add-outline",
      },
    ],
    [
      data?.summary.metrics?.weight?.change,
      data?.summary.metrics?.waist?.change,
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
          subtitle="See how your body metrics change over time."
          onBack={() => router.back()}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
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
          <Text style={styles.heroTitle}>Your progress</Text>
          <Text style={styles.heroBody}>
            Review changes across saved body vitals only, without mixing in partial local edits.
          </Text>
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
              <BodyVitalsTrendChart
                title="Weight Timeline"
                metricKey="weight_kg"
                unit="kg"
                accent={newTheme.chart3 ?? newTheme.warning}
                timeline={timeline}
              />
              <BodyVitalsTrendChart
                title="Waist Timeline"
                metricKey="waist_cm"
                unit="cm"
                accent={newTheme.chart4 ?? newTheme.success}
                timeline={timeline}
              />
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
