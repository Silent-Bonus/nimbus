import type { ImageSourcePropType } from "react-native";
import type { ProtocolTemplateCardItem } from "@/components/common/ProtocolTemplateCard";

export type RecipePlanNutrition = {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

export type RecipePlanTip = {
  key: string;
  title: string;
  description: string;
  icon: string;
};

export type RecipePlanStep = {
  step: number;
  title: string;
  description: string;
};

export type RecipePlanDetail = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  mealSlot?: string;
  filterKey: "Breakfast" | "Lunch" | "Dinner" | "Beverages" | "Snacks" | "Soup" | "Dessert" | "Sauce" | "NonVeg";
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
  nutrition: RecipePlanNutrition;
  description: string;
  ingredients: string[];
  process: string[];
  tips: RecipePlanTip[];
  wisdomTitle: string;
  wisdom: string;
  ctaLabel: string;
  context?: string;
  proTip?: string;
  fastTrack?: string;
  bioHacker?: string;
  ingredientsJson?: string[];
  stepsJson?: RecipePlanStep[];
  tagsJson?: string[];
};

export type RecipeCardItem = ProtocolTemplateCardItem & {
  id: string;
  favorite: boolean;
  raw: Record<string, any>;
};
