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
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import BreathMotionCanvas from "@/features/self-care/components/breathwork/BreathMotionCanvas";
import { getWellnessContentDetail } from "@/features/self-care/services/selfCareService";
import {
  completeWellnessSession,
  createWellnessSession,
  pauseWellnessSession,
} from "@/features/self-care/services/wellnessSessionService";
import {
  cacheBreathWorkDetail,
  getCachedBreathWorkDetail,
  mapBreathworkDetail,
} from "@/features/self-care/utils/breathworkLibrary";
import {
  createFallbackBreathPhases,
  getBreathMotionVariant,
  resolveBreathworkColor,
} from "@/features/self-care/utils/breathworkUtils";
import type {
  BreathPhase,
  BreathWorkDetail,
} from "@/features/self-care/types/wellnessContentTypes";
import {
  parseBreathWorkRouteParams,
  type BreathWorkRouteParams,
} from "@/features/self-care/utils/breathworkPlayback";
import { makeBreathWorkSessionStyles } from "@/features/self-care/styles/breathwork/breathWorkSessionStyles";

type BreathWorkSessionParams = BreathWorkRouteParams;

const MINIMUM_ROUNDS = 5;
const DEFAULT_PHASE: BreathPhase = { label: "Inhale", seconds: 4 };

// Builds the compact subtitle shown in the header so users can see the full
// inhale / hold / exhale cadence without reading the longer instruction copy.
const formatPhaseTimeline = (phases: BreathPhase[]) =>
  phases.map((phase) => `${phase.label} ${phase.seconds}s`).join(" · ");

// Returns the live coaching line for the current phase. This keeps the prompt
// logic in one place instead of scattering label checks through the component.
const getPhaseCue = (
  phase: BreathPhase,
  phaseIndex: number,
  phases: BreathPhase[]
) => {
  const label = phase.label.toLowerCase();

  if (label.includes("inhale")) {
    return phaseIndex === 0
      ? "Draw the breath in with a steady, rooted count."
      : "Take in the same calm count you will return on the way out.";
  }

  if (label.includes("exhale")) {
    return "Let the exhale stay smooth and even.";
  }

  if (label.includes("hold")) {
    if (phaseIndex === phases.length - 1) {
      return "Rest lightly at the end of the cycle before the next round begins.";
    }
    return "Hold gently and keep the frame steady.";
  }

  return `Stay with the ${phase.label.toLowerCase()} for ${phase.seconds} seconds.`;
};

const triggerSelectionHaptic = () => {
  if (Platform.OS !== "web") {
    void Haptics.selectionAsync().catch(() => {});
  }
};

