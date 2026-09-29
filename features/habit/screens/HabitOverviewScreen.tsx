import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenView } from "@/components/ui/Themed";
import AppHeader from "@/components/layout/AppHeader";
import ThemeContext from "@/contexts/ThemeContext";
import OverviewSectionHeader from "@/features/habit/components/habit-overview/OverviewSectionHeader";
import RitualConsistencyCard from "@/features/habit/components/habit-overview/RitualConsistencyCard";
import CoreVitalsBlock from "@/features/habit/components/habit-overview/CoreVitalsBlock";
import MonthlyPulseCard from "@/features/habit/components/habit-overview/MonthlyPulseCard";
import RitualRadarCard from "@/features/habit/components/habit-overview/RitualRadarCard";
import type {
  CoreVitalMetric,
  MonthlyPulsePoint,
  RadarAxisPoint,
  TrendPoint,
} from "@/features/habit/components/habit-overview/overviewTypes";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";
import {
  getWellnessDashboard,
  type WellnessDashboard,
} from "@/features/habit/services/wellnessDashboardService";
import { getDoshaProfile, type DoshaProfile } from "@/features/habit/services/doshaProfileService";

type HabitOverviewStyles = ReturnType<typeof createStyles>;
type OverviewTab = "resonance" | "dosha";
type DoshaKey = "vata" | "pitta" | "kapha";

const DOSHA_PROFILES: {
  key: DoshaKey;
  label: string;
  description: string;
}[] = [
  {
    key: "vata",
    label: "Vata",
    description: "Movement, creativity, and adaptability.",
  },
  {
    key: "pitta",
    label: "Pitta",
    description: "Focus, transformation, and purposeful energy.",
  },
  {
    key: "kapha",
    label: "Kapha",
    description: "Stability, nourishment, and grounded presence.",
  },
];

