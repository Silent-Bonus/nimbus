import type { ImageSourcePropType } from "react-native";
import type { Meditations } from "@/features/tools/types/toolsTypes";

// Backend API types
// These types model the wellness content payloads returned by the service layer.

export type WellnessContentModality =
  | "meditation"
  | "breathwork"
  | "soundscape";

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

export interface WellnessContentItem {
  id: number;
  slug: string;
  title: string;
  modality: string;
  category: string;
  duration: number | string;
  image: string | null;
  metadata?: WellnessContentMetadata | null;
  rating: number;
  reviews: number;
  tags: string[];
  level: string;
  dosha: string;
  description?: string;
  date?: string;
  source?: string | null;
  isLocked?: boolean;
  is_locked?: boolean;
}

export interface WellnessContentResponse {
  success: boolean;
  message: string;
  data: WellnessContentItem[];
  pagination?: WellnessContentPagination;
}

export interface WellnessContentDetailItem extends WellnessContentItem {
  tips?: string[];
  instructor?: WellnessContentInstructor;
  benefits?: WellnessContentBenefit[];
  source?: string | null;
  longDescription?: string;
  guidance?: string;
  audio?: string;
  scientificSynthesis?: WellnessContentScientificSynthesis;
}

export interface WellnessContentDetailResponse {
  success: boolean;
  message: string;
  data: WellnessContentDetailItem;
}

// UI view-model types
// These types represent frontend-shaped data used by meditation screens and cards.

export type MeditationListItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  durationLabel: string;
  image: string | ImageSourcePropType;
  source?: string | null;
  isLocked: boolean;
  category?: string;
  slug?: string;
  rating?: number;
  reviews?: number;
  level?: string;
  dosha?: string;
  modality?: string;
};

export type MeditationItemDetail = MeditationListItem & {
  longDescription?: string;
  guidance?: string;
  date?: string;
  instructor?: WellnessContentInstructor;
  benefits?: WellnessContentBenefit[];
  scientificSynthesis?: WellnessContentScientificSynthesis;
};

export type MeditationTemplateCardItem = Pick<
  MeditationListItem,
  "id" | "title" | "description" | "tags" | "durationLabel" | "isLocked"
> & {
  image: ImageSourcePropType;
  rating?: number;
};

export type WellnessCategoryOption = {
  label: string;
  value: string;
};

// UI view-model types
// These types represent frontend-shaped data used by breathwork screens.

export type BreathworkStyle = "grounding" | "steady" | "release" | "sleep";

export type BreathPhase = {
  label: string;
  seconds: number;
  color?: string;
  sanskrit?: string;
  frequency?: number;
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
};

export type BreathPattern = {
  id: string;
  style: BreathworkStyle;
  title: string;
  description: string;
  benefit: string;
  phases: BreathPhase[];
};

export type BreathMotionVariant = "box" | "orb";

export type BreathRecommendationPalette = {
  colors: [string, string];
  accent: string;
  accentSoft: string;
  text: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
};

export type BreathRecommendation = {
  id: string;
  style: BreathPattern["style"];
  title: string;
  subtitle: string;
  tag: string;
  palette: BreathRecommendationPalette;
  icon: string;
};

export type BreathWorkListItem = {
  id: string;
  title: string;
  slug?: string;
  modality?: string;
  category: string;
  durationLabel: string;
  image: string | ImageSourcePropType;
  description: string;
  style: BreathPattern["style"];
  styleLabel: string;
  palette: BreathRecommendationPalette;
  rating?: number;
  reviews?: number;
  level?: string;
  dosha?: string;
  tags: string[];
};

export type BreathWorkDetail = BreathWorkListItem & {
  steps: string[];
  benefits: WellnessContentBenefit[];
  tips: string[];
  phases: BreathPhase[];
  source?: string | null;
  longDescription?: string;
  guidance?: string;
  date?: string;
  metadata?: WellnessContentMetadata;
  instructor?: WellnessContentInstructor;
  scientificSynthesis?: WellnessContentScientificSynthesis;
};

// Legacy featured-rail meditation type.
export type EnrichedMeditation = Meditations & {
  tag: string;
  isLocked: boolean;
  coachName: string;
  durationLabel: string;
  image: string | ImageSourcePropType;
};