export default function BreathWorkSessionScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<BreathWorkSessionParams>();
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const { breathworkId, breathworkSlug } = parseBreathWorkRouteParams(params);
  const detailIdentifier = breathworkSlug || breathworkId;

  const [detail, setDetail] = useState<BreathWorkDetail | null>(() =>
    detailIdentifier ? getCachedBreathWorkDetail(detailIdentifier) ?? null : null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const phases = detail
    ? detail.phases.length > 0
      ? detail.phases
      : createFallbackBreathPhases(detail.style)
    : [];
  const heroMeta = detail
    ? `${detail.durationLabel} · ${(
        detail.category ?? detail.styleLabel
      ).toUpperCase()}`
    : "";

  // Motion treatment is derived from stable content identifiers so the same
  // breathwork consistently renders with the same animated visual language.
  const motionVariant = useMemo(() => {
    const motionKey = [
      detail?.slug,
      detail?.title,
      detail?.category,
      detail?.styleLabel,
      detail?.id,
    ]
      .filter(Boolean)
      .join(" ");

    return getBreathMotionVariant(motionKey);
  }, [detail?.category, detail?.id, detail?.slug, detail?.title, detail?.styleLabel]);
  const phaseTimeline = useMemo(() => formatPhaseTimeline(phases), [phases]);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(phases[0]?.seconds ?? 0);
  const [roundCount, setRoundCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompletedSession, setHasCompletedSession] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<
    "idle" | "creating" | "active" | "paused" | "completed"
  >("idle");
  const [sessionRef, setSessionRef] = useState<string | null>(null);
  const sessionStatusRef = useRef<"idle" | "creating" | "active" | "paused" | "completed">("idle");
  const sessionCreatePromiseRef = useRef<Promise<string | null> | null>(null);
  const pauseSessionRef = useRef<(() => Promise<void>) | null>(null);
  const leavingScreenRef = useRef(false);
  const phaseProgress = useRef(new Animated.Value(0)).current;
  const phaseIndexRef = useRef(0);
  const elapsedSecondsRef = useRef(0);
  const initialPhase = phases[0] ?? DEFAULT_PHASE;

  const styles = useMemo(
    () => makeBreathWorkSessionStyles(theme, spacing, typography),
    [theme, spacing, typography]
  );

  const resetCycleProgress = useCallback(() => {
    phaseIndexRef.current = 0;
    setPhaseIndex(0);
    setSecondsRemaining(initialPhase.seconds);
    setRoundCount(0);
    elapsedSecondsRef.current = 0;
    phaseProgress.stopAnimation();
    phaseProgress.setValue(0);
  }, [initialPhase.seconds, phaseProgress]);

  const resetLocalSessionState = useCallback(
    (
      nextStatus: "idle" | "creating" | "active" | "paused" | "completed" = "idle",
      completed = false
    ) => {
      resetCycleProgress();
      setHasStarted(false);
      setHasCompletedSession(completed);
      setIsCompletingSession(false);
      setSessionStatus(nextStatus);
      setSessionRef(null);
      sessionStatusRef.current = nextStatus;
      sessionCreatePromiseRef.current = null;
      leavingScreenRef.current = false;
    },
    [resetCycleProgress]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;
    const cachedDetail = detailIdentifier
      ? getCachedBreathWorkDetail(detailIdentifier)
      : undefined;

    setDetail(cachedDetail ?? null);
    setLoadError(null);
    setIsLoading(true);

    if (cachedDetail) {
      setIsLoading(false);

      return () => {
        active = false;
      };
    }

    if (!detailIdentifier) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    void getWellnessContentDetail(detailIdentifier)
      .then((response) => {
        if (!active) {
          return;
        }

        // Normalize the backend payload into the session-ready breathwork shape
        // so steps, benefits, palette, and phases all stay consistent.
        const mappedDetail = mapBreathworkDetail(response.data, 0);

        cacheBreathWorkDetail(mappedDetail);
        setDetail(mappedDetail);
      })
      .catch((error) => {
        console.warn("Unable to load breathwork details:", error);
        if (active) {
          setLoadError("Unable to load the latest breathwork details.");
          setDetail(cachedDetail ?? null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [detailIdentifier]);

  useEffect(() => {
    // Fully reset the session state whenever the underlying breathwork changes.
    // This prevents timers, round counts, or in-flight refs from bleeding
    // across two different breathwork sessions.
    resetLocalSessionState();
  }, [detail?.id, resetLocalSessionState]);

  useEffect(() => {
    sessionStatusRef.current = sessionStatus;
  }, [sessionStatus]);

  useEffect(() => {
    if (!hasStarted || phases.length === 0) {
      return undefined;
    }

    // Animate one linear progress sweep for the currently active phase. The
    // interval below advances the phase; this animation only visualizes it.
    const currentPhase = phases[phaseIndex] ?? phases[0];
    if (!currentPhase) return undefined;

    phaseProgress.stopAnimation();
    phaseProgress.setValue(0);

    const animation = Animated.timing(phaseProgress, {
      toValue: 1,
      duration: currentPhase.seconds * 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [hasStarted, phaseIndex, phases, phaseProgress]);

  useEffect(() => {
    if (!hasStarted || phases.length === 0) {
      return undefined;
    }

    // Drive the breath cycle one second at a time so phase transitions can
    // update haptics, round count, and CTA state in lockstep.
    const timer = setInterval(() => {
      setSecondsRemaining((current) => {
        elapsedSecondsRef.current += 1;

        if (current > 1) {
          return current - 1;
        }

        const nextIndex = (phaseIndexRef.current + 1) % phases.length;
        phaseIndexRef.current = nextIndex;
        setPhaseIndex(nextIndex);

        if (nextIndex === 0) {
          setRoundCount((value) => value + 1);
        }

        triggerSelectionHaptic();
        if (Platform.OS !== "web" && nextIndex === 0) {
          void Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Light
          ).catch(() => {});
        }

        return phases[nextIndex]?.seconds ?? 0;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [hasStarted, phases]);

  const currentPhase = useMemo(
    () => phases[phaseIndex] ?? initialPhase,
    [initialPhase, phaseIndex, phases]
  );
  const hasCompletedMinimumRounds = roundCount >= MINIMUM_ROUNDS;
  const preStartGuide =
    detail?.description?.trim() || "Tap play to begin this rhythm.";
  const phaseCue = hasCompletedSession
    ? `You completed ${MINIMUM_ROUNDS} rounds and marked this breathwork complete.`
    : hasStarted
      ? getPhaseCue(currentPhase, phaseIndex, phases)
      : preStartGuide;
  const motionSize = Math.min(Math.max(width - spacing.md * 2 - 8, 260), 332);
  const currentRound =
    hasStarted || hasCompletedSession
      ? Math.min(roundCount + 1, MINIMUM_ROUNDS)
      : 0;
  const motionCoreStart = theme.chart5;
  const motionCoreEnd = theme.chart2;
  const motionGlow = "rgba(121, 169, 242, 0.10)";
  const motionFrameBorder = theme.chart6;
  const phaseActionLabel = hasCompletedSession
    ? "Completed"
    : !hasStarted
      ? "Start"
      : hasCompletedMinimumRounds
        ? "Mark Complete"
        : "In Progress";
  const phaseActionPrompt = hasCompletedSession
    ? "Breathwork session complete. Restart if you want to practice again."
    : !hasStarted
      ? "Tap play to begin this rhythm."
      : hasCompletedMinimumRounds
        ? `Minimum ${MINIMUM_ROUNDS} rounds complete. Tap mark complete to finish.`
        : `Complete ${MINIMUM_ROUNDS} rounds before marking complete.`;
  const canTriggerPrimaryAction =
    !hasCompletedSession && (!hasStarted || hasCompletedMinimumRounds);

  // Session creation is async and can race with the user pressing complete or
  // leaving the screen, so every mutation resolves through one shared ref.
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
      !detail ||
      sessionStatus !== "idle" ||
      sessionCreatePromiseRef.current ||
      !Number.isFinite(Number(detail.id))
    ) {
      return;
    }

    setSessionStatus("creating");

    // The backend session starts on first play, not on screen mount, so
    // passive visits to the session screen do not create false activity.
    const promise = createWellnessSession({
      activity_type: "breathwork",
      content_type: "wellness_content.wellnesscontent",
      content_object_id: Number(detail.id),
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
        console.warn("Unable to create breathwork session:", error);
        return null;
      })
      .finally(() => {
        sessionCreatePromiseRef.current = null;
      });

    sessionCreatePromiseRef.current = promise;
  }, [detail, sessionStatus]);

  const pauseSession = useCallback(async () => {
    if (
      sessionStatus === "idle" ||
      sessionStatus === "paused" ||
      sessionStatus === "completed"
    ) {
      return;
    }

    // Pause is reused for back navigation, restart, and unmount cleanup.
    const resolvedSessionRef = await resolveSessionRef();
    if (!resolvedSessionRef) {
      return;
    }

    try {
      await pauseWellnessSession(resolvedSessionRef);
      setSessionStatus("paused");
    } catch (error) {
      console.warn("Unable to pause breathwork session:", error);
    }
  }, [resolveSessionRef, sessionStatus]);

  useEffect(() => {
    pauseSessionRef.current = pauseSession;
  }, [pauseSession]);

  const handleStart = useCallback(() => {
    if (hasCompletedSession || isCompletingSession) {
      return;
    }

    // Start flips the local cycle immediately and lets session creation finish
    // in parallel so the first tap always feels responsive.
    ensureSessionStarted();
    setHasStarted(true);
    triggerSelectionHaptic();
  }, [ensureSessionStarted, hasCompletedSession, isCompletingSession]);

  const handleCompleteBreathwork = useCallback(async () => {
    if (
      !hasStarted ||
      !hasCompletedMinimumRounds ||
      isCompletingSession ||
      hasCompletedSession
    ) {
      return;
    }

    triggerSelectionHaptic();

    setIsCompletingSession(true);

    try {
      // Completion sends the elapsed duration gathered locally because this
      // screen owns the breathing timer and round progression state.
      const resolvedSessionRef = await resolveSessionRef();

      if (resolvedSessionRef) {
        await completeWellnessSession(resolvedSessionRef, {
          duration_seconds: Math.max(1, Math.round(elapsedSecondsRef.current)),
        });
      } else {
        console.warn("Missing breathwork session ref while completing session.");
      }

      resetLocalSessionState("completed", true);
    } catch (error) {
      console.warn("Unable to complete breathwork session:", error);
    } finally {
      setIsCompletingSession(false);
    }
  }, [
    hasCompletedMinimumRounds,
    hasCompletedSession,
    hasStarted,
    isCompletingSession,
    resolveSessionRef,
    resetLocalSessionState,
  ]);

  const handleBack = useCallback(async () => {
    leavingScreenRef.current = true;

    // Exiting an active session should pause it before navigating away so the
    // backend state matches the stopped UI state.
    if (sessionStatus !== "idle" && sessionStatus !== "completed") {
      await pauseSession();
    }

    router.back();
  }, [pauseSession, sessionStatus]);

  const handleRestart = useCallback(async () => {
    // Restart behaves like a brand-new local session. If a backend session is
    // active, pause it first and then clear all local counters and refs.
    if (sessionStatus === "active" || sessionStatus === "creating") {
      await pauseSession();
    }
    resetLocalSessionState();
    triggerSelectionHaptic();
  }, [pauseSession, resetLocalSessionState, sessionStatus]);

  useEffect(() => {
    return () => {
      if (leavingScreenRef.current) {
        return;
      }

      // If the component disappears for any reason other than the explicit back
      // flow above, still pause the backend session before unmounting.
      const currentStatus = sessionStatusRef.current;
      if (currentStatus === "active" || currentStatus === "creating") {
        void pauseSessionRef.current?.();
      }
    };
  }, []);

  useEffect(() => {
    setSecondsRemaining(currentPhase.seconds);
  }, [currentPhase]);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Breath Session"
          subtitle={detail ? phaseTimeline : "Loading breathwork..."}
          onBack={() => void handleBack()}
          rightActions={[
            {
              icon: "refresh-outline",
              accessibilityLabel: "Restart session",
              onPress: () => void handleRestart(),
            },
          ]}
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl * 2.5 },
          ]}
        >
          {detail ? (
            <>
              <View
                style={[styles.heroCard, { borderColor: detail.palette.accent }]}
              >
                <Image
                  source={detail.image}
                  style={styles.heroImage}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["rgba(8, 10, 7, 0.02)", "rgba(8, 10, 7, 0.86)"]}
                  style={StyleSheet.absoluteFill}
                />

                <View
                  pointerEvents="none"
                  style={[
                    styles.heroGlowPrimary,
                    { backgroundColor: detail.palette.accentSoft },
                  ]}
                />
                <View pointerEvents="none" style={styles.heroGlowSecondary} />

                <View style={styles.heroCopy}>
                  <Text style={styles.heroKicker}>CURATED BREATHWORK</Text>
                  <Text style={styles.heroTitle} numberOfLines={2}>
                    {detail.title}
                  </Text>
                  <Text style={styles.heroSubtext}>{heroMeta}</Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  phaseActionLabel === "Mark Complete"
                    ? "Mark breathwork complete"
                    : phaseActionLabel === "Completed"
                      ? "Breathwork completed"
                      : "Start breathwork"
                }
                accessibilityHint="Starts the selected breathwork pattern"
                disabled={!canTriggerPrimaryAction || isCompletingSession}
                onPress={
                  !canTriggerPrimaryAction
                    ? undefined
                    : !hasStarted
                      ? handleStart
                      : handleCompleteBreathwork
                }
                style={({ pressed }) => [
                  styles.phaseCard,
                  {
                    borderColor: theme.border ?? theme.borderMuted,
                  },
                  pressed && canTriggerPrimaryAction && styles.phaseCardPressed,
                  (!canTriggerPrimaryAction || hasCompletedSession) &&
                    styles.phaseCardDisabled,
                ]}
              >
                <View style={styles.phaseTopRow}>
                  <View style={styles.phaseTitleBlock}>
                    <Text style={styles.phaseLabel}>
                      {hasCompletedSession
                        ? "COMPLETED"
                        : currentPhase.label.toUpperCase()}
                    </Text>
                    <Text style={styles.phaseStartPrompt}>
                      {phaseActionPrompt}
                    </Text>
                  </View>
                </View>

            <View style={styles.phaseCuePanel}>
              <Text style={styles.phaseCueLabel}>SESSION GUIDE</Text>
              <Text style={styles.phaseCue} numberOfLines={3}>
                {phaseCue}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricBlock}>
                <Text style={styles.metricValue}>
                  {phaseIndex + 1}/{phases.length}
                </Text>
                <Text style={styles.metricLabel}>Phase</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricBlock}>
                <Text style={styles.metricValue}>{currentRound}</Text>
                <Text style={styles.metricLabel}>Round</Text>
              </View>
            </View>

            <View style={styles.phaseActions}>
              <View
                style={[
                  styles.phasePill,
                  {
                    backgroundColor: detail.palette.tagBg,
                    borderColor: detail.palette.tagBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.phasePillText,
                    { color: detail.palette.tagText },
                  ]}
                >
                  {secondsRemaining}s
                </Text>
              </View>

              <View
                style={[
                  styles.phaseStartBadge,
                  {
                    backgroundColor: hasCompletedSession
                      ? theme.surfaceMuted
                      : hasStarted && hasCompletedMinimumRounds
                        ? detail.palette.accent
                        : hasStarted
                          ? theme.surfaceMuted
                          : detail.palette.accent,
                    borderColor: hasCompletedSession
                      ? theme.borderMuted
                      : hasStarted && hasCompletedMinimumRounds
                        ? detail.palette.accent
                        : hasStarted
                          ? theme.borderMuted
                          : detail.palette.accent,
                  },
                ]}
              >
                <Ionicons
                  name={
                    hasCompletedSession
                      ? "checkmark-circle"
                      : hasStarted && hasCompletedMinimumRounds
                        ? "checkmark"
                        : "play"
                  }
                  size={14}
                  color={
                    hasCompletedSession || hasStarted
                      ? theme.textSecondary
                      : theme.buttonPrimaryText
                  }
                />
                <Text
                  style={[
                    styles.phaseStartText,
                    {
                      color: hasCompletedSession || hasStarted
                        ? theme.textSecondary
                        : theme.buttonPrimaryText,
                    },
                  ]}
                >
                  {phaseActionLabel}
                </Text>
              </View>
            </View>
              </Pressable>

              <View
                style={[
                  styles.motionCard,
                  { borderColor: theme.border ?? theme.borderMuted },
                ]}
              >
                <BreathMotionCanvas
                  motionVariant={motionVariant}
                  phases={phases}
                  currentPhase={currentPhase}
                  phaseIndex={phaseIndex}
                  phaseProgress={phaseProgress}
                  motionSize={motionSize}
                  accent={detail.palette.accent}
                  shadow={theme.shadow}
                  typography={typography}
                  textSecondary={theme.textSecondary}
                  surface={theme.surface}
                  motionCoreStart={motionCoreStart}
                  motionCoreEnd={motionCoreEnd}
                  motionGlow={motionGlow}
                  motionFrameBorder={motionFrameBorder}
                />
              </View>

              <View style={styles.sequenceCard}>
            <Text style={styles.sequenceLabel}>SEQUENCE</Text>
            <View style={styles.sequenceRow}>
              {phases.map((phase, index) => {
                const selected = index === phaseIndex;
                const phaseColor = resolveBreathworkColor(
                  phase.color,
                  detail.palette.accent
                );
                return (
                  <View
                    key={`${phase.label}-${phase.seconds}-${index}`}
                    style={[
                      styles.sequenceChip,
                      selected && [
                        styles.sequenceChipSelected,
                        {
                          borderColor: phaseColor,
                          backgroundColor: detail.palette.accentSoft,
                        },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.sequenceChipLabel,
                        {
                          color: selected
                            ? phaseColor
                            : theme.textSecondary,
                        },
                      ]}
                    >
                      {phase.label}
                    </Text>
                    <Text
                      style={[
                        styles.sequenceChipValue,
                        {
                          color: selected
                            ? phaseColor
                            : theme.textPrimary,
                        },
                      ]}
                    >
                      {phase.seconds}s
                    </Text>
                  </View>
                );
              })}
            </View>
              </View>

              <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>WHY THIS RHYTHM</Text>
            <Text style={styles.insightText}>{detail.description}</Text>
            {detail.benefits[0]?.text ? (
              <Text style={styles.insightSubtext}>
                {detail.benefits[0].text}
              </Text>
            ) : null}
            {detail.tips[0] ? (
              <View style={styles.tipRow}>
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color={detail.palette.accent}
                />
                <Text style={styles.tipText}>{detail.tips[0]}</Text>
              </View>
            ) : null}
              </View>
            </>
          ) : (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loadingTitle}>
                {isLoading
                  ? "Loading breathwork session..."
                  : loadError ?? "Breathwork detail is unavailable."}
              </Text>
            </View>
          )}

          {detail && loadError ? (
            <View style={styles.errorCard}>
              <View style={styles.errorHeaderRow}>
                <Text style={styles.errorTitle}>Detail unavailable</Text>
                <Ionicons name="warning-outline" size={16} color="#F7C48B" />
              </View>
              <Text style={styles.errorText}>{loadError}</Text>
            </View>
          ) : null}

        </ScrollView>
      </View>
    </ScreenView>
  );
}
