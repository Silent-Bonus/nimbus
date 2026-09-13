/**
 * Presence Anchor check-in screen.
 * Runs the timed grounding exercise and gives the user subtle haptic/audio
 * feedback when the configured meditation target is reached.
 */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import { useMeditationSession } from "@/contexts/MeditationSessionContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import {
  MeditationAnchorPulseOrb,
  MeditationAnchorSuggestionCard,
} from "@/features/check-in/components/meditationAnchor";
import {
  incrementHabitProgress,
} from "@/features/check-in/services/dailyCheckinService";
import {
  formatTime,
  parseAnchorAt,
  parseGoalMinutes,
} from "@/features/check-in/utils/meditationAnchor";
import { toApiDate } from "@/utils/date-time";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

// A low-volume rain texture gives completion a gentle audible cue without
// interrupting the quiet tone of the presence exercise.
const COMPLETION_SOUND = require("../../../assets/dump/lightRain.mp3");

const secondsToDecimalMinutes = (seconds: number) =>
  Math.round(Math.max(0, seconds / 60) * 10) / 10;

const getDisplayFont = (svaTypography?: TypographyTokens) =>
  svaTypography?.textStyle.authTitle?.fontFamily ??
  svaTypography?.textStyle.displayMedium?.fontFamily ??
  undefined;

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography?: TypographyTokens
) => {
  const displayFont = getDisplayFont(svaTypography) ?? typography.h2.fontFamily;

  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === "ios" ? 140 : 160,
    },
    sectionCopy: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      ...typography.h2,
      color: theme.textPrimary,
      fontFamily: displayFont,
      letterSpacing: -0.35,
    },
    sectionBody: {
      ...typography.body,
      color: theme.textSecondary,
      lineHeight: 22,
      marginTop: 8,
    },
    sectionHeaderRow: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.7,
      textTransform: "uppercase",
    },
    sectionBodySmall: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
    anchorNote: {
      marginTop: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    anchorNoteText: {
      ...typography.caption,
      color: theme.textPrimary,
      flex: 1,
      lineHeight: 18,
    },
    timerControl: {
      marginTop: spacing.md,
      minHeight: 58,
      borderRadius: 999,
      backgroundColor: theme.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 16,
      elevation: 6,
    },
    timerControlPaused: {
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
    },
    timerControlPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    timerControlText: {
      ...typography.button,
      color: theme.background,
      fontWeight: "800",
    },
    timerControlTextPaused: {
      color: theme.textPrimary,
    },
  });
};

