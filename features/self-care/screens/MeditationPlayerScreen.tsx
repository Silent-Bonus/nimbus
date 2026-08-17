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
import MeditationPlayerActionButton from "@/features/self-care/components/meditation/MeditationPlayerActionButton";
import MeditationPlayerHeader from "@/features/self-care/components/meditation/MeditationPlayerHeader";
import MeditationTransportControls from "@/features/self-care/components/meditation/MeditationTransportControls";
import {
  buildMeditationPlaybackTemplate,
  formatPlaybackRemaining,
  formatPlaybackTime,
  resolveMeditationPlaybackCover,
  resolveMeditationPlaybackSource,
  seekMillis,
  type MeditationRouteParams,
} from "@/features/self-care/utils/meditationPlayback";
import {
  formatMeditationTagLabel,
  normalizeMeditationTag,
} from "@/features/self-care/utils/meditationLibrary";
import type { MeditationItemDetail } from "@/features/self-care/types/wellnessContentTypes";
import {
  completeWellnessSession,
  createWellnessSession,
  pauseWellnessSession,
  resumeWellnessSession,
} from "@/features/self-care/services/wellnessSessionService";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type MeditationPlayerParams = MeditationRouteParams;

// Derives the short descriptor shown under the meditation title from the
// first available tag/category so the player can render a consistent subtitle.
const buildMeditationMeta = (template: MeditationItemDetail) => {
  const primaryTag = normalizeMeditationTag(
    template.tags[0] ?? template.category ?? ""
  );
  const labels = {
    calm: "Deep calm",
    sleep: "Restorative",
    focus: "Attention reset",
    breath: "Breath-led",
    release: "Soft release",
    beginner: "Gentle entry",
  };

  return labels[primaryTag as keyof typeof labels] ?? "Curated meditation";
};

