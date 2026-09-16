import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import ExerciseIntroCard from "@/features/self-care/components/workout/ExerciseIntroCard";
import DifficultyTabs from "@/features/self-care/components/workout/DifficultyTabs";
import RestInfoRow, {
  type TimerMode,
} from "@/features/self-care/components/workout/RestInfoRow";
import TimerRing from "@/features/self-care/components/workout/TimerRing";
import WorkoutGuideModal from "@/features/self-care/components/workout/WorkoutGuideModal";
import WorkoutPrimaryButton from "@/features/self-care/components/workout/WorkoutPrimaryButton";
import WorkoutTipBanner from "@/features/self-care/components/workout/WorkoutTipBanner";
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
  TypographyTokens,
} from "@/theme/types";

type WorkoutSessionParams = {
  id?: string | string[];
  title?: string | string[];
  subtitle?: string | string[];
};

const FALLBACK_WORKOUT = mockWorkoutRecommendations[0];

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const buildWorkoutFallback = (
  id: string | undefined,
  title: string | undefined,
  subtitle: string | undefined
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
    image: base.image,
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
  const workoutTitle = readParam(params.title);
  const workoutSubtitle = readParam(params.subtitle);

  const workout = useMemo<WorkoutCardModel | null>(() => {
    const found = workoutId
      ? mockWorkoutRecommendations.find((item) => item.id === workoutId)
      : undefined;

    if (found) {
      return found;
    }

    return buildWorkoutFallback(workoutId, workoutTitle, workoutSubtitle);
  }, [workoutId, workoutTitle, workoutSubtitle]);

  const [difficulty, setDifficulty] = useState<WorkoutGuideLevel>("easy");
  const [mode, setMode] = useState<TimerMode>("workout");
  const [remainingSeconds, setRemainingSeconds] = useState(
    WORKOUT_SESSION_WORK_DURATION_SECONDS
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [guideWorkout, setGuideWorkout] = useState<WorkoutCardModel | null>(
    null
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    setMode("workout");
    setRemainingSeconds(WORKOUT_SESSION_WORK_DURATION_SECONDS);
    setIsRunning(false);
    setHasStarted(false);
  }, [workout?.id, difficulty]);

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

  const handleDifficultyChange = useCallback((next: WorkoutGuideLevel) => {
    setDifficulty(next);
  }, []);

  const handleToggleTimer = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      setIsRunning(true);
      return;
    }

    if (remainingSeconds === 0) {
      const resetTo =
        mode === "rest"
          ? WORKOUT_SESSION_BREAK_DURATION_SECONDS
          : WORKOUT_SESSION_WORK_DURATION_SECONDS;

      setRemainingSeconds(resetTo);
      setIsRunning(true);
      return;
    }

    setIsRunning((current) => !current);
  }, [hasStarted, remainingSeconds, mode]);

  const handleToggleBreak = useCallback(() => {
    if (mode === "rest") {
      setMode("workout");
      setRemainingSeconds(WORKOUT_SESSION_WORK_DURATION_SECONDS);
      setIsRunning(true);
      setHasStarted(true);
      return;
    }

    setMode("rest");
    setRemainingSeconds(WORKOUT_SESSION_BREAK_DURATION_SECONDS);
    setIsRunning(true);
    setHasStarted(true);
  }, [mode]);

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
      : WORKOUT_SESSION_WORK_DURATION_SECONDS;
  const progress =
    progressBase > 0 && hasStarted ? 1 - remainingSeconds / progressBase : 0;

  const statusText =
    mode === "rest"
      ? remainingSeconds === 0
        ? "Break complete"
        : "Break & breathe"
      : remainingSeconds === 0
      ? "Ready to restart"
      : isRunning
      ? "In progress"
      : "Paused";

  const buttonLabel = !hasStarted
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
          subtitle="Choose a rhythm, open the guide, and move with precision."
          onBack={() => router.back()}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <DifficultyTabs
            activeKey={difficulty}
            onChange={handleDifficultyChange}
            style={styles.difficultyTabs}
          />

          <ExerciseIntroCard
            imageUri={workout.image}
            reps={sessionContent.reps}
            description={sessionContent.description}
            title={workout.title}
            subtitle={workout.subtitle}
            onPress={handleOpenGuide}
          />

          <View style={styles.timerWrap}>
            <TimerRing
              size={260}
              progress={progress}
              remainingSeconds={remainingSeconds}
              statusText={statusText}
              mode={mode}
            />
          </View>

          <RestInfoRow
            restSeconds={WORKOUT_SESSION_BREAK_DURATION_SECONDS}
            mode={mode}
            remainingSeconds={remainingSeconds}
            onPress={handleToggleBreak}
          />
        </ScrollView>

        <View style={styles.footer}>
          <WorkoutPrimaryButton
            label={buttonLabel}
            onPress={handleToggleTimer}
            isDanger={false}
          />
          <WorkoutTipBanner text={sessionContent.tip} />
        </View>

        <WorkoutGuideModal
          workout={guideWorkout}
          initialLevel={difficulty}
          onClose={handleCloseGuide}
        />
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
    difficultyTabs: {
      marginTop: spacing.xs,
    },
    timerWrap: {
      alignItems: "center",
      marginTop: spacing.sm,
    },
    footer: {
      gap: spacing.md,
      paddingBottom: spacing.md,
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
