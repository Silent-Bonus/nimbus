// UI Types for Self-Care Module

import { Meditations } from "@/features/tools/types/toolsTypes";
import type {
  WellnessContentModality,
  WellnessContentPagination,
} from "@/features/self-care/types/wellnessContentTypes";

export * from "@/features/self-care/types/wellnessContentTypes";

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

export interface MeditationAudioListItem {
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

// Workout UI Types

type ExerciseCategory = "cardio" | "strength" | "stretching" | "full_body";

type DifficultyLevel = "easy" | "medium" | "hard";

export interface Exercise {
  id: string;
  name: string; // "Dumbbell Shoulder Press"
  category: ExerciseCategory; // 'strength'
  difficulty: DifficultyLevel;

  thumbnailUrl: string; // or require('...') for local image

  // primary metrics to display on that row
  durationSeconds: number; // 30
  reps: number; // 3 or 4

  // optional extras if you need later
  equipment?: string[]; // ["dumbbells", "bench"]
  muscles?: string[]; // ["shoulders", "triceps"]
}

export interface ExerciseFilterTab {
  id: ExerciseCategory;
  label: string; // "Strength"
}

export const EXERCISE_FILTER_TABS: ExerciseFilterTab[] = [
  { id: "cardio", label: "Cardio" },
  { id: "strength", label: "Strength" },
  { id: "stretching", label: "Stretching" },
  { id: "full_body", label: "Full Body" },
];

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  {
    label: string;
    color: string; // Nimbus green / yellow / orange
  }
> = {
  easy: { label: "Easy", color: "#4ADE80" },
  medium: { label: "Medium", color: "#FACC15" },
  hard: { label: "Hard", color: "#FB923C" },
};

// Backend Tpypes for Self-Care Module
export interface JournalListItem {
  id: number;
  title: string;
  image: string;
  category: string;
  description: string;
  icon: string;
  prompts: {
    id: number;
    text: string;
  };
}

export interface JournalListResponse {
  data: JournalListItem[];
  message: string;
}

export interface JournalSubmitRequest {
  template_id: number;
  answers: { id: number; answer: string }[];
}

export interface JournalSubmitResponse {
  status: string;
  message: string;
}

export type JournalAnswer = {
  prompt_text: string;
  answer: string;
};

export interface JournalEntryListResponse {
  id: number;
  template_title: string;
  created_at: string; // ISO date string
  answers: JournalAnswer[];
}

export type MentalTestItem = {
  id: string;
  title: string;
  image: string;
};

export interface MentalTestListResponse {
  data: MentalTestItem[];
  success: boolean;
}

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

export interface MeditationListItem {
  id: number;
  title: string;
  image: string;
  coach_name: string;
  category: string;
  duration: number;
  description: string;
  source: string;
}

export interface MeditationVideoListResponse {
  data: MeditationListItem[];
  success: boolean;
}

export type WellnessSessionActivityType = WellnessContentModality;

export type WellnessSessionSource =
  | "manual"
  | "recommendation"
  | "notification";

export type WellnessMoodLabel =
  | "calm"
  | "happy"
  | "anxious"
  | "tired"
  | "motivated"
  | "sad"
  | "neutral"
  | "stressed";

export type WellnessScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type WellnessSessionFeedbackSource =
  | "choice"
  | "manual"
  | "reminder"
  | "post_session"
  | "widget";

export type WellnessSessionContentType =
  | "recipe"
  | "workout"
  | "wellness_content"
  | "wellness_content.wellnesscontent";

export interface WellnessSessionMetadata extends Record<string, unknown> {
  entry_surface: string;
  test_mode?: boolean;
}

export interface WellnessSessionRequest {
  activity_type: WellnessSessionActivityType;
  content_type: WellnessSessionContentType;
  content_object_id: number;
  content_object_type_id?: number;
  source: WellnessSessionSource;
  metadata: WellnessSessionMetadata;
}

export interface WellnessSessionFeedbackRequest {
  mood_label_before: WellnessMoodLabel;
  mood_label_after: WellnessMoodLabel;
  mood_score_before: WellnessScore;
  mood_score_after: WellnessScore;
  calmness_before: WellnessScore;
  calmness_after: WellnessScore;
  stress_before: WellnessScore;
  stress_after: WellnessScore;
  relaxment_before: WellnessScore;
  relaxment_after: WellnessScore;
  energy_before: WellnessScore;
  energy_after: WellnessScore;
  felt_better: boolean;
  notes: string;
  source: WellnessSessionFeedbackSource;
}

export interface WellnessMoodLogRequest {
  mood_label: string;
  mood_score: number;
  calmness_score?: number;
  stress_score?: number;
  relaxment_score?: number;
  energy_score?: number;
  notes?: string;
  source?: string;
}

export interface WellnessSessionItem {
  session_ref: string;
  id: number;
  activity_type: string;
  activity_type_display: string;
  content_type?: string | null;
  object_id?: number | null;
  content_label?: string | null;
  source: string;
  source_display: string;
  status: string;
  status_display: string;
  started_at: string;
  paused_at: string | null;
  resumed_at: string | null;
  completed_at: string | null;
  duration_seconds: number;
  metadata: Record<string, unknown>;
  has_feedback: boolean;
  created_at: string;
  updated_at: string;
}

export interface WellnessSessionListResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem[];
  pagination?: WellnessContentPagination;
}

export interface WellnessSessionCreateResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem;
}

export type WellnessSessionDetailResponse = WellnessSessionCreateResponse;
export type WellnessSessionPauseResumeResponse = WellnessSessionCreateResponse;
export type WellnessSessionFeedbackResponse = WellnessSessionCreateResponse;

export interface WellnessSessionCompleteRequest {
  duration_seconds: number;
}

export interface WellnessSessionCompleteResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem;
}

export interface WellnessMoodLogItem {
  id: number;
  mood_label: string;
  mood_score: number;
  calmness_score?: number | null;
  stress_score?: number | null;
  relaxment_score?: number | null;
  energy_score?: number | null;
  notes?: string | null;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WellnessMoodLogResponse {
  success: boolean;
  message: string;
  data: WellnessMoodLogItem;
}

export interface WellnessMoodLogStatsResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export interface WellnessSummaryResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export type EnrichedMeditation = Meditations & {
  tag: string;
  isLocked: boolean;
  coachName: string;
  durationLabel: string;
  image: any;
};