export default function MeditationPlayerScreen() {
  // Route params are converted once into the same template shape used across
  // the meditation flow so the player does not depend on raw query strings.
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<MeditationPlayerParams>();
  const {
    newTheme: theme,
    svaTypography,
    spacing,
    typography,
  } = useContext(ThemeContext);
  const template: MeditationItemDetail = buildMeditationPlaybackTemplate(params);
  const meditationId = template.id;

  const meditationTitle = template.title ?? "Meditation";
  const meditationDescription = template.description;
  const meditationSessionNotes =
    template.guidance?.trim() || meditationDescription;
  const meditationDurationLabel = template.durationLabel;
  const meditationMeta = useMemo(
    () => buildMeditationMeta(template),
    [template]
  );

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  // Refs hold mutable playback/session state that must stay readable inside
  // async callbacks without forcing the audio instance to be recreated.
  const soundRef = useRef<Audio.Sound | null>(null);
  const pendingPlayOnReadyRef = useRef(false);
  const playbackPositionRef = useRef(0);
  const playbackIntentRef = useRef<"play" | "pause" | null>(null);
  const hasCompletedSessionRef = useRef(false);
  const sessionStatusRef = useRef<
    "idle" | "creating" | "active" | "paused" | "completed"
  >("idle");
  const pauseSessionRef = useRef<(() => Promise<void>) | null>(null);
  const completeSessionRef = useRef<(() => Promise<void>) | null>(null);
  const sessionCreatePromiseRef = useRef<Promise<string | null> | null>(null);
  const completionInFlightRef = useRef(false);
  const leavingScreenRef = useRef(false);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ambientMode, setAmbientMode] = useState(false);
  const [playbackIntent, setPlaybackIntent] = useState<
    "play" | "pause" | null
  >(null);
  const [sessionStatus, setSessionStatus] = useState<
    "idle" | "creating" | "active" | "paused" | "completed"
  >("idle");
  const [sessionRef, setSessionRef] = useState<string | null>(null);

  // The player shows optimistic play/pause state immediately on tap, then
  // falls back to the native audio status once Expo confirms the transition.
  const isActuallyPlaying =
    playbackStatus?.isLoaded ? playbackStatus.isPlaying : false;
  const isPlaying =
    playbackIntent === "play"
      ? true
      : playbackIntent === "pause"
        ? false
        : isActuallyPlaying ||
          sessionStatus === "creating" ||
          sessionStatus === "active";
  const positionMillis = playbackStatus?.isLoaded
    ? playbackStatus.positionMillis
    : 0;
  const durationMillis =
    playbackStatus?.isLoaded && playbackStatus.durationMillis
      ? playbackStatus.durationMillis
      : 1;
  const progress = Math.min(positionMillis / durationMillis, 1);

  const playbackSource = useMemo(
    () =>
      resolveMeditationPlaybackSource(meditationId, template.source ?? null),
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
    pendingPlayOnReadyRef.current = false;
    setPlaybackIntent(null);
    playbackIntentRef.current = null;
    setSessionStatus("idle");
    setSessionRef(null);
    sessionStatusRef.current = "idle";
    sessionCreatePromiseRef.current = null;
    completionInFlightRef.current = false;
    leavingScreenRef.current = false;
    hasCompletedSessionRef.current = false;
    playbackPositionRef.current = 0;
  }, [meditationId]);

  useEffect(() => {
    sessionStatusRef.current = sessionStatus;
  }, [sessionStatus]);

  useEffect(() => {
    playbackIntentRef.current = playbackIntent;
  }, [playbackIntent]);

  // Session creation is async, so callers resolve the session ref through the
  // in-flight promise when the API has not finished yet.
  const resolveSessionRef = useCallback(async () => {
    if (sessionRef) {
      return sessionRef;
    }

    if (!sessionCreatePromiseRef.current) {
      return null;
    }

    const resolved = await sessionCreatePromiseRef.current;
    if (resolved) {
      setSessionRef(resolved);
    }

    return resolved;
  }, [sessionRef]);

  const ensureSessionStarted = useCallback(() => {
    if (
      sessionStatus !== "idle" ||
      sessionCreatePromiseRef.current ||
      !Number.isFinite(Number(template.id))
    ) {
      return;
    }

    setSessionStatus("creating");

    const promise = createWellnessSession({
      activity_type: "meditation",
      content_type: "wellness_content.wellnesscontent",
      content_object_id: Number(template.id),
      source: "manual",
      metadata: {
        entry_surface: "player_screen",
        test_mode: true,
      },
    })
      .then((response) => {
        const nextSessionRef = response.data.session_ref;
        setSessionRef(nextSessionRef);
        setSessionStatus((current) =>
          current === "paused" || current === "completed" ? current : "active"
        );
        return nextSessionRef;
      })
      .catch((error) => {
        console.warn("Unable to create meditation session:", error);
        return null;
      })
      .finally(() => {
        sessionCreatePromiseRef.current = null;
      });

    sessionCreatePromiseRef.current = promise;
  }, [sessionStatus, template.id]);

  // Pausing/resuming the backend session is kept separate from audio control so
  // the screen can pause on navigation changes and resume only when playback restarts.
  const pauseSession = useCallback(async () => {
    if (
      sessionStatus === "idle" ||
      sessionStatus === "paused" ||
      sessionStatus === "completed"
    ) {
      return;
    }

    const resolvedSessionRef = await resolveSessionRef();
    if (!resolvedSessionRef) {
      return;
    }

    try {
      await pauseWellnessSession(resolvedSessionRef);
      setSessionStatus("paused");
    } catch (error) {
      console.warn("Unable to pause meditation session:", error);
    }
  }, [resolveSessionRef, sessionStatus]);

  useEffect(() => {
    pauseSessionRef.current = pauseSession;
  }, [pauseSession]);

  const resumeSession = useCallback(async () => {
    if (sessionStatus !== "paused") {
      return;
    }

    const resolvedSessionRef = await resolveSessionRef();
    if (!resolvedSessionRef) {
      return;
    }

    try {
      await resumeWellnessSession(resolvedSessionRef);
      setSessionStatus("active");
    } catch (error) {
      console.warn("Unable to resume meditation session:", error);
    }
  }, [resolveSessionRef, sessionStatus]);

  const startPlayback = useCallback(
    async (sound: Audio.Sound) => {
      // A completed session should never restart from the player screen.
      if (sessionStatusRef.current === "completed") {
        return;
      }

      // Resuming an existing paused session skips create and only restarts audio.
      if (sessionStatusRef.current === "paused") {
        await sound.playAsync();
        void resumeSession();
        return;
      }

      // First-time play starts the session request and audio in parallel so the
      // button responds immediately instead of waiting for the API round trip.
      ensureSessionStarted();
      await sound.playAsync();
      setSessionStatus((current) =>
        current === "completed" ? current : "active"
      );
    },
    [ensureSessionStarted, resumeSession]
  );

  const completeSession = useCallback(async () => {
    if (completionInFlightRef.current || hasCompletedSessionRef.current) {
      return;
    }

    completionInFlightRef.current = true;

    try {
      const resolvedSessionRef = await resolveSessionRef();
      if (!resolvedSessionRef) {
        return;
      }

      await completeWellnessSession(resolvedSessionRef, {
        duration_seconds: Math.max(
          0,
          Math.round(playbackPositionRef.current / 1000)
        ),
      });
      hasCompletedSessionRef.current = true;
      setSessionStatus("completed");
    } catch (error) {
      console.warn("Unable to complete meditation session", error);
    } finally {
      completionInFlightRef.current = false;
    }
  }, [resolveSessionRef]);

  useEffect(() => {
    completeSessionRef.current = completeSession;
  }, [completeSession]);

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      setPlaybackStatus(status);

      if (!status.isLoaded) {
        return;
      }

      const playbackIntent = playbackIntentRef.current;

      // Once Expo confirms the requested transition, clear the optimistic intent
      // so future UI state is driven by the native playback status again.
      if (status.didJustFinish) {
        setPlaybackIntent(null);
      } else if (status.isPlaying && playbackIntent === "play") {
        setPlaybackIntent(null);
      } else if (!status.isPlaying && playbackIntent === "pause") {
        setPlaybackIntent(null);
      }

      playbackPositionRef.current = status.positionMillis;

      if (status.didJustFinish) {
        void completeSessionRef.current?.();
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    // The sound instance is created once per audio source. Keeping this effect
    // stable avoids reloading audio when play/pause state changes.
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
            shouldPlay: false,
            progressUpdateIntervalMillis: 500,
          },
          handlePlaybackStatusUpdate
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
      if (!leavingScreenRef.current) {
        const currentStatus = sessionStatusRef.current;
        if (currentStatus === "active" || currentStatus === "creating") {
          void pauseSessionRef.current?.();
        }
      }
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [playbackSource]);

  useEffect(() => {
    if (isLoading || !pendingPlayOnReadyRef.current) {
      return;
    }

    // If the user tapped play before the sound finished loading, start
    // playback as soon as the audio instance becomes available.
    const sound = soundRef.current;
    if (!sound) {
      return;
    }

    pendingPlayOnReadyRef.current = false;
    void startPlayback(sound).catch(() => {
      setPlaybackIntent(null);
    });
  }, [isLoading, startPlayback]);

  const handleSeek = useCallback(
    async (delta: number) => {
      const sound = soundRef.current;
      if (!sound || !playbackStatus?.isLoaded) return;

      const nextPosition = seekMillis(
        playbackStatus.positionMillis,
        delta,
        playbackStatus.durationMillis ?? 0
      );
      await sound.setPositionAsync(nextPosition);
    },
    [playbackStatus]
  );

  const handleTogglePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (sessionStatus === "completed") return;

    // Pause uses the current sound immediately, then updates the backend
    // session in the background.
    if (isPlaying) {
      setPlaybackIntent("pause");
      if (!sound) return;
      await sound.pauseAsync();
      void pauseSession();
      return;
    }

    // Early play taps are queued while the audio file is still loading so the
    // user does not need to press the button a second time.
    if (isLoading || !sound) {
      pendingPlayOnReadyRef.current = true;
      setPlaybackIntent("play");
      return;
    }

    setPlaybackIntent("play");

    try {
      await startPlayback(sound);
    } catch (error) {
      setPlaybackIntent(null);
      throw error;
    }
  }, [isLoading, isPlaying, pauseSession, sessionStatus, startPlayback]);

  const handleBack = useCallback(async () => {
    leavingScreenRef.current = true;

    const sound = soundRef.current;
    if (sound && isPlaying) {
      await sound.pauseAsync();
    }

    if (sessionStatus !== "idle" && sessionStatus !== "completed") {
      await pauseSession();
    }

    router.back();
  }, [isPlaying, pauseSession, sessionStatus]);

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
        <MeditationPlayerHeader onBack={() => void handleBack()} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl * 2.5 },
          ]}
        >
          <View style={styles.heroCard}>
            <Image
              source={heroImage}
              style={styles.heroImage}
              contentFit="cover"
            />
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
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>
                {formatPlaybackTime(positionMillis)}
              </Text>
              <Text style={styles.timeText}>
                {formatPlaybackRemaining(
                  positionMillis,
                  playbackStatus?.isLoaded
                    ? playbackStatus.durationMillis ?? 0
                    : 0
                )}
              </Text>
            </View>
          </View>

          <MeditationTransportControls
            isPlaying={isPlaying}
            disabled={isLoading}
            playDisabled={false}
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

            <Text style={styles.metaText}>{meditationSessionNotes}</Text>

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
            <MeditationPlayerActionButton
              icon={isFavorite ? "heart" : "heart-outline"}
              label={isFavorite ? "Saved" : "Save"}
              active={isFavorite}
              onPress={() => setIsFavorite((value) => !value)}
            />
            <MeditationPlayerActionButton
              icon={ambientMode ? "radio-button-on-outline" : "radio-outline"}
              label="Ambient"
              active={ambientMode}
              onPress={() => setAmbientMode((value) => !value)}
            />
            <MeditationPlayerActionButton
              icon="share-outline"
              label="Share"
              onPress={handleShare}
            />
            <MeditationPlayerActionButton
              icon="list-outline"
              label="Library"
              onPress={handleOpenLibrary}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingPill}>
              <ActivityIndicator
                size="small"
                color={theme.chart2 ?? theme.accent}
              />
              <Text style={styles.loadingText}>Loading meditation…</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </ScreenView>
  );
}

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
