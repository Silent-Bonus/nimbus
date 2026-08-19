import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import {
  buildSoundscapeResonanceLabel,
  getSoundscapeById,
  resolveSoundscapePlaybackSource,
} from "@/features/self-care/utils/soundscapeLibrary";
import type { SoundscapeTrack } from "@/features/self-care/types/soundscapeTypes";
import { useAudioPlayback } from "@/features/self-care/hooks/useAudioPlayback";
import {
  formatPlaybackRemaining,
  formatPlaybackTime,
} from "@/features/self-care/utils/meditationPlayback";
import {
  completeWellnessSession,
  createWellnessSession,
  pauseWellnessSession,
  resumeWellnessSession,
} from "@/features/self-care/services/wellnessSessionService";
import type { ColorSet, Spacing, Typography, TypographyTokens } from "@/theme/types";

type SoundscapePlayerParams = {
  soundscapeId?: string | string[];
};

const parseParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const timerOptions = [null, 10, 20, 30] as const;
const intensityVolumes = [0.45, 0.68, 0.9] as const;

export default function SoundscapePlayerScreen() {
  // Resolve the cached soundscape and shared theme/layout tokens used by the
  // immersive player surface.
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const params = useLocalSearchParams<SoundscapePlayerParams>();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const isCompactLayout = windowHeight < 900;

  const soundscapeId = parseParam(params.soundscapeId) ?? "";
  const soundscape = useMemo(
    () => getSoundscapeById(soundscapeId) ?? null,
    [soundscapeId]
  );
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography, isCompactLayout),
    [theme, svaTypography, spacing, typography, isCompactLayout]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleBack = () => {
    router.back();
  };

  if (!soundscape) {
    return (
      <ScreenView
        bgColor={theme.background}
        padding={0}
        useSafeTop={false}
        style={styles.screen}
      >
        <LinearGradient
          colors={["#0A0C09", theme.background, "rgba(39, 46, 31, 0.94)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.vignetteTop} />
        <View style={styles.vignetteBottom} />

        <View style={styles.root}>
          <View
            style={[
              styles.scrollContent,
              {
                flex: 1,
                paddingTop: insets.top + (isCompactLayout ? spacing.sm : spacing.md),
                paddingBottom:
                  insets.bottom +
                  spacing.lg +
                  (isCompactLayout ? spacing.md : spacing.xl),
              },
            ]}
          >
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
              </Pressable>

              <Text style={styles.topLabel} numberOfLines={1}>
                NOW PLAYING
              </Text>

              <View style={styles.topSpacer} />
            </View>

            <View style={styles.emptyState}>
              <Ionicons
                name="musical-notes-outline"
                size={34}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyTitle}>Soundscape unavailable</Text>
              <Text style={styles.emptyText}>
                Open a soundscape detail screen first so the player can use the
                cached track.
              </Text>
            </View>
          </View>
        </View>
      </ScreenView>
    );
  }

  return (
    <SoundscapePlayerContent
      soundscape={soundscape}
      theme={theme}
      styles={styles}
      insets={insets}
      spacing={spacing}
      isCompactLayout={isCompactLayout}
      onBack={handleBack}
    />
  );
}

