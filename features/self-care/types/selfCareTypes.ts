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
  slug: string;
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

export type EnrichedMeditation = Meditations & {
  tag: string;
  isLocked: boolean;
  coachName: string;
  durationLabel: string;
  image: any;
};
