import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import type { ColorSet, Spacing } from "@/theme/types";
import { getTodayResonance } from "@/features/home/services/resonanceService";
import { SELF_CARE_SECTIONS } from "@/features/self-care/data/selfCareSections";
import type {
  SelfCareActionTile,
  SelfCareFonts,
  SelfCareSectionConfig,
} from "@/features/self-care/types/selfCare";
import {
  getSelfCareIconTint,
  getSelfCareTileGradient,
} from "@/features/self-care/utils/selfCarePresentation";

const SelfCareActionTile = ({
  action,
  onPress,
  iconColor,
  gradientColors,
  styles,
}: {
  action: SelfCareActionTile;
  onPress: (route: string, mode?: "push" | "navigate") => void;
  iconColor: string;
  gradientColors: [string, string];
  styles: ReturnType<typeof makeStyles>;
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={() => onPress(action.route, action.navigationMode)}
      style={({ pressed }) => [
        styles.actionTile,
        pressed && styles.actionTilePressed,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionTileGradient}
      >
      <View
        style={[
          styles.actionIconWrap,
          {
            backgroundColor: getSelfCareIconTint(iconColor),
            borderColor: getSelfCareIconTint(iconColor),
          },
        ]}
      >
          <MaterialCommunityIcons
            name={action.icon}
            size={18}
            color={iconColor}
          />
        </View>
        <Text style={styles.actionLabel} numberOfLines={1}>
          {action.label}
        </Text>
        <Text style={styles.actionDescription} numberOfLines={2}>
          {action.description}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

const SelfCareSectionCard = ({
  section,
  onPress,
  iconColors,
  styles,
}: {
  section: SelfCareSectionConfig;
  onPress: (route: string, mode?: "push" | "navigate") => void;
  iconColors: string[];
  styles: ReturnType<typeof makeStyles>;
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${section.title} self-care hub`}
      onPress={() =>
        onPress(section.actions[0].route, section.actions[0].navigationMode)
      }
      style={({ pressed }) => [
        styles.sectionCard,
        pressed && styles.sectionCardPressed,
      ]}
    >
      <View style={styles.sectionInner}>
        <View style={styles.sectionTopRow}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionEyebrow} numberOfLines={1}>
              {section.eyebrow}
            </Text>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              {section.title}
            </Text>
          </View>

        </View>

        <View style={styles.actionRow}>
          {section.actions.map((action, index) => (
            <SelfCareActionTile
              key={action.label}
              action={action}
              onPress={onPress}
              iconColor={iconColors[index % iconColors.length]}
              gradientColors={getSelfCareTileGradient(
                iconColors[index % iconColors.length]
              )}
              styles={styles}
            />
          ))}
        </View>

      </View>
    </Pressable>
  );
};

export default function SelfCare() {
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [resonanceScore, setResonanceScore] = useState<number | null>(null);
  const [resonanceLoading, setResonanceLoading] = useState(true);

  const ringSize = useMemo(() => {
    return Math.min(220, Math.max(176, Math.round(width * 0.58)));
  }, [width]);

  const fontFamilies = useMemo(
    () => ({
      serif:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      mono:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        SVATypography.fontFamily.mono,
      action:
        svaTypography.textStyle.button.fontFamily ??
        SVATypography.fontFamily.bodyStrong,
    }),
    [svaTypography]
  );

  const styles = useMemo(
    () => makeStyles(theme, spacing, ringSize, fontFamilies),
    [theme, spacing, ringSize, fontFamilies]
  );

  useEffect(() => {
    let active = true;

    const loadResonance = async () => {
      setResonanceLoading(true);
      try {
        const score = await getTodayResonance();
        if (active) {
          setResonanceScore(score);
        }
      } catch (error) {
        console.error("Unable to load today's resonance:", error);
        if (active) {
          setResonanceScore(null);
        }
      } finally {
        if (active) {
          setResonanceLoading(false);
        }
      }
    };

    void loadResonance();

    return () => {
      active = false;
    };
  }, []);

  const onRoutePress = (route: string, mode: "push" | "navigate" = "push") => {
    if (mode === "navigate") {
      router.navigate(route as never);
      return;
    }

    router.push(route as never);
  };

  return (
    <ScreenView bgColor={theme.background} padding={0} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.root}>
        <AppHeader
          title="Sattva Sanctuary"
          subtitle="A quiet orbit for mind, body, soul."
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 154 },
          ]}
        >
          <View style={styles.heroBlock}>
            <View style={styles.ringStage}>
              <View style={styles.scoreRing}>
              <View style={styles.scoreRingInner}>
                  {resonanceLoading ? (
                    <ActivityIndicator color={theme.accent} size="small" />
                  ) : (
                    <Text style={styles.scoreNumber}>
                      {resonanceScore ?? "—"}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.heroTitle} numberOfLines={1}>
              Sattva Level
            </Text>
            <Text style={styles.heroSubtitle} numberOfLines={1}>
              {resonanceScore === null
                ? "RESONANCE • AWAITING SIGNAL"
                : resonanceScore >= 80
                ? "OPTIMIZED STATE • HIGH COHERENCE"
                : resonanceScore >= 55
                ? "BALANCED STATE • STEADY COHERENCE"
                : "RESET STATE • ROOM TO RESTORE"}
            </Text>
          </View>

          <View style={styles.sectionStack}>
            {SELF_CARE_SECTIONS.map((section) => (
              <SelfCareSectionCard
                key={section.title}
                section={section}
                onPress={onRoutePress}
                iconColors={[theme.chart1, theme.chart2, theme.chart3, theme.chart4]}
                styles={styles}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScreenView>
  );
}

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  ringSize: number,
  fonts: SelfCareFonts
) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    header: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingTop: spacing.xs,
    },
    heroBlock: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    ringStage: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    scoreRing: {
      width: ringSize,
      height: ringSize,
      borderRadius: ringSize / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    scoreRingInner: {
      flex: 1,
      borderRadius: ringSize / 2 - 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreNumber: {
      fontFamily: fonts.serif,
      fontSize: 60,
      lineHeight: 62,
      color: theme.accent,
      letterSpacing: -1.2,
    },
    heroTitle: {
      fontFamily: fonts.serif,
      fontSize: 24,
      lineHeight: 28,
      color: theme.textPrimary,
      textAlign: "center",
    },
    heroSubtitle: {
      marginTop: 6,
      fontFamily: fonts.mono,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 3.1,
      color: theme.textSecondary,
      textAlign: "center",
      textTransform: "uppercase",
      opacity: 0.92,
    },
    sectionStack: {
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    sectionCard: {
      borderRadius: 30,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.32,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 9,
    },
    sectionCardPressed: {
      borderColor: theme.accent,
      backgroundColor: theme.surfaceMuted,
      transform: [{ scale: 0.985 }],
    },
    sectionInner: {
      paddingHorizontal: 18,
      paddingVertical: 18,
    },
    sectionTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    sectionCopy: {
      flex: 1,
      paddingRight: 12,
    },
    sectionEyebrow: {
      fontFamily: fonts.mono,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color: theme.textSecondary,
      opacity: 0.9,
    },
    sectionTitle: {
      marginTop: 6,
      fontFamily: fonts.serif,
      fontSize: 32,
      lineHeight: 34,
      color: theme.textPrimary,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    actionTile: {
      width: "48%",
      minHeight: 124,
      borderRadius: 18,
      marginBottom: spacing.sm,
      overflow: "hidden",
    },
    actionTileGradient: {
      flex: 1,
      alignItems: "stretch",
      justifyContent: "flex-start",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    actionTilePressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    actionIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
    },
    actionLabel: {
      fontFamily: fonts.action,
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0.2,
      color: theme.textPrimary,
      marginTop: spacing.sm,
      opacity: 0.94,
    },
    actionDescription: {
      marginTop: 5,
      fontFamily: fonts.mono,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.2,
      color: theme.textSecondary,
    },
  });
