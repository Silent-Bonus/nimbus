import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import PillFilters from "@/components/ui/PillFilters";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";

import { ROUTES } from "@/constants/routes";

import ThemeContext from "@/contexts/ThemeContext";

import AffirmationLibrarySkeleton from "@/features/self-care/components/affirmation/AffirmationLibrarySkeleton";
import AffirmationListCard from "@/features/self-care/components/affirmation/AffirmationListCard";
import AffirmationStoryModal from "@/features/self-care/components/affirmation/AffirmationStoryModal";
import AffirmationRecommendationSection from "@/features/self-care/components/affirmation/AffirmationRecommendationSection";

import { consumeQueuedCreatedAffirmation } from "@/features/self-care/data/affirmationCreationInbox";

import {
  getAffirmations,
  getAffirmationBySlug,
} from "@/features/self-care/services/affirmationService";
import { buildAffirmationRecommendations } from "@/features/self-care/utils/affirmationPresentation";
import {
  buildAffirmationFilters,
  filterAffirmations,
} from "@/features/self-care/utils/affirmationHelpers";
import type {
  AffirmationDeck,
  AffirmationResolvedItem,
} from "@/features/self-care/types/affirmation";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type AffirmationFilterValue = string | "all";

const EMPTY_AFFIRMATION_DECK: AffirmationDeck = {
  cards: [],
  recommendations: [],
};

