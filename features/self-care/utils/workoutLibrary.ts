import type { ImageSourcePropType } from "react-native";

import type { PillFilterOption } from "@/components/ui/PillFilters";
import type { WorkoutListItem } from "@/features/self-care/types/workoutTypes";

export type WorkoutCategory = "cardio" | "strength" | "yoga" | "full_body";

export type WorkoutFilterCategory = "all" | WorkoutCategory;

export interface WorkoutCardModel {
  id: string;
  title: string;
  subtitle: string;
  category: WorkoutCategory;
  image: string | ImageSourcePropType;
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

  if (
    value === "cardio" ||
    value === "strength" ||
    value === "yoga" ||
    value === "full_body"
  ) {
    return value;
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

export const filterWorkoutCards = (
  workouts: readonly WorkoutCardModel[],
  selectedCategory: WorkoutFilterCategory
) => {
  if (selectedCategory === "all") {
    return workouts;
  }

  return workouts.filter((workout) => workout.category === selectedCategory);
};
