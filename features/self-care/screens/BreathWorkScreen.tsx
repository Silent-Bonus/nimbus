import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import PillFilters from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import BreathRecommendationSection from "@/features/self-care/components/breathwork/BreathRecommendationSection";
import BreathStackCard from "@/features/self-care/components/breathwork/BreathStackCard";
import { getWellnessContentList } from "@/features/self-care/services/selfCareService";
import {
  buildBreathWorkPattern,
  buildBreathWorkRecommendation,
  buildBreathWorkCategoryOptions,
  buildBreathWorkRouteParams,
  mapBreathworkContent,
} from "@/features/self-care/utils/breathworkLibrary";
import type {
  BreathWorkListItem,
  WellnessCategoryOption,
} from "@/features/self-care/types/wellnessContentTypes";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type BreathCategorySelection = string;

export const BreathWorkScreen = () => {
  const navigation = useNavigation();
  const {
    newTheme: theme,
    svaTypography,
    spacing,
    typography,
  } = useContext(ThemeContext);

  // This screen renders breathwork cards directly, so state stores the
  // already-mapped UI list model instead of the raw wellness API payload.
  const [contentItems, setContentItems] = useState<BreathWorkListItem[]>([]);

  const [categoryOptions, setCategoryOptions] = useState<
    WellnessCategoryOption[]
  >([{ label: "All", value: "all" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<BreathCategorySelection>("all");
  const [selectedBreathworkId, setSelectedBreathworkId] =
    useState<string>("");

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      // Reset transient UI state whenever the library regains focus so the
      // screen always re-enters from a neutral "all categories" view.
      setSelectedCategory("all");
      setSelectedBreathworkId("");
    }, [])
  );

  useEffect(() => {
    let isActive = true;

    const loadBreathwork = async () => {
      // The list endpoint supports category filtering, so the active pill value
      // can be sent directly when the user narrows the library.
      setIsLoading(true);
      setLoadError(null);
      setContentItems([]);
      setSelectedBreathworkId("");

      try {
        const params: Parameters<typeof getWellnessContentList>[0] =
          selectedCategory === "all"
            ? { modality: "breathwork" }
            : {
                modality: "breathwork",
                category: selectedCategory,
              };

        const result = await getWellnessContentList(params);

        if (!isActive) {
          return;
        }

        const normalizedItems = Array.isArray(result.data)
          ? result.data.map((item, index) => mapBreathworkContent(item, index))
          : [];

        setContentItems(normalizedItems);

        // Category options are derived from the full dataset once and then used
        // to drive subsequent filtered requests.
        if (selectedCategory === "all") {
          setCategoryOptions(buildBreathWorkCategoryOptions(normalizedItems));
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load breathwork right now."
        );
        setContentItems([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadBreathwork();

    return () => {
      isActive = false;
    };
  }, [selectedCategory]);

  // The active card powers the recommendation rail highlight, quote card, and
  // fallback detail target when a tapped recommendation is no longer visible.
  const activeItem = useMemo(
    () =>
      contentItems.find((item) => item.id === selectedBreathworkId) ??
      contentItems[0],
    [contentItems, selectedBreathworkId]
  );

  const visibleRecommendations = useMemo(
    () =>
      contentItems
        .slice(0, 2)
        .map((item) => buildBreathWorkRecommendation(item)),
    [contentItems]
  );

  useEffect(() => {
    // Keep one valid selection in sync with the currently visible list so
    // recommendation taps and card highlighting remain stable after reloads.
    if (isLoading || contentItems.length === 0) {
      return;
    }

    if (!contentItems.some((pattern) => pattern.id === selectedBreathworkId)) {
      setSelectedBreathworkId(contentItems[0]?.id ?? "");
    }
  }, [contentItems, isLoading, selectedBreathworkId]);

  const openBreathworkDetail = useCallback((item: BreathWorkListItem) => {
    setSelectedBreathworkId(item.id);
    // The detail screen hydrates immediately from route params, then refreshes
    // itself from the backend for the latest copy and structure.
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_DETAIL,
      params: buildBreathWorkRouteParams(item),
    });
  }, []);

  const openBreathworkSession = useCallback((item: BreathWorkListItem) => {
    setSelectedBreathworkId(item.id);
    // Session routes now use the same identifier-only payload as detail so the
    // player can fetch the latest content on mount.
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_SESSION,
      params: buildBreathWorkRouteParams(item),
    });
  }, []);

  const resolveRecommendationItem = useCallback(
    (item: (typeof visibleRecommendations)[number]) =>
      contentItems.find((candidate) => candidate.id === item.id) ?? activeItem,
    [activeItem, contentItems]
  );

  const handleSelectRecommendation = useCallback(
    (item: (typeof visibleRecommendations)[number]) => {
      const selectedItem = resolveRecommendationItem(item);

      if (!selectedItem) {
        return;
      }

      openBreathworkDetail(selectedItem);
    },
    [openBreathworkDetail, resolveRecommendationItem]
  );

  const handlePlayRecommendation = useCallback(
    (item: (typeof visibleRecommendations)[number]) => {
      const selectedItem = resolveRecommendationItem(item);

      if (!selectedItem) {
        return;
      }

      openBreathworkSession(selectedItem);
    },
    [openBreathworkSession, resolveRecommendationItem]
  );

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? "All categories"
      : categoryOptions.find((option) => option.value === selectedCategory)
          ?.label ?? selectedCategory;

  const handleSelectCategory = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Breath Work"
          subtitle="Choose a category, then narrow the stack below."
          onBack={() => router.back()}
          containerStyle={styles.header}
        />

        <FlatList
          testID="breathwork-library-list"
          data={contentItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <BreathRecommendationSection
                items={visibleRecommendations}
                selectedId={activeItem?.id ?? ""}
                onSelect={handleSelectRecommendation}
                onPlay={handlePlayRecommendation}
              />

              <PillFilters
                options={categoryOptions}
                selectedValue={selectedCategory}
                onChange={handleSelectCategory}
                uppercase={false}
                scrollable
                contentContainerStyle={styles.filterRow}
                selectedPillStyle={styles.filterPillActive}
                inactivePillStyle={styles.filterPillInactive}
                selectedLabelStyle={styles.filterTextActive}
                inactiveLabelStyle={styles.filterTextInactive}
              />

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>STACKED CATEGORIES</Text>
                  <Text style={styles.sectionTitle}>
                    {selectedCategoryLabel} collection
                  </Text>
                </View>

                <View style={styles.countPill}>
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.countText}>
                    {contentItems.length} rhythm
                    {contentItems.length === 1 ? "" : "s"}
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <BreathStackCard
              item={buildBreathWorkPattern(item)}
              recommendation={buildBreathWorkRecommendation(item)}
              onPress={() => openBreathworkDetail(item)}
              onPlay={() => openBreathworkSession(item)}
              selected={item.id === activeItem?.id}
            />
          )}
          ListFooterComponent={
            activeItem ? (
              <View
                style={[
                  styles.quoteCard,
                  { borderColor: activeItem.palette.accent },
                ]}
              >
                <View
                  style={[
                    styles.quoteIconWrap,
                    {
                      backgroundColor: activeItem.palette.tagBg,
                      borderColor: activeItem.palette.accent,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="repeat"
                    size={18}
                    color={activeItem.palette.tagText}
                  />
                </View>

                {/* <Text
                  style={[
                    styles.quoteText,
                    { color: activeItem.palette.text },
                  ]}
                >
                  {`"${quoteCopy}"`}
                </Text> */}

                <Text style={styles.quoteMeta} numberOfLines={1}>
                  {activeItem.title}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator
                  testID="breathwork-loading-indicator"
                  size="large"
                  color={theme.accent}
                />
                <Text style={styles.emptyTitle}>Loading breathwork...</Text>
                <Text style={styles.emptyText}>
                  Fetching the breathwork collection from the server.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={40}
                  color={theme.textSecondary}
                />
                <Text style={styles.emptyTitle}>
                  {loadError
                    ? "Breathwork is unavailable."
                    : "No rhythms in this filter."}
                </Text>
                <Text style={styles.emptyText}>
                  {loadError
                    ? loadError
                    : "Switch the category chip to bring the library back."}
                </Text>
              </View>
            )
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
    listContent: {
      paddingBottom: spacing.xl * 3,
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
      marginBottom: spacing.md,
    },
    sectionEyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.6,
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
    },
    countText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      letterSpacing: 1,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    quoteCard: {
      marginTop: spacing.xl,
      borderRadius: 28,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.14,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    quoteIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    quoteText: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 22,
      lineHeight: 30,
      color: theme.textPrimary,
      textAlign: "center",
      fontStyle: "italic",
      letterSpacing: -0.2,
    },
    quoteMeta: {
      marginTop: spacing.sm,
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      color: theme.textSecondary,
      textTransform: "uppercase",
      textAlign: "center",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl,
    },
    loadingState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl * 1.5,
      gap: spacing.sm,
    },
    emptyTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      marginTop: spacing.sm,
      marginBottom: 4,
    },
    emptyText: {
      ...typography.body,
      color: theme.textSecondary,
      textAlign: "center",
      maxWidth: 280,
    },
  });

export default BreathWorkScreen;