export const AffirmationScreen = () => {
  const navigation = useNavigation();
  const {
    newTheme: theme,
    svaTypography,
    spacing,
    typography,
  } = useContext(ThemeContext);

  const [affirmationDeck, setAffirmationDeck] = useState<AffirmationDeck>(
    EMPTY_AFFIRMATION_DECK
  );
  const [selectedTone, setSelectedTone] =
    useState<AffirmationFilterValue>("all");
  const [selectedAffirmationId, setSelectedAffirmationId] =
    useState<string>("");
  const [storyVisible, setStoryVisible] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const visibleAffirmations = useMemo(
    () => filterAffirmations(affirmationDeck.cards, selectedTone),
    [affirmationDeck.cards, selectedTone]
  );

  const affirmationFilters = useMemo(
    () => buildAffirmationFilters(affirmationDeck.cards),
    [affirmationDeck.cards]
  );

  const visibleRecommendations = useMemo(
    () => buildAffirmationRecommendations(visibleAffirmations),
    [visibleAffirmations]
  );

  const mergeResolvedAffirmation = useCallback(
    (
      resolved: AffirmationResolvedItem,
      options?: {
        prepend?: boolean;
        select?: boolean;
        revealAllIfNeeded?: boolean;
      }
    ) => {
      setAffirmationDeck((current) => {
        const nextCards = current.cards.some(
          (card) => card.id === resolved.card.id
        )
          ? current.cards.map((card) =>
              card.id === resolved.card.id
                ? {
                    ...resolved.card,
                    paletteKey: card.paletteKey ?? resolved.card.paletteKey,
                  }
                : card
            )
          : options?.prepend
          ? [resolved.card, ...current.cards]
          : [...current.cards, resolved.card];

        return {
          ...current,
          cards: nextCards,
          recommendations: buildAffirmationRecommendations(nextCards),
        };
      });

      if (options?.select !== false) {
        setSelectedAffirmationId(resolved.recommendation.id);
      }

      if (
        options?.revealAllIfNeeded &&
        selectedTone !== "all" &&
        selectedTone !== resolved.card.tone
      ) {
        setSelectedTone("all");
      }
    },
    [selectedTone]
  );

  const loadAffirmations = useCallback(async () => {
    setIsInitialLoading(true);
    setLoadError(null);

    try {
      const deck = await getAffirmations();
      setAffirmationDeck(deck);
    } catch (error) {
      console.warn("Unable to load affirmation library:", error);
      setLoadError(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Unable to load affirmations right now."
      );
      setAffirmationDeck(EMPTY_AFFIRMATION_DECK);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAffirmations();
  }, [loadAffirmations]);

  useFocusEffect(
    useCallback(() => {
      const pending = consumeQueuedCreatedAffirmation();

      if (pending) {
        mergeResolvedAffirmation(pending, {
          prepend: true,
          select: false,
          revealAllIfNeeded: true,
        });
      }
    }, [mergeResolvedAffirmation])
  );

  useEffect(() => {
    if (
      !visibleAffirmations.some((item) => item.id === selectedAffirmationId)
    ) {
      setSelectedAffirmationId(
        visibleRecommendations[0]?.id ??
          visibleAffirmations[0]?.id ??
          affirmationDeck.recommendations[0]?.id ??
          affirmationDeck.cards[0]?.id ??
          ""
      );
    }
  }, [
    affirmationDeck.cards,
    affirmationDeck.recommendations,
    selectedAffirmationId,
    visibleAffirmations,
    visibleRecommendations,
  ]);

  const selectedAffirmation = useMemo(
    () =>
      visibleAffirmations.find((item) => item.id === selectedAffirmationId) ??
      affirmationDeck.cards.find((item) => item.id === selectedAffirmationId) ??
      visibleAffirmations[0] ??
      affirmationDeck.cards[0],
    [affirmationDeck.cards, selectedAffirmationId, visibleAffirmations]
  );

  const selectedRecommendationId = useMemo(
    () =>
      visibleRecommendations.some((item) => item.id === selectedAffirmationId)
        ? selectedAffirmationId
        : visibleRecommendations[0]?.id ?? "",
    [selectedAffirmationId, visibleRecommendations]
  );

  const listAffirmations = useMemo(
    () =>
      visibleAffirmations.filter((item) => item.id !== selectedAffirmation?.id),
    [selectedAffirmation?.id, visibleAffirmations]
  );

  const selectedToneLabel = selectedTone === "all" ? "All tones" : selectedTone;
  const isToneEmpty =
    selectedTone !== "all" &&
    visibleAffirmations.length === 0 &&
    affirmationDeck.cards.length > 0;
  const isLibraryEmpty =
    selectedTone === "all" && affirmationDeck.cards.length === 0;

  const handleOpenStory = useCallback(
    async (item: { id: string }) => {
      setSelectedAffirmationId(item.id);
      setStoryVisible(true);
      setIsStoryLoading(true);

      try {
        const resolved = await getAffirmationBySlug(item.id);
        mergeResolvedAffirmation(resolved);
      } catch (error) {
        console.warn("Failed to load affirmation detail:", error);
      } finally {
        setIsStoryLoading(false);
      }
    },
    [mergeResolvedAffirmation]
  );

  const handleOpenCreateAffirmation = useCallback(() => {
    router.push(ROUTES.AUTH.SELF_CARE_CREATE_AFFIRMATION as never);
  }, []);

  const handleCloseStory = useCallback(() => {
    setStoryVisible(false);
    setIsStoryLoading(false);
  }, []);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Affirmations"
          onBack={() => router.back()}
          rightAction={{
            icon: "pencil-outline",
            accessibilityLabel: "Create custom affirmation",
            onPress: handleOpenCreateAffirmation,
          }}
          containerStyle={styles.header}
        />

        {isInitialLoading ? <AffirmationLibrarySkeleton /> : null}

        {!isInitialLoading && loadError ? (
          <View testID="affirmation-error-state" style={styles.statePanel}>
            <View style={styles.stateIcon}>
              <MaterialCommunityIcons
                name="cloud-outline"
                size={28}
                color={theme.textPrimary}
              />
            </View>
            <Text style={styles.stateTitle}>Couldn't load affirmations</Text>
            <Text style={styles.stateText}>{loadError}</Text>
            <NimbusButton
              testID="affirmation-retry-button"
              label="Try again"
              onPress={() => {
                void loadAffirmations();
              }}
              style={styles.retryButton}
            />
          </View>
        ) : null}

        {!isInitialLoading && !loadError ? (
          <FlatList
            testID="affirmation-library-list"
            data={listAffirmations}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                <AffirmationRecommendationSection
                  items={visibleRecommendations}
                  selectedId={selectedRecommendationId}
                  onSelect={handleOpenStory}
                />

                <PillFilters
                  options={affirmationFilters}
                  selectedValue={selectedTone}
                  onChange={setSelectedTone}
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
                    <Text style={styles.sectionEyebrow}>LIBRARY</Text>
                    <Text style={styles.sectionTitle}>
                      {selectedToneLabel} collection
                    </Text>
                  </View>

                  <View style={styles.countPill}>
                    <MaterialCommunityIcons
                      name="cards-heart-outline"
                      size={14}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.countText}>
                      {visibleAffirmations.length} affirmations
                    </Text>
                  </View>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <AffirmationListCard
                item={item}
                onPress={handleOpenStory}
                selected={item.id === selectedAffirmation?.id}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="cards-heart-outline"
                  size={40}
                  color={theme.textSecondary}
                />
                <Text style={styles.emptyTitle}>
                  {isLibraryEmpty
                    ? "No affirmations available yet."
                    : isToneEmpty
                    ? "No lines in this tone yet."
                    : "No extra lines in this tone."}
                </Text>
                <Text style={styles.emptyText}>
                  {isLibraryEmpty
                    ? "Check back soon for fresh affirmation lines."
                    : isToneEmpty
                    ? "Try another tone to explore more affirmation cards."
                    : "The selected line is still available above."}
                </Text>
              </View>
            }
          />
        ) : null}

        <AffirmationStoryModal
          visible={storyVisible}
          onClose={handleCloseStory}
          affirmation={selectedAffirmation}
          isLoading={isStoryLoading}
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
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 72,
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
    statePanel: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl * 2,
    },
    stateIcon: {
      width: 64,
      height: 64,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      marginBottom: spacing.md,
    },
    stateTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      textAlign: "center",
    },
    stateText: {
      ...typography.body,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: spacing.sm,
      maxWidth: 320,
    },
    retryButton: {
      minWidth: 156,
      marginTop: spacing.lg,
    },
  });

export default AffirmationScreen;
