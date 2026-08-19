import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import AppHeader from "@/components/layout/AppHeader";
import ProtocolTemplateCard from "@/components/common/ProtocolTemplateCard";
import PillFilters from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import {
  readFavoriteState,
  toggleFavoriteId,
  writeFavoriteIds,
} from "@/features/self-care/services/favoritesStorage";
import { getWellnessContentList } from "@/features/self-care/services/selfCareService";
import SoundscapePinterestSkeleton from "@/features/self-care/components/soundscape/SoundscapePinterestSkeleton";
import {
  cacheSoundscapeTracks,
  normalizeKey,
  resolveSoundscapeTracks,
} from "@/features/self-care/utils/soundscapeLibrary";
import type { SoundscapeTrack } from "@/features/self-care/types/soundscapeTypes";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

const FAVORITES_FILTER_VALUE = "favorites";

const FAVORITES_SUBTITLE = "Soundscape archive for rest, focus, and reset.";

const getSoundscapeEmptyStateCopy = (selectedFilter: string) => {
  if (selectedFilter === FAVORITES_FILTER_VALUE) {
    return {
      title: "No favorites yet.",
      subtitle: "Tap the favorites tag on any card to save it here.",
    };
  }

  if (selectedFilter === "all") {
    return {
      title: "No soundscapes found.",
      subtitle: "Try again in a moment or revisit the library later.",
    };
  }

  return {
    title: "No soundscapes in this filter.",
    subtitle: "Try a different tag or clear the filter row.",
  };
};

export const SoundscapeScreen = () => {
  // Screen-level state covers the backend-fed soundscape library and the
  // local favorites/filter state used by this listing screen.
  const navigation = useNavigation();
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, svaTypography, spacing),
    [svaColors, svaTypography, spacing]
  );

  const [tracks, setTracks] = useState<SoundscapeTrack[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [hasStoredFavorites, setHasStoredFavorites] = useState<boolean | null>(
    null
  );
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const seededFavoritesRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Favorites are persisted locally so the screen can rebuild the favorites
  // filter and detail-entry state without another backend dependency.
  const loadFavorites = useCallback(async () => {
    try {
      const { ids, hasStoredFavorites: hasStored } = await readFavoriteState(
        "soundscape"
      );

      if (isMountedRef.current) {
        setFavoriteIds(ids);
        setHasStoredFavorites(hasStored);
      }
    } catch (error) {
      console.warn("Unable to load soundscape favorites:", error);
      if (isMountedRef.current) {
        setHasStoredFavorites(false);
      }
    } finally {
      if (isMountedRef.current) {
        setFavoritesLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      void loadFavorites();
    });

    return unsubscribe;
  }, [loadFavorites, navigation]);

  useEffect(() => {
    let active = true;

    // Soundscapes now come from the shared wellness content list endpoint,
    // then get normalized into the legacy soundscape card/player shape.
    const loadSoundscapes = async () => {
      setIsLoading(true);
      try {
        const result = await getWellnessContentList({
          modality: "soundscape",
        });
        const normalized = resolveSoundscapeTracks(result);

        if (active) {
          setTracks(normalized);
          cacheSoundscapeTracks(normalized);
        }
      } catch (error) {
        console.log(error, "API Error Response");
        if (active) {
          const fallbackTracks = resolveSoundscapeTracks(null);
          setTracks(fallbackTracks);
          cacheSoundscapeTracks(fallbackTracks);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadSoundscapes();

    return () => {
      active = false;
    };
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  // Filter pills are derived from backend categories only: All, Favorites,
  // then each unique normalized category returned in the soundscape list.
  const filterOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        tracks
          .map((track) => track.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All", value: "all" },
      { label: "Favorites", value: FAVORITES_FILTER_VALUE },
      ...categories.map((category) => ({
        label: category,
        value: normalizeKey(category),
      })),
    ];
  }, [tracks]);

  const showFavoritesOnly = selectedFilter === FAVORITES_FILTER_VALUE;

  // Filtering is applied in two passes at once: category matching and the
  // optional local favorites constraint.
  const filteredTracks = useMemo(() => {
    const selectedKey = normalizeKey(selectedFilter);

    return tracks.filter((track) => {
      const matchesFilter =
        selectedFilter === "all" ||
        selectedFilter === FAVORITES_FILTER_VALUE ||
        normalizeKey(track.category) === selectedKey;
      const matchesFavorites = !showFavoritesOnly || favoriteSet.has(track.id);

      return matchesFilter && matchesFavorites;
    });
  }, [tracks, selectedFilter, favoriteSet, showFavoritesOnly]);

  useEffect(() => {
    if (
      !favoritesLoaded ||
      hasStoredFavorites !== false ||
      seededFavoritesRef.current ||
      tracks.length === 0 ||
      favoriteIds.length > 0
    ) {
      return;
    }

    const seed = tracks.slice(0, 3).map((track) => track.id);
    if (seed.length === 0) {
      return;
    }

    // Seed a few favorites only for first-run empty local state so the
    // favorites tab is not empty in fresh demo/dev environments.
    seededFavoritesRef.current = true;
    setFavoriteIds(seed);
    void writeFavoriteIds("soundscape", seed);
  }, [favoriteIds.length, favoritesLoaded, hasStoredFavorites, tracks]);

  // Favorite toggles stay local to the screen and detail flow, backed by the
  // shared AsyncStorage key used when the screen regains focus.
  const handleToggleFavorite = async (trackId: string) => {
    try {
      const nextFavorites = await toggleFavoriteId("soundscape", trackId);
      setFavoriteIds(nextFavorites);
    } catch (error) {
      console.warn("favorite toggle failed", error);
    }
  };

  const handleOpenSoundscapeDetail = useCallback((soundscapeId: string) => {
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_SOUNDSCAPE_DETAIL,
      params: { soundscapeId },
    });
  }, []);

  const handleBack = useCallback(() => {
    if (selectedFilter === FAVORITES_FILTER_VALUE) {
      setSelectedFilter("all");
      return;
    }

    navigation.goBack();
  }, [navigation, selectedFilter]);
  const emptyStateCopy = getSoundscapeEmptyStateCopy(selectedFilter);

  if (isLoading) {
    return (
      <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
        <View style={styles.root}>
          <AppHeader
            title="Acoustic Formulas"
            subtitle={FAVORITES_SUBTITLE}
            onBack={handleBack}
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.headerSubtitle}
            containerStyle={styles.header}
          />

          <SoundscapePinterestSkeleton />
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Acoustic Formulas"
          subtitle={FAVORITES_SUBTITLE}
          onBack={handleBack}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          containerStyle={styles.header}
        />

        <PillFilters
          options={filterOptions}
          selectedValue={selectedFilter}
          onChange={setSelectedFilter}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersRow}
          selectedPillStyle={styles.filterPillSelected}
          inactivePillStyle={styles.filterPillInactive}
          selectedLabelStyle={styles.filterLabelSelected}
          inactiveLabelStyle={styles.filterLabelInactive}
          labelStyle={styles.filterLabel}
        />

        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: spacing.xl * 3 },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <View style={styles.cardShell}>
              <ProtocolTemplateCard
                item={item}
                style={styles.cardCell}
                onPress={() => handleOpenSoundscapeDetail(item.id)}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  favoriteSet.has(item.id)
                    ? `Remove ${item.title} from favorites`
                    : `Add ${item.title} to favorites`
                }
                onPress={() => handleToggleFavorite(item.id)}
                style={({ pressed }) => [
                  styles.favoriteTag,
                  favoriteSet.has(item.id) && styles.favoriteTagActive,
                  pressed && styles.favoriteTagPressed,
                ]}
              >
                <Ionicons
                  name={favoriteSet.has(item.id) ? "bookmark" : "bookmark-outline"}
                  size={13}
                  color={
                    favoriteSet.has(item.id)
                      ? svaColors.brand.primary
                      : svaColors.text.primary
                  }
                />
                <Text
                  style={[
                    styles.favoriteTagText,
                    {
                      color: favoriteSet.has(item.id)
                        ? svaColors.brand.primary
                        : svaColors.text.primary,
                    },
                  ]}
                >
                  {favoriteSet.has(item.id) ? "Saved" : "Favorite"}
                </Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{emptyStateCopy.title}</Text>
              <Text style={styles.emptySubtitle}>{emptyStateCopy.subtitle}</Text>
            </View>
          }
        />
      </View>
    </ScreenView>
  );
};

