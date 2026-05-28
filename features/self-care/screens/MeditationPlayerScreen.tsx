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
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import MeditationPlayerHeader from "@/features/self-care/components/meditation/MeditationPlayerHeader";
import MeditationTransportControls from "@/features/self-care/components/meditation/MeditationTransportControls";
import {
  formatPlaybackRemaining,
  formatPlaybackTime,
  resolveMeditationPlaybackCover,
  resolveMeditationPlaybackSource,
  seekMillis,
} from "@/features/self-care/utils/meditationPlayback";
import {
  formatMeditationTagLabel,
  hydrateMeditationTemplate,
  mockMeditationRecommendations,
  type MeditationRouteParams,
  type MeditationTemplate,
} from "@/features/self-care/utils/meditationLibrary";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type MeditationPlayerParams = MeditationRouteParams;

const parseParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const buildMeditationMeta = (template: MeditationTemplate) => {
  const labels = {
    calm: "Deep calm",
    sleep: "Restorative",
    focus: "Attention reset",
    breath: "Breath-led",
    release: "Soft release",
    beginner: "Gentle entry",
  };

  return labels[template.tag as keyof typeof labels] ?? "Curated meditation";
};

export default function MeditationPlayerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<MeditationPlayerParams>();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);

  const meditationId = parseParam(params.meditationId) ?? "moonlit-reset";
  const fallbackMeditation = useMemo<MeditationTemplate>(() => {
    return (
      mockMeditationRecommendations.find(
        (item) => item.id === meditationId || item.slug === meditationId
      ) ?? mockMeditationRecommendations[0]
    );
  }, [meditationId]);

  const template = hydrateMeditationTemplate(params, fallbackMeditation);

  const meditationTitle = template.title ?? "Meditation";
  const meditationDescription = template.description;
  const meditationDurationLabel = template.durationLabel;
  const meditationMeta = useMemo(() => buildMeditationMeta(template), [template]);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  const soundRef = useRef<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ambientMode, setAmbientMode] = useState(false);

  const isPlaying = playbackStatus?.isLoaded ? playbackStatus.isPlaying : false;
  const positionMillis = playbackStatus?.isLoaded
    ? playbackStatus.positionMillis
    : 0;
  const durationMillis =
    playbackStatus?.isLoaded && playbackStatus.durationMillis
      ? playbackStatus.durationMillis
      : 1;
  const progress = Math.min(positionMillis / durationMillis, 1);

  const playbackSource = useMemo(
    () => resolveMeditationPlaybackSource(meditationId, template.source ?? null),
    [meditationId, template.source]
  );
  const heroImage = useMemo(
    () => resolveMeditationPlaybackCover(template),
    [template]
  );

  const selectedTags = template.tags.slice(0, 3);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          playbackSource,
          {
            shouldPlay: true,
            progressUpdateIntervalMillis: 500,
          },
          (status) => setPlaybackStatus(status)
        );

        if (!active) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
      } catch (error) {
        console.error("Unable to load meditation audio", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [playbackSource]);

  const handleSeek = useCallback(async (delta: number) => {
    const sound = soundRef.current;
    if (!sound || !playbackStatus?.isLoaded) return;

    const nextPosition = seekMillis(
      playbackStatus.positionMillis,
      delta,
      playbackStatus.durationMillis ?? 0
    );
    await sound.setPositionAsync(nextPosition);
  }, [playbackStatus]);

  const handleTogglePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  }, [isPlaying]);

  const handleShare = useCallback(async () => {
    await Share.share({
      message: `${meditationTitle} · ${meditationDescription}`,
    });
  }, [meditationDescription, meditationTitle]);

  const handleOpenLibrary = useCallback(() => {
    router.push(ROUTES.AUTH.SELF_CARE_MEDITATION);
  }, []);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <MeditationPlayerHeader
          onBack={() => router.back()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl * 2.5 },
          ]}
        >
          <View style={styles.heroCard}>
            <Image source={heroImage} style={styles.heroImage} contentFit="cover" />
            <LinearGradient
              colors={["rgba(8, 9, 7, 0.02)", "rgba(8, 9, 7, 0.86)"]}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[
                styles.heroGlowTop,
                ambientMode && styles.heroGlowTopActive,
              ]}
            />
            <View style={styles.heroGlowBottom} />

            <View style={styles.heroLabelRow}>
              <Text style={styles.heroLabel}>NIMBUS ORIGINAL MEDITATION</Text>
              <View style={styles.heroBadge}>
                <Ionicons
                  name={ambientMode ? "radio-button-on" : "leaf-outline"}
                  size={12}
                  color={ambientMode ? theme.chart2 : theme.buttonPrimaryText}
                />
                <Text style={styles.heroBadgeText}>
                  {ambientMode ? "Ambient mode" : "Curated"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {meditationTitle}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {meditationDurationLabel} · {meditationMeta}
            </Text>
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>
                {formatPlaybackTime(positionMillis)}
              </Text>
              <Text style={styles.timeText}>
                {formatPlaybackRemaining(
                  positionMillis,
                  playbackStatus?.isLoaded ? playbackStatus.durationMillis ?? 0 : 0
                )}
              </Text>
            </View>
          </View>

          <MeditationTransportControls
            isPlaying={isPlaying}
            disabled={isLoading}
            onSeekBackward={() => handleSeek(-15000)}
            onTogglePlayPause={handleTogglePlayPause}
            onSeekForward={() => handleSeek(15000)}
          />

          <View style={styles.metaCard}>
            <View style={styles.metaHeader}>
              <Text style={styles.metaEyebrow}>SESSION NOTES</Text>
              <Text style={styles.metaDate}>
                {template.durationLabel.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.metaText}>{meditationDescription}</Text>

            <View style={styles.tagsRow}>
              {selectedTags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>
                    #{formatMeditationTagLabel(tag).toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionRow}>
            <PlayerActionButton
              icon={isFavorite ? "heart" : "heart-outline"}
              label={isFavorite ? "Saved" : "Save"}
              active={isFavorite}
              onPress={() => setIsFavorite((value) => !value)}
            />
            <PlayerActionButton
              icon={ambientMode ? "radio-button-on-outline" : "radio-outline"}
              label="Ambient"
              active={ambientMode}
              onPress={() => setAmbientMode((value) => !value)}
            />
            <PlayerActionButton
              icon="share-outline"
              label="Share"
              onPress={handleShare}
            />
            <PlayerActionButton
              icon="list-outline"
              label="Library"
              onPress={handleOpenLibrary}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingPill}>
              <ActivityIndicator size="small" color={theme.chart2 ?? theme.accent} />
              <Text style={styles.loadingText}>Loading meditation…</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </ScreenView>
  );
}

