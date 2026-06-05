import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import { getStoredBodyVitalsContext } from "@/features/self-care/services/bodyVitalsStorage";
import type { BodyVitalsContext } from "@/features/self-care/types/bodyVitals";
import {
  buildCaloriePanelTiers,
  resolveCaloriePanelDataFromContext,
  resolveCaloriePanelDataFromParams,
  type CaloriePanelParams,
} from "@/features/self-care/services/caloriePanelService";
import type { ColorSet, Spacing, Typography } from "@/theme/types";

export default function CalorieThresholdScreen() {
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const [savedVitalsContext, setSavedVitalsContext] =
    useState<BodyVitalsContext | null>(null);

  useEffect(() => {
    let active = true;

    const loadSavedVitals = async () => {
      const cachedVitals = await getStoredBodyVitalsContext();

      if (!active) {
        return;
      }

      setSavedVitalsContext(cachedVitals);
    };

    void loadSavedVitals();

    return () => {
      active = false;
    };
  }, []);

  const routeCalorieData = useMemo(
    () =>
      resolveCaloriePanelDataFromParams(
        params as unknown as CaloriePanelParams
      ),
    [params]
  );

  const savedCalorieData = useMemo(
    () => resolveCaloriePanelDataFromContext(savedVitalsContext),
    [savedVitalsContext]
  );

  const calorieData =
    routeCalorieData.source === "api" ? routeCalorieData : savedCalorieData;

  const calorieTiers = useMemo(
    () => buildCaloriePanelTiers(calorieData),
    [calorieData]
  );

  const heroWidth = Math.min(Math.max(width * 0.68, 208), 244);
  const heroHeight = 96;

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, heroWidth, heroHeight),
    [newTheme, spacing, typography, heroWidth, heroHeight]
  );

  const handleSealToPlan = () => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_MEAL_PLANNER,
      params: {
        maintenanceCalories: String(calorieData.maintenanceCalories),
        targetCalories: String(calorieData.optimalBurnCalories),
      },
    });
  };

  return (
    <ScreenView padding={0} bgColor={newTheme.background} style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppHeader
          title="Calorie Intake"
          subtitle="Daily maintenance agni"
          onBack={() => router.back()}
          rightAction={{
            icon: "settings-outline",
            accessibilityLabel: "Open settings",
            onPress: () => router.push(ROUTES.TABS.SETTINGS),
          }}
          containerStyle={styles.header}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />

        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroPill,
              {
                width: heroWidth,
                height: heroHeight,
                borderRadius: heroHeight / 2,
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(228,143,163,0.96)", "rgba(191,97,106,0.96)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />

            <Text style={styles.heroValue}>
              {calorieData.totalCalorie}
              <Text style={styles.heroUnit}> {calorieData.unit}</Text>
            </Text>
            <Text style={styles.heroCaption}>TOTAL CALORIES</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>The Prescriptions</Text>

        <View style={styles.cardStack}>
          {calorieTiers.map((tier) => (
            <View
              key={tier.key}
              style={[
                styles.card,
                tier.highlight && styles.cardHighlight,
              ]}
            >
              <LinearGradient
                colors={
                  tier.highlight
                    ? ["rgba(228,143,163,0.07)", "rgba(228,143,163,0.02)"]
                    : ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.035)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                pointerEvents="none"
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.cardLeft}>
                <View style={styles.cardLabelRow}>
                  <Text style={styles.cardLabel}>{tier.label}</Text>
                  {tier.highlight ? <View style={styles.cardDot} /> : null}
                </View>
                <Text style={styles.cardTitle}>{tier.title}</Text>
              </View>

              <Text
                style={[
                  styles.cardCalories,
                  tier.highlight && styles.cardCaloriesHighlight,
                ]}
              >
                {tier.calories}
                <Text style={styles.cardCaloriesUnit}> {calorieData.unit}</Text>
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.tipWrap}>
          <Text style={styles.tipText}>
            {calorieData.tip}
            {"\n"}
            Assign the selected Burn target to your Nourish Plan to begin.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Seal to plan"
          onPress={handleSealToPlan}
          style={({ pressed }) => [
            styles.sealButton,
            pressed && styles.sealButtonPressed,
          ]}
        >
          <LinearGradient
            colors={[newTheme.chart4 ?? "#E48FA3", newTheme.error ?? "#BF616A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons
            name="bookmark"
            size={20}
            color={themeInk}
            style={styles.sealIcon}
          />
          <Text style={styles.sealButtonText}>SEAL TO{"\n"}PLAN</Text>
        </Pressable>
      </ScrollView>
    </ScreenView>
  );
}

const themeInk = "#10120E";

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  heroWidth: number,
  heroHeight: number
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2.6,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...typography.h2,
      fontSize: 22,
      letterSpacing: -0.4,
    },
    headerSubtitle: {
      ...typography.body,
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSecondary,
      opacity: 0.88,
    },
    heroSection: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    heroPill: {
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(228,143,163,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 5,
    },
    heroValue: {
      color: themeInk,
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: 48,
      lineHeight: 50,
      fontStyle: "italic",
      letterSpacing: -1.1,
    },
    heroUnit: {
      color: themeInk,
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: 24,
      lineHeight: 24,
      fontStyle: "italic",
      letterSpacing: -0.4,
    },
    heroCaption: {
      marginTop: 2,
      color: themeInk,
      fontFamily: typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "800",
      letterSpacing: 2.4,
      opacity: 0.88,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontFamily: "CormorantGaramond_500Medium",
      fontSize: 24,
      lineHeight: 28,
      fontStyle: "italic",
      marginBottom: spacing.md,
      marginTop: spacing.xl,
    },
    cardStack: {
      gap: spacing.md,
    },
    card: {
      minHeight: 84,
      borderRadius: 18,
      backgroundColor: theme.surface ?? theme.card,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    cardHighlight: {
      borderColor: newThemeAccent(theme),
      backgroundColor: "rgba(228,143,163,0.05)",
      shadowOpacity: 0.24,
    },
    cardLeft: {
      flex: 1,
      paddingRight: spacing.md,
    },
    cardLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 2,
    },
    cardLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.4,
      opacity: 0.86,
      fontWeight: "700",
    },
    cardDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: newThemeAccent(theme),
      marginTop: 1,
    },
    cardTitle: {
      color: theme.textPrimary,
      fontFamily: "CormorantGaramond_500Medium",
      fontSize: 21,
      lineHeight: 24,
      fontStyle: "italic",
    },
    cardCalories: {
      color: newThemeAccent(theme),
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: 28,
      lineHeight: 30,
      letterSpacing: -0.8,
      fontStyle: "italic",
      textAlign: "right",
    },
    cardCaloriesHighlight: {
      color: newThemeAccent(theme),
    },
    cardCaloriesUnit: {
      fontSize: 16,
      lineHeight: 16,
      fontStyle: "italic",
    },
    tipWrap: {
      alignSelf: "center",
      maxWidth: 282,
      marginTop: spacing.xl,
    },
    tipText: {
      color: theme.textPrimary,
      fontFamily: "CormorantGaramond_500Medium",
      fontSize: 20,
      lineHeight: 29,
      fontStyle: "italic",
      textAlign: "center",
      opacity: 0.96,
    },
    sealButton: {
      width: 114,
      height: 114,
      borderRadius: 57,
      alignSelf: "center",
      marginTop: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(191,97,106,0.6)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    sealButtonPressed: {
      opacity: 0.96,
      transform: [{ scale: 0.98 }],
    },
    sealIcon: {
      marginBottom: 2,
    },
    sealButtonText: {
      color: themeInk,
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "800",
      letterSpacing: 1.2,
      textAlign: "center",
    },
  });

const newThemeAccent = (theme: any) => theme.chart4 ?? theme.error ?? "#E48FA3";
