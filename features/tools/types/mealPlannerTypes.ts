/**
 * Central meal planner type contract.
 *
 * Keep API payloads, response models, normalized dashboard models,
 * and planner draft state in this file so the meal planner module
 * shares one source of truth for data shapes.
 */

export type MealPlannerApiMealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack";

export type MealPlannerScreenMealSlotKey =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack";

export type MealPlannerUiMealType =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snack";

export type NutritionMetricKey =
  | "calories"
  | "protein"
  | "carbs"
  | "fats"
  | "fiber";

export type DashboardDirection = "up" | "down" | "steady";
export type DashboardMealKey = MealPlannerApiMealType;

export interface MealRecipeSummary {
  id: number;
  slug?: string;
  title: string;
  short_description?: string;
  meal_slot?: string;
  difficulty_level?: string;
  total_time_minutes?: number;
  avg_rating?: string | number;
  reviews_count?: number;
  favorites_count?: number;
  is_favorited?: boolean;
  image?: string | null;
}

export interface Meal {
  id: number;
  name: string;
  calories?: number;
  image?: string | null;
  protein?: number;
  fiber?: number;
  is_consumed: boolean;
  plan?: number;
  meal_type?: string;
  recipe?: number | MealRecipeSummary | null;
}

export interface DayPlan {
  id: number;
  date: string;
  status: string;
  meals: {
    breakfast: Meal | null;
    lunch: Meal | null;
    dinner: Meal | null;
    snack: Meal[] | null;
  };
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
}

/**
 * Raw meal-plan shape from the backend.
 *
 * The API still returns the snack collection under `snacks`, so the
 * service layer normalizes this shape into the app-level `DayPlan`.
 */
export interface RawDayPlan {
  id: number;
  date: string;
  status: string;
  meals: {
    breakfast: Meal | null;
    lunch: Meal | null;
    dinner: Meal | null;
    snack?: Meal[] | null;
    snacks?: Meal[] | null;
  };
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
}

/**
 * Shared weekly planner card types used by Nourish Horizon.
 */
export type MealPlanMealType = MealPlannerApiMealType;

export interface MealPlanMealRow {
  mealType: MealPlanMealType;
  recipeName: string;
  recipeId?: string;
  recipeSlug?: string;
  recipeData?: string;
}

export type MealPlannerWeekRangeId = "previous" | "current" | "next";

export interface MealPlannerWeekRange {
  value: MealPlannerWeekRangeId;
  label: string;
  startDate: Date;
  endDate: Date;
}

export interface MealPlannerWeekDisplayDay {
  id: string;
  title: string;
  date: Date;
  mealRows: MealPlanMealRow[];
  sourcePlan: DayPlan | null;
  statusLabel: string;
}

export interface MealPlannerExportErrorPayload {
  message?: string;
  error_code?: string;
}

export interface MealPlanPagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results_count: number;
}

export interface MealPlanResponse<T = DayPlan[]> {
  success: boolean;
  message: string;
  data: T;
  pagination?: MealPlanPagination;
}

export interface NutritionStats {
  consumed: number;
  goal: number;
  color: string;
}

export interface MealDashboardData {
  period: string;
  days_tracked?: number;
  total_calories_consumed?: number;
  average_calories?: number;
  today_nutrition: {
    calories: NutritionStats;
    protein: NutritionStats;
    carbs: NutritionStats;
    fats: NutritionStats;
    fiber: NutritionStats;
  };
}

export interface MealDashboardResponse {
  success: boolean;
  message: string;
  data: MealDashboardData;
}

export interface AddMealRequest {
  date: Date;
  meal_type: MealPlannerApiMealType;
  recipe_id?: number | string;
  name?: string;
  calories?: number;
  protein?: number;
  fiber?: number;
}

export interface MealItemResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    plan: number;
    meal_type: string;
    name: string;
    calories: number;
    is_consumed: boolean;
  };
}

export interface UpdateMealItemRequest {
  is_consumed: boolean;
}

export interface BulkMealUpdateEntry {
  recipe_id?: number | string;
  name?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
  fiber?: number;
}

export interface BulkMealUpdatePayload {
  [date: string]: {
    [mealType: string]: BulkMealUpdateEntry | null;
  };
}

export interface MealPlannerDraftEntry {
  foodName: string;
  calories?: number;
  recipeId?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
  fiber?: number;
}

export interface MealPlannerDayDraft {
  [key: string]: MealPlannerDraftEntry | null;
}

export interface MealPlannerWeeklyPlanStore {
  [date: string]: MealPlannerDayDraft;
}

export interface NormalizedNutritionMetric {
  consumed: number;
  goal: number;
  remaining: number;
  unit: string;
  progress_percent: number;
  color: string;
}

export interface NormalizedMealDashboardData {
  range: {
    days: number;
    label: string;
    start_date: string;
    end_date: string;
  };
  summary: {
    days_tracked: number;
    tracked_days_percentage: number;
    current_streak_days: number;
    best_streak_days: number;
    meals_consumed: number;
    meals_planned: number;
    meal_completion_rate: number;
    calories_consumed: {
      total: number;
      average_per_tracked_day: number;
    };
  };
  today: {
    date: string;
    meals: Record<
      DashboardMealKey,
      {
        planned: boolean;
        consumed: boolean;
        name: string | null;
      }
    >;
    nutrition: Record<NutritionMetricKey, NormalizedNutritionMetric>;
    status: {
      fully_tracked: boolean;
      next_pending_meal: DashboardMealKey | null;
      last_logged_meal: DashboardMealKey | null;
    };
  };
  adherence: {
    calorie_goal_days_hit: number;
    protein_goal_days_hit: number;
    fiber_goal_days_hit: number;
    goal_hit_rate: {
      calories: number;
      protein: number;
      fiber: number;
    };
  };
  trends: {
    last_7_days: {
      avg_calories: number;
      avg_protein: number;
      avg_fiber: number;
    };
    direction: Record<"calories" | "protein" | "fiber", DashboardDirection>;
  };
  insights: string[];
}

export interface NormalizedMealDashboardResponse {
  success: boolean;
  message: string;
  data: NormalizedMealDashboardData;
}
