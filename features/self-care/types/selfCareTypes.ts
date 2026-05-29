// UI Types for Self-Care Module

import { Meditations } from "@/features/tools/types/toolsTypes";

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

export interface WellnessContentItem {
  id: number;
  slug?: string;
  title: string;
  modality: string;
  category: string;
  duration: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  level: string;
  dosha: string;
  description?: string;
}

export interface WellnessContentBreathworkStep {
  name: string;
  color?: string;
  sanskrit?: string;
  frequency?: number;
  hold_seconds?: number;
  exhale_seconds?: number;
  inhale_seconds?: number;
}

export interface WellnessContentMetadata extends Record<string, unknown> {
  steps?: WellnessContentBreathworkStep[];
}

export interface WellnessContentPagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results_count: number;
}

export interface WellnessContentResponse {
  success: boolean;
  message: string;
  data: WellnessContentItem[];
  pagination?: WellnessContentPagination;
}

export interface WellnessContentInstructor {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface WellnessContentBenefit {
  id: number;
  title: string;
  text: string;
}

export interface WellnessContentScientificSynthesis {
  title: string;
  text: string;
  source: string;
}

export interface WellnessContentDetailItem extends WellnessContentItem {
  audio?: string;
  description?: string;
  longDescription?: string;
  guidance?: string;
  date?: string;
  metadata?: WellnessContentMetadata;
  instructor?: WellnessContentInstructor;
  benefits?: WellnessContentBenefit[];
  tips?: string[];
  scientificSynthesis?: WellnessContentScientificSynthesis;
}

export interface WellnessContentDetailResponse {
  success: boolean;
  message: string;
  data: WellnessContentDetailItem;
}

export interface WellnessSessionRequest {
  activity_type: string;
  content_type: string;
  content_object_id: number;
  source: string;
  metadata: Record<string, unknown>;
}

export interface WellnessSessionItem {
  session_ref: string;
  id: number;
  activity_type: string;
  activity_type_display: string;
  content_type: string;
  object_id: number;
  content_label: string;
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

export interface WellnessSessionCreateResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem;
}

export interface WellnessSessionCompleteRequest {
  duration_seconds: number;
}

export interface WellnessSessionCompleteResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem;
}

export type EnrichedMeditation = Meditations & {
  tag: string;
  isLocked: boolean;
  coachName: string;
  durationLabel: string;
  image: any;
};