const styling = (
  theme: ColorSet,
  svaTypography: TypographyTokens | undefined,
  spacing: Spacing,
  typography: Typography,
  isCompactLayout: boolean
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 0,
    },
    vignetteTop: {
      position: "absolute",
      top: -100,
      left: -40,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: "rgba(163,190,140,0.08)",
    },
    vignetteBottom: {
      position: "absolute",
      bottom: -120,
      right: -60,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: "rgba(255,255,255,0.04)",
    },
    root: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      justifyContent: "space-between",
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    topLabel: {
      flex: 1,
      textAlign: "center",
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    topSpacer: {
      width: 42,
      height: 42,
    },
    titleBlock: {
      alignItems: "center",
      paddingTop: isCompactLayout ? spacing.md : spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    kicker: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.6,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: isCompactLayout ? 32 : 36,
      lineHeight: isCompactLayout ? 34 : 38,
      letterSpacing: -0.45,
      color: theme.textPrimary,
      textAlign: "center",
    },
    subtitle: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 8,
      letterSpacing: 0.8,
      textAlign: "center",
    },
    orbStage: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: isCompactLayout ? 260 : 300,
      marginTop: isCompactLayout ? spacing.sm : spacing.md,
      marginBottom: isCompactLayout ? spacing.sm : spacing.md,
    },
    orbGlow: {
      width: isCompactLayout ? 236 : 260,
      height: isCompactLayout ? 236 : 260,
      borderRadius: isCompactLayout ? 118 : 130,
      alignItems: "center",
      justifyContent: "center",
    },
    orbOuterRing: {
      position: "absolute",
      width: isCompactLayout ? 236 : 260,
      height: isCompactLayout ? 236 : 260,
      borderRadius: isCompactLayout ? 118 : 130,
      backgroundColor: "rgba(10,13,10,0.88)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.02)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.32,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 16 },
      elevation: 8,
    },
    orbMidRing: {
      position: "absolute",
      width: isCompactLayout ? 172 : 190,
      height: isCompactLayout ? 172 : 190,
      borderRadius: isCompactLayout ? 86 : 95,
      backgroundColor: "rgba(163,190,140,0.08)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.12)",
    },
    orbInnerRing: {
      position: "absolute",
      width: isCompactLayout ? 120 : 132,
      height: isCompactLayout ? 120 : 132,
      borderRadius: isCompactLayout ? 60 : 66,
      backgroundColor: "rgba(163,190,140,0.15)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.18)",
    },
    orbCoreGlow: {
      position: "absolute",
      width: isCompactLayout ? 82 : 92,
      height: isCompactLayout ? 82 : 92,
      borderRadius: isCompactLayout ? 41 : 46,
      backgroundColor: "rgba(232,94,82,0.28)",
    },
    orbCore: {
      position: "absolute",
      width: isCompactLayout ? 64 : 72,
      height: isCompactLayout ? 64 : 72,
      borderRadius: isCompactLayout ? 32 : 36,
      backgroundColor: "rgba(197,84,69,0.88)",
      shadowColor: "#C65D4A",
      shadowOpacity: 0.32,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    orbCoreHalo: {
      position: "absolute",
      width: isCompactLayout ? 126 : 140,
      height: isCompactLayout ? 126 : 140,
      borderRadius: isCompactLayout ? 63 : 70,
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.1)",
      backgroundColor: "rgba(163,190,140,0.02)",
    },
    loadingPill: {
      position: "absolute",
      bottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    loadingText: {
      ...typography.smallCaption,
      color: theme.textPrimary,
      letterSpacing: 0.9,
    },
    entrainmentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      marginTop: isCompactLayout ? spacing.xs : spacing.sm,
    },
    entrainmentLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      color: theme.accent,
      textTransform: "uppercase",
    },
    toggleTrack: {
      width: 42,
      height: 24,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      padding: 2,
      justifyContent: "center",
    },
    toggleTrackActive: {
      backgroundColor: "rgba(163,190,140,0.18)",
      borderColor: "rgba(163,190,140,0.22)",
    },
    toggleThumb: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.textSecondary,
      transform: [{ translateX: 0 }],
    },
    toggleThumbActive: {
      backgroundColor: theme.buttonPrimaryText,
      transform: [{ translateX: 18 }],
    },
    transportRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      marginTop: isCompactLayout ? spacing.lg : spacing.xl,
    },
    sideControl: {
      width: isCompactLayout ? 82 : 88,
      minHeight: isCompactLayout ? 80 : 86,
      borderRadius: isCompactLayout ? 22 : 24,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    sideControlActive: {
      backgroundColor: "rgba(163,190,140,0.12)",
      borderColor: "rgba(163,190,140,0.2)",
    },
    buttonPressed: {
      transform: [{ scale: 0.98 }],
    },
    sideControlLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.1,
    },
    sideControlValue: {
      ...typography.smallCaption,
      fontSize: 12,
      lineHeight: 16,
      color: theme.textPrimary,
      letterSpacing: 0.8,
    },
    sideControlLabelActive: {
      color: theme.textPrimary,
    },
    playControl: {
      width: isCompactLayout ? 88 : 94,
      height: isCompactLayout ? 88 : 94,
      borderRadius: isCompactLayout ? 44 : 47,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
      borderWidth: 1,
      borderColor: theme.accent,
      shadowColor: theme.shadow,
      shadowOpacity: 0.32,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    playControlActive: {
      backgroundColor: theme.accentPressed,
    },
    playControlPressed: {
      transform: [{ scale: 0.98 }],
    },
    playControlDisabled: {
      opacity: 0.7,
    },
    progressBlock: {
      marginTop: isCompactLayout ? spacing.lg : spacing.xl,
    },
    progressMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      marginBottom: isCompactLayout ? 8 : 10,
    },
    progressMeta: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    progressTrack: {
      height: 4,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
      justifyContent: "center",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.accent,
    },
    progressDot: {
      position: "absolute",
      top: -3,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.accent,
      shadowColor: theme.accent,
      shadowOpacity: 0.5,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
    timeRow: {
      marginTop: isCompactLayout ? 6 : 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timeText: {
      ...typography.caption,
      color: theme.textSecondary,
      letterSpacing: 0.8,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      minHeight: isCompactLayout ? 260 : 320,
    },
    emptyTitle: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: isCompactLayout ? 24 : 28,
      lineHeight: isCompactLayout ? 28 : 32,
      letterSpacing: -0.3,
      color: theme.textPrimary,
      textAlign: "center",
    },
    emptyText: {
      ...typography.caption,
      color: theme.textSecondary,
      textAlign: "center",
      maxWidth: 320,
      lineHeight: 24,
    },
  });

