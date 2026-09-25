import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Pressable, Share, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

import { ScreenView } from "@/components/ui/Themed";
import AppHeader from "@/components/layout/AppHeader";
import { StoreKey } from "@/constants/Constant";
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
  const [activeTab, setActiveTab] = useState<OverviewTab>("resonance");
  const [doshaScores, setDoshaScores] = useState<Partial<Record<DoshaKey, number>>>({});
  const styles: HabitOverviewStyles = useMemo(
    () => createStyles(spacing, insets.bottom, svaTypography, svaColors),
    [spacing, insets.bottom, svaTypography, svaColors]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    void SecureStore.getItemAsync(StoreKey.DOSHA_ASSESSMENT_RESULT_KEY).then(
      (value) => {
        if (!active || !value) return;

        try {
          const parsed = JSON.parse(value) as any;
          const scores = parsed?.scores ?? parsed?.dosha_scores ?? parsed;
          const nextScores: Partial<Record<DoshaKey, number>> = {};

          DOSHA_PROFILES.forEach(({ key }) => {
            const score = Number(scores?.[key] ?? scores?.[`${key}_score`]);
            if (Number.isFinite(score)) {
              nextScores[key] = Math.max(0, Math.min(100, score));
            }
          });

          setDoshaScores(nextScores);
        } catch {
          setDoshaScores({});
        }
      }
    );

    return () => {
      active = false;
    };
  }, []);

  const trendData = useMemo<TrendPoint[]>(
    () => [
      { label: "Mon", value: 74 },
      { label: "Tue", value: 69 },
      { label: "Wed", value: 71 },
      { label: "Thu", value: 77 },
      { label: "Fri", value: 73 },
      { label: "Sat", value: 86 },
      { label: "Sun", value: 92 },
    ],
    []
  );

  const coreVitals = useMemo<CoreVitalMetric[]>(
    () => [
      {
        key: "zen",
        label: "Zen Minutes",
        value: "482",
        detail: "Quiet focused time logged this week.",
        icon: "leaf-outline",
        tone: "blue",
        emphasis: "primary",
      },
      {
        key: "sleep",
        label: "Sleep Quality",
        value: "84%",
        detail: "Stable recovery and cleaner evenings.",
        icon: "moon-outline",
        tone: "violet",
      },
      {
        key: "intensity",
        label: "Intensity",
        value: "7.2",
        detail: "Effort is up, but still sustainable.",
        icon: "flash-outline",
        tone: "amber",
      },
    ],
    []
  );

  const monthlyPulse = useMemo<MonthlyPulsePoint[]>(
    () => [
      { label: "W1", value: 58, color: svaColors.chart.blue },
      { label: "W2", value: 84, color: svaColors.chart.lavender },
      { label: "W3", value: 62, color: svaColors.chart.amber },
      { label: "W4", value: 76, color: svaColors.brand.primary },
    ],
    [svaColors.brand.primary, svaColors.chart.amber, svaColors.chart.blue, svaColors.chart.lavender]
  );

  const radarData = useMemo<RadarAxisPoint[]>(
    () => [
      { label: "Move", value: 76, color: svaColors.chart.blue },
      { label: "Mind", value: 91, color: svaColors.brand.primary },
      { label: "Body", value: 84, color: svaColors.chart.lavender },
    ],
    [svaColors.brand.primary, svaColors.chart.blue, svaColors.chart.lavender]
  );

  const shareSummary = useMemo(
    () =>
      [
        "Holistic Overview",
        "",
        "Ritual consistency: 92% current completion across the week.",
        "Core vitals: Zen Minutes 482, Sleep Quality 84%, Intensity 7.2.",
        "Monthly pulse: W2 is the strongest month segment.",
        "Ritual balance: Mind is the most consistent category.",
      ].join("\n"),
    []
  );

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        title: "Holistic Overview",
        message: shareSummary,
      });
    } catch (error) {
      console.warn("overview share failed", error);
    }
  }, [shareSummary]);

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
          rightActions={[
            {
              icon: "share-outline",
              accessibilityLabel: "Share overview",
              onPress: onShare,
            },
          ]}
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
                onPress={() => setActiveTab(value)}
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
                title="Current Trends"
                accessoryLabel="Past 7 days"
              />
              <RitualConsistencyCard data={trendData} />
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
              <MonthlyPulseCard data={monthlyPulse} />
            </View>

            <View style={styles.sectionBlock}>
              <OverviewSectionHeader
                title="Ritual Balance"
                accessoryLabel="Move • Mind • Body"
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
            {DOSHA_PROFILES.map((profile) => {
              const score = doshaScores[profile.key];

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
                      {score === undefined ? "—" : `${Math.round(score)}%`}
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
          </View>
        )}
      </ScrollView>
    </ScreenView>
  );
};

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
