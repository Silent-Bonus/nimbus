import React, { useContext, useMemo } from "react";
import {
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
import {
  buildProteinPanelMealSlots,
  resolveProteinPanelDataFromParams,
} from "@/features/self-care/services/body-vitals/panels";
import { resolveBodyVitalsTypography } from "@/features/self-care/utils/bodyVitalsTheme";
import type { ColorSet, Spacing } from "@/theme/types";

export const ProteinCalculatorScreen = () => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );

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
    [params]
  );

  const proteinSlots = useMemo(
    () => buildProteinPanelMealSlots(proteinPanelData),
    [proteinPanelData]
  );

  const heroSize = Math.min(Math.max(width * 0.64, 198), 226);

  const styles = useMemo(
    () => styling(newTheme, spacing, t, heroSize),
    [newTheme, spacing, t, heroSize]
  );
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
      </ScrollView>
    </ScreenView>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: ReturnType<typeof resolveBodyVitalsTypography>,
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
      ...t.screenTitle,
      color: theme.textPrimary,
    },
    headerSubtitle: {
      ...t.screenSubtitle,
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
      fontFamily: t.heroDisplay.fontFamily,
      fontSize: heroSize * 0.27,
      lineHeight: heroSize * 0.27,
      fontWeight: t.heroDisplay.fontWeight,
      letterSpacing: t.heroDisplay.letterSpacing ?? -1.1,
    },
    heroUnit: {
      color: theme.textPrimary,
      fontFamily: t.heroDisplay.fontFamily,
      fontSize: heroSize * 0.14,
      lineHeight: heroSize * 0.14,
      fontWeight: t.heroDisplay.fontWeight,
      letterSpacing: -0.4,
    },
    heroCaption: {
      ...t.sectionLabel,
      color: theme.textSecondary,
      marginTop: spacing.xs,
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
      ...t.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.85,
    },
    slotAmountColumn: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    slotAmount: {
      color: theme.chart4 ?? theme.error,
      fontFamily: t.screenTitle.fontFamily,
      fontSize: 24,
      lineHeight: 26,
      fontWeight: t.screenTitle.fontWeight,
      letterSpacing: t.screenTitle.letterSpacing ?? -0.8,
    },
    slotUnit: {
      color: theme.chart4 ?? theme.error,
      fontFamily: t.screenTitle.fontFamily,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: t.screenTitle.fontWeight,
    },
    slotAmountLabel: {
      ...t.caption,
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
      ...t.body,
      fontSize: 17,
      lineHeight: 26,
      textAlign: "center",
      opacity: 0.98,
    },
  });
