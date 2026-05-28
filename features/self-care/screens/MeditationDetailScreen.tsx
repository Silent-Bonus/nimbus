import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import {
  buildMeditationRouteParams,
  formatMeditationTagLabel,
  hydrateMeditationTemplate,
  mockMeditationRecommendations,
  type MeditationRouteParams,
  type MeditationTemplate,
} from "@/features/self-care/utils/meditationLibrary";
import type { ColorSet, Spacing, Typography, TypographyTokens } from "@/theme/types";

type MeditationDetailParams = MeditationRouteParams;

const HERO_IMAGE = require("../../../assets/images/mt.jpg");

const parseParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const buildBenefits = (template: MeditationTemplate) => {
  switch (template.tag) {
    case "sleep":
      return [
        "Slow the system before the evening gives way to rest.",
        "Unwind the body with a gentler pace and softer attention.",
        "Carry a quieter rhythm into the next stretch of the day.",
      ];
    case "focus":
      return [
        "Return the mind to one clear point at a time.",
        "Set a steadier cadence before deep work or study.",
        "Reduce noise so attention can settle without force.",
      ];
    case "breath":
      return [
        "Use the breath as a precise anchor for the session.",
        "Lengthen each cycle to create a slower internal tempo.",
        "Ease the body into a more grounded presence.",
      ];
    case "release":
      return [
        "Let tension soften without needing to be solved.",
        "Open a little space around the shoulders and jaw.",
        "Move the day out of the body with care.",
      ];
    case "beginner":
      return [
        "Start with a low-friction entry into meditation.",
        "Follow a simple rhythm that stays easy to return to.",
        "Build confidence without asking for too much too soon.",
      ];
    case "calm":
    default:
      return [
        "Quiet the nervous system before the next transition.",
        "Create a steady pause that feels premium and unhurried.",
        "Carry a softer internal tone into the rest of the day.",
      ];
  }
};

export default function MeditationDetailScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<MeditationDetailParams>();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const [isFavorite, setIsFavorite] = useState(false);

  const meditationId = parseParam(params.meditationId) ?? "";
  const fallbackMeditation = useMemo<MeditationTemplate>(() => {
    return (
      mockMeditationRecommendations.find(
        (item) => item.id === meditationId || item.slug === meditationId
      ) ?? mockMeditationRecommendations[0]
    );
  }, [meditationId]);

  const meditation = hydrateMeditationTemplate(params, fallbackMeditation);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  const benefits = useMemo(() => buildBenefits(meditation), [meditation]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleShare = async () => {
    await Share.share({
      message: `${meditation.title} · ${meditation.description}`,
    });
  };

  const handleStartMeditation = () => {
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_PLAYER,
      params: buildMeditationRouteParams(meditation),
    });
  };

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Meditation Prelude"
          subtitle="A quiet threshold before the session begins."
          onBack={() => router.back()}
          rightActions={[
            {
              icon: isFavorite ? "heart" : "heart-outline",
              accessibilityLabel: isFavorite
                ? "Remove from favorites"
                : "Add to favorites",
              onPress: () => setIsFavorite((value) => !value),
            },
            {
              icon: "share-outline",
              accessibilityLabel: "Share meditation",
              onPress: handleShare,
            },
          ]}
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: spacing.xl * 2.5 },
          ]}
        >
          <View style={styles.heroCard}>
            <Image source={meditation.image ?? HERO_IMAGE} style={styles.heroImage} contentFit="cover" />
            <LinearGradient
              colors={["rgba(9, 11, 8, 0.02)", "rgba(9, 11, 8, 0.84)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.heroGlowTop} />
            <View style={styles.heroGlowBottom} />

            <View style={styles.heroTextBlock}>
              <Text style={styles.heroKicker}>CURATED SESSION</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {meditation.title}
              </Text>
              <Text style={styles.heroSubtext}>
                {meditation.durationLabel} · {formatMeditationTagLabel(meditation.tag)}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardLabel}>ABOUT THIS SESSION</Text>
              <Text style={styles.cardMeta}>{meditation.durationLabel}</Text>
            </View>

            <Text style={styles.descriptionText}>{meditation.description}</Text>

            <View style={styles.tagsRow}>
              {meditation.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>
                    #{formatMeditationTagLabel(tag).toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardLabel}>BENEFITS</Text>
              <View style={styles.miniPill}>
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.miniPillText}>
                  {formatMeditationTagLabel(meditation.tag).toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.benefitList}>
              {benefits.map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={theme.background}
                    />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          <NimbusButton
            label="Start Meditation"
            onPress={handleStartMeditation}
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={theme.buttonPrimaryText}
              />
            }
            style={styles.ctaButton}
          />
        </ScrollView>
      </View>
    </ScreenView>
  );
}

const styling = (
  theme: ColorSet,
  svaTypography: TypographyTokens | undefined,
  spacing: Spacing,
  typography: Typography
) =>
  StyleSheet.create({
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    root: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    heroCard: {
      height: 320,
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroGlowTop: {
      position: "absolute",
      top: -46,
      right: -24,
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: "rgba(163, 190, 140, 0.16)",
    },
    heroGlowBottom: {
      position: "absolute",
      bottom: -56,
      left: -30,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(163, 190, 140, 0.08)",
    },
    heroTextBlock: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.lg,
    },
    heroKicker: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    heroTitle: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 34,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: theme.textPrimary,
    },
    heroSubtext: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 10,
      letterSpacing: 0.3,
    },
    descriptionCard: {
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    benefitCard: {
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.xl,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    cardLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    cardMeta: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    descriptionText: {
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 16,
      lineHeight: 26,
      color: theme.textPrimary,
      opacity: 0.96,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 18,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.16)",
    },
    tagText: {
      ...typography.smallCaption,
      color: theme.chart2 ?? theme.accent,
      letterSpacing: 1.1,
    },
    miniPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    miniPillText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    benefitList: {
      gap: 12,
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    benefitIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
      marginTop: 2,
    },
    benefitText: {
      flex: 1,
      ...typography.body,
      color: theme.textPrimary,
      lineHeight: 24,
    },
    ctaButton: {
      width: "100%",
    },
  });
