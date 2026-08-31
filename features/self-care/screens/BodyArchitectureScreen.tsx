import React, { useContext, useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

const BODY_BLUEPRINT_IMAGE = require("@/assets/images/bodyShape/3.png");

type StatCard = {
  label: string;
  value: string;
};

const STRUCTURE_STATS: StatCard[] = [
  {
    label: "FOCUS ZONE",
    value: "Core\nStabilization",
  },
  {
    label: "DOSHA",
    value: "Vata-\nGrounding",
  },
];

export default function BodyArchitectureScreen() {
  const { newTheme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const { width } = useWindowDimensions();

  const heroWidth = Math.min(Math.max(width * 0.76, 240), 286);
  const heroHeight = Math.round(heroWidth * 1.08);
  const titleSize = Math.min(Math.max(width * 0.105, 40), 50);
  const sealWidth = Math.min(Math.max(width * 0.72, 232), 288);

  const styles = useMemo(
    () =>
      styling(
        newTheme,
        svaTypography,
        spacing,
        typography,
        heroWidth,
        heroHeight,
        titleSize,
        sealWidth
      ),
    [
      heroHeight,
      heroWidth,
      newTheme,
      sealWidth,
      spacing,
      svaTypography,
      titleSize,
      typography,
    ]
  );

  const handleSealToChronicle = () => {
    router.push(ROUTES.AUTH.SELF_CARE_REFLECTIONS);
  };

  return (
    <ScreenView padding={0} bgColor={newTheme.background} style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppHeader
          title="Body Blueprint"
          onBack={() => router.back()}
          rightAction={{
            icon: "ellipsis-vertical",
            onPress: () => router.push(ROUTES.TABS.SETTINGS),
            accessibilityLabel: "More options",
          }}
          containerStyle={styles.header}
          titleStyle={styles.headerTitle}
        />

        <View style={styles.heroSection}>
          <View style={[styles.heroFrame, { width: heroWidth, height: heroHeight }]}>
            <Image
              source={BODY_BLUEPRINT_IMAGE}
              style={[
                styles.heroImage,
                {
                  width: heroWidth,
                  height: heroHeight,
                },
              ]}
              resizeMode="contain"
              accessibilityLabel="Body architecture illustration"
            />
          </View>
        </View>

        <Text style={styles.profileLabel}>RESULT PROFILE</Text>
        <Text style={styles.profileTitle}>THE ANCHORED{"\n"}HOURGLASS</Text>

        <View style={styles.strategyCard}>
          <LinearGradient
            colors={["rgba(163,190,140,0.07)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.strategyHeader}>
            <Ionicons
              name="body-outline"
              size={14}
              color={newTheme.chart5 ?? newTheme.success}
            />
            <Text style={styles.strategyLabel}>STRATEGY: EQUILIBRIUM</Text>
          </View>

          <Text style={styles.strategyBody}>
            To harmonize your specific silhouette, prioritize{" "}
            <Text style={styles.strategyEmphasis}>Move (Workout)</Text>{" "}
            protocols that emphasize core stabilization and lateral sync. This
            balances your natural geometry, grounding mental energy{" "}
            <Text style={styles.strategyEmphasis}>(Vata)</Text>.
          </Text>

          <View style={styles.statRow}>
            {STRUCTURE_STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.wisdomCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.035)", "rgba(255,255,255,0.01)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />

          <Text style={styles.wisdomLabel}>SOMATIC WISDOM</Text>
          <Text style={styles.wisdomBody}>
            This geometry is not static; it is a manifestation of your current
            Pillar alignment. Adjusting your Nourish and Move formulas will
            shift this resonance over time.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Seal to chronicle"
          onPress={handleSealToChronicle}
          style={({ pressed }) => [
            styles.sealButton,
            pressed && styles.sealButtonPressed,
          ]}
        >
          <LinearGradient
            colors={[newTheme.buttonPrimary, newTheme.accentPressed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons
            name="shield-sharp"
            size={18}
            color={sealInk}
            style={styles.sealIcon}
          />
          <Text style={styles.sealButtonText}>SEAL TO CHRONICLE</Text>
        </Pressable>
      </ScrollView>

      <Text style={styles.watermark}>SVA</Text>
    </ScreenView>
  );
}

const sealInk = "#11120E";

const styling = (
  theme: ColorSet,
  svaTypography: TypographyTokens | undefined,
  spacing: Spacing,
  typography: Typography,
  heroWidth: number,
  heroHeight: number,
  titleSize: number,
  sealWidth: number
) => {
  const authTitle = svaTypography?.textStyle.authTitle ?? typography.h2;
  const authTinyLabel =
    svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption;
  const authBody = svaTypography?.textStyle.body ?? typography.body;
  const authActionLabel =
    svaTypography?.textStyle.authActionLabel ?? typography.button;
  const displayLarge = svaTypography?.textStyle.displayLarge ?? typography.h1;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2.8,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...authTitle,
      fontSize: 24,
      lineHeight: 28,
      fontStyle: "italic",
      color: theme.textSecondary,
      opacity: 0.9,
    },
    heroSection: {
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: heroHeight + spacing.md,
    },
    heroFrame: {
      alignItems: "center",
      justifyContent: "center",
    },
    heroImage: {
      opacity: 0.98,
    },
    profileLabel: {
      ...authTinyLabel,
      color: theme.chart5 ?? theme.textSecondary,
      opacity: 0.95,
      marginBottom: spacing.xs,
      letterSpacing: 2.4,
    },
    profileTitle: {
      fontFamily: displayLarge.fontFamily,
      fontSize: titleSize,
      lineHeight: Math.round(titleSize * 1.02),
      color: theme.textPrimary,
      letterSpacing: -0.04 * titleSize,
      textTransform: "uppercase",
      marginBottom: spacing.lg,
    },
    strategyCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.1)",
      backgroundColor: "rgba(28,32,23,0.94)",
      padding: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.26,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 5,
      marginBottom: spacing.lg,
    },
    strategyHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: spacing.md,
    },
    strategyLabel: {
      ...authTinyLabel,
      color: theme.chart5 ?? theme.textSecondary,
      letterSpacing: 2.5,
    },
    strategyBody: {
      color: theme.textPrimary,
      fontFamily: authBody.fontFamily,
      fontSize: 17,
      lineHeight: 28,
      marginBottom: spacing.lg,
    },
    strategyEmphasis: {
      color: theme.chart5 ?? theme.success,
      fontStyle: "italic",
      fontFamily: authBody.fontFamily,
    },
    statRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      minHeight: 110,
      borderRadius: 16,
      backgroundColor: "rgba(18,21,16,0.76)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.03)",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      justifyContent: "space-between",
    },
    statLabel: {
      ...authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.9,
      letterSpacing: 2,
    },
    statValue: {
      fontFamily: authBody.fontFamily,
      fontSize: 16,
      lineHeight: 24,
      color: theme.textPrimary,
    },
    wisdomCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.04)",
      backgroundColor: "rgba(22,26,19,0.92)",
      padding: spacing.lg,
      marginBottom: spacing.xl,
      shadowColor: theme.shadow,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 16,
      elevation: 4,
    },
    wisdomLabel: {
      ...authTitle,
      fontSize: 22,
      lineHeight: 26,
      fontStyle: "italic",
      color: theme.textPrimary,
      marginBottom: spacing.sm,
    },
    wisdomBody: {
      color: theme.textSecondary,
      fontFamily: authTitle.fontFamily,
      fontSize: 17,
      lineHeight: 30,
      fontStyle: "italic",
      textAlign: "center",
    },
    sealButton: {
      alignSelf: "center",
      width: sealWidth,
      minHeight: 58,
      paddingHorizontal: spacing.lg,
      borderRadius: 29,
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 20,
      elevation: 6,
    },
    sealButtonPressed: {
      opacity: 0.96,
      transform: [{ scale: 0.99 }],
    },
    sealIcon: {
      marginRight: 10,
    },
    sealButtonText: {
      color: sealInk,
      ...authActionLabel,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 1.8,
    },
    watermark: {
      position: "absolute",
      right: -4,
      bottom: 18,
      fontFamily: displayLarge.fontFamily,
      fontSize: 72,
      lineHeight: 72,
      color: theme.textSecondary,
      opacity: 0.045,
      letterSpacing: -4,
    },
  });
};
