import type { ImageSourcePropType } from "react-native";

import type {
  WellnessContentBenefit,
  WellnessContentBreathworkStep,
  WellnessContentDetailItem,
  WellnessContentItem,
  WellnessContentMetadata,
} from "@/features/self-care/types/wellnessContentTypes";

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

export type BreathTone = "grounding" | "steady" | "release" | "sleep";

export type BreathPattern = {
  id: string;
  tone: BreathTone;
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
  tone: BreathPattern["tone"];
  title: string;
  subtitle: string;
  mantra: string;
  tag: string;
  palette: BreathRecommendationPalette;
  icon: string;
};

export type BreathWorkCategoryOption = {
  label: string;
  value: string;
};

export type BreathWorkDetail = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  context: string;
  steps: string[];
  benefits: WellnessContentBenefit[];
  tips: string[];
  image: ImageSourcePropType;
  tone: BreathPattern["tone"];
  toneLabel: string;
  tag: string;
  mantra: string;
  palette: BreathRecommendationPalette;
  icon: string;
  durationLabel: string;
  category?: string;
  slug?: string;
  rating?: number;
  reviews?: number;
  level?: string;
  dosha?: string;
  tags: string[];
  modality?: string;
  source?: string | null;
  phases: BreathPhase[];
  longDescription?: string;
  guidance?: string;
  date?: string;
  metadata?: WellnessContentMetadata;
  instructor?: WellnessContentDetailItem["instructor"];
  scientificSynthesis?: WellnessContentDetailItem["scientificSynthesis"];
};

export type RouteValue = string | string[] | undefined;

export type BreathWorkRouteParams = {
  breathworkId?: RouteValue;
  breathworkTitle?: RouteValue;
  breathworkDescription?: RouteValue;
  breathworkDurationLabel?: RouteValue;
  breathworkImage?: RouteValue;
  breathworkTags?: RouteValue;
  breathworkCategory?: RouteValue;
  breathworkRating?: RouteValue;
  breathworkReviews?: RouteValue;
  breathworkLevel?: RouteValue;
  breathworkDosha?: RouteValue;
  breathworkTone?: RouteValue;
  breathworkSource?: RouteValue;
};

export type RawBreathWorkTemplate = WellnessContentItem;
export type RawBreathWorkDetailItem = WellnessContentDetailItem;
export type BreathWorkMetadataStep = WellnessContentBreathworkStep;
