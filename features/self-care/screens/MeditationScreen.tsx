import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "@/components/layout/AppHeader";
import NimbusUltraFeaturedCard from "@/components/layout/NimbusUltraFeaturedCard";
import ThemeContext from "@/contexts/ThemeContext";
import PillFilters from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import {
  MeditationFeaturedSkeleton,
  MeditationListSkeleton,
} from "@/features/self-care/components/meditation/MeditationSkeletonSections";
import MeditationTemplateCard from "@/features/self-care/components/meditation/MeditationTemplateCard";

import { getWellnessContentList } from "@/features/self-care/services/selfCareService";
import {
  buildMeditationFilterOptions,
  formatMeditationTagLabel,
  mapMeditationList,
} from "@/features/self-care/utils/meditationLibrary";
import { ROUTES } from "@/constants/routes";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import type {
  MeditationTemplateCardItem,
  MeditationListItem,
  WellnessCategoryOption,
  WellnessContentItem,
} from "@/features/self-care/types/wellnessContentTypes";

export const MeditationScreen: React.FC = () => {
  // Theme and navigation context used by the screen shell and cards.
  const navigation = useNavigation();
  const {
    newTheme: theme,
    svaTypography,
    spacing,
    typography,
  } = useContext(ThemeContext);

  // Raw API items stay in state; UI templates are derived below.
  const [contentItems, setContentItems] = useState<WellnessContentItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    WellnessCategoryOption[]
  >([{ label: "All Modes", value: "all" }]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Loading only tracks the list request for this screen.
  const [isLoading, setIsLoading] = useState(true);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  // The screen renders its own branded header instead of the router header.
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Fetch meditation content for the active category. Filter pills are derived
  // from the full unfiltered response and kept stable in local state.
  useEffect(() => {
    let active = true;

    const loadMeditationContent = async () => {
      setIsLoading(true);
      setContentItems([]);

      try {
        const params: Parameters<typeof getWellnessContentList>[0] =
          selectedCategory === "all"
            ? { modality: "meditation" }
            : {
                modality: "meditation",
                category: selectedCategory,
              };

        const result = await getWellnessContentList(params);
        const sourceItems =
          Array.isArray(result.data) && result.data.length > 0
            ? result.data
            : null;

        const normalized = sourceItems ? sourceItems : [];

        if (active) {
          setContentItems(normalized);

          // Preserve the full category row from the unfiltered response so the
          // user can always switch between server-backed categories.
          if (selectedCategory === "all") {
            setCategoryOptions(
              buildMeditationFilterOptions(normalized.map(mapMeditationList))
            );
          }
        }
      } catch (error) {
        console.warn("Unable to load meditation content:", error);
        if (active) {
          setContentItems([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadMeditationContent();

    return () => {
      active = false;
    };
  }, [selectedCategory]);

  // Convert raw API items into UI-ready card data with normalized labels,
  // fallback copy, and image handling.
  const templates = useMemo(
    () => contentItems.map(mapMeditationList),
    [contentItems]
  );

  // Reset to "all" if the active filter disappears after new data loads.
  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      !categoryOptions.some((option) => option.value === selectedCategory)
    ) {
      setSelectedCategory("all");
    }
  }, [categoryOptions, selectedCategory]);

  // Server-side category filtering means the visible list is simply the
  // current response mapped into meditation templates.
  const visibleTemplates = templates;

  // The featured card always uses the first visible item, falling back to the
  // first available meditation if no filter result exists.
  const featuredTemplate = useMemo(
    () => visibleTemplates[0] ?? templates[0],
    [visibleTemplates, templates]
  );

  const listEntries = useMemo(
    () =>
      visibleTemplates.map((template) => ({
        template,
        cardItem: {
          id: template.id,
          title: template.title,
          description: template.description,
          tags: template.tags
            .slice(0, 2)
            .map((tag) => formatMeditationTagLabel(tag)),
          durationLabel: template.durationLabel,
          image:
            typeof template.image === "string"
              ? { uri: template.image }
              : template.image,
          isLocked: template.isLocked,
          rating: template.rating,
        } satisfies MeditationTemplateCardItem,
      })),
    [visibleTemplates]
  );

  const selectedLabel =
    categoryOptions.find((option) => option.value === selectedCategory)
      ?.label ??
    "All Modes";

  // Detail fetches from the API on mount, so this route only passes identifiers.
  const openMeditationDetail = useCallback((template: MeditationListItem) => {
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_DETAIL,
      params: {
        meditationId: template.id,
        meditationSlug: template.slug,
      },
    });
  }, []);

  if (isLoading) {
    return (
      <ScreenView bgColor={theme.background} style={styles.screen}>
        <View style={styles.root}>
          <AppHeader
            title="Quiet Current"
            subtitle="Curated recommendations for breath, sleep, and reset."
            onBack={() => router.back()}
            containerStyle={styles.header}
          />

          <View style={styles.loadingContent}>
            <MeditationFeaturedSkeleton />
            <MeditationListSkeleton />
          </View>
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Quiet Current"
          subtitle="Curated recommendations for breath, sleep, and reset."
          onBack={() => router.back()}
          containerStyle={styles.header}
        />

        <FlatList
          testID="meditation-library-list"
          data={listEntries}
          keyExtractor={(item) => item.template.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: spacing.xl * 2 },
          ]}
          ListHeaderComponent={
            <>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredEyebrow}>
                  CURATED RECOMMENDATION
                </Text>
                <Text style={styles.featuredTitle}>
                  The first pull for the present moment.
                </Text>
              </View>

              {featuredTemplate ? (
                <View style={styles.featuredCardWrap}>
                  {/** Featured card still expects an RN image source, so backend
                   * image strings are wrapped at the render edge. */}
                  <NimbusUltraFeaturedCard
                    title={featuredTemplate.title}
                    subtitle={`${
                      featuredTemplate.durationLabel
                    } · ${formatMeditationTagLabel(
                      featuredTemplate.tags[0] ??
                        featuredTemplate.category ??
                        "curated"
                    )}`}
                    description={featuredTemplate.description}
                    image={
                      typeof featuredTemplate.image === "string"
                        ? { uri: featuredTemplate.image }
                        : featuredTemplate.image
                    }
                    badge="Curated pick"
                    tint="rgba(163,190,140,0.12)"
                    accent={theme.chart2 ?? theme.accent}
                    onPress={() => openMeditationDetail(featuredTemplate)}
                  />
                </View>
              ) : null}

              <PillFilters
                options={categoryOptions}
                selectedValue={selectedCategory}
                onChange={setSelectedCategory}
                scrollable
                contentContainerStyle={styles.filterRow}
                selectedPillStyle={styles.filterPillActive}
                inactivePillStyle={styles.filterPillInactive}
                selectedLabelStyle={styles.filterTextActive}
                inactiveLabelStyle={styles.filterTextInactive}
              />

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>LIBRARY</Text>
                  <Text style={styles.sectionTitle}>
                    {selectedLabel} collection
                  </Text>
                </View>

                <View style={styles.countPill}>
                  <Ionicons
                    name="leaf-outline"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.countText}>
                    {listEntries.length} sessions
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <MeditationTemplateCard
              item={item.cardItem}
              onPress={() => openMeditationDetail(item.template)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="leaf-outline"
                size={40}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyTitle}>No templates in this mode.</Text>
              <Text style={styles.emptyText}>
                Try another filter to surface a different rhythm.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenView>
  );
};

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
    loadingContent: {
      flex: 1,
    },
    listContent: {
      paddingBottom: spacing.xl * 3,
    },
    featuredHeader: {
      marginBottom: spacing.md,
    },
    featuredEyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    featuredTitle: {
      ...typography.h3,
      color: theme.textPrimary,
    },
    featuredCardWrap: {
      marginBottom: spacing.lg,
    },
    filterRow: {
      paddingVertical: spacing.xs,
      paddingRight: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    filterPillInactive: {
      backgroundColor: theme.surface,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    filterPillActive: {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    filterTextInactive: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 11,
      letterSpacing: 1.1,
      color: theme.textSecondary,
    },
    filterTextActive: {
      color: theme.textPrimary,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: spacing.md,
    },
    sectionEyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    sectionTitle: {
      ...typography.h3,
      color: theme.textPrimary,
    },
    countPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      flexShrink: 0,
    },
    countText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 0.9,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      marginTop: spacing.md,
      textAlign: "center",
    },
    emptyText: {
      ...typography.body,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
  });

export default MeditationScreen;
