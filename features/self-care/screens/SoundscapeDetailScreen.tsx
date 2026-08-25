import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/components/layout/AppHeader";
import type { HeaderRightAction } from "@/components/layout/AppHeader";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import {
  readFavoriteIds,
  toggleFavoriteId,
} from "@/features/self-care/services/favoritesStorage";
import { getWellnessContentDetail } from "@/features/self-care/services/selfCareService";
import {
  cacheSoundscapeTracks,
  formatSoundscapeTagLabel,
  getSoundscapeById,
  toSoundscapeTrack,
} from "@/features/self-care/utils/soundscapeLibrary";
import type { SoundscapeTrack } from "@/features/self-care/types/soundscapeTypes";
import type {
  Spacing,
  SvaColorSet,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type SoundscapeDetailParams = {
  soundscapeId?: string | string[];
};

const parseParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

// Soundscape detail routes currently pass a numeric id from the library flow.
// The detail fetch only runs when that identifier can be used by the backend.
const isNumericId = (value: string) => /^\d+$/.test(value.trim());

export default function SoundscapeDetailScreen() {
  // The screen tries to render immediately from the in-memory soundscape cache,
  // then refreshes from the wellness detail API when the route id is fetchable.
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<SoundscapeDetailParams>();
  const { svaColors, svaTypography, spacing, typography } =
    useContext(ThemeContext);

  const soundscapeId = parseParam(params.soundscapeId) ?? "";

  const styles = useMemo(
    () => styling(svaColors, svaTypography, spacing, typography),
    [svaColors, svaTypography, spacing, typography]
  );

  // Cached soundscape data keeps the transition from library to detail fast,
  // while the later API refresh fills in the latest backend content.
  const [soundscape, setSoundscape] = useState<SoundscapeTrack | null>(
    () => getSoundscapeById(soundscapeId) ?? null
  );
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const isFavorite = soundscape ? favoriteSet.has(soundscape.id) : false;
  const benefits = soundscape?.benefits ?? [];
  const subtitle = useMemo(
    () =>
      soundscape ? `${soundscape.durationLabel} · ${soundscape.category}` : "",
    [soundscape]
  );
  const ratingLabel = useMemo(() => {
    if (typeof soundscape?.rating !== "number") {
      return "4";
    }

    return Number.isInteger(soundscape.rating)
      ? String(soundscape.rating)
      : soundscape.rating.toFixed(1);
  }, [soundscape?.rating]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    // Favorites are local-only state shared with the library screen via the
    // same AsyncStorage key so the bookmark action stays in sync across screens.
    const loadFavorites = async () => {
      try {
        const ids = await readFavoriteIds("soundscape");
        if (active) {
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.warn("Unable to load soundscape favorites:", error);
      }
    };

    void loadFavorites();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    // Reset from cache first on every route change so the screen can show
    // previously visited content immediately while the network refresh runs.
    setSoundscape(getSoundscapeById(soundscapeId) ?? null);
    setLoadError(null);

    if (!isNumericId(soundscapeId)) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);

    // Numeric ids fetch the latest detail payload, then map it back into the
    // shared soundscape track shape used by detail and player flows.
    const loadSoundscapeDetails = async () => {
      try {
        const response = await getWellnessContentDetail(Number(soundscapeId));
        if (!active) return;

        // Reuse the library mapper so detail and player screens read the same
        // normalized soundscape shape from cache and API responses.
        const mappedSoundscape = toSoundscapeTrack(response.data, 0);
        setSoundscape(mappedSoundscape);
        cacheSoundscapeTracks([mappedSoundscape]);
      } catch (error) {
        console.warn("Unable to load soundscape details:", error);
        if (active) {
          setLoadError("Unable to load the latest soundscape details.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadSoundscapeDetails();

    return () => {
      active = false;
    };
  }, [soundscapeId]);

  // Favorite toggles update both local state and persisted storage so the next
  // library/detail visit reflects the same saved state.
  const handleToggleFavorite = useCallback(async () => {
    if (!soundscape) return;

    try {
      const nextFavorites = await toggleFavoriteId("soundscape", soundscape.id);
      setFavoriteIds(nextFavorites);
    } catch (error) {
      console.warn("soundscape favorite toggle failed", error);
    }
  }, [favoriteIds, isFavorite, soundscape]);

  const handleShare = useCallback(async () => {
    if (!soundscape) return;

    await Share.share({
      message: `${soundscape.title} · ${soundscape.description}`,
    });
  }, [soundscape]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // The player only needs the normalized soundscape id because the player
  // screen resolves the rest of the content from the shared cache.
  const handleStartSoundscape = useCallback(() => {
    if (!soundscape) return;

    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_SOUNDSCAPE_PLAYER,
      params: {
        soundscapeId: soundscape.id,
      },
    });
  }, [soundscape]);

  const ctaLabel = "Start Soundscape";
  const headerActions: HeaderRightAction[] = soundscape
    ? [
        {
          icon: isFavorite ? "bookmark" : "bookmark-outline",
          accessibilityLabel: isFavorite
            ? "Remove from favorites"
            : "Add to favorites",
          onPress: () => void handleToggleFavorite(),
        },
        {
          icon: "share-outline",
          accessibilityLabel: "Share soundscape",
          onPress: () => void handleShare(),
        },
      ]
    : [];

  return (
    <ScreenView bgColor={svaColors.bg.base} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Soundscape Prelude"
          subtitle="A quiet threshold before the sound begins."
          onBack={handleBack}
          rightActions={headerActions}
          subtitleStyle={styles.headerSubtitle}
          containerStyle={styles.header}
        />

        {!soundscape ? (
          <View
            style={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + spacing.xl * 2.5,
              },
            ]}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroKicker}>CURATED SOUNDSCAPE</Text>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {isLoading
                    ? "Refreshing soundscape"
                    : "Soundscape unavailable"}
                </Text>
                <Text style={styles.heroSubtext}>
                  {loadError ??
                    "Open a soundscape detail screen to load the latest content."}
                </Text>

                <View style={styles.loadingChip}>
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={svaColors.brand.primary}
                    />
                  ) : (
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={svaColors.brand.primary}
                    />
                  )}
                  <Text style={styles.loadingChipText}>
                    {isLoading
                      ? "Loading soundscape"
                      : "Waiting for soundscape"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + spacing.xl * 2.5 },
            ]}
          >
            <View style={styles.heroCard}>
              <Image
                source={soundscape.image}
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
                <Text style={styles.heroKicker}>CURATED SOUNDSCAPE</Text>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {soundscape.title}
                </Text>
                <Text style={styles.heroSubtext}>{subtitle}</Text>

                <View style={styles.heroMetaRow}>
                  <View
                    style={styles.heroMetaPill}
                    accessibilityLabel={`Soundscape rating ${ratingLabel}`}
                  >
                    <Ionicons
                      name="star"
                      size={12}
                      color={svaColors.brand.primary}
                    />
                    <Text style={styles.heroMetaText}>{ratingLabel}</Text>
                  </View>
                </View>

                {isLoading ? (
                  <View style={styles.loadingChip}>
                    <ActivityIndicator
                      size="small"
                      color={svaColors.brand.primary}
                    />
                    <Text style={styles.loadingChipText}>
                      Refreshing soundscape
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.descriptionCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>ABOUT THIS SOUNDSCAPE</Text>
                <Text style={styles.cardMeta}>{soundscape.category}</Text>
              </View>

              <Text style={styles.descriptionText}>
                {soundscape.description}
              </Text>

              {soundscape.frequencyHz || soundscape.moodLabel ? (
                <View style={styles.signalRow}>
                  {soundscape.frequencyHz ? (
                    <View style={styles.signalChip}>
                      <Text style={styles.signalText}>
                        {soundscape.frequencyHz.toFixed(2)} HZ
                      </Text>
                    </View>
                  ) : null}

                  {soundscape.moodLabel ? (
                    <View style={styles.signalChip}>
                      <Text style={styles.signalText}>
                        {soundscape.moodLabel.toUpperCase()}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {loadError ? (
                <Text style={styles.errorText}>{loadError}</Text>
              ) : null}

              {soundscape.tags.length > 0 ? (
                <View style={styles.tagsRow}>
                  {soundscape.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>
                        #{formatSoundscapeTagLabel(tag).toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {soundscape.longDescription ? (
              <View style={styles.detailCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardLabel}>DEEPER LISTENING</Text>
                  <View style={styles.miniPill}>
                    <Ionicons
                      name="ear-outline"
                      size={14}
                      color={svaColors.text.secondary}
                    />
                    <Text style={styles.miniPillText}>EXTENDED NOTES</Text>
                  </View>
                </View>

                <Text style={styles.descriptionText}>
                  {soundscape.longDescription}
                </Text>
              </View>
            ) : null}

            {benefits.length > 0 ? (
              <View style={styles.benefitCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardLabel}>WHY IT HELPS</Text>
                  <View style={styles.miniPill}>
                    <Ionicons
                      name="musical-notes-outline"
                      size={14}
                      color={svaColors.text.secondary}
                    />
                    <Text style={styles.miniPillText}>
                      {soundscape.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitList}>
                  {benefits.map((benefit) => (
                    <View
                      key={`${benefit.id}-${benefit.title}`}
                      style={styles.benefitRow}
                    >
                      <View style={styles.benefitIcon}>
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={svaColors.bg.base}
                        />
                      </View>
                      <View style={styles.benefitCopy}>
                        {benefit.title ? (
                          <Text style={styles.benefitTitle}>
                            {benefit.title}
                          </Text>
                        ) : null}
                        {benefit.text ? (
                          <Text style={styles.benefitText}>{benefit.text}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <NimbusButton
              label={ctaLabel}
              onPress={handleStartSoundscape}
              rightIcon={
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={svaColors.text.inverse}
                />
              }
              style={styles.ctaButton}
            />
          </ScrollView>
        )}
      </View>
    </ScreenView>
  );
}

const styling = (
  theme: SvaColorSet,
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
    headerSubtitle: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      textTransform: "uppercase",
      color: theme.text.secondary,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    heroCard: {
      height: 320,
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: theme.surface.base,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow.default,
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
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      color: theme.text.secondary,
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
      color: theme.text.primary,
    },
    heroSubtext: {
      ...typography.caption,
      color: theme.text.secondary,
      marginTop: 10,
      letterSpacing: 0.3,
    },
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 14,
    },
    heroMetaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "rgba(9, 11, 8, 0.38)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      alignSelf: "flex-start",
    },
    heroMetaText: {
      ...typography.smallCaption,
      color: theme.text.primary,
      letterSpacing: 1,
    },
    loadingChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    loadingChipText: {
      ...typography.smallCaption,
      color: theme.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    descriptionCard: {
      borderRadius: 28,
      backgroundColor: theme.surface.base,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow.default,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    benefitCard: {
      borderRadius: 28,
      backgroundColor: theme.surface.base,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.xl,
      shadowColor: theme.shadow.default,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    detailCard: {
      borderRadius: 28,
      backgroundColor: theme.surface.base,
      borderWidth: 1,
      borderColor: theme.border.subtle,
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow.default,
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
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.text.secondary,
      textTransform: "uppercase",
    },
    cardMeta: {
      ...typography.smallCaption,
      color: theme.text.secondary,
      textTransform: "uppercase",
    },
    descriptionText: {
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Outfit_400Regular",
      fontSize: 16,
      lineHeight: 26,
      color: theme.text.primary,
      opacity: 0.96,
    },
    errorText: {
      ...typography.smallCaption,
      color: "#C85B5B",
      marginTop: spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    signalRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 16,
    },
    signalChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: theme.border.subtle,
    },
    signalText: {
      ...typography.smallCaption,
      color: theme.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 1.1,
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
      color: theme.brand.primary,
      letterSpacing: 1.1,
    },
    miniPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.bg.subtle,
      borderWidth: 1,
      borderColor: theme.border.subtle,
    },
    miniPillText: {
      ...typography.smallCaption,
      color: theme.text.secondary,
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
      backgroundColor: theme.brand.primary,
      marginTop: 2,
    },
    benefitCopy: {
      flex: 1,
      gap: 4,
    },
    benefitTitle: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      color: theme.text.primary,
    },
    benefitText: {
      flex: 1,
      ...typography.body,
      color: theme.text.primary,
      lineHeight: 24,
    },
    ctaButton: {
      width: "100%",
    },
  });
