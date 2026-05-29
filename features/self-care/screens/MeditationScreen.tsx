import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  buildMeditationRouteParams,
  filterMeditationTemplates,
  formatMeditationTagLabel,
  fallbackMeditationTemplates,
  mapMeditationTemplate,
  type MeditationTemplate,
} from "@/features/self-care/utils/meditationLibrary";
import { ROUTES } from "@/constants/routes";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

export const MeditationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);

  const [templates, setTemplates] = useState<MeditationTemplate[]>(
    fallbackMeditationTemplates
  );
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const loadMeditationContent = async () => {
      setIsLoading(true);

      try {
        const result = await getWellnessContentList({ modality: "meditation" });
        const sourceItems =
          Array.isArray(result.data) && result.data.length > 0
            ? result.data
            : null;

        const normalized = sourceItems
          ? sourceItems.map((item, index) => mapMeditationTemplate(item, index))
          : fallbackMeditationTemplates;

        if (active) {
          setTemplates(normalized);
        }
      } catch (error) {
        console.warn("Unable to load meditation content:", error);
        if (active) {
          setTemplates(fallbackMeditationTemplates);
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
  }, []);

  const filterOptions = useMemo(
    () => buildMeditationFilterOptions(templates),
    [templates]
  );

  useEffect(() => {
    if (
      selectedTag !== "all" &&
      !filterOptions.some((option) => option.value === selectedTag)
    ) {
      setSelectedTag("all");
    }
  }, [filterOptions, selectedTag]);

  const visibleTemplates = useMemo(
    () => filterMeditationTemplates(templates, selectedTag),
    [templates, selectedTag]
  );

  const featuredTemplate = useMemo(
    () => visibleTemplates[0] ?? templates[0],
    [visibleTemplates, templates]
  );

  const listTemplates = useMemo(
    () => visibleTemplates,
    [visibleTemplates]
  );

  const selectedLabel =
    filterOptions.find((option) => option.value === selectedTag)?.label ??
    "All Modes";

  const openMeditationDetail = useCallback((template: MeditationTemplate) => {
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_DETAIL,
      params: buildMeditationRouteParams(template),
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
          data={listTemplates}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: spacing.xl * 2 },
          ]}
          ListHeaderComponent={
            <>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredEyebrow}>CURATED RECOMMENDATION</Text>
                <Text style={styles.featuredTitle}>
                  The first pull for the present moment.
                </Text>
              </View>

              {featuredTemplate ? (
                <View style={styles.featuredCardWrap}>
                  <NimbusUltraFeaturedCard
                    title={featuredTemplate.title}
                    subtitle={`${featuredTemplate.durationLabel} · ${formatMeditationTagLabel(featuredTemplate.tag)}`}
                    description={featuredTemplate.description}
                    image={featuredTemplate.image}
                    badge="Curated pick"
                    tint="rgba(163,190,140,0.12)"
                    accent={theme.chart2 ?? theme.accent}
                    onPress={() => openMeditationDetail(featuredTemplate)}
                  />
                </View>
              ) : null}

              <PillFilters
                options={filterOptions}
                selectedValue={selectedTag}
                onChange={setSelectedTag}
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
                    {listTemplates.length} sessions
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <MeditationTemplateCard
              item={item}
              onPress={() => openMeditationDetail(item)}
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
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
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
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
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
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
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