export const HabitOverviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const [dashboard, setDashboard] = useState<WellnessDashboard | null>(null);
  const [activeTab, setActiveTab] = useState<OverviewTab>("resonance");
  const [doshaProfile, setDoshaProfile] = useState<DoshaProfile | null>(null);
  const [isLoadingDosha, setIsLoadingDosha] = useState(false);
  const [doshaError, setDoshaError] = useState<string | null>(null);
  const styles: HabitOverviewStyles = useMemo(
    () => createStyles(spacing, insets.bottom, svaTypography, svaColors),
    [spacing, insets.bottom, svaTypography, svaColors]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;
    void getWellnessDashboard("7d").then((nextDashboard) => {
      if (active) setDashboard(nextDashboard);
    });

    return () => {
      active = false;
    };
  }, []);

  const loadDoshaProfile = useCallback(async () => {
    setIsLoadingDosha(true);
    setDoshaError(null);
    try {
      const response = await getDoshaProfile();
      if (!response.success) throw new Error(response.message || "Could not load your Dosha profile.");
      setDoshaProfile(response.data ?? null);
    } catch (error) {
      setDoshaError(error instanceof Error ? error.message : "Could not load your Dosha profile. Please try again.");
    } finally {
      setIsLoadingDosha(false);
    }
  }, []);

  const handleTabPress = useCallback((tab: OverviewTab) => {
    setActiveTab(tab);
    if (tab === "dosha") void loadDoshaProfile();
  }, [loadDoshaProfile]);

  const doshaResult = doshaProfile?.result?.result_payload;

  const trendData = useMemo<TrendPoint[]>(
    () =>
      dashboard
        ? dashboard.ritual_consistency.timeline.map((point) => ({
            label: new Date(`${point.date}T00:00:00`).toLocaleDateString([], {
              weekday: "short",
            }),
            value: point.active ? 100 : 0,
          }))
        : [
            { label: "Mon", value: 74 },
            { label: "Tue", value: 69 },
            { label: "Wed", value: 71 },
            { label: "Thu", value: 77 },
            { label: "Fri", value: 73 },
            { label: "Sat", value: 86 },
            { label: "Sun", value: 92 },
          ],
    [dashboard]
  );

  const coreVitals = useMemo<CoreVitalMetric[]>(
    () =>
      dashboard
        ? [
            {
              key: "zen",
              label: "Zen Minutes",
              value: String(dashboard.core_vitals.zen_minutes),
              detail: "Completed mindful minutes in this period.",
              icon: "leaf-outline" as const,
              tone: "blue" as const,
              emphasis: "primary" as const,
            },
            {
              key: "sleep",
              label: "Sleep Consistency",
              value: dashboard.core_vitals.sleep_consistency.available
                ? `${dashboard.core_vitals.sleep_consistency.percentage}%`
                : "—",
              detail: dashboard.core_vitals.sleep_consistency.available
                ? `${dashboard.core_vitals.sleep_consistency.tracked_days} tracked days.`
                : "Sleep tracking is not available yet.",
              icon: "moon-outline" as const,
              tone: "violet" as const,
            },
            {
              key: "workouts",
              label: "Workout Sessions",
              value: String(dashboard.core_vitals.workout_sessions),
              detail: `${dashboard.core_vitals.daily_checkins_completed} daily check-ins completed.`,
              icon: "flash-outline" as const,
              tone: "amber" as const,
            },
          ]
        : [
            {
              key: "zen",
              label: "Zen Minutes",
              value: "482",
              detail: "Quiet focused time logged this week.",
              icon: "leaf-outline" as const,
              tone: "blue" as const,
              emphasis: "primary" as const,
            },
            {
              key: "sleep",
              label: "Sleep Quality",
              value: "84%",
              detail: "Stable recovery and cleaner evenings.",
              icon: "moon-outline" as const,
              tone: "violet" as const,
            },
            {
              key: "intensity",
              label: "Intensity",
              value: "7.2",
              detail: "Effort is up, but still sustainable.",
              icon: "flash-outline" as const,
              tone: "amber" as const,
            },
          ],
    [dashboard]
  );

  const monthlyPulse = useMemo<MonthlyPulsePoint[]>(
    () =>
      dashboard
        ? [
            { label: "Active days", value: dashboard.monthly_pulse.active_days, color: svaColors.chart.blue },
            { label: "Sessions", value: dashboard.monthly_pulse.session_count, color: svaColors.chart.lavender },
            { label: "Mood", value: dashboard.monthly_pulse.mood_checkins_completed, color: svaColors.chart.amber },
            { label: "Check-ins", value: dashboard.monthly_pulse.daily_checkins_completed, color: svaColors.brand.primary },
          ]
        : [
            { label: "W1", value: 58, color: svaColors.chart.blue },
            { label: "W2", value: 84, color: svaColors.chart.lavender },
            { label: "W3", value: 62, color: svaColors.chart.amber },
            { label: "W4", value: 76, color: svaColors.brand.primary },
          ],
    [dashboard, svaColors.brand.primary, svaColors.chart.amber, svaColors.chart.blue, svaColors.chart.lavender]
  );

  const radarData = useMemo<RadarAxisPoint[]>(
    () =>
      dashboard
        ? [
            { label: "Mind", value: dashboard.ritual_balance.percentages.mind, color: svaColors.brand.primary },
            { label: "Body", value: dashboard.ritual_balance.percentages.body, color: svaColors.chart.blue },
            { label: "Soul", value: dashboard.ritual_balance.percentages.soul, color: svaColors.chart.lavender },
          ]
        : [
            { label: "Move", value: 76, color: svaColors.chart.blue },
            { label: "Mind", value: 91, color: svaColors.brand.primary },
            { label: "Body", value: 84, color: svaColors.chart.lavender },
          ],
    [dashboard, svaColors.brand.primary, svaColors.chart.blue, svaColors.chart.lavender]
  );

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppHeader
          title="Holistic Overview"
          subtitle="Quantifying your inner growth"
          onBack={() => navigation.goBack()}
          containerStyle={styles.header}
        />

        <View style={styles.tabBar} accessibilityRole="tablist">
          {([
            ["resonance", "Resonance Overview"],
            ["dosha", "Dosha Overview"],
          ] as const).map(([value, label]) => {
            const selected = activeTab === value;

            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => handleTabPress(value)}
                style={[styles.tab, selected && styles.tabActive]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "resonance" ? (
          <>
            <View style={styles.sectionBlock}>
              <OverviewSectionHeader
                title="Ritual Consistency"
                accessoryLabel="Past 7 days"
              />
              <RitualConsistencyCard
                data={trendData}
                headlineValue={dashboard?.ritual_consistency.percentage}
              />
            </View>

            <View style={styles.sectionBlock}>
              <OverviewSectionHeader title="Core Vitals" />
              <CoreVitalsBlock metrics={coreVitals} />
            </View>

            <View style={styles.sectionBlock}>
              <OverviewSectionHeader
                title="Monthly Pulse"
                accessoryLabel="Activity split"
              />
              <MonthlyPulseCard
                data={monthlyPulse}
                valueSuffix={dashboard ? "" : "%"}
                caption={
                  dashboard
                    ? "Monthly activity across sessions, mood, and daily check-ins."
                    : undefined
                }
              />
            </View>

            <View style={styles.sectionBlock}>
              <OverviewSectionHeader
                title="Ritual Balance"
                accessoryLabel={dashboard ? "Mind • Body • Soul" : "Move • Mind • Body"}
              />
              <RitualRadarCard data={radarData} />
            </View>
          </>
        ) : (
          <View style={styles.doshaSection}>
            <OverviewSectionHeader
              title="Dosha Profile"
              accessoryLabel="Your constitution"
            />
            {isLoadingDosha ? (
              <View style={styles.doshaState}>
                <ActivityIndicator color={svaColors.brand.primary} />
                <Text style={styles.doshaStateText}>Loading your Dosha profile…</Text>
              </View>
            ) : doshaError ? (
              <View style={styles.doshaState}>
                <Text style={styles.doshaStateText}>{doshaError}</Text>
                <Pressable accessibilityRole="button" onPress={() => void loadDoshaProfile()} style={styles.doshaRetry}>
                  <Text style={styles.doshaRetryText}>Try again</Text>
                </Pressable>
              </View>
            ) : !doshaResult ? (
              <View style={styles.doshaState}>
                <Text style={styles.doshaEmptyTitle}>Your Dosha profile is not ready yet</Text>
                <Text style={styles.doshaStateText}>Complete a Dosha assessment to see your constitution and scores here.</Text>
              </View>
            ) : (
              <>
                <View style={styles.doshaResultCard}>
                  <Text style={styles.doshaResultEyebrow}>YOUR CONSTITUTION</Text>
                  <Text style={styles.doshaCombination}>{formatDoshaName(doshaResult.dosha_combination)}</Text>
                  <Text style={styles.doshaResultMeta}>
                    Dominant · {formatDoshaName(doshaResult.dominant_dosha)}
                    {doshaResult.secondary_dosha ? `   Secondary · ${formatDoshaName(doshaResult.secondary_dosha)}` : ""}
                  </Text>
                  {!!(doshaResult.result_summary || doshaProfile.result?.result_summary) && (
                    <Text style={styles.doshaSummary}>{doshaResult.result_summary || doshaProfile.result?.result_summary}</Text>
                  )}
                </View>
                {DOSHA_PROFILES.map((profile) => {
              const rawScore = doshaResult.normalized_scores?.[profile.key];
              const score = typeof rawScore === "number" && Number.isFinite(rawScore) ? Math.max(0, Math.min(100, rawScore)) : undefined;

              return (
                <View key={profile.key} style={styles.doshaCard}>
                  <View style={styles.doshaCardHeader}>
                    <View style={styles.doshaBadge}>
                      <Text style={styles.doshaBadgeText}>
                        {profile.label.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.doshaCopy}>
                      <Text style={styles.doshaTitle}>{profile.label}</Text>
                      <Text style={styles.doshaDescription}>
                        {profile.description}
                      </Text>
                    </View>
                    <Text style={styles.doshaScore}>
                      {score === undefined ? "—" : `${Number(score.toFixed(2))}%`}
                    </Text>
                  </View>
                  <View style={styles.doshaTrack}>
                    <View
                      style={[
                        styles.doshaFill,
                        { width: `${score ?? 0}%` },
                      ]}
                    />
                  </View>
                </View>
              );
                })}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenView>
  );
};

function formatDoshaName(value?: string | null) {
  if (!value) return "Not available";
  return value.split(/[_\s-]+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" · ");
}

function createStyles(
  spacing: Spacing,
  bottomInset: number,
  svaTypography: TypographyTokens,
  svaColors: SvaColorSet
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: bottomInset + spacing.xl * 2,
    },
    header: {
      marginBottom: spacing.sm,
    },
    tabBar: {
      flexDirection: "row",
      padding: 4,
      marginBottom: spacing.md,
      borderRadius: 16,
      backgroundColor: svaColors.surface.base,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderRadius: 12,
    },
    tabActive: {
      backgroundColor: svaColors.interaction.pressed,
    },
    tabText: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.58)",
      fontWeight: "700",
      fontSize: 11,
    },
    tabTextActive: {
      color: "#FFFFFF",
    },
    doshaSection: {
      marginTop: spacing.md,
    },
    doshaState: {
      alignItems: "center",
      padding: spacing.lg,
      gap: spacing.sm,
      borderRadius: 20,
      backgroundColor: svaColors.surface.base,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    doshaStateText: {
      ...svaTypography.textStyle.body,
      color: svaColors.text.secondary,
      textAlign: "center",
    },
    doshaEmptyTitle: {
      ...svaTypography.textStyle.title,
      color: svaColors.text.primary,
      textAlign: "center",
    },
    doshaRetry: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: svaColors.interaction.pressed,
    },
    doshaRetryText: {
      ...svaTypography.textStyle.caption,
      color: svaColors.text.primary,
      fontWeight: "700",
    },
    doshaResultCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: 22,
      backgroundColor: svaColors.surface.base,
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.24)",
    },
    doshaResultEyebrow: {
      ...svaTypography.textStyle.caption,
      color: "#A3BE8C",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.3,
    },
    doshaCombination: {
      ...svaTypography.textStyle.title,
      color: svaColors.text.primary,
      textTransform: "capitalize",
      marginTop: spacing.xs,
    },
    doshaResultMeta: {
      ...svaTypography.textStyle.caption,
      color: svaColors.text.secondary,
      marginTop: spacing.xs,
      textTransform: "capitalize",
    },
    doshaSummary: {
      ...svaTypography.textStyle.body,
      color: svaColors.text.primary,
      marginTop: spacing.sm,
      lineHeight: 23,
    },
    doshaCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: 22,
      backgroundColor: svaColors.surface.base,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    doshaCardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    doshaBadge: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(163,190,140,0.16)",
    },
    doshaBadgeText: {
      ...svaTypography.textStyle.title,
      color: "#A3BE8C",
    },
    doshaCopy: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    doshaTitle: {
      ...svaTypography.textStyle.title,
      color: "#FFFFFF",
    },
    doshaDescription: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.62)",
      marginTop: 2,
    },
    doshaScore: {
      ...svaTypography.textStyle.title,
      color: "#A3BE8C",
    },
    doshaTrack: {
      height: 6,
      marginTop: spacing.md,
      borderRadius: 3,
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    doshaFill: {
      height: "100%",
      borderRadius: 3,
      backgroundColor: "#A3BE8C",
    },
    sectionBlock: {
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
  });
}

export default HabitOverviewScreen;
