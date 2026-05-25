import React, { useContext, useMemo } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenHeader from "@/components/layout/ScreenHeader";
import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, SvaColorSet } from "@/theme/types";

type RewardsTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type MilestoneBadge = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  unlocked: boolean;
};

type MilestoneSection = {
  title: string;
  masteryLabel: string;
  badges: MilestoneBadge[];
};

type MilestoneHero = {
  statusLabel: string;
  totalLabel: string;
  progressPercent: number;
  progressBarLabel: string;
  description: string;
};

type RewardsStyles = ReturnType<typeof createStyles>;

type BadgeTileProps = {
  badge: MilestoneBadge;
  colors: SvaColorSet;
  styles: RewardsStyles;
};

const createMilestoneContent = (colors: SvaColorSet) => ({
  hero: {
    statusLabel: "STATUS: ASCENDING",
    totalLabel: "Total Badges: 12/50",
    progressPercent: 24,
    progressBarLabel: "24%",
    description:
      "You're making elegant progress towards your holistic goals. 38 milestones remain to reach Enlightenment.",
  } satisfies MilestoneHero,
  section: {
    title: "Mind & Spirit",
    masteryLabel: "MASTERY LEVEL 2",
    badges: [
      {
        id: "solar-morning",
        title: "Solar Morning",
        icon: "sunny-outline",
        color: colors.chart.amber,
        unlocked: true,
      },
      {
        id: "hydration-master",
        title: "Hydration Master",
        icon: "water-outline",
        color: colors.chart.blue,
        unlocked: true,
      },
      {
        id: "inner-peace",
        title: "Inner Peace",
        icon: "sparkles-outline",
        color: colors.chart.lavender,
        unlocked: true,
      },
      {
        id: "zen-warrior",
        title: "Zen Warrior",
        icon: "body-outline",
        color: colors.chart.grid,
        unlocked: false,
      },
      {
        id: "night-owl",
        title: "Night Owl",
        icon: "moon-outline",
        color: colors.chart.blue,
        unlocked: false,
      },
      {
        id: "moon-ritual",
        title: "Moon Ritual",
        icon: "sparkles-outline",
        color: colors.chart.lavender,
        unlocked: false,
      },
    ],
  } satisfies MilestoneSection,
});

function BadgeTile({ badge, colors, styles }: BadgeTileProps) {
  return (
    <View style={styles.badgeTile}>
      <View style={styles.badgeOrbOuter}>
        <LinearGradient
          colors={
            badge.unlocked
              ? [badge.color, colors.surface.base]
              : [colors.surface.raised, colors.bg.base]
          }
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.95 }}
          style={[
            styles.badgeOrb,
            badge.unlocked ? styles.badgeOrbUnlocked : styles.badgeOrbLocked,
            {
              shadowColor: badge.unlocked ? badge.color : colors.shadow.default,
            },
          ]}
        >
          <View
            style={[
              styles.badgeOrbInner,
              badge.unlocked
                ? styles.badgeOrbInnerUnlocked
                : styles.badgeOrbInnerLocked,
            ]}
          >
            <Ionicons
              name={badge.icon}
              size={badge.unlocked ? 22 : 20}
              color={
                badge.unlocked ? colors.text.primary : colors.text.secondary
              }
              style={badge.unlocked ? styles.badgeIconUnlocked : undefined}
            />
          </View>
        </LinearGradient>
      </View>

      <Text
        style={[
          styles.badgeTitle,
          !badge.unlocked && styles.badgeTitleLocked,
        ]}
        numberOfLines={1}
      >
        {badge.title}
      </Text>
    </View>
  );
}