const PlayerActionButton = ({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) => {
  const { newTheme: theme, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => actionButtonStyles(theme, typography),
    [theme, typography]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        active && styles.buttonActive,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? theme.buttonPrimaryText : theme.textSecondary}
      />
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

const actionButtonStyles = (theme: ColorSet, typography: Typography) =>
  StyleSheet.create({
    button: {
      flex: 1,
      minHeight: 64,
      borderRadius: 18,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 10,
    },
    buttonActive: {
      backgroundColor: "rgba(163,190,140,0.14)",
      borderColor: "rgba(163,190,140,0.22)",
    },
    buttonPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.92,
    },
    label: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.1,
    },
    labelActive: {
      color: theme.textPrimary,
    },
  });

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
    scrollContent: {
      paddingBottom: spacing.xl * 2,
    },
    heroCard: {
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      minHeight: 320,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
    heroImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroGlowTop: {
      position: "absolute",
      top: -46,
      right: -24,
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: "rgba(163,190,140,0.16)",
    },
    heroGlowTopActive: {
      backgroundColor: "rgba(184,209,240,0.16)",
    },
    heroGlowBottom: {
      position: "absolute",
      bottom: -56,
      left: -30,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
    heroLabelRow: {
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 18,
      gap: 10,
    },
    heroLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: "#B8D1F0",
    },
    heroBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    heroBadgeText: {
      ...typography.smallCaption,
      color: theme.textPrimary,
      letterSpacing: 0.9,
    },
    titleBlock: {
      marginBottom: spacing.md,
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 36,
      lineHeight: 40,
      color: theme.textPrimary,
      letterSpacing: -0.45,
    },
    subtitle: {
      ...typography.body,
      color: theme.textSecondary,
      marginTop: 8,
    },
    progressBlock: {
      marginBottom: spacing.lg,
    },
    progressTrack: {
      height: 4,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.chart2 ?? theme.accent,
    },
    timeRow: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timeText: {
      ...typography.caption,
      color: theme.textSecondary,
      letterSpacing: 0.8,
    },
    metaCard: {
      marginTop: spacing.lg,
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      padding: 18,
    },
    metaHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    metaEyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    metaDate: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 0.9,
    },
    metaText: {
      ...typography.body,
      color: theme.textPrimary,
      lineHeight: 22,
    },
    tagsRow: {
      marginTop: spacing.md,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.16)",
    },
    tagText: {
      ...typography.smallCaption,
      color: theme.chart2 ?? theme.accent,
      letterSpacing: 1.05,
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: spacing.lg,
    },
    loadingPill: {
      alignSelf: "center",
      marginTop: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    loadingText: {
      ...typography.caption,
      color: theme.textSecondary,
    },
  });