type SoundscapePlayerContentProps = {
  soundscape: SoundscapeTrack;
  theme: ColorSet;
  styles: ReturnType<typeof styling>;
  insets: { top: number; bottom: number };
  spacing: Spacing;
  isCompactLayout: boolean;
  onBack: () => void | Promise<void>;
};

type SoundscapeSessionStatus =
  | "idle"
  | "creating"
  | "active"
  | "paused"
  | "completed";

function SoundscapePlayerContent({
  soundscape,
  theme,
  styles,
  insets,
  spacing,
  isCompactLayout,
  onBack,
}: SoundscapePlayerContentProps) {
  // Display-only labels are derived once from the cached soundscape so the
  // transport and header sections can stay presentation-focused.
  const subtitle = useMemo(
    () => `${soundscape.durationLabel} · ${soundscape.category}`,
    [soundscape]
  );
  const resonanceLabel = useMemo(
    () => buildSoundscapeResonanceLabel(soundscape),
    [soundscape]
  );
  const source = useMemo(
    () => resolveSoundscapePlaybackSource(soundscape.id),
    [soundscape.id]
  );
  const soundscapeContentObjectId = useMemo(() => {
    const numericId = Number(soundscape.id);
    return Number.isFinite(numericId) ? numericId : null;
  }, [soundscape.id]);

  // Player controls manage three local behaviors: the atmosphere toggle, the
  // sleep timer, and the coarse playback volume preset.
  const [binauralEnabled, setBinauralEnabled] = useState(true);
  const [timerIndex, setTimerIndex] = useState(0);
  const [intensityIndex, setIntensityIndex] = useState(1);
  // Session state stays separate from raw audio state because the playback
  // service and the wellness-session API can progress independently.
  const [sessionStatus, setSessionStatus] =
    useState<SoundscapeSessionStatus>("idle");
  const [sessionRef, setSessionRef] = useState<string | null>(null);
  const sessionStatusRef = useRef<SoundscapeSessionStatus>("idle");
  const pauseSessionRef = useRef<(() => Promise<void>) | null>(null);
  const sessionCreatePromiseRef = useRef<Promise<string | null> | null>(null);
  const completionInFlightRef = useRef(false);
  const leavingScreenRef = useRef(false);

  const {
    soundRef,
    playbackStatus,
    isLoading,
    isPlaying,
    positionMillis,
    durationMillis,
    togglePlayPause,
  } = useAudioPlayback({
    source,
    autoPlay: false,
    progressUpdateIntervalMillis: 500,
  });
  const currentSound = soundRef.current;

  // Opening a different soundscape resets the local session bookkeeping while
  // reusing the same shared player implementation.
  useEffect(() => {
    setSessionStatus("idle");
    setSessionRef(null);
    sessionStatusRef.current = "idle";
    sessionCreatePromiseRef.current = null;
    completionInFlightRef.current = false;
    leavingScreenRef.current = false;
  }, [soundscape.id]);

  useEffect(() => {
    sessionStatusRef.current = sessionStatus;
  }, [sessionStatus]);

  // The atmosphere toggle only changes UI energy and output gain right now; it
  // does not synthesize true binaural processing.
  const orbScale = binauralEnabled
    ? 1 + intensityIndex * 0.015 + (isPlaying ? 0.02 : 0)
    : 0.96;
  const playbackVolume = binauralEnabled
    ? intensityVolumes[intensityIndex]
    : Math.max(0.25, intensityVolumes[intensityIndex] * 0.7);

  const progress = Math.min(positionMillis / durationMillis, 1);
  const timerLabel =
    timerOptions[timerIndex] === null ? "OFF" : `${timerOptions[timerIndex]} MIN`;
  const intensityLabel = ["LOW", "MID", "HIGH"][intensityIndex];

  // Timer and volume controls cycle through a fixed set of presets instead of
  // opening separate pickers.
  const cycleTimer = () => {
    setTimerIndex((current) => (current + 1) % timerOptions.length);
  };

  const cycleIntensity = () => {
    setIntensityIndex((current) => (current + 1) % 3);
  };

  // Session creation is async and may still be in flight when the user pauses,
  // resumes, or exits, so downstream actions resolve the ref lazily.
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
      soundscapeContentObjectId === null
    ) {
      return;
    }

    // Create the wellness session only once per soundscape visit, then let the
    // playback controls drive pause/resume/complete updates against that ref.
    setSessionStatus("creating");

    const promise = createWellnessSession({
      activity_type: "soundscape",
      content_type: "wellness_content.wellnesscontent",
      content_object_id: soundscapeContentObjectId,
      source: "manual",
      metadata: {
        entry_surface: "session_screen",
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
        console.warn("Unable to create soundscape session:", error);
        return null;
      })
      .finally(() => {
        sessionCreatePromiseRef.current = null;
      });

    sessionCreatePromiseRef.current = promise;
  }, [sessionStatus, soundscapeContentObjectId]);

  const pauseSession = useCallback(async () => {
    if (sessionStatus === "idle" || sessionStatus === "completed") {
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
      console.warn("Unable to pause soundscape session:", error);
    }
  }, [resolveSessionRef, sessionStatus]);

  useEffect(() => {
    pauseSessionRef.current = pauseSession;
  }, [pauseSession]);

  // Resume only applies after an existing session has been paused; fresh play
  // presses go through session creation instead.
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
      console.warn("Unable to resume soundscape session:", error);
    }
  }, [resolveSessionRef, sessionStatus]);

  const completeSession = useCallback(async () => {
    if (completionInFlightRef.current || sessionStatus === "completed") {
      return;
    }

    completionInFlightRef.current = true;

    try {
      const resolvedSessionRef = await resolveSessionRef();
      if (!resolvedSessionRef) {
        return;
      }

      await completeWellnessSession(resolvedSessionRef, {
        duration_seconds: Math.max(1, Math.round(durationMillis / 1000)),
      });
      setSessionStatus("completed");
    } catch (error) {
      console.warn("Unable to complete soundscape session:", error);
    } finally {
      completionInFlightRef.current = false;
    }
  }, [durationMillis, resolveSessionRef, sessionStatus]);

  useEffect(() => {
    if (!playbackStatus?.isLoaded) {
      return;
    }

    if (!("didJustFinish" in playbackStatus) || !playbackStatus.didJustFinish) {
      return;
    }

    void completeSession();
  }, [completeSession, playbackStatus]);

  // Navigating away while a session is active should leave the server-side
  // session paused unless the handler already performed an explicit exit flow.
  useEffect(() => {
    return () => {
      if (leavingScreenRef.current) {
        return;
      }

      const currentStatus = sessionStatusRef.current;
      if (currentStatus === "active" || currentStatus === "creating") {
        void pauseSessionRef.current?.();
      }
    };
  }, []);

  // Volume preset changes apply immediately to the currently loaded sound.
  useEffect(() => {
    if (!currentSound || isLoading) return;

    void currentSound.setVolumeAsync(playbackVolume);
  }, [currentSound, isLoading, playbackVolume]);

  // The sleep timer counts down from the moment the user selects a preset. When
  // it elapses, playback stops, the session is paused, and the control resets.
  useEffect(() => {
    const selectedMinutes = timerOptions[timerIndex];
    if (!selectedMinutes) return undefined;

    const timeout = setTimeout(() => {
      if (currentSound) {
        void currentSound.stopAsync();
      }
      void pauseSessionRef.current?.();
      setTimerIndex(0);
    }, selectedMinutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [currentSound, timerIndex]);

  // Play/pause coordinates local audio state with the wellness session state so
  // pause/resume actions stay reflected in analytics and completion flows.
  const handlePlayPause = useCallback(async () => {
    if (isLoading || sessionStatus === "completed") {
      return;
    }

    if (isPlaying) {
      await togglePlayPause();
      void pauseSession();
      return;
    }

    if (sessionStatus === "paused") {
      await togglePlayPause();
      void resumeSession();
      return;
    }

    ensureSessionStarted();
    await togglePlayPause();
    setSessionStatus((current) =>
      current === "completed" ? current : "active"
    );
  }, [
    ensureSessionStarted,
    isLoading,
    isPlaying,
    pauseSession,
    resumeSession,
    sessionStatus,
    togglePlayPause,
  ]);

  // Back navigation pauses both audio and session state before leaving the
  // screen so the user can resume later without marking the session complete.
  const handleBack = useCallback(async () => {
    leavingScreenRef.current = true;

    if (isPlaying) {
      await togglePlayPause();
    }

    if (sessionStatus !== "idle" && sessionStatus !== "completed") {
      await pauseSession();
    }

    await onBack();
  }, [isPlaying, onBack, pauseSession, sessionStatus, togglePlayPause]);

  return (
    <ScreenView
      bgColor={theme.background}
      padding={0}
      useSafeTop={false}
      style={styles.screen}
    >
      <LinearGradient
        colors={["#0A0C09", theme.background, "rgba(39, 46, 31, 0.94)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />

      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + (isCompactLayout ? spacing.sm : spacing.md),
              paddingBottom:
                insets.bottom + spacing.lg + (isCompactLayout ? spacing.md : spacing.xl),
            },
          ]}
        >
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => void handleBack()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
            </Pressable>

            <Text style={styles.topLabel} numberOfLines={1}>
              NOW PLAYING
            </Text>

            <View style={styles.topSpacer} />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.kicker}>SVA LABORATORY SOUNDSCAPE</Text>
            <Text style={styles.title} numberOfLines={2}>
              {soundscape.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          <View style={styles.orbStage}>
            <View
              pointerEvents="none"
              style={[
                styles.orbGlow,
                {
                  transform: [
                    {
                      scale: orbScale,
                    },
                  ],
                  opacity: binauralEnabled ? 1 : 0.78,
                },
              ]}
            >
              <View style={styles.orbOuterRing} />
              <View style={styles.orbMidRing} />
              <View style={styles.orbInnerRing} />
              <View style={styles.orbCoreGlow} />
              <View style={styles.orbCore} />
              <View style={styles.orbCoreHalo} />
            </View>

            {isLoading ? (
              <View style={styles.loadingPill}>
                <Ionicons
                  name="musical-notes"
                  size={14}
                  color={theme.buttonPrimaryText}
                />
                <Text style={styles.loadingText}>Preparing soundscape</Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle enhanced atmosphere"
            onPress={() => setBinauralEnabled((value) => !value)}
            style={({ pressed }) => [
              styles.entrainmentRow,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.entrainmentLabel}>ENHANCED ATMOSPHERE</Text>
            <View
              style={[
                styles.toggleTrack,
                binauralEnabled && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  binauralEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>

          <View style={styles.transportRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Sleep timer ${timerLabel}`}
              onPress={cycleTimer}
              style={({ pressed }) => [
                styles.sideControl,
                pressed && styles.buttonPressed,
                timerIndex > 0 && styles.sideControlActive,
              ]}
            >
              <Ionicons
                name="timer-outline"
                size={22}
                color={timerIndex > 0 ? theme.textPrimary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.sideControlLabel,
                  timerIndex > 0 && styles.sideControlLabelActive,
                ]}
              >
                SLEEP TIMER
              </Text>
              <Text style={styles.sideControlValue}>{timerLabel}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isPlaying ? "Pause soundscape" : "Play soundscape"
              }
              disabled={isLoading}
              onPress={() => void handlePlayPause()}
              style={({ pressed }) => [
                styles.playControl,
                pressed && !isLoading && styles.playControlPressed,
                isPlaying && styles.playControlActive,
                isLoading && styles.playControlDisabled,
              ]}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={34}
                color={theme.background}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Volume ${intensityLabel}`}
              onPress={cycleIntensity}
              style={({ pressed }) => [
                styles.sideControl,
                pressed && styles.buttonPressed,
                intensityIndex > 0 && styles.sideControlActive,
              ]}
            >
              <Ionicons
                name="bar-chart-outline"
                size={22}
                color={intensityIndex > 0 ? theme.textPrimary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.sideControlLabel,
                  intensityIndex > 0 && styles.sideControlLabelActive,
                ]}
                numberOfLines={1}
              >
                VOLUME
              </Text>
              <Text style={styles.sideControlValue}>{intensityLabel}</Text>
            </Pressable>
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMeta}>{resonanceLabel}</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              <View
                style={[
                  styles.progressDot,
                  { left: `${Math.max(progress * 100 - 1.2, 1.2)}%` },
                ]}
              />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>
                {formatPlaybackTime(positionMillis)}
              </Text>
              <Text style={styles.timeText}>
                {formatPlaybackRemaining(positionMillis, durationMillis)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenView>
  );
}
