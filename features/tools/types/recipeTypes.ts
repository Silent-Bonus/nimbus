import type { ImageSourcePropType } from "react-native";

import type { ProtocolTemplateCardItem } from "@/components/common/ProtocolTemplateCard";

export interface RecipeCategory {
  id: number;
  name: string;
  slug: string;
  parent: RecipeCategory | null;
  sort_order: number;
  recipe_count?: number;
}

export interface RecipePagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results_count: number;
}

export interface RecipeStep {
  step: number;
  title: string;
  description: string;
}

export interface RecipeNutritionEntry {
  label: string;
  value: string;
}

export type RecipeNutrition = {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

export type RecipeTip = {
  key: string;
  title: string;
  description: string;
  icon: string;
};

export type RecipeFilterKey =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Beverages"
  | "Snacks"
  | "Soup"
  | "Dessert"
  | "Sauce"
  | "NonVeg";

export type RecipeDetail = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  mealSlot?: string;
  filterKey: RecipeFilterKey;
  image: ImageSourcePropType;
  imageFit?: "cover" | "contain";
  prepTime: string;
  prepTimeMinutes?: number;
  activeTimeMinutes?: number;
  totalTimeMinutes?: number;
  calories: number;
  favorite: boolean;
  avgRating?: string;
  reviewsCount?: number;
  favoritesCount?: number;
  viewsCount?: number;
  nutrition: RecipeNutrition;
  description: string;
  ingredients: string[];
  process: string[];
  tips: RecipeTip[];
  wisdomTitle: string;
  wisdom: string;
  ctaLabel: string;
  context?: string;
  proTip?: string;
  fastTrack?: string;
  bioHacker?: string;
  ingredientsJson?: string[];
  stepsJson?: RecipeStep[];
  tagsJson?: string[];
};

export type RecipeCardItem = ProtocolTemplateCardItem & {
  id: string;
  favorite: boolean;
  raw: Record<string, any>;
};

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

export interface RecipePreviewData {
  id: number | string;
  slug: string | null;
  title: string;
  short_description: string | null;
  meal_slot: string | null;
  category: RecipeCategory | null;
  difficulty_level: string;
  total_time_minutes: number;
  avg_rating: string;
  reviews_count: number;
  favorites_count: number;
  is_favorited: boolean;
  image: string | null;
  context?: string;
  pro_tip?: string;
  fast_track?: string;
  bio_hacker?: string;
  prep_time_minutes?: number;
  active_time_minutes?: number;
  ingredients_json?: string[];
  steps_json?: RecipeStep[];
  nutrition_json?: RecipeNutritionEntry[] | Record<string, string | number>;
  benefits_json?: string[];
  tags_json?: string[];
  description?: string | null;
  name?: string;
  imageUri?: string | null;
  imageFit?: "cover" | "contain";
  prep_time?: string | null;
  prepTime?: string | null;
  calories?: number | string | null;
  favorite?: boolean;
  is_favorite?: boolean;
  views_count?: number;
  ctaLabel?: string;
  action_button?: string | null;
}

// API Response
export type RecipeDetailRouteParams = {
  id?: string | string[];
  slug?: string | string[];
  recipeData?: string | string[];
};

// API REQUEST RESPONSE TYPE
export interface RecipeListResponse {
  data: RecipeItem[];
  success: boolean;
  message: string;
  pagination?: RecipePagination;
}

export interface RecipeCategoryListResponse {
  data: RecipeCategory[];
  success: boolean;
  message: string;
  pagination?: RecipePagination;
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
  nutrition_json: RecipeNutritionEntry[];
  benefits_json: string[];
  tags_json: string[];
  views_count: number;
}

export interface RecipeDetailResponse {
  success: boolean;
  message: string;
  data: RecipeDetailItem;
}

export interface AddRecipeFavoriteData {
  recipe_id: number;
  is_favorited: boolean;
  favorites_count: number;
}

export interface AddRecipeFavoriteResponse {
  success: boolean;
  message: string;
  data?: AddRecipeFavoriteData | null;
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

export interface RecipeReviewData {
  id: number;
  username: string;
  rating: number;
  review_text: string;
  clarity_score: number;
  energy_score: number;
  satiety_score: number;
  digestibility_score: number;
  would_repeat: boolean;
  made_as_is: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeReviewResponse {
  success: boolean;
  message: string;
  data?: RecipeReviewData | null;
  error_code?: string;
}
