import type { ImageSourcePropType } from "react-native";

import type { PillFilterOption } from "@/components/ui/PillFilters";
import type {
  MoveExercise,
  MoveExerciseListResponse,
  WorkoutListItem,
} from "@/features/self-care/types/workoutTypes";

export type WorkoutCategory = "cardio" | "strength" | "yoga" | "full_body";

export type WorkoutFilterCategory = "all" | WorkoutCategory;

export interface WorkoutCardModel {
  id: string;
  title: string;
  subtitle: string;
  category: WorkoutCategory;
  image: string | ImageSourcePropType;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
}

const WORKOUT_CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  cardio: "ENDURANCE",
  strength: "ADVANCED",
  yoga: "INTRODUCTORY",
  full_body: "BALANCED",
};

export const WORKOUT_FILTER_OPTIONS: readonly PillFilterOption<WorkoutFilterCategory>[] =
  [
    { label: "All", value: "all" },
    { label: "Cardio", value: "cardio" },
    { label: "Strength", value: "strength" },
    { label: "Yoga", value: "yoga" },
  ] as const;

export const mockWorkoutRecommendations: readonly WorkoutCardModel[] = [
  {
    id: "1",
    title: "Alignment Flow",
    subtitle: "15 MIN · INTRODUCTORY",
    category: "yoga",
    image:
      "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
  },
  {
    id: "2",
    title: "Bodyweight Blitz",
    subtitle: "25 MIN · INTERMEDIATE",
    category: "cardio",
    image:
      "https://images.pexels.com/photos/6551424/pexels-photo-6551424.jpeg",
  },
  {
    id: "3",
    title: "Iron Core Strength",
    subtitle: "20 MIN · ADVANCED",
    category: "strength",
    image:
      "https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg",
  },
  {
    id: "4",
    title: "Heart Rate Hero",
    subtitle: "35 MIN · ENDURANCE",
    category: "cardio",
    image:
      "https://images.pexels.com/photos/1506091/pexels-photo-1506091.jpeg",
  },
] as const;

export const normalizeWorkoutCategory = (category: string): WorkoutCategory => {
  const value = category.trim().toLowerCase().replace(/-/g, "_");

  if (value.includes("cardio") || value.includes("aerobic") || value.includes("hiit")) {
    return "cardio";
  }
  if (value.includes("strength") || value.includes("resistance")) return "strength";
  if (
    value.includes("yoga") ||
    value.includes("stretch") ||
    value.includes("mobility") ||
    value.includes("flexibility")
  ) {
    return "yoga";
  }

  return "full_body";
};

export const formatWorkoutCategoryLabel = (category: WorkoutCategory) =>
  WORKOUT_CATEGORY_LABELS[category];

export const mapWorkoutListItemToCardModel = (
  item: WorkoutListItem
): WorkoutCardModel => {
  const category = normalizeWorkoutCategory(item.category);

  return {
    id: String(item.id),
    title: item.title,
    subtitle: `${Math.max(1, Math.round(item.duration || 0))} MIN · ${formatWorkoutCategoryLabel(category)}`,
    category,
    image: item.image,
  };
};

const getExerciseRows = (
  response: MoveExerciseListResponse | null | undefined
): MoveExercise[] => {
  return response?.data ?? [];
};

export const formatMoveExerciseTitle = (title: string) => {
  if (!title.includes("_") && !title.includes("-")) return title;
  return title
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getMoveExerciseTitle = (exercise: Pick<MoveExercise, "slug" | "title">) => {
  const title = exercise.title || exercise.slug.replace(/-(medium|hard)$/i, "");
  return formatMoveExerciseTitle(title);
};

export const getMoveExerciseDifficulty = (
  exercise: Pick<MoveExercise, "slug" | "difficulty">
): "easy" | "medium" | "hard" => {
  const difficulty = exercise.difficulty?.toLowerCase() || exercise.slug.match(/-(medium|hard)$/i)?.[1]?.toLowerCase();
  return difficulty === "medium" || difficulty === "hard" ? difficulty : "easy";
};

export const getMoveExerciseDurationSeconds = (
  exercise: Pick<MoveExercise, "duration" | "duration_seconds">
) => {
  if (typeof exercise.duration_seconds === "number" && exercise.duration_seconds > 0) {
    return Math.round(exercise.duration_seconds);
  }
  const match = exercise.duration?.trim().match(/^(\d+(?:\.\d+)?)\s*(s|sec|seconds|min|m|minutes)?$/i);
  if (!match) return 0;
  const value = Number(match[1]);
  return /^(min|m|minutes)$/i.test(match[2] ?? "s")
    ? Math.round(value * 60)
    : Math.round(value);
};

export const mapMoveExercisesToCardModels = (
  response: MoveExerciseListResponse | null | undefined
): WorkoutCardModel[] =>
  getExerciseRows(response).map((exercise, index) => {
    const category = normalizeWorkoutCategory(exercise.intent || exercise.category || "full_body");
    const fallbackImage =
      mockWorkoutRecommendations[index % mockWorkoutRecommendations.length].image;
    const image = exercise.thumbnail || fallbackImage;
    const difficulty = getMoveExerciseDifficulty(exercise);
    const detail = exercise.duration || "Duration unavailable";

    return {
      id: String(exercise.id),
      title: getMoveExerciseTitle(exercise),
      subtitle: `${detail} · ${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`,
      category,
      image,
      description: exercise.description,
      difficulty,
    };
  });

export const filterWorkoutCards = (
  workouts: readonly WorkoutCardModel[],
  selectedCategory: WorkoutFilterCategory
) => {
  if (selectedCategory === "all") {
    return workouts;
  }

  return workouts.filter((workout) => workout.category === selectedCategory);
};
