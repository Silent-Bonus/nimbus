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
  BreathWorkCategoryOption,
  BreathWorkDetail,
} from "@/features/self-care/types/breathworkTypes";
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

  const [breathworkDetails, setBreathworkDetails] = useState<BreathWorkDetail[]>(
    []
  );
  const [categoryOptions, setCategoryOptions] = useState<
    BreathWorkCategoryOption[]
  >([{ label: "All", value: "all" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<BreathCategorySelection>("all");
  const [selectedPatternId, setSelectedPatternId] = useState<string>("");

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setSelectedCategory("all");
      setSelectedPatternId("");
    }, [])
  );

  useEffect(() => {
    let isActive = true;

    const loadBreathwork = async () => {
      setIsLoading(true);
      setLoadError(null);
      setBreathworkDetails([]);
      setSelectedPatternId("");

      try {
        const params =
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

        const mappedDetails = (result.data ?? []).map((item, index) =>
          mapBreathworkContent(item, index)
        );

        setBreathworkDetails(mappedDetails);

        if (selectedCategory === "all") {
          setCategoryOptions(buildBreathWorkCategoryOptions(mappedDetails));
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
        setBreathworkDetails([]);
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

  const visibleDetails = breathworkDetails;

  const activeDetail = useMemo(
    () =>
      visibleDetails.find((item) => item.id === selectedPatternId) ??
      visibleDetails[0],
    [selectedPatternId, visibleDetails]
  );

  const visibleRecommendations = useMemo(
    () => visibleDetails.map((item) => buildBreathWorkRecommendation(item)),
    [visibleDetails]
  );

  useEffect(() => {
    if (isLoading || visibleDetails.length === 0) {
      return;
    }

    if (!visibleDetails.some((pattern) => pattern.id === selectedPatternId)) {
      setSelectedPatternId(visibleDetails[0]?.id ?? "");
    }
  }, [isLoading, selectedPatternId, visibleDetails]);

  const handleSelectPattern = useCallback((detail: BreathWorkDetail) => {
    setSelectedPatternId(detail.id);
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_DETAIL,
      params: buildBreathWorkRouteParams(detail),
    });
  }, []);

  const handlePlayPattern = useCallback((detail: BreathWorkDetail) => {
    setSelectedPatternId(detail.id);
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_SESSION,
      params: buildBreathWorkRouteParams(detail),
    });
  }, []);

  const handleSelectRecommendation = useCallback(
    (item: (typeof visibleRecommendations)[number]) => {
      const detail =
        visibleDetails.find((candidate) => candidate.id === item.id) ??
        activeDetail;

      if (!detail) {
        return;
      }

      setSelectedPatternId(detail.id);
      router.push({
        pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_DETAIL,
        params: buildBreathWorkRouteParams(detail),
      });
    },
    [activeDetail, visibleDetails]
  );

  const handlePlayRecommendation = useCallback(
    (item: (typeof visibleRecommendations)[number]) => {
      const detail =
        visibleDetails.find((candidate) => candidate.id === item.id) ??
        activeDetail;

      if (!detail) {
        return;
      }

      setSelectedPatternId(detail.id);
      router.push({
        pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_SESSION,
        params: buildBreathWorkRouteParams(detail),
      });
    },
    [activeDetail, visibleDetails]
  );

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? "All categories"
      : categoryOptions.find((option) => option.value === selectedCategory)?.label ??
        selectedCategory;

  const handleSelectCategory = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  const quoteCopy =
    activeDetail?.mantra ?? activeDetail?.benefits[0]?.text ?? "";

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
          data={visibleDetails}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <BreathRecommendationSection
                items={visibleRecommendations}
                selectedId={activeDetail?.id ?? ""}
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
                    {visibleDetails.length} rhythm
                    {visibleDetails.length === 1 ? "" : "s"}
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <BreathStackCard
              item={buildBreathWorkPattern(item)}
              recommendation={buildBreathWorkRecommendation(item)}
              onPress={() => handleSelectPattern(item)}
              onPlay={() => handlePlayPattern(item)}
              selected={item.id === activeDetail?.id}
            />
          )}
          ListFooterComponent={
            activeDetail ? (
              <View
                style={[
                  styles.quoteCard,
                  { borderColor: activeDetail.palette.accent },
                ]}
              >
                <View
                  style={[
                    styles.quoteIconWrap,
                    {
                      backgroundColor: activeDetail.palette.tagBg,
                      borderColor: activeDetail.palette.accent,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="repeat"
                    size={18}
                    color={activeDetail.palette.tagText}
                  />
                </View>

                <Text
                  style={[
                    styles.quoteText,
                    { color: activeDetail.palette.text },
                  ]}
                >
                  {`"${quoteCopy}"`}
                </Text>

                <Text style={styles.quoteMeta} numberOfLines={1}>
                  {activeDetail.title}
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