export const MeditationAnchorScreen = () => {
  const navigation = useNavigation();
  const { goal, anchorAt, source, checkInId, date, autoStart } = useLocalSearchParams<{
    goal?: string | string[];
    anchorAt?: string | string[];
    source?: string | string[];
    checkInId?: string | string[];
    date?: string | string[];
    autoStart?: string | string[];
  }>();
  const {
    activeSession,
    pauseSession,
    registerControls,
    resumeSession,
    startSession,
    status,
    stopSession,
  } = useMeditationSession();

  const { newTheme: theme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography, svaTypography),
    [theme, spacing, typography, svaTypography]
  );

  const scrollRef = useRef<ScrollView>(null);
  const completionSoundRef = useRef<Audio.Sound | null>(null);
  const completionNotifiedRef = useRef(false);
  const hasStartedSessionRef = useRef(false);
  const syncedSecondsRef = useRef(0);

  const goalMinutes = useMemo(() => parseGoalMinutes(goal), [goal]);
  const anchoredAtDate = useMemo(() => parseAnchorAt(anchorAt), [anchorAt]);
  const routedSource = useMemo(
    () => (Array.isArray(source) ? source[0] : source),
    [source]
  );
  const routedCheckInId = useMemo(
    () => (Array.isArray(checkInId) ? checkInId[0] : checkInId),
    [checkInId]
  );
  const routedDate = useMemo(
    () => (Array.isArray(date) ? date[0] : date),
    [date]
  );
  const shouldAutoStart = useMemo(() => {
    const raw = Array.isArray(autoStart) ? autoStart[0] : autoStart;
    return raw !== "false";
  }, [autoStart]);
  const elapsedSeconds =
    activeSession?.mode === "anchor" ? activeSession.elapsedSeconds : 0;
  const isAnchorSessionActive = activeSession?.mode === "anchor";
  const isAnchorRunning = isAnchorSessionActive && status === "running";
  const isAnchorPaused = isAnchorSessionActive && status === "paused";

  // Keep the elapsed timer aligned with the active anchor session.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (!shouldAutoStart || hasStartedSessionRef.current) {
      return;
    }

    hasStartedSessionRef.current = true;
    startSession({
      mode: "anchor",
      source: routedSource === "daily-checkin" ? "daily-checkin" : "anchor",
      title: "Presence anchor",
      goalSeconds: goalMinutes * 60,
      checkInId: routedCheckInId,
      date: routedDate,
    });
  }, [
    goalMinutes,
    routedCheckInId,
    routedDate,
    routedSource,
    shouldAutoStart,
    startSession,
  ]);

  const saveCheckInProgress = useCallback(
    async (durationSeconds: number) => {
      const habitId = Number(routedCheckInId);
      const deltaSeconds = Math.max(0, durationSeconds - syncedSecondsRef.current);
      const completedMinutes = secondsToDecimalMinutes(deltaSeconds);

      if (
        routedSource !== "daily-checkin" ||
        !Number.isFinite(habitId) ||
        completedMinutes <= 0
      ) {
        return;
      }

      await incrementHabitProgress(
        habitId,
        routedDate ?? toApiDate(new Date()),
        completedMinutes
      );
      syncedSecondsRef.current = durationSeconds;
    },
    [routedCheckInId, routedDate, routedSource]
  );

  useEffect(
    () =>
      registerControls({
        onPause: saveCheckInProgress,
        onStop: saveCheckInProgress,
      }),
    [registerControls, saveCheckInProgress]
  );

  // Release audio and haptic-related resources when leaving the screen.
  useEffect(() => {
    if (
      completionNotifiedRef.current ||
      elapsedSeconds < goalMinutes * 60
    ) {
      return;
    }

    completionNotifiedRef.current = true;

    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
    }

    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const playCompletionSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(COMPLETION_SOUND, {
          shouldPlay: true,
          volume: 0.18,
        });
        completionSoundRef.current = sound;
        // Keep the cue short so the completion sound remains unobtrusive.
        stopTimer = setTimeout(async () => {
          await sound.stopAsync().catch(() => {});
          await sound.unloadAsync().catch(() => {});
          completionSoundRef.current = null;
        }, 900);
      } catch (error) {
        // Completion should still work when audio is unavailable or muted.
        console.warn("[Presence Anchor] completion sound unavailable", error);
      }
    };

    void playCompletionSound();

    return () => {
      if (stopTimer) clearTimeout(stopTimer);
    };
  }, [elapsedSeconds, goalMinutes]);

  // Reset session listeners when the route or session state changes.
  useEffect(() => {
    return () => {
      void completionSoundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const handleLeaveMeditation = useCallback(() => {
    void stopSession().finally(() => navigation.goBack());
  }, [navigation, stopSession]);

  const handleTimerControl = useCallback(() => {
    if (isAnchorRunning) {
      void pauseSession();
      return;
    }

    if (isAnchorPaused) {
      void resumeSession();
      return;
    }

    completionNotifiedRef.current = false;
    hasStartedSessionRef.current = true;
    startSession({
      mode: "anchor",
      source: routedSource === "daily-checkin" ? "daily-checkin" : "anchor",
      title: "Presence anchor",
      goalSeconds: goalMinutes * 60,
      checkInId: routedCheckInId,
      date: routedDate,
    });
  }, [
    goalMinutes,
    isAnchorPaused,
    isAnchorRunning,
    pauseSession,
    resumeSession,
    routedCheckInId,
    routedDate,
    routedSource,
    startSession,
  ]);

  // Render the exercise using the shared SVA themed screen container.
  return (
    <ScreenView bgColor={theme.background} padding={0}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="Presence Anchored"
          subtitle={`${goalMinutes}m goal • vibration sync`}
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "settings-outline",
              accessibilityLabel: "Leave meditation",
              onPress: handleLeaveMeditation,
            },
          ]}
        />

        <MeditationAnchorPulseOrb
          goalMinutes={goalMinutes}
          elapsedSeconds={elapsedSeconds}
          anchorAt={anchoredAtDate}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isAnchorRunning ? "Pause anchor timer" : "Play anchor timer"
          }
          onPress={handleTimerControl}
          style={({ pressed }) => [
            styles.timerControl,
            (isAnchorPaused || !isAnchorSessionActive) &&
              styles.timerControlPaused,
            pressed && styles.timerControlPressed,
          ]}
        >
          <Ionicons
            name={isAnchorRunning ? "pause" : "play"}
            size={20}
            color={
              isAnchorPaused || !isAnchorSessionActive
                ? theme.textPrimary
                : theme.background
            }
          />
          <Text
            style={[
              styles.timerControlText,
              (isAnchorPaused || !isAnchorSessionActive) &&
                styles.timerControlTextPaused,
            ]}
          >
            {isAnchorRunning ? "Pause Timer" : "Play Timer"}
          </Text>
        </Pressable>

        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Stay with the pulse.</Text>
          <Text style={styles.sectionBody}>
            Let the circle fill to the goal while the room stays quiet and the
            body softens.
          </Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionLabel}>SUGGESTED NEXT</Text>
            <Text style={styles.sectionBodySmall}>
              Keep the ritual going with a deeper meditation or a calmer soundscape.
            </Text>
          </View>
        </View>

        <MeditationAnchorSuggestionCard
          title="Guided Meditation"
          description="Step into a 10-minute guided settle to deepen the anchored state."
          meta="10 min"
          actionLabel="Open meditation"
          icon="leaf-outline"
          tint="rgba(163,190,140,0.12)"
          accent={theme.chart5 ?? theme.accent}
          onPress={() =>
            router.push({
              pathname: ROUTES.AUTH.SELF_CARE_MEDITATION,
              params: {
                source: routedSource ?? "anchor",
                checkInId: routedCheckInId,
                date: routedDate,
              },
            })
          }
        />

        <View style={{ height: spacing.md }} />

        <MeditationAnchorSuggestionCard
          title="Soundscape"
          description="Open a low amber ambience to keep the nervous system quiet."
          meta="Ambient"
          actionLabel="Open soundscape"
          icon="musical-notes-outline"
          tint="rgba(121,169,242,0.10)"
          accent={theme.chart2 ?? theme.accent}
          onPress={() =>
            router.push({
              pathname: ROUTES.AUTH.SELF_CARE_SOUNDSCAPE,
              params: {
                source: routedSource ?? "anchor",
                checkInId: routedCheckInId,
                date: routedDate,
              },
            })
          }
        />

        <View style={styles.anchorNote}>
          <Ionicons
            name="sparkles-outline"
            size={16}
            color={theme.chart5 ?? theme.accent}
          />
          <Text style={styles.anchorNoteText}>
            {anchoredAtDate
              ? `Anchor locked at ${formatTime(anchoredAtDate)}.`
              : "The first hold has already set the tone."}
          </Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenView>
  );
};

export default MeditationAnchorScreen;
