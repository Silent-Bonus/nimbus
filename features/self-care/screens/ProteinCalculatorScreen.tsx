import React, { useContext, useMemo } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import type { ColorSet, Spacing, Typography } from "@/theme/types";
import {
  buildProteinPanelMealSlots,
  resolveProteinPanelDataFromParams,
} from "@/features/self-care/services/proteinPanelService";

export const ProteinCalculatorScreen = () => {
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const proteinPanelData = useMemo(
    () =>
      resolveProteinPanelDataFromParams(
        params as {
          total_requirement?: string | string[];
          meal_one?: string | string[];
          meal_two?: string | string[];
          meal_three?: string | string[];
          unit?: string | string[];
          tip?: string | string[];
          protein?: string | string[];
        }
      ),
    [
      params,
    ]
  );

  const proteinSlots = useMemo(
    () => buildProteinPanelMealSlots(proteinPanelData),
    [proteinPanelData]
  );

  const heroSize = Math.min(Math.max(width * 0.64, 198), 226);

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, heroSize),
    [newTheme, spacing, typography, heroSize]
  );

  const handleSealToPlan = () => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_MEAL_PLANNER,
      params: { protein: String(proteinPanelData.totalRequirement) },
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
          title="Protein Intake"
          subtitle="Daily structural requirement"
          onBack={() => router.back()}
          containerStyle={styles.header}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />

        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroRing,
              {
                width: heroSize,
                height: heroSize,
                borderRadius: heroSize / 2,
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.03)", "rgba(163,190,140,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />

            <Text style={styles.heroValue}>
              {proteinPanelData.totalRequirement}
              <Text style={styles.heroUnit}> {proteinPanelData.unit}</Text>
            </Text>
            <Text style={styles.heroCaption}>TOTAL REQUIREMENT</Text>
          </View>
        </View>

        <View style={styles.cardStack}>
          {proteinSlots.map((slot, index) => (
            <View
              key={slot.key}
              style={[
                styles.slotCard,
                index === proteinSlots.length - 1 && styles.slotCardLast,
              ]}
            >
              <View style={styles.slotLabelColumn}>
                <Text style={styles.slotLabel} numberOfLines={2}>
                  {slot.label}
                </Text>
              </View>

              <View style={styles.slotAmountColumn}>
                <Text style={styles.slotAmount}>
                  {slot.grams}
                  <Text style={styles.slotUnit}> {proteinPanelData.unit}</Text>
                </Text>
                <Text style={styles.slotAmountLabel}>Protein</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tipWrap}>
          <Text style={styles.tipText}>
            {proteinPanelData.tip}
            {"\n"}
            Assign these values to your Nourish Plan to begin.
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
            colors={[newTheme.buttonPrimary, newTheme.accentPressed]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.sealButtonText}>SEAL TO{"\n"}PLAN</Text>
        </Pressable>
      </ScrollView>
    </ScreenView>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  heroSize: number
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2.75,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...typography.h2,
      fontSize: 22,
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      ...typography.body,
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSecondary,
      opacity: 0.9,
    },
    heroSection: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    heroRing: {
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.12)",
      backgroundColor: "rgba(255,255,255,0.012)",
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.26,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 5,
    },
    heroValue: {
      color: theme.textPrimary,
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: heroSize * 0.27,
      lineHeight: heroSize * 0.27,
      fontWeight: "600",
      letterSpacing: -1.1,
    },
    heroUnit: {
      color: theme.textPrimary,
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: heroSize * 0.14,
      lineHeight: heroSize * 0.14,
      fontWeight: "600",
      letterSpacing: -0.4,
    },
    heroCaption: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      letterSpacing: 2.3,
      textAlign: "center",
      opacity: 0.9,
    },
    cardStack: {
      gap: spacing.md,
    },
    slotCard: {
      minHeight: 72,
      borderRadius: 20,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.borderMuted ?? theme.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    slotCardLast: {
      marginBottom: spacing.xs,
    },
    slotLabelColumn: {
      flex: 1,
      paddingRight: spacing.md,
    },
    slotLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      fontWeight: "700",
      letterSpacing: 1.3,
      opacity: 0.85,
    },
    slotAmountColumn: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    slotAmount: {
      color: theme.chart4 ?? theme.error,
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: 24,
      lineHeight: 26,
      fontWeight: "600",
      letterSpacing: -0.8,
    },
    slotUnit: {
      color: theme.chart4 ?? theme.error,
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "600",
    },
    slotAmountLabel: {
      ...typography.caption,
      color: theme.textSecondary,
      marginLeft: 6,
      marginBottom: 1,
    },
    tipWrap: {
      alignSelf: "center",
      maxWidth: 290,
      marginTop: spacing.lg,
      paddingHorizontal: spacing.xs,
    },
    tipText: {
      color: theme.textPrimary,
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: 20,
      lineHeight: 29,
      fontStyle: "italic",
      textAlign: "center",
      opacity: 0.98,
    },
    sealButton: {
      width: 112,
      height: 112,
      borderRadius: 56,
      alignSelf: "center",
      marginTop: spacing.lg * 1.1,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(49,56,38,0.45)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.34,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    sealButtonPressed: {
      opacity: 0.96,
      transform: [{ scale: 0.98 }],
    },
    sealButtonText: {
      color: theme.background,
      fontFamily: typography.button.fontFamily,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "800",
      letterSpacing: 1.4,
      textAlign: "center",
    },
  });
