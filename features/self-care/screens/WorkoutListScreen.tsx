import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import PillFilters, { type PillFilterOption } from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import WorkoutCard from "@/features/self-care/components/workout/WorkoutCard";
import {
  getMoveExerciseCategories,
  getMoveExerciseDetails,
  getMoveExercises,
} from "@/features/self-care/services/selfCareService";
import {
  getMoveExerciseDurationSeconds,
  getMoveExerciseTitle,
  mapMoveExercisesToCardModels,
  type WorkoutCardModel,
} from "@/features/self-care/utils/workoutLibrary";
import type {
  ColorSet,
  Spacing,
} from "@/theme/types";

export const WorkoutListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutCardModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openingWorkoutId, setOpeningWorkoutId] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadWorkouts = useCallback(async (category = "All") => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await getMoveExercises({
        ...(category !== "All" ? { category } : {}),
        difficulty: "easy",
      });
      if (!response.success) throw new Error(response.message || "Could not load exercises.");
      setWorkouts(mapMoveExercisesToCardModels(response));
    } catch (error) {
      setWorkouts([]);
      setLoadError(
        typeof error === "string"
          ? error
          : "We couldn’t load workouts right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkouts("All");
  }, [loadWorkouts]);

  useEffect(() => {
    let isCurrent = true;
    void getMoveExerciseCategories().then((response) => {
      if (isCurrent && response.success) {
        setCategories(response.data.filter((category) => typeof category === "string" && !!category.trim()));
      }
    }).catch(() => {
      if (isCurrent) setCategories([]);
    });
    return () => { isCurrent = false; };
  }, []);

  const filterOptions = useMemo<PillFilterOption<string>[]>(() => [
    { label: "All", value: "All" },
    ...categories.map((category) => ({ label: category, value: category })),
  ], [categories]);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    void loadWorkouts(category);
  }, [loadWorkouts]);

  const handleOpenWorkout = useCallback(
    async (workout: WorkoutCardModel) => {
      if (openingWorkoutId) return;
      setOpeningWorkoutId(workout.id);
      setDetailError(null);

      try {
        const response = await getMoveExerciseDetails(workout.id);
        if (!response.success || !response.data) {
          throw new Error(response.message || "Could not load this workout.");
        }

        const detail = response.data;
        router.push({
          pathname: ROUTES.AUTH.SELF_CARE_WORKOUT_SESSION,
          params: {
            id: String(detail.id),
            title: getMoveExerciseTitle(detail),
            subtitle: workout.subtitle,
            description: detail.description,
            instructions: detail.instructions || detail.focus_instruction || detail.description,
            reps: detail.reps,
            category: detail.category,
            tags: JSON.stringify(detail.tags ?? detail.metadata?.tags ?? []),
            benefits: JSON.stringify(detail.benefits ?? detail.metadata?.benefits ?? []),
            tips: JSON.stringify(detail.tips ?? detail.metadata?.tips ?? []),
            commonMistakes: JSON.stringify(detail.common_mistakes ?? detail.metadata?.common_mistakes ?? []),
            breathingPattern: String(detail.breathing_pattern ?? detail.metadata?.breathing_pattern ?? ""),
            image: detail.thumbnail ?? "",
            difficulty: workout.difficulty ?? "easy",
            durationSeconds: String(getMoveExerciseDurationSeconds(detail)),
          },
        });
      } catch (error) {
        setDetailError(
          error instanceof Error
            ? error.message
            : "We couldn’t load this workout. Please try again."
        );
      } finally {
        setOpeningWorkoutId(null);
      }
    },
    [openingWorkoutId]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Workouts"
          subtitle="Find your rhythm in the silence. Move with intention, breathe with grace."
          onBack={handleBack}
          rightActions={[
            {
              icon: "list-outline",
              accessibilityLabel: "View workout routines",
              onPress: () => router.push(ROUTES.AUTH.SELF_CARE_WORKOUT_ROUTINES),
            },
          ]}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          containerStyle={styles.header}
        />

        <FlatList
          testID="workout-library-list"
          data={workouts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.filterBlock}>
              <Text style={styles.filterHeading}>Explore by focus</Text>
              {detailError ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {detailError}
                </Text>
              ) : null}
              <PillFilters
                testID="workout-filters"
                options={filterOptions}
                selectedValue={selectedCategory}
                onChange={handleSelectCategory}
                uppercase={false}
                scrollable
                contentContainerStyle={styles.filterRow}
                selectedPillStyle={styles.filterPillActive}
                inactivePillStyle={styles.filterPillInactive}
                selectedLabelStyle={styles.filterTextActive}
                inactiveLabelStyle={styles.filterTextInactive}
              />
            </View>
          }
          renderItem={({ item }) => (
            <WorkoutCard
              item={item}
              onPress={() => void handleOpenWorkout(item)}
              isLoading={openingWorkoutId === item.id}
              disabled={openingWorkoutId !== null && openingWorkoutId !== item.id}
            />
          )}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={theme.buttonPrimary} />
                <Text style={styles.emptyText}>Loading workouts…</Text>
              </View>
            ) : loadError ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={40}
                  color={theme.textSecondary}
                />
                <Text style={styles.emptyTitle}>Workouts are unavailable.</Text>
                <Text style={styles.emptyText}>{loadError}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadWorkouts()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="fitness-outline"
                  size={40}
                  color={theme.textSecondary}
                />
                <Text style={styles.emptyTitle}>No workouts in this mode.</Text>
                <Text style={styles.emptyText}>
                  Try another filter to surface a different pace.
                </Text>
              </View>
            )
          }
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
    filterBlock: {
      marginBottom: spacing.lg,
    },
    filterHeading: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      fontSize: 12,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      marginBottom: spacing.xs,
    },
    filterRow: {
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    filterPillInactive: {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    filterPillActive: {
      backgroundColor: theme.buttonPrimary,
      borderColor: theme.buttonPrimary,
    },
    filterTextInactive: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 12,
      letterSpacing: 0.8,
      color: theme.textSecondary,
    },
    filterTextActive: {
      color: theme.buttonPrimaryText,
    },
    listContent: {
      paddingBottom: spacing.xl * 3,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: spacing.xl * 2,
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      marginTop: spacing.md,
      textAlign: "center",
    },
    emptyText: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
    retryButton: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 14,
      backgroundColor: theme.buttonPrimary,
    },
    retryButtonText: {
      ...svaTypography.textStyle.button,
      color: theme.buttonPrimaryText,
    },
    errorText: {
      ...svaTypography.textStyle.body,
      color: theme.error ?? theme.textSecondary,
      marginBottom: spacing.sm,
    },
  });

export default WorkoutListScreen;
