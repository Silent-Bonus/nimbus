import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
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
import { getWellnessContentDetail } from "@/features/self-care/services/selfCareService";
import {
  buildMeditationRouteParams,
  formatMeditationTagLabel,
  hydrateMeditationTemplate,
  mapMeditationTemplate,
  mockMeditationRecommendations,
  type MeditationRouteParams,
  type MeditationTemplate,
} from "@/features/self-care/utils/meditationLibrary";
import type { ColorSet, Spacing, Typography, TypographyTokens } from "@/theme/types";

type MeditationDetailParams = MeditationRouteParams;

type BenefitItem = {
  id: number | string;
  title: string;
  text: string;
};

const HERO_IMAGE = require("../../../assets/images/mt.jpg");

const parseParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const isNumericId = (value: string) => /^\d+$/.test(value.trim());

const buildFallbackBenefits = (template: MeditationTemplate): BenefitItem[] => {
  switch (template.tag) {
    case "sleep":
      return [
        {
          id: "sleep-1",
          title: "Restorative winding down",
          text: "Slows the system before the evening gives way to rest.",
        },
        {
          id: "sleep-2",
          title: "Gentler breath rhythm",
          text: "Encourages a softer pace that feels easier to release into sleep.",
        },
        {
          id: "sleep-3",
          title: "Quiet transition",
          text: "Carries a calmer cadence into the next stretch of the day.",
        },
      ];
    case "focus":
      return [
        {
          id: "focus-1",
          title: "Attentional clarity",
          text: "Returns the mind to one point at a time without force.",
        },
        {
          id: "focus-2",
          title: "Deeper work prep",
          text: "Sets a steadier cadence before study or deep work.",
        },
        {
          id: "focus-3",
          title: "Less mental noise",
          text: "Creates space for attention to settle without friction.",
        },
      ];
    case "breath":
      return [
        {
          id: "breath-1",
          title: "Breath as anchor",
          text: "Uses the inhale and exhale as a precise focus point.",
        },
        {
          id: "breath-2",
          title: "Slower internal tempo",
          text: "Lengthens each cycle to create a calmer rhythm.",
        },
        {
          id: "breath-3",
          title: "Grounded presence",
          text: "Eases the body into a more supported state.",
        },
      ];
    case "release":
      return [
        {
          id: "release-1",
          title: "Tension softening",
          text: "Lets the shoulders and jaw relax without needing to solve anything.",
        },
        {
          id: "release-2",
          title: "Gentler exhale",
          text: "Uses the breath to move the day out of the body with care.",
        },
        {
          id: "release-3",
          title: "Room to unwind",
          text: "Opens a little more space around the edges of effort.",
        },
      ];
    case "beginner":
      return [
        {
          id: "beginner-1",
          title: "Low-friction entry",
          text: "Starts with a simple rhythm that stays easy to return to.",
        },
        {
          id: "beginner-2",
          title: "Confidence builder",
          text: "Helps new meditators settle without asking too much too soon.",
        },
        {
          id: "beginner-3",
          title: "Steady repetition",
          text: "Reinforces the basics so the practice feels approachable.",
        },
      ];
    case "calm":
    default:
      return [
        {
          id: "calm-1",
          title: "Nervous system reset",
          text: "Supports a quieter pause before the next transition.",
        },
        {
          id: "calm-2",
          title: "Soft, premium pacing",
          text: "Creates a deliberate stillness that feels unhurried.",
        },
        {
          id: "calm-3",
          title: "Softer internal tone",
          text: "Helps the rest of the day feel less sharp around the edges.",
        },
      ];
  }
};

