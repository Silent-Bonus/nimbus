import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import ExerciseIntroCard from "@/features/self-care/components/workout/ExerciseIntroCard";
import RestInfoRow, {
  type TimerMode,
} from "@/features/self-care/components/workout/RestInfoRow";
import TimerRing from "@/features/self-care/components/workout/TimerRing";
import WorkoutGuideModal from "@/features/self-care/components/workout/WorkoutGuideModal";
import WorkoutPrimaryButton from "@/features/self-care/components/workout/WorkoutPrimaryButton";
import WorkoutTipBanner from "@/features/self-care/components/workout/WorkoutTipBanner";
import {
  completeMoveSession,
  pauseMoveSession,
  resumeMoveSession,
  startMoveExercise,
} from "@/features/self-care/services/selfCareService";
import { mockWorkoutRecommendations, type WorkoutCardModel } from "@/features/self-care/utils/workoutLibrary";
import {
  WORKOUT_SESSION_BREAK_DURATION_SECONDS,
  WORKOUT_SESSION_WORK_DURATION_SECONDS,
  getWorkoutSessionLevelContent,
} from "@/features/self-care/utils/workoutSession";
import { type WorkoutGuideLevel } from "@/features/self-care/utils/workoutGuide";
import type {
  ColorSet,
  Spacing,
} from "@/theme/types";

type WorkoutSessionParams = {
  id?: string | string[];
  title?: string | string[];
  subtitle?: string | string[];
  image?: string | string[];
  description?: string | string[];
  instructions?: string | string[];
  reps?: string | string[];
  category?: string | string[];
  tags?: string | string[];
  benefits?: string | string[];
  tips?: string | string[];
  commonMistakes?: string | string[];
  breathingPattern?: string | string[];
  difficulty?: string | string[];
  durationSeconds?: string | string[];
  planSessionRef?: string | string[];
  planId?: string | string[];
  planExercises?: string | string[];
  exerciseIndex?: string | string[];
};

const FALLBACK_WORKOUT = mockWorkoutRecommendations[0];

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeDifficulty = (value?: string): WorkoutGuideLevel => {
  const normalized = value?.toLowerCase();
  return normalized === "medium" || normalized === "hard" ? normalized : "easy";
};

const parseStringList = (value?: string): string[] => {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && !!item.trim());
    if (typeof parsed === "string" && parsed.trim()) return [parsed];
  } catch {
    return [value];
  }
  return [];
};

const buildWorkoutFallback = (
  id: string | undefined,
  title: string | undefined,
  subtitle: string | undefined,
  image: string | undefined,
  description: string | undefined
): WorkoutCardModel | null => {
  if (!title && !id) {
    return null;
  }

  const base = FALLBACK_WORKOUT;
  return {
    id: id ?? base.id,
    title: title ?? base.title,
    subtitle: subtitle ?? base.subtitle,
    category: base.category,
    image: image || base.image,
    description,
  };
};

