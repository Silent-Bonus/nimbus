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
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import ThemeContext from "@/contexts/ThemeContext";
import AffirmationListCard from "@/features/self-care/components/affirmation/AffirmationListCard";
import AffirmationStoryModal from "@/features/self-care/components/affirmation/AffirmationStoryModal";
import AffirmationRecommendationSection from "@/features/self-care/components/affirmation/AffirmationRecommendationSection";
import { consumeQueuedCreatedAffirmation } from "@/features/self-care/data/affirmationCreationInbox";
import {
  getAffirmations,
  getAffirmationBySlug,
  getMockAffirmationDeck,
} from "@/features/self-care/services/affirmationService";
import {
  AFFIRMATION_FILTERS,
  filterAffirmations,
  formatAffirmationToneLabel,
  type AffirmationTone,
} from "@/features/self-care/utils/mindPractices";
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

type AffirmationFilterValue = AffirmationTone | "all";

export const AffirmationScreen = () => {
  const navigation = useNavigation();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);

  const fallbackAffirmationDeck = useMemo(() => getMockAffirmationDeck(), []);
  const [affirmationDeck, setAffirmationDeck] = useState<AffirmationDeck>(
    fallbackAffirmationDeck
  );
  const [selectedTone, setSelectedTone] =
    useState<AffirmationFilterValue>("all");
  const [selectedAffirmationId, setSelectedAffirmationId] = useState<string>(
    fallbackAffirmationDeck.recommendations[0]?.id ?? ""
  );
  const [storyVisible, setStoryVisible] = useState(false);

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

  const visibleRecommendations = useMemo(
    () => filterAffirmations(affirmationDeck.recommendations, selectedTone),
    [affirmationDeck.recommendations, selectedTone]
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
        const nextCards = current.cards.some((card) => card.id === resolved.card.id)
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

        const nextRecommendations = current.recommendations.some(
          (item) => item.id === resolved.recommendation.id
        )
          ? current.recommendations.map((item) =>
              item.id === resolved.recommendation.id
                ? {
                    ...resolved.recommendation,
                    palette: item.palette,
                    detail: resolved.recommendation.detail ?? item.detail,
                  }
                : item
            )
          : options?.prepend
            ? [resolved.recommendation, ...current.recommendations]
            : [...current.recommendations, resolved.recommendation];

        return {
          ...current,
          cards: nextCards,
          recommendations: nextRecommendations,
          source: resolved.source,
          message: resolved.message,
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

  useEffect(() => {
    let active = true;

    const loadAffirmations = async () => {
      const deck = await getAffirmations();

      if (!active) {
        return;
      }

      setAffirmationDeck(deck);
    };

    void loadAffirmations();

    return () => {
      active = false;
    };
  }, []);

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
      !visibleRecommendations.some(
        (item) => item.id === selectedAffirmationId
      )
    ) {
      setSelectedAffirmationId(
        visibleRecommendations[0]?.id ??
          affirmationDeck.recommendations[0]?.id ??
          ""
      );
    }
  }, [
    affirmationDeck.recommendations,
    selectedAffirmationId,
    visibleRecommendations,
  ]);

  const selectedAffirmation = useMemo(
    () =>
      visibleRecommendations.find((item) => item.id === selectedAffirmationId) ??
      visibleRecommendations[0] ??
      affirmationDeck.recommendations[0],
    [
      affirmationDeck.recommendations,
      selectedAffirmationId,
      visibleRecommendations,
    ]
  );

  const listAffirmations = useMemo(
    () =>
      visibleAffirmations.filter((item) => item.id !== selectedAffirmation?.id),
    [selectedAffirmation?.id, visibleAffirmations]
  );

  const selectedToneLabel =
    selectedTone === "all"
      ? "All tones"
      : formatAffirmationToneLabel(selectedTone as AffirmationTone);

  const handleOpenStory = useCallback(
    async (item: { id: string }) => {
      setSelectedAffirmationId(item.id);
      setStoryVisible(true);

      try {
        const resolved = await getAffirmationBySlug(item.id);
        mergeResolvedAffirmation(resolved);
      } catch (error) {
        console.warn("Failed to load affirmation detail:", error);
      }
    },
    [mergeResolvedAffirmation]
  );

  const handleOpenCreateAffirmation = useCallback(() => {
    router.push(ROUTES.AUTH.SELF_CARE_CREATE_AFFIRMATION as never);
  }, []);

  const handleCloseStory = useCallback(() => {
    setStoryVisible(false);
  }, []);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Affirmations"
          subtitle="Swipe a line, or tap the pencil to compose your own deck."
          onBack={() => router.back()}
          rightAction={{
            icon: "pencil-outline",
            accessibilityLabel: "Create custom affirmation",
            onPress: handleOpenCreateAffirmation,
          }}
          containerStyle={styles.header}
        />

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
                selectedId={selectedAffirmation?.id ?? ""}
                onSelect={handleOpenStory}
              />

              <PillFilters
                options={AFFIRMATION_FILTERS}
                selectedValue={selectedTone}
                onChange={setSelectedTone}
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
                    {visibleAffirmations.length} lines
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
              <Text style={styles.emptyTitle}>No extra lines in this tone.</Text>
              <Text style={styles.emptyText}>
                The selected line is still available above.
              </Text>
            </View>
          }
        />

        <AffirmationStoryModal
          visible={storyVisible}
          onClose={handleCloseStory}
          slides={affirmationDeck.recommendations}
          initialSlideId={selectedAffirmation?.id}
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
      marginBottom: spacing.md,
    },
    sectionEyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
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
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
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
  });

export default AffirmationScreen;
