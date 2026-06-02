// UI data Type

export interface SoundscapeTrackListItem {
  id: number;
  title: string;
  image: { uri: string };
  category: string;
  duration: number | string;
  description: string;
  source: string;
}

// Backend Data Type

// TODO add types

// TODO ADD PROPER TYPE
export interface ArticleListItem {
  id: number;
  title: string;
  image: string;
}

export type ArticleData = ArticleListItem;

export interface ArticleListResponse {
  data: ArticleListItem[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface NewsletterItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  published_at: string;
  content?: string;
}

export interface NewsletterListResponse {
  data: NewsletterItem[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface NewsletterReflectionPrompt {
  eyebrow?: string;
  title?: string;
  prompt?: string;
  helper?: string;
  actionLabel?: string;
  action_label?: string;
}

export interface NewsletterDetailItem extends NewsletterItem {
  content: string;
  reflection_prompt?: string | NewsletterReflectionPrompt;
  reflectionPrompt?: string | NewsletterReflectionPrompt;
  call_to_action?: string;
  callToAction?: string;
}

export interface NewsletterDetailResponse {
  success: boolean;
  message: string;
  data: NewsletterDetailItem;
  error_code?: string;
}

export interface SoundscapeListResponse {
  data: ArticleDetails[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface ShortVideoItem {
  id: number;
  title: string;
  image: string;
}

export interface ShortVideoListResponse {
  data: ArticleDetails[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface AudioBookItem {
  id: number;
  title: string;
  image: string;
}

export interface AudioBookListResponse {
  data: ArticleDetails[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface RecipeCategory {
  id: number;
  name: string;
  slug: string;
  parent: RecipeCategory | null;
  sort_order: number;
}

export interface RecipeStep {
  step: number;
  title: string;
  description: string;
}

export interface RecipeItem {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  meal_slot: string;
  category: RecipeCategory | null;
  difficulty_level: string;
  total_time_minutes: number;
  avg_rating: string;
  reviews_count: number;
  favorites_count: number;
  is_favorited: boolean;
  image: string | null;
  [key: string]: any;
}

export interface RecipeListResponse {
  data: RecipeItem[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface RecipeCategoryListResponse {
  data: RecipeCategory[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface RecipeDetailItem extends RecipeItem {
  context: string;
  pro_tip: string;
  fast_track: string;
  bio_hacker: string;
  prep_time_minutes: number;
  active_time_minutes: number;
  total_time_minutes: number;
  ingredients_json: string[];
  steps_json: RecipeStep[];
  nutrition_json: unknown[];
  benefits_json: unknown[];
  tags_json: unknown[];
  views_count: number;
}

export interface RecipeDetailResponse {
  success: boolean;
  message: string;
  data: RecipeDetailItem;
  error_code?: string;
}

export interface RecipeFavoriteResponse {
  success: boolean;
  message: string;
  data?: RecipeDetailItem | null;
  error_code?: string;
}

export interface RecipeReviewPayload {
  rating: number;
  review_text: string;
  clarity_score: number;
  energy_score: number;
  satiety_score: number;
  digestibility_score: number;
  would_repeat: boolean;
  made_as_is: boolean;
}

export interface RecipeReviewResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error_code?: string;
}

export interface calorieCalculatorRequest {
  weight: string;
  height: string;
  age: string;
  gender: string;
  activityLevel: string;
}

export interface calorieCalculatorResponse {
  basalMetabolicRate: number;
  maintenanceCalories: number;
  goals: {
    mildWeightLoss: {
      calories: number;
    };
    weightLoss: {
      calories: number;
    };
    mildWeightGain: {
      calories: number;
    };
    weightGain: {
      calories: number;
    };
  };
}

export interface proteinIntakeCalculatorRequest {
  weight: string;
  // gender: string;
  activityLevel: string;
}

export interface proteinIntakeCalculatorResponse {
  activityLevel: string;
  recommendedIntake: {
    grams: number;
  };
  generalRange: {
    minimumGrams: number;
    highActivityGrams: number;
  };
}

export interface bodyShapeCalculatorRequest {
  bust: string;
  waist: string;
  highHip: string;
  lowHip: string;
}

export interface bodyShapeCalculatorResponse {
  shape: string;
  measurements: {
    bust: number;
    waist: number;
    hips: number;
  };
}

export type Meditations = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  image: any; // Replace with actual image
  source: any; // Replace with actual audio
  category: string;
  isLocked: boolean;
};

type ArticleDetails = {
  id: number | string;
  title: string;
  image?: string;
  imageUri?: string | null;
  meta_info?: {
    points: number;
    time: string;
  };
  author_info?: any;
  section_data?: {
    title: string;
    content: string;
  }[];
  instructions?: { step: string; instruction: string }[];
  nutrition?: any;
  action_button?: string | null;
  routine_items?: any[];
  web_url?: string | null;
  source?: string | null;
  [key: string]: any;
};
