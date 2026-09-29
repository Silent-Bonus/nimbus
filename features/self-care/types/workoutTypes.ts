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

export interface MoveExerciseMetadata {
  legacy_category?: string;
  [key: string]: unknown;
}

/** One selectable exercise returned by the move exercise catalog endpoint. */
export interface MoveExercise {
  id: number;
  slug: string;
  title?: string;
  description: string;
  intent: string;
  reps: string;
  duration: string;
  category: string;
  category_display?: string;
  difficulty?: string;
  difficulty_display?: string;
  duration_seconds?: number;
  thumbnail?: string | null;
  focus_instruction?: string;
  instructions?: string;
  tags?: string[];
  benefits?: string[];
  tips?: string[] | string;
  common_mistakes?: string[] | string;
  breathing_pattern?: string;
  is_premium?: boolean;
  sort_order?: number;
  manifest_version?: number;
  frame_count?: number;
  metadata?: MoveExerciseMetadata | null;
}

export interface MoveExerciseListResponse {
  success: boolean;
  message: string;
  data: MoveExercise[];
  pagination: MovePagination;
}

export interface MoveExerciseCategoriesResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface MovePagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results_count: number;
}

export interface MoveExerciseDetailResponse {
  success: boolean;
  message: string;
  data: MoveExercise;
}

export interface StartMoveExerciseRequest {
  difficulty: "easy" | "medium" | "hard";
  source: "manual";
  metadata: Record<string, unknown>;
}

export interface StartMoveExerciseResponse {
  success: boolean;
  message: string;
  data: { session_ref: string };
}

export interface MoveSessionActionResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export type MoveRoutineFrequency = "daily" | "weekly";

export interface CreateMoveRoutineSchedule {
  frequency_type: MoveRoutineFrequency;
  interval: number;
  start_date: string;
  end_date: string | null;
  days_of_week: number[];
  days_of_month: number[];
  reminder_time: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
}

export interface CreateMoveRoutineItem {
  exercise_id: number;
  sequence_order: number;
  transition_seconds: number;
  notes: string;
  is_optional: boolean;
  metadata: Record<string, unknown>;
}

export interface CreateMoveRoutineRequest {
  title: string;
  description: string;
  source: "manual";
  status: "active";
  schedule: CreateMoveRoutineSchedule;
  items: CreateMoveRoutineItem[];
  icon: string;
  color: string;
  metadata: Record<string, unknown>;
}

export interface CreateMoveRoutineResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface MoveRoutineSchedule {
  frequency_type: MoveRoutineFrequency;
  interval: number;
  start_date: string;
  end_date: string | null;
  days_of_week: number[];
  days_of_month: number[];
  reminder_time: string | null;
  start_time?: string | null;
  end_time?: string | null;
  all_day?: boolean;
}

export interface MoveRoutineItem {
  id?: number;
  exercise_id: number;
  difficulty: string;
  sequence_order: number;
  transition_seconds?: number;
  notes?: string;
  is_optional?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MoveRoutine {
  id: number;
  title: string;
  description: string;
  source: string;
  status: string;
  frequency_type: MoveRoutineFrequency;
  interval: number;
  reminder_time: string | null;
  all_day: boolean;
  duration_seconds: number;
  duration: string;
  item_count: number;
  current_streak: number;
  longest_streak: number;
  last_completed: string | null;
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
  // Retain support for endpoints that return the full nested routine shape.
  schedule?: MoveRoutineSchedule;
  items?: MoveRoutineItem[];
}

export interface MovePlanListResponse {
  success: boolean;
  message: string;
  data: MoveRoutine[];
  pagination?: MovePagination;
}

export interface MovePlanExercise {
  id?: number;
  exercise_id?: number;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  duration?: string | number;
  duration_seconds?: number;
  difficulty?: string;
  sequence_order?: number;
  notes?: string;
  is_optional?: boolean;
  exercise?: Partial<MoveExercise>;
}

export interface MovePlanDetail {
  id: number;
  title: string;
  description?: string;
  source?: string;
  status?: string;
  frequency_type?: MoveRoutineFrequency;
  interval?: number;
  days_of_week?: number[];
  reminder_time?: string | null;
  all_day?: boolean;
  duration?: string;
  duration_seconds?: number;
  item_count?: number;
  current_streak?: number;
  longest_streak?: number;
  last_completed?: string | null;
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
  exercises: MovePlanExercise[];
  items?: MovePlanExercise[];
  schedule?: MoveRoutineSchedule & { days_of_week?: number[] };
}

export interface MovePlanDetailResponse {
  success: boolean;
  message: string;
  data: MovePlanDetail;
}

export interface StartMovePlanResponse {
  success: boolean;
  message: string;
  data?: { session_ref?: string };
  session_ref?: string;
}

export interface WorkoutVideoListResponse {
  success: boolean;
  data: WorkoutListItem[];
}