export default function MeditationDetailScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<MeditationDetailParams>();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isStartingMeditation, setIsStartingMeditation] = useState(false);
  const hasLaunchedMeditationRef = useRef(false);

  const meditationId = parseParam(params.meditationId) ?? "";
  const meditationTitleParam = parseParam(params.meditationTitle);
  const meditationDescriptionParam = parseParam(params.meditationDescription);
  const meditationDurationLabelParam = parseParam(
    params.meditationDurationLabel
  );
  const meditationImageParam = parseParam(params.meditationImage);
  const meditationTagsParam = parseParam(params.meditationTags);
  const meditationCategoryParam = parseParam(params.meditationCategory);
  const meditationRatingParam = parseParam(params.meditationRating);
  const meditationReviewsParam = parseParam(params.meditationReviews);
  const meditationLevelParam = parseParam(params.meditationLevel);
  const meditationDoshaParam = parseParam(params.meditationDosha);
  const meditationSourceParam = parseParam(params.meditationSource);

  const fallbackMeditation = useMemo<MeditationTemplate>(() => {
    return (
      mockMeditationRecommendations.find(
        (item) => item.id === meditationId || item.slug === meditationId
      ) ?? mockMeditationRecommendations[0]
    );
  }, [meditationId]);

  const routeMeditationParams = useMemo<MeditationDetailParams>(
    () => ({
      meditationId,
      meditationTitle: meditationTitleParam,
      meditationDescription: meditationDescriptionParam,
      meditationDurationLabel: meditationDurationLabelParam,
      meditationImage: meditationImageParam,
      meditationTags: meditationTagsParam,
      meditationCategory: meditationCategoryParam,
      meditationRating: meditationRatingParam,
      meditationReviews: meditationReviewsParam,
      meditationLevel: meditationLevelParam,
      meditationDosha: meditationDoshaParam,
      meditationSource: meditationSourceParam,
    }),
    [
      meditationId,
      meditationTitleParam,
      meditationDescriptionParam,
      meditationDurationLabelParam,
      meditationImageParam,
      meditationTagsParam,
      meditationCategoryParam,
      meditationRatingParam,
      meditationReviewsParam,
      meditationLevelParam,
      meditationDoshaParam,
      meditationSourceParam,
    ]
  );

  const initialMeditation = useMemo(
    () => hydrateMeditationTemplate(routeMeditationParams, fallbackMeditation),
    [fallbackMeditation, routeMeditationParams]
  );

  const [meditation, setMeditation] = useState<MeditationTemplate>(
    initialMeditation
  );

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    setMeditation(initialMeditation);
    setLoadError(null);

    if (!isNumericId(meditationId)) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);

    void getWellnessContentDetail(Number(meditationId))
      .then((response) => {
        if (!active) return;
        setMeditation(mapMeditationTemplate(response.data, 0));
      })
      .catch((error) => {
        console.warn("Unable to load meditation details:", error);
        if (active) {
          setLoadError("Unable to load the latest meditation details.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [initialMeditation, meditationId]);

  useEffect(() => {
    hasLaunchedMeditationRef.current = false;
    setIsStartingMeditation(false);
  }, [meditationId]);

  const benefits = useMemo<BenefitItem[]>(
    () =>
      meditation.benefits?.length
        ? meditation.benefits.map((benefit) => ({
            id: benefit.id,
            title: benefit.title,
            text: benefit.text,
          }))
        : buildFallbackBenefits(meditation),
    [meditation]
  );

  const ratingLabel =
    typeof meditation.rating === "number" ? meditation.rating.toFixed(1) : "4.9";

  const handleShare = async () => {
    await Share.share({
      message: `${meditation.title} · ${meditation.description}`,
    });
  };

  const handleStartMeditation = useCallback(() => {
    if (isStartingMeditation || hasLaunchedMeditationRef.current) {
      return;
    }

    hasLaunchedMeditationRef.current = true;
    setIsStartingMeditation(true);

    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_PLAYER,
      params: {
        ...buildMeditationRouteParams(meditation),
      },
    });
  }, [isStartingMeditation, meditation]);

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
            <Image
              source={meditation.image ?? HERO_IMAGE}
              style={styles.heroImage}
              contentFit="cover"
            />
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
                {meditation.durationLabel}
                {meditation.category ? ` · ${meditation.category}` : ""}
              </Text>

              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaPill}>
                  <Ionicons
                    name="star"
                    size={12}
                    color={theme.chart2 ?? theme.accent}
                  />
                  <Text style={styles.heroMetaText}>{ratingLabel}</Text>
                </View>
                <View style={styles.heroMetaPill}>
                  <Ionicons
                    name="leaf-outline"
                    size={12}
                    color={theme.chart2 ?? theme.accent}
                  />
                  <Text style={styles.heroMetaText}>
                    {meditation.dosha ?? "All doshas"}
                  </Text>
                </View>
                <View style={styles.heroMetaPill}>
                  <Ionicons
                    name="layers-outline"
                    size={12}
                    color={theme.chart2 ?? theme.accent}
                  />
                  <Text style={styles.heroMetaText}>
                    {meditation.level ?? "All levels"}
                  </Text>
                </View>
              </View>

              {isLoading ? (
                <View style={styles.loadingChip}>
                  <ActivityIndicator
                    size="small"
                    color={theme.chart2 ?? theme.accent}
                  />
                  <Text style={styles.loadingChipText}>Refreshing details</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.descriptionCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardLabel}>ABOUT THIS SESSION</Text>
              <Text style={styles.cardMeta}>
                {meditation.date ?? meditation.durationLabel}
              </Text>
            </View>

            <Text style={styles.descriptionText}>{meditation.description}</Text>

            {meditation.longDescription ? (
              <Text style={styles.longDescriptionText}>
                {meditation.longDescription}
              </Text>
            ) : null}

            {meditation.tags.length > 0 ? (
              <View style={styles.tagsRow}>
                {meditation.tags.slice(0, 4).map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>
                      #{formatMeditationTagLabel(tag).toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {meditation.guidance ? (
            <View style={styles.guidanceCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>GUIDANCE</Text>
                <View style={styles.miniPill}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.miniPillText}>Practice cues</Text>
                </View>
              </View>

              <Text style={styles.sectionBodyText}>{meditation.guidance}</Text>
            </View>
          ) : null}

          {meditation.instructor ? (
            <View style={styles.instructorCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>INSTRUCTOR</Text>
                <Text style={styles.cardMeta}>{meditation.category}</Text>
              </View>

              <View style={styles.instructorRow}>
                <Image
                  source={
                    meditation.instructor.image
                      ? { uri: meditation.instructor.image }
                      : HERO_IMAGE
                  }
                  style={styles.instructorAvatar}
                  contentFit="cover"
                />

                <View style={styles.instructorCopy}>
                  <Text style={styles.instructorName}>
                    {meditation.instructor.name}
                  </Text>
                  <Text style={styles.instructorRole}>
                    {meditation.instructor.role}
                  </Text>
                  <Text style={styles.instructorBio}>
                    {meditation.instructor.bio}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

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
                  {benefits.length} insights
                </Text>
              </View>
            </View>

            <View style={styles.benefitList}>
              {benefits.map((benefit) => (
                <View key={benefit.id} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={theme.background}
                    />
                  </View>

                  <View style={styles.benefitCopy}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitText}>{benefit.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {meditation.scientificSynthesis ? (
            <View style={styles.scienceCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>SCIENTIFIC SYNTHESIS</Text>
                <Text style={styles.cardMeta}>Evidence-informed</Text>
              </View>

              <Text style={styles.scienceTitle}>
                {meditation.scientificSynthesis.title}
              </Text>
              <Text style={styles.sectionBodyText}>
                {meditation.scientificSynthesis.text}
              </Text>
              <Text style={styles.scienceSource}>
                Source: {meditation.scientificSynthesis.source}
              </Text>
            </View>
          ) : null}

          {loadError ? (
            <View style={styles.errorCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.errorTitle}>Detail unavailable</Text>
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color="#F7C48B"
                />
              </View>
              <Text style={styles.errorText}>{loadError}</Text>
            </View>
          ) : null}

          <NimbusButton
            label="Start Meditation"
            onPress={handleStartMeditation}
            loading={isStartingMeditation}
            disabled={isStartingMeditation}
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
      height: 332,
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
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 14,
    },
    heroMetaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(7, 9, 7, 0.48)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    heroMetaText: {
      ...typography.smallCaption,
      color: theme.textPrimary,
      letterSpacing: 0.8,
    },
    loadingChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      marginTop: 12,
      alignSelf: "flex-start",
      backgroundColor: "rgba(7, 9, 7, 0.52)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    loadingChipText: {
      ...typography.smallCaption,
      color: theme.textPrimary,
      letterSpacing: 0.8,
    },
    sectionCardBase: {
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
    guidanceCard: {
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
    instructorCard: {
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
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    scienceCard: {
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
    errorCard: {
      borderRadius: 28,
      backgroundColor: "rgba(247, 196, 139, 0.08)",
      borderWidth: 1,
      borderColor: "rgba(247, 196, 139, 0.18)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
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
    longDescriptionText: {
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 15,
      lineHeight: 24,
      color: theme.textSecondary,
      marginTop: 14,
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
    sectionBodyText: {
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 15,
      lineHeight: 24,
      color: theme.textPrimary,
    },
    instructorRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    instructorAvatar: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.surfaceMuted,
    },
    instructorCopy: {
      flex: 1,
      minWidth: 0,
    },
    instructorName: {
      ...typography.h3,
      color: theme.textPrimary,
      marginBottom: 4,
    },
    instructorRole: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 1.2,
      color: theme.chart2 ?? theme.accent,
      textTransform: "uppercase",
    },
    instructorBio: {
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 15,
      lineHeight: 24,
      color: theme.textSecondary,
      marginTop: 8,
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
    benefitCopy: {
      flex: 1,
      minWidth: 0,
    },
    benefitTitle: {
      ...typography.body,
      color: theme.textPrimary,
      fontWeight: "600",
      marginBottom: 4,
    },
    benefitText: {
      ...typography.body,
      color: theme.textSecondary,
      lineHeight: 24,
    },
    scienceTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      marginBottom: 10,
    },
    scienceSource: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 11,
      lineHeight: 16,
      color: theme.textSecondary,
      marginTop: 12,
    },
    errorTitle: {
      ...typography.h3,
      color: "#F7C48B",
    },
    errorText: {
      ...typography.body,
      color: "#F4D8B5",
      marginTop: 8,
    },
    ctaButton: {
      width: "100%",
      marginBottom: spacing.lg,
    },
  });
