import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import BottomPlayer from "@/components/layout/BottomPlayer";
import AppHeader from "@/components/layout/AppHeader";
import PillFilters from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import ProtocolTemplateCard from "@/features/tools/components/common/ProtocolTemplateCard";
import { getSoundscapeContentList } from "@/features/self-care/services/selfCareService";
import SoundscapePinterestSkeleton from "@/features/self-care/components/soundscape/SoundscapePinterestSkeleton";
import {
  cacheSoundscapeTracks,
  normalizeKey,
  resolveSoundscapeTracks,
  uniqueStrings,
  type SoundscapeTrack,
} from "@/features/self-care/utils/soundscapeLibrary";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

const FAVORITES_KEY = "soundscape_favorites_v1";
const FAVORITES_FILTER_VALUE = "favorites";

const FAVORITES_SUBTITLE = "Soundscape archive for rest, focus, and reset.";

export const SoundscapeScreen = () => {
  const navigation = useNavigation();
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, svaTypography, spacing),
    [svaColors, svaTypography, spacing]
  );

  const [currentTrack, setCurrentTrack] = useState<SoundscapeTrack | null>(
    null
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          if (isMountedRef.current) {
            setFavoriteIds(parsed.map(String));
            setHasStoredFavorites(true);
          }
        } else if (isMountedRef.current) {
          setHasStoredFavorites(false);
        }
      } else if (isMountedRef.current) {
        setHasStoredFavorites(false);
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

    const loadSoundscapes = async () => {
      setIsLoading(true);
      try {
        const result: unknown = await getSoundscapeContentList();
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

  const filterOptions = useMemo(() => {
    const filters = tracks.flatMap((track) => track.filterTags);
    const uniqueFilters = uniqueStrings(filters).filter(
      (label) => normalizeKey(label) !== FAVORITES_FILTER_VALUE
    );

    return [
      { label: "All", value: "all" },
      { label: "Favorites", value: FAVORITES_FILTER_VALUE },
      ...uniqueFilters.slice(0, 8).map((label) => ({
        label,
        value: label,
      })),
    ];
  }, [tracks]);

  const showFavoritesOnly = selectedFilter === FAVORITES_FILTER_VALUE;

  const filteredTracks = useMemo(() => {
    const selectedKey = normalizeKey(selectedFilter);

    return tracks.filter((track) => {
      const matchesFilter =
        selectedFilter === "all" ||
        selectedFilter === FAVORITES_FILTER_VALUE ||
        track.filterTags.some((tag) => normalizeKey(tag) === selectedKey);
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

    seededFavoritesRef.current = true;
    setFavoriteIds(seed);
    void AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(seed));
  }, [favoriteIds.length, favoritesLoaded, hasStoredFavorites, tracks]);

  const handlePlayPause = async (track: SoundscapeTrack) => {
    try {
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          await sound?.pauseAsync();
        } else {
          await sound?.playAsync();
        }
        setIsPlaying((value) => !value);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: nextSound } = await Audio.Sound.createAsync(
        typeof track.source === "string" ? { uri: track.source } : track.source
      );

      setSound(nextSound);
      setCurrentTrack(track);
      setIsPlaying(true);
      await nextSound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleClosePlayer = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.warn("Error stopping sound on close:", error);
    } finally {
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  const handleToggleFavorite = async (trackId: string) => {
    try {
      const nextFavorites = favoriteSet.has(trackId)
        ? favoriteIds.filter((id) => id !== trackId)
        : [trackId, ...favoriteIds];

      setFavoriteIds(nextFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
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

  const headerTitle = "Acoustic Formulas";
  const headerSubtitle = selectedFilter === FAVORITES_FILTER_VALUE
    ? "A private stack of saved soundscapes."
    : FAVORITES_SUBTITLE;

  const emptyTitle = selectedFilter === FAVORITES_FILTER_VALUE
    ? "No favorites yet."
    : selectedFilter === "all"
    ? "No soundscapes found."
    : "No soundscapes in this filter.";
  const emptySubtitle = selectedFilter === FAVORITES_FILTER_VALUE
    ? "Tap the favorites tag on any card to save it here."
    : selectedFilter === "all"
    ? "Try again in a moment or revisit the library later."
    : "Try a different tag or clear the filter row.";

  if (isLoading) {
    return (
      <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
        <View style={styles.root}>
          <AppHeader
            title={headerTitle}
            subtitle={headerSubtitle}
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
          title={headerTitle}
          subtitle={headerSubtitle}
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
            { paddingBottom: currentTrack ? spacing.xl * 5 : spacing.xl * 3 },
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
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
            </View>
          }
        />
      </View>

      {currentTrack && (
        <BottomPlayer
          title={currentTrack.title}
          subtitle={`${currentTrack.durationLabel} · Soundscape`}
          image={currentTrack.image}
          isPlaying={isPlaying}
          onPlayPause={() => handlePlayPause(currentTrack)}
          onClose={handleClosePlayer}
        />
      )}
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
      textTransform: "uppercase",
      color: colors.text.secondary,
    },
    filtersContainer: {
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    filtersRow: {
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