const styling = (
  colors: SvaColorSet,
  typography: TypographyTokens | undefined,
  spacing: Spacing
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
    },
    root: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...(typography?.textStyle?.authTitle ?? {}),
    },
    headerSubtitle: {
      ...(typography?.textStyle?.authTinyLabel ?? {}),
      lineHeight: 16,
      minHeight: 32,
      textTransform: "uppercase",
      color: colors.text.secondary,
    },
    filtersContainer: {
      height: 72,
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    filtersRow: {
      minHeight: 72,
      paddingBottom: spacing.md,
      paddingTop: spacing.md,
      paddingRight: spacing.md,
    },
    filterLabel: {
      ...(typography?.textStyle?.authTinyLabel ?? {}),
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    filterLabelSelected: {
      color: colors.text.inverse,
    },
    filterLabelInactive: {
      color: colors.text.secondary,
    },
    filterPillSelected: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    filterPillInactive: {
      backgroundColor: colors.surface.base,
      borderColor: colors.border.default,
    },
    listContent: {
      paddingTop: spacing.xs,
    },
    columnWrapper: {
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    cardShell: {
      width: "48%",
      position: "relative",
    },
    cardCell: {
      width: "100%",
    },
    favoriteTag: {
      position: "absolute",
      top: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "rgba(12, 14, 11, 0.88)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      zIndex: 2,
    },
    favoriteTagActive: {
      backgroundColor: "rgba(163, 190, 140, 0.18)",
      borderColor: "rgba(163, 190, 140, 0.3)",
    },
    favoriteTagPressed: {
      transform: [{ scale: 0.96 }],
      opacity: 0.92,
    },
    favoriteTagText: {
      ...(typography?.textStyle?.authTinyLabel ?? {}),
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
      ...(typography?.textStyle?.authTitle ?? {}),
      fontSize: 22,
      lineHeight: 26,
      color: colors.text.primary,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    emptySubtitle: {
      ...(typography?.textStyle?.body ?? {}),
      color: colors.text.secondary,
      textAlign: "center",
    },
  });

export default SoundscapeScreen;