export const RewardsScreen = () => {
  const { newTheme, svaColors, svaTypography, typography } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const fonts = useMemo<RewardsTypography>(
    () => ({
      titleFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        typography.h2.fontFamily ??
        "CormorantGaramond_500Medium",
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Inter_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Inter_600SemiBold",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () => createStyles(newTheme, svaColors, fonts, insets.bottom),
    [newTheme, svaColors, fonts, insets.bottom]
  );

  const content = useMemo(() => createMilestoneContent(svaColors), [svaColors]);

  const fillWidth = `${Math.max(
    0,
    Math.min(content.hero.progressPercent, 100)
  )}%`;

  return (
    <ScreenView bgColor={newTheme.background} padding={0} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScreenHeader
        title="Your Milestones"
        onBack={() => router.back()}
        containerStyle={styles.headerContainer}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <LinearGradient
            colors={[
              "rgba(43, 45, 39, 1)",
              "rgba(52, 61, 74, 0.98)",
              "rgba(30, 32, 27, 1)",
            ]}
            start={{ x: 0.05, y: 0.08 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroVisual}
          >
            <LinearGradient
              colors={[
                "rgba(200, 184, 244, 0.58)",
                "rgba(200, 184, 244, 0.16)",
                "rgba(200, 184, 244, 0)",
              ]}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.95, y: 0.8 }}
              style={styles.heroSweep}
            />

            <LinearGradient
              colors={[
                "rgba(246, 200, 137, 0.28)",
                "rgba(246, 200, 137, 0.1)",
                "rgba(246, 200, 137, 0)",
              ]}
              start={{ x: 0.1, y: 0.2 }}
              end={{ x: 0.75, y: 0.85 }}
              style={styles.heroGlow}
            />

            <View style={styles.heroOrbOne} />
            <View style={styles.heroOrbTwo} />

            <View style={styles.statusPill}>
              <Ionicons
                name="shield-checkmark-outline"
                size={13}
                color={svaColors.brand.primary}
              />
              <Text style={styles.statusPillText}>{content.hero.statusLabel}</Text>
            </View>
          </LinearGradient>

          <View style={styles.heroBody}>
            <View style={styles.heroStatsRow}>
              <Text style={styles.heroTitle}>{content.hero.totalLabel}</Text>
              <Text style={styles.heroProgressLabel}>
                {content.hero.progressBarLabel}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: fillWidth }]} />
            </View>

            <Text style={styles.heroDescription}>{content.hero.description}</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{content.section.title}</Text>
          <Text style={styles.sectionMeta}>{content.section.masteryLabel}</Text>
        </View>

        <View style={styles.badgeGrid}>
          {content.section.badges.map((badge) => (
            <BadgeTile
              key={badge.id}
              badge={badge}
              colors={svaColors}
              styles={styles}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenView>
  );
};

const createStyles = (
  theme: ColorSet,
  colors: SvaColorSet,
  fonts: RewardsTypography,
  bottomInset: number
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    headerContainer: {
      marginBottom: 12,
      paddingBottom: 0,
      paddingHorizontal: 12,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: bottomInset + 28,
    },
    heroCard: {
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.default,
          shadowOpacity: 0.36,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
        },
        android: {
          elevation: 10,
        },
      }),
    },
    heroVisual: {
      height: 126,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 18,
      justifyContent: "flex-start",
      alignItems: "center",
      overflow: "hidden",
    },
    heroSweep: {
      position: "absolute",
      width: 240,
      height: 240,
      borderRadius: 120,
      left: -52,
      top: -22,
      opacity: 0.9,
      transform: [{ rotate: "-14deg" }],
    },
    heroGlow: {
      position: "absolute",
      width: 210,
      height: 210,
      borderRadius: 105,
      right: -36,
      bottom: -58,
      opacity: 0.9,
    },
    heroOrbOne: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      left: -28,
      top: -12,
      backgroundColor: "rgba(255,255,255,0.08)",
      opacity: 0.2,
    },
    heroOrbTwo: {
      position: "absolute",
      width: 140,
      height: 140,
      borderRadius: 70,
      right: -40,
      top: 12,
      backgroundColor: "rgba(163,190,140,0.12)",
      opacity: 0.28,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: "rgba(31, 33, 28, 0.54)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      marginTop: 22,
    },
    statusPillText: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.8,
      color: colors.text.secondary,
      textTransform: "uppercase",
    },
    heroBody: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 18,
      backgroundColor: colors.surface.base,
    },
    heroStatsRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
    },
    heroTitle: {
      flex: 1,
      fontFamily: fonts.titleFamily,
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: -0.25,
      color: colors.text.primary,
    },
    heroProgressLabel: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 12,
      lineHeight: 16,
      color: colors.chart.blue,
    },
    progressTrack: {
      height: 7,
      borderRadius: 999,
      marginTop: 10,
      backgroundColor: colors.divider,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.chart.blue,
      shadowColor: colors.chart.blue,
      shadowOpacity: 0.42,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 0 },
      elevation: 2,
    },
    heroDescription: {
      marginTop: 12,
      fontFamily: fonts.bodyFamily,
      fontSize: 13.5,
      lineHeight: 21,
      color: colors.text.secondary,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: 18,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontFamily: fonts.titleFamily,
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: -0.18,
      color: colors.text.primary,
      fontStyle: "italic",
    },
    sectionMeta: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.8,
      color: colors.text.secondary,
      textTransform: "uppercase",
      paddingBottom: 2,
    },
    badgeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -6,
      paddingTop: 6,
    },
    badgeTile: {
      width: "33.333%",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 10,
    },
    badgeOrbOuter: {
      width: 76,
      height: 76,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 38,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 8 },
    },
    badgeOrb: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      overflow: "hidden",
    },
    badgeOrbUnlocked: {
      borderColor: "rgba(255,255,255,0.26)",
      opacity: 1,
    },
    badgeOrbLocked: {
      borderColor: "rgba(255,255,255,0.08)",
      opacity: 0.46,
    },
    badgeOrbInner: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeOrbInnerUnlocked: {
      backgroundColor: "rgba(255,255,255,0.12)",
    },
    badgeOrbInnerLocked: {
      backgroundColor: "rgba(0,0,0,0.18)",
    },
    badgeIconUnlocked: {
      textShadowColor: "rgba(0,0,0,0.18)",
      textShadowRadius: 2,
      textShadowOffset: { width: 0, height: 1 },
    },
    badgeTitle: {
      marginTop: 8,
      maxWidth: 88,
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 11,
      lineHeight: 14,
      textAlign: "center",
      color: colors.text.primary,
    },
    badgeTitleLocked: {
      color: colors.text.secondary,
      opacity: 0.55,
    },
  });

export default RewardsScreen;