export const WorkoutSessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );

  const params = useLocalSearchParams<WorkoutSessionParams>();
  const workoutId = readParam(params.id);
  const planSessionRef = readParam(params.planSessionRef);
  const planId = readParam(params.planId);
  const serializedPlanExercises = readParam(params.planExercises);
  const exerciseIndex = Math.max(0, Number(readParam(params.exerciseIndex) ?? 0) || 0);
  const planExercises = useMemo(() => {
    if (!serializedPlanExercises) return [] as Record<string, string>[];
    try {
      const parsed: unknown = JSON.parse(serializedPlanExercises);
      return Array.isArray(parsed) ? parsed.filter((item): item is Record<string, string> => !!item && typeof item === "object") : [];
    } catch { return []; }
  }, [serializedPlanExercises]);
  const isPlanSession = !!planSessionRef && !!planId && planExercises.length > 0;
  const workoutTitle = readParam(params.title);
  const workoutSubtitle = readParam(params.subtitle);
  const workoutImage = readParam(params.image);
  const workoutDescription = readParam(params.description);
  const workoutInstructions = readParam(params.instructions);
  const workoutReps = readParam(params.reps);
  const exerciseCategory = readParam(params.category) || "Exercise";
  const tags = parseStringList(readParam(params.tags));
  const benefits = parseStringList(readParam(params.benefits));
  const tips = parseStringList(readParam(params.tips));
  const commonMistakes = parseStringList(readParam(params.commonMistakes));
  const breathingPattern = readParam(params.breathingPattern);
  const assignedDifficulty = normalizeDifficulty(readParam(params.difficulty));
  const parsedDurationSeconds = Number(readParam(params.durationSeconds));
  const workoutDurationSeconds = Number.isFinite(parsedDurationSeconds) && parsedDurationSeconds > 0
    ? Math.round(parsedDurationSeconds)
    : WORKOUT_SESSION_WORK_DURATION_SECONDS;

  const workout = useMemo<WorkoutCardModel | null>(() => {
    const found = workoutId
      ? mockWorkoutRecommendations.find((item) => item.id === workoutId)
      : undefined;

    if (found && !workoutTitle && !workoutDescription && !workoutImage) {
      return found;
    }

    return buildWorkoutFallback(
      workoutId,
      workoutTitle,
      workoutSubtitle,
      workoutImage,
      workoutDescription
    );
  }, [workoutId, workoutTitle, workoutSubtitle, workoutImage, workoutDescription]);

  const [difficulty, setDifficulty] = useState<WorkoutGuideLevel>(assignedDifficulty);
  const [mode, setMode] = useState<TimerMode>("workout");
  const [remainingSeconds, setRemainingSeconds] = useState(
    workoutDurationSeconds
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);
  const [isCompletingWorkout, setIsCompletingWorkout] = useState(false);
  const [sessionRef, setSessionRef] = useState<string | null>(null);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  const [isCelebrationVisible, setIsCelebrationVisible] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [guideWorkout, setGuideWorkout] = useState<WorkoutCardModel | null>(
    null
  );
  const celebrationScale = useRef(new Animated.Value(0.65)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    setDifficulty(assignedDifficulty);
  }, [workoutId, assignedDifficulty]);

  useEffect(() => {
    setMode("workout");
    setRemainingSeconds(workoutDurationSeconds);
    setIsRunning(false);
    setHasStarted(false);
    setSessionRef(planSessionRef ?? null);
    setIsWorkoutComplete(false);
    setIsCelebrationVisible(false);
    setActionError(null);
  }, [workout?.id, difficulty, workoutDurationSeconds, exerciseIndex, planSessionRef]);

  useEffect(() => {
    if (remainingSeconds === 0) setIsRunning(false);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!isCelebrationVisible) return undefined;

    celebrationScale.setValue(0.65);
    celebrationOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 5,
        tension: 85,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      celebrationScale.stopAnimation();
      celebrationOpacity.stopAnimation();
    };
  }, [isCelebrationVisible, celebrationOpacity, celebrationScale]);

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, remainingSeconds]);

  const sessionContent = useMemo(
    () => getWorkoutSessionLevelContent(difficulty),
    [difficulty]
  );

  const handleToggleTimer = useCallback(async () => {
    if (isUpdatingSession) return;

    if (!hasStarted) {
      if (isPlanSession) {
        setActionError(null);
        setHasStarted(true);
        setIsRunning(true);
        return;
      }
      if (!workoutId) {
        setActionError("This exercise is missing its ID.");
        return;
      }

      setIsStartingWorkout(true);
      setActionError(null);
      try {
        const response = await startMoveExercise(workoutId, {
          difficulty,
          source: "manual",
          metadata: { exercise_id: Number(workoutId) },
        });
        if (!response.success) {
          throw new Error(response.message || "Could not start this workout.");
        }
        if (!response.data?.session_ref) {
          throw new Error("The start response did not include a session reference.");
        }
        setSessionRef(response.data.session_ref);
        setHasStarted(true);
        setIsRunning(true);
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "We couldn’t start this workout. Please try again."
        );
      } finally {
        setIsStartingWorkout(false);
      }
      return;
    }

    if (remainingSeconds === 0) {
      const resetTo =
        mode === "rest"
        ? WORKOUT_SESSION_BREAK_DURATION_SECONDS
          : workoutDurationSeconds;

      setRemainingSeconds(resetTo);
      setIsRunning(true);
      return;
    }

    if (!sessionRef) {
      setActionError("This workout session is missing its reference. Please restart the exercise.");
      return;
    }

    setIsUpdatingSession(true);
    setActionError(null);
    try {
      const response = isRunning
        ? await pauseMoveSession(sessionRef)
        : await resumeMoveSession(sessionRef);
      if (!response.success) {
        throw new Error(response.message || `Could not ${isRunning ? "pause" : "resume"} this workout.`);
      }
      setIsRunning(!isRunning);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : `We couldn’t ${isRunning ? "pause" : "resume"} this workout. Please try again.`
      );
    } finally {
      setIsUpdatingSession(false);
    }
  }, [hasStarted, remainingSeconds, mode, workoutId, difficulty, workoutDurationSeconds, sessionRef, isRunning, isUpdatingSession, isPlanSession]);

  const handleCompleteWorkout = useCallback(async () => {
    if (!sessionRef || !hasStarted || mode !== "workout" || remainingSeconds > 0) {
      return;
    }

    setIsCompletingWorkout(true);
    setActionError(null);
    try {
      if (isPlanSession && exerciseIndex < planExercises.length - 1) {
        setIsRunning(false);
        setIsCompletingWorkout(false);
        router.setParams({ ...planExercises[exerciseIndex + 1], planSessionRef, planId, planExercises: serializedPlanExercises, exerciseIndex: String(exerciseIndex + 1) });
        return;
      }
      const response = await completeMoveSession(sessionRef);
      if (!response.success) {
        throw new Error(response.message || "Could not complete this workout.");
      }

      setIsWorkoutComplete(true);
      setIsRunning(false);
      setIsCelebrationVisible(true);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "We couldn’t complete this workout. Please try again."
      );
    } finally {
      setIsCompletingWorkout(false);
    }
  }, [sessionRef, hasStarted, mode, remainingSeconds, isPlanSession, exerciseIndex, planExercises, planSessionRef, planId, serializedPlanExercises]);

  const navigatePlanExercise = useCallback((nextIndex: number) => {
    const nextExercise = planExercises[nextIndex];
    if (!isPlanSession || !nextExercise || nextIndex === exerciseIndex) return;
    setIsRunning(false);
    router.setParams({ ...nextExercise, planSessionRef, planId, planExercises: serializedPlanExercises, exerciseIndex: String(nextIndex) });
  }, [isPlanSession, planExercises, exerciseIndex, planSessionRef, planId, serializedPlanExercises]);

  const handleToggleBreak = useCallback(async () => {
    if (isUpdatingSession) return;

    if (!isRunning) {
      if (!sessionRef) {
        setActionError("This workout session is missing its reference. Please restart the exercise.");
        return;
      }
      setIsUpdatingSession(true);
      setActionError(null);
      try {
        const response = await resumeMoveSession(sessionRef);
        if (!response.success) {
          throw new Error(response.message || "Could not resume this workout.");
        }
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "We couldn’t resume this workout. Please try again."
        );
        return;
      } finally {
        setIsUpdatingSession(false);
      }
    }

    if (mode === "rest") {
      setMode("workout");
      setRemainingSeconds(workoutDurationSeconds);
      setIsRunning(true);
      setHasStarted(true);
      return;
    }

    setMode("rest");
    setRemainingSeconds(WORKOUT_SESSION_BREAK_DURATION_SECONDS);
    setIsRunning(true);
    setHasStarted(true);
  }, [mode, workoutDurationSeconds, isRunning, isUpdatingSession, sessionRef]);

  const handleOpenGuide = useCallback(() => {
    if (!workout) return;
    setGuideWorkout(workout);
  }, [workout]);

  const handleCloseGuide = useCallback(() => {
    setGuideWorkout(null);
  }, []);

  if (!workout) {
    return (
      <ScreenView bgColor={theme.background} style={styles.screen}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Workout not found.</Text>
          <Text style={styles.emptyText}>
            Go back and choose another workout to continue.
          </Text>
        </View>
      </ScreenView>
    );
  }

  const progressBase =
    mode === "rest"
      ? WORKOUT_SESSION_BREAK_DURATION_SECONDS
      : workoutDurationSeconds;
  const progress =
    progressBase > 0 && hasStarted ? 1 - remainingSeconds / progressBase : 0;

  const statusText =
    !hasStarted
      ? "Start"
      : remainingSeconds === 0
        ? isWorkoutComplete
          ? "Exercise complete"
          : mode === "rest" ? "Break complete" : "Time complete"
        : !isRunning
          ? "Pause"
          : mode === "rest" ? "Break & breathe" : "In progress";

  const canCompleteWorkout =
    hasStarted && mode === "workout" && remainingSeconds === 0;
  const buttonLabel = isWorkoutComplete
    ? "Exercise Complete"
    : canCompleteWorkout
      ? isPlanSession && exerciseIndex < planExercises.length - 1 ? "Next Exercise" : isPlanSession ? "Complete Workout" : "Complete Exercise"
      : !hasStarted
        ? "Begin Flow"
        : remainingSeconds === 0
          ? "Restart Flow"
          : isRunning
            ? "Pause Flow"
            : "Resume Flow";

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title={workout.title}
          subtitle={workout.description || "Move with intention and focus on your form."}
          onBack={() => router.back()}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.difficultyRow}>
            <Text style={styles.difficultyLabel}>CATEGORY</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyValue}>{exerciseCategory}</Text>
            </View>
          </View>

          <ExerciseIntroCard
            imageUri={workout.image}
            reps={workoutReps !== undefined ? workoutReps : sessionContent.reps}
            description={workoutInstructions || workout.description || sessionContent.description}
            title={workout.title}
            showTitle={false}
            onPress={handleOpenGuide}
          />

          {!!tags.length && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>TAGS</Text>
              <View style={styles.tagList}>
                {tags.map((tag, index) => <View key={`${tag}-${index}`} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
              </View>
            </View>
          )}
          {!!benefits.length && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>BENEFITS</Text>
              {benefits.map((benefit, index) => <Text key={`${index}-${benefit}`} style={styles.detailText}>•  {benefit}</Text>)}
            </View>
          )}
          {!!tips.length && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>TIPS</Text>
              {tips.map((tip, index) => <Text key={`${index}-${tip}`} style={styles.detailText}>•  {tip}</Text>)}
            </View>
          )}
          {!!commonMistakes.length && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>COMMON MISTAKES</Text>
              {commonMistakes.map((mistake, index) => <Text key={`${index}-${mistake}`} style={styles.detailText}>•  {mistake}</Text>)}
            </View>
          )}
          {!!breathingPattern && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>BREATHING PATTERN</Text>
              <Text style={styles.detailText}>{breathingPattern}</Text>
            </View>
          )}

          <View style={styles.timerWrap}>
            {isPlanSession ? (
              <View style={styles.planNavRow}>
                <Pressable accessibilityRole="button" accessibilityLabel="Previous exercise" disabled={exerciseIndex === 0} onPress={() => navigatePlanExercise(exerciseIndex - 1)}><Text style={[styles.planNav, exerciseIndex === 0 && styles.planNavDisabled]}>‹ Previous</Text></Pressable>
                <Text style={styles.planProgress}>Exercise {exerciseIndex + 1} of {planExercises.length}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Next exercise" disabled={exerciseIndex === planExercises.length - 1} onPress={() => navigatePlanExercise(exerciseIndex + 1)}><Text style={[styles.planNav, exerciseIndex === planExercises.length - 1 && styles.planNavDisabled]}>Next ›</Text></Pressable>
              </View>
            ) : null}
            <TimerRing
              size={260}
              progress={progress}
              remainingSeconds={remainingSeconds}
              statusText={statusText}
              mode={mode}
            />
          </View>

          {hasStarted && !canCompleteWorkout && !isWorkoutComplete ? (
            <RestInfoRow
              restSeconds={WORKOUT_SESSION_BREAK_DURATION_SECONDS}
              mode={mode}
              remainingSeconds={remainingSeconds}
              onPress={handleToggleBreak}
            />
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <WorkoutPrimaryButton
            label={buttonLabel}
            onPress={canCompleteWorkout ? handleCompleteWorkout : handleToggleTimer}
            isDanger={false}
            isLoading={isStartingWorkout || isUpdatingSession || isCompletingWorkout}
            disabled={isWorkoutComplete}
          />
          {actionError ? (
            <Text accessibilityRole="alert" style={styles.actionError}>
              {actionError}
            </Text>
          ) : null}
          <WorkoutTipBanner text={sessionContent.tip} />
        </View>

        <WorkoutGuideModal
          workout={guideWorkout}
          initialLevel={difficulty}
          onClose={handleCloseGuide}
        />

        <Modal
          visible={isCelebrationVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => router.back()}
        >
          <Animated.View
            style={[styles.celebrationBackdrop, { opacity: celebrationOpacity }]}
          >
            <Animated.View
              style={[
                styles.celebrationCard,
                {
                  opacity: celebrationOpacity,
                  transform: [{ scale: celebrationScale }],
                },
              ]}
            >
              <View style={styles.celebrationSparkles}>
                <Ionicons name="sparkles" size={28} color={theme.accent} />
              </View>
              <View style={styles.celebrationIcon}>
                <Ionicons name="checkmark-done" size={42} color={theme.buttonPrimaryText} />
              </View>
              <Text style={styles.celebrationEyebrow}>SESSION COMPLETE</Text>
              <Text style={styles.celebrationTitle}>You did it.</Text>
              <Text style={styles.celebrationMessage}>
                You showed up for yourself and followed through. That’s a win worth celebrating.
              </Text>
              <WorkoutPrimaryButton
                label="Back to workouts"
                onPress={() => router.back()}
              />
            </Animated.View>
          </Animated.View>
        </Modal>
      </View>
    </ScreenView>
  );
};

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing,

) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    root: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        svaTypography.textStyle.heading2.fontFamily,
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.6,
    },
    headerSubtitle: {
      fontStyle: "italic",
      color: theme.textSecondary,
      opacity: 0.9,
    },
    scrollContent: {
      paddingBottom: spacing.xl * 2,
      gap: spacing.lg,
    },
    difficultyRow: {
      marginTop: spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xs,
    },
    difficultyLabel: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      letterSpacing: 1.1,
    },
    difficultyBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
    },
    difficultyValue: {
      ...svaTypography.textStyle.caption,
      color: theme.buttonPrimary,
      textTransform: "capitalize",
    },
    detailsCard: {
      padding: spacing.md,
      borderRadius: 18,
      backgroundColor: theme.cardRaised,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
      gap: spacing.xs,
    },
    detailsHeading: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      letterSpacing: 1.2,
      marginBottom: spacing.xs,
    },
    detailText: {
      ...svaTypography.textStyle.body,
      color: theme.textPrimary,
      lineHeight: 22,
    },
    tagList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
    tag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
    },
    tagText: { ...svaTypography.textStyle.caption, color: theme.textPrimary },
    timerWrap: {
      alignItems: "center",
      marginTop: spacing.sm,
    },
    footer: {
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    planNavRow: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
    planNav: { color: theme.buttonPrimary, ...svaTypography.textStyle.caption, padding: spacing.xs },
    planNavDisabled: { opacity: 0.35 },
    planProgress: { color: theme.textSecondary, ...svaTypography.textStyle.caption },
    actionError: {
      ...svaTypography.textStyle.body,
      color: theme.error,
      textAlign: "center",
    },
    celebrationBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor: theme.overlayStrong,
    },
    celebrationCard: {
      width: "100%",
      maxWidth: 420,
      alignItems: "center",
      padding: spacing.xl,
      borderRadius: 28,
      backgroundColor: theme.cardRaised,
      borderWidth: 1,
      borderColor: theme.borderMuted,
    },
    celebrationSparkles: {
      position: "absolute",
      top: spacing.md,
      right: spacing.lg,
    },
    celebrationIcon: {
      width: 84,
      height: 84,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
      marginBottom: spacing.lg,
      borderRadius: 42,
      backgroundColor: theme.buttonPrimary,
    },
    celebrationEyebrow: {
      ...svaTypography.textStyle.caption,
      color: theme.accent,
      letterSpacing: 1.6,
      fontWeight: "700",
    },
    celebrationTitle: {
      ...svaTypography.textStyle.authTitle,
      color: theme.textPrimary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
    celebrationMessage: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
      textAlign: "center",
      lineHeight: 23,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      textAlign: "center",
    },
    emptyText: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      marginTop: spacing.sm,
      textAlign: "center",
    },
  });

export default WorkoutSessionScreen;
