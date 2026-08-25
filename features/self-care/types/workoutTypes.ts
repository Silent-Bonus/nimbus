// Workout and legacy movement/media list API types.

export interface WorkoutVideoListItem {
  id: number;
  title: string;
  image: {
    uri: string;
  };
  coachName: string;
  category: string;
  duration: number;
  description: string;
  source: string;
}

export type ExerciseCategory =
  | "cardio"
  | "strength"
  | "stretching"
  | "full_body";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  difficulty: DifficultyLevel;
  thumbnailUrl: string;
  durationSeconds: number;
  reps: number;
  equipment?: string[];
  muscles?: string[];
}

export interface ExerciseFilterTab {
  id: ExerciseCategory;
  label: string;
}

export const EXERCISE_FILTER_TABS: ExerciseFilterTab[] = [
  { id: "cardio", label: "Cardio" },
  { id: "strength", label: "Strength" },
  { id: "stretching", label: "Stretching" },
  { id: "full_body", label: "Full Body" },
];

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string }
> = {
  easy: { label: "Easy", color: "#4ADE80" },
  medium: { label: "Medium", color: "#FACC15" },
  hard: { label: "Hard", color: "#FB923C" },
};

export interface WorkoutListItem {
  id: number;
  title: string;
  image: string;
  coach_name: string;
  category: string;
  duration: number;
  description: string;
  source: string;
}

export interface WorkoutVideoListResponse {
  success: boolean;
  data: WorkoutListItem[];
}
