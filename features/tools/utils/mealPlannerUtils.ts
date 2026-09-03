/**
 * Meal planner utility layer.
 *
 * This file owns response normalization, display helpers, and
 * meal-type conversion helpers so screens stay focused on UI logic.
 */

import { addDays, format, startOfWeek, subDays } from "date-fns";

import type {
  DashboardMealKey,
  DayPlan,
  Meal,
  MealDashboardData,
  MealDashboardResponse,
  MealPlanMealRow,
  MealPlanMealType,
  MealPlannerApiMealType,
  MealPlannerExportErrorPayload,
  MealPlannerUiMealType,
  MealPlannerWeekDisplayDay,
  MealPlannerWeekRange,
  MealRecipeSummary,
  NormalizedMealDashboardData,
  NormalizedMealDashboardResponse,
  NormalizedNutritionMetric,
  NutritionMetricKey,
  NutritionStats,
} from "@/features/tools/types/mealPlannerTypes";
import type { RecipePreviewData } from "@/features/tools/types/recipeTypes";

type PartialNormalizedMealDashboardData = Partial<NormalizedMealDashboardData> & {
  today?: Partial<NormalizedMealDashboardData["today"]>;
  summary?: Partial<NormalizedMealDashboardData["summary"]>;
  adherence?: Partial<NormalizedMealDashboardData["adherence"]>;
  trends?: Partial<NormalizedMealDashboardData["trends"]> & {
    last_7_days?: Partial<NormalizedMealDashboardData["trends"]["last_7_days"]>;
    direction?: Partial<NormalizedMealDashboardData["trends"]["direction"]>;
  };
  range?: Partial<NormalizedMealDashboardData["range"]>;
};

type MealPlannerRouteMetricValue = string | string[] | undefined;

type MealPlannerGoalOverrideParams = {
  targetCalories?: MealPlannerRouteMetricValue;
  protein?: MealPlannerRouteMetricValue;
};

export const DAY_MEAL_TYPES: MealPlannerUiMealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

export const WEEKLY_MEAL_TYPES: readonly MealPlanMealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

const DASHBOARD_COLORS: Record<NutritionMetricKey, string> = {
  calories: "#6DFF8C",
  protein: "#4C8DFF",
  carbs: "#FACC15",
  fats: "#FB923C",
  fiber: "#A78BFA",
};

const DASHBOARD_UNITS: Record<NutritionMetricKey, string> = {
  calories: "kcal",
  protein: "g",
  carbs: "g",
  fats: "g",
  fiber: "g",
};

const DASHBOARD_DEFAULT_GOALS: Record<NutritionMetricKey, number> = {
  calories: 1737,
  protein: 102,
  carbs: 202,
  fats: 58,
  fiber: 25,
};

const DEFAULT_INSIGHTS = [
  "You are usually missing your fiber goal.",
  "Protein adherence is stronger than calorie adherence.",
  "Lunch is your most skipped meal this week.",
];

const DEFAULT_TODAY_MEALS: NormalizedMealDashboardData["today"]["meals"] = {
  breakfast: { planned: true, consumed: true, name: "Oats Bowl" },
  lunch: { planned: true, consumed: false, name: "Paneer Wrap" },
  dinner: { planned: true, consumed: false, name: "Dal Rice Bowl" },
  snack: { planned: false, consumed: false, name: null },
};

const MEAL_STATUS_ORDER: DashboardMealKey[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampPercent = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));

const extractRangeDays = (label?: string) => {
  if (!label) {
    return 30;
  }

  const matched = label.match(/(\d+)/);
  return matched ? toNumber(matched[1], 30) : 30;
};

const toDateString = (value?: string | null, fallbackDate = new Date()) => {
  if (!value) {
    return format(fallbackDate, "yyyy-MM-dd");
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? format(fallbackDate, "yyyy-MM-dd")
    : format(parsed, "yyyy-MM-dd");
};

const normalizeNutritionMetric = (
  key: NutritionMetricKey,
  legacyMetric?: Partial<NutritionStats> | Partial<NormalizedNutritionMetric>,
  normalizedMetric?: Partial<NormalizedNutritionMetric>
): NormalizedNutritionMetric => {
  const consumed = toNumber(
    normalizedMetric?.consumed ?? legacyMetric?.consumed,
    0
  );
  const goal = toNumber(
    normalizedMetric?.goal ?? legacyMetric?.goal,
    DASHBOARD_DEFAULT_GOALS[key]
  );
  const remaining = toNumber(
    normalizedMetric?.remaining,
    Math.max(goal - consumed, 0)
  );
  const progressPercent = toNumber(
    normalizedMetric?.progress_percent,
    goal > 0 ? clampPercent((consumed / goal) * 100) : 0
  );

  return {
    consumed,
    goal,
    remaining,
    unit: normalizedMetric?.unit ?? DASHBOARD_UNITS[key],
    progress_percent: progressPercent,
    color:
      normalizedMetric?.color ??
      legacyMetric?.color ??
      DASHBOARD_COLORS[key],
  };
};

const normalizeTodayMeals = (
  normalizedTodayMeals?: Partial<NormalizedMealDashboardData["today"]["meals"]>
): NormalizedMealDashboardData["today"]["meals"] => {
  return {
    breakfast: {
      ...DEFAULT_TODAY_MEALS.breakfast,
      ...normalizedTodayMeals?.breakfast,
    },
    lunch: {
      ...DEFAULT_TODAY_MEALS.lunch,
      ...normalizedTodayMeals?.lunch,
    },
    dinner: {
      ...DEFAULT_TODAY_MEALS.dinner,
      ...normalizedTodayMeals?.dinner,
    },
    snack: {
      ...DEFAULT_TODAY_MEALS.snack,
      ...normalizedTodayMeals?.snack,
    },
  };
};

const getDashboardStatus = (
  meals: NormalizedMealDashboardData["today"]["meals"],
  explicitStatus?: Partial<NormalizedMealDashboardData["today"]["status"]>
) => {
  const fullyTracked =
    explicitStatus?.fully_tracked ??
    MEAL_STATUS_ORDER.every((mealKey) => {
      const meal = meals[mealKey];
      return !meal.planned || meal.consumed;
    });

  const nextPendingMeal =
    explicitStatus?.next_pending_meal ??
    MEAL_STATUS_ORDER.find((mealKey) => {
      const meal = meals[mealKey];
      return meal.planned && !meal.consumed;
    }) ??
    null;

  const lastLoggedMeal =
    explicitStatus?.last_logged_meal ??
    [...MEAL_STATUS_ORDER]
      .reverse()
      .find((mealKey) => meals[mealKey].consumed) ??
    null;

  return {
    fully_tracked: Boolean(fullyTracked),
    next_pending_meal: nextPendingMeal,
    last_logged_meal: lastLoggedMeal,
  };
};

const parseMealPlannerMetricParam = (value?: MealPlannerRouteMetricValue) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Normalize planner search params or draft labels into supported API meal keys.
 */
export const normalizeMealTypeParam = (
  value?: string | string[]
): MealPlannerUiMealType => {
  const raw = Array.isArray(value) ? value[0] : value;

  switch (raw?.toLowerCase()) {
    case "breakfast":
      return "Breakfast";
    case "lunch":
      return "Lunch";
    case "dinner":
      return "Dinner";
    case "snack":
    case "snacks":
      return "Snack";
    default:
      return "Breakfast";
  }
};

/**
 * Extract optional calorie and protein goal overrides from planner route params.
 */
export const getMealPlannerGoalOverrides = (
  params: MealPlannerGoalOverrideParams
) => ({
  targetCalories: parseMealPlannerMetricParam(params.targetCalories),
  targetProtein: parseMealPlannerMetricParam(params.protein),
});

/**
 * Convert the UI meal label into the backend key expected by bulk update APIs.
 */
export const mealTypeToApiKey = (
  value: MealPlannerUiMealType
): MealPlannerApiMealType => {
  switch (value) {
    case "Breakfast":
      return "breakfast";
    case "Lunch":
      return "lunch";
    case "Dinner":
      return "dinner";
    case "Snack":
      return "snack";
  }
};

/**
 * Convert backend meal keys into readable labels for cards and review rows.
 */
export const apiMealTypeToLabel = (value: string) => {
  switch (value) {
    case "breakfast":
      return "Breakfast";
    case "lunch":
      return "Lunch";
    case "dinner":
      return "Dinner";
    case "snack":
      return "Snack";
    default:
      return value;
  }
};

/**
 * Resolve a meal title regardless of whether the API returns a custom meal,
 * a nested recipe object, or a snack array.
 */
export const getMealName = (meal: Meal | Meal[] | null | undefined): string => {
  if (!meal) return "Not planned";

  if (Array.isArray(meal)) {
    const names = meal
      .map((entry) => getMealName(entry))
      .filter((entry) => entry !== "Not planned");
    return names.length > 0 ? names.join(", ") : "Not planned";
  }

  if (meal.name) return meal.name;

  if (meal.recipe && typeof meal.recipe === "object" && meal.recipe.title) {
    return meal.recipe.title;
  }

  return "Untitled recipe";
};

/**
 * Resolve the first useful image for a meal card across custom and recipe-backed meals.
 */
export const getMealImage = (
  meal: Meal | Meal[] | null | undefined
): string | null => {
  if (!meal) return null;

  if (Array.isArray(meal)) {
    for (const entry of meal) {
      const image = getMealImage(entry);
      if (image) return image;
    }
    return null;
  }

  if (meal.image) return meal.image;

  if (meal.recipe && typeof meal.recipe === "object") {
    return (meal.recipe as MealRecipeSummary).image ?? null;
  }

  return null;
};

const isMealRecipeSummary = (
  recipe: Meal["recipe"]
): recipe is MealRecipeSummary =>
  Boolean(recipe && typeof recipe === "object" && "id" in recipe);

const buildMealRecipePreviewData = (
  recipe: MealRecipeSummary,
  fallbackName: string
) => {
  const payload: RecipePreviewData = {
    id: recipe.id,
    slug: recipe.slug ?? null,
    title: recipe.title || fallbackName,
    short_description: recipe.short_description ?? null,
    meal_slot: recipe.meal_slot ?? null,
    category: null,
    difficulty_level: recipe.difficulty_level ?? "",
    total_time_minutes: recipe.total_time_minutes ?? 0,
    avg_rating: String(recipe.avg_rating ?? "0.00"),
    reviews_count: recipe.reviews_count ?? 0,
    favorites_count: recipe.favorites_count ?? 0,
    is_favorited: recipe.is_favorited ?? false,
    image: recipe.image ?? null,
  };

  return JSON.stringify(payload);
};

/**
 * Extract the route params needed to open a recipe-detail screen from a meal.
 */
export const getMealRecipeRouteData = (
  meal: Meal | Meal[] | null | undefined
): Pick<MealPlanMealRow, "recipeId" | "recipeSlug" | "recipeData"> => {
  if (!meal) {
    return {};
  }

  if (Array.isArray(meal)) {
    if (meal.length !== 1) {
      return {};
    }

    return getMealRecipeRouteData(meal[0]);
  }

  if (isMealRecipeSummary(meal.recipe)) {
    return {
      recipeId: String(meal.recipe.id),
      recipeSlug: meal.recipe.slug,
      recipeData: buildMealRecipePreviewData(meal.recipe, meal.name),
    };
  }

  if (typeof meal.recipe === "number") {
    return { recipeId: String(meal.recipe) };
  }

  return {};
};

const normalizeWeeklyMealRow = (
  mealType: MealPlanMealType,
  meal: Meal | Meal[] | null | undefined
): MealPlanMealRow | null => {
  if (!meal) {
    return null;
  }

  if (mealType === "snack") {
    const snackMeals = Array.isArray(meal) ? meal : [meal];
    const validSnacks = snackMeals.filter(Boolean);

    if (validSnacks.length === 0) {
      return null;
    }

    return {
      mealType,
      recipeName: getMealName(validSnacks),
      ...getMealRecipeRouteData(validSnacks),
    };
  }

  const mealEntry = Array.isArray(meal) ? meal[0] : meal;
  if (!mealEntry) {
    return null;
  }

  return {
    mealType,
    recipeName: getMealName(mealEntry),
    ...getMealRecipeRouteData(mealEntry),
  };
};

/**
 * Build the visible meal rows for one planner day, including snack bundles.
 */
export const buildWeeklyMealRows = (plan: DayPlan): MealPlanMealRow[] =>
  WEEKLY_MEAL_TYPES.map((mealType) =>
    normalizeWeeklyMealRow(mealType, plan.meals?.[mealType] ?? null)
  ).filter((row): row is MealPlanMealRow => Boolean(row));

/**
 * Build the fixed seven-day UI model for Nourish Horizon from a sparse API response.
 */
export const buildMealPlannerWeekDisplayDays = (
  weekStart: Date,
  plans: DayPlan[]
): MealPlannerWeekDisplayDay[] => {
  const planMap = new Map(
    plans.map((plan) => [format(new Date(plan.date), "yyyy-MM-dd"), plan])
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = format(date, "yyyy-MM-dd");
    const livePlan = planMap.get(key) ?? null;

    return {
      id: key,
      title: format(date, "EEEE, MMM d"),
      date,
      mealRows: livePlan ? buildWeeklyMealRows(livePlan) : [],
      sourcePlan: livePlan,
      statusLabel: livePlan?.status || "Not Planned",
    };
  });
};

/**
 * Build the week filter ranges anchored to the current Monday-based week.
 */
export const buildMealPlannerWeekRanges = (
  referenceDate: Date
): MealPlannerWeekRange[] => {
  const currentWeekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });

  return [
    {
      value: "previous",
      label: "Previous",
      startDate: addDays(currentWeekStart, -7),
      endDate: addDays(currentWeekStart, -1),
    },
    {
      value: "current",
      label: "Current",
      startDate: currentWeekStart,
      endDate: addDays(currentWeekStart, 6),
    },
    {
      value: "next",
      label: "Future",
      startDate: addDays(currentWeekStart, 7),
      endDate: addDays(currentWeekStart, 13),
    },
  ];
};

/**
 * Build the planner PDF filename expected by the export endpoint.
 */
export const getMealPlanPdfFileName = (startDate: string, endDate: string) =>
  `meal_plan_${startDate}_${endDate}.pdf`;

/**
 * Convert export error codes into user-facing messages for plan sharing.
 */
export const getMealPlanExportErrorMessage = (
  payload?: MealPlannerExportErrorPayload | null
) => {
  switch (payload?.error_code) {
    case "VAL_202":
      return "We couldn't export this plan because the date range was missing.";
    case "VAL_203":
      return "We couldn't export this plan because the request format was invalid.";
    case "VAL_208":
      return "We couldn't export this plan because the selected dates were invalid.";
    case "BUS_301":
      return "There isn't a meal plan in this range to export yet.";
    case "BUS_307":
      return "This export request is only valid for the current meal plan.";
    case "AUTH_103":
      return "You don't have access to export this meal plan.";
    default:
      return payload?.message?.trim() || "Unable to export the weekly meal plan right now.";
  }
};

/**
 * Compose the plain-text day summary used by native share sheets.
 */
export const buildMealDayShareMessage = (
  plan: DayPlan,
  title = "Nourish Horizon"
) => {
  const dateValue = new Date(plan.date);
  const plannedMeals = [
    { label: "Breakfast", value: plan.meals?.breakfast },
    { label: "Lunch", value: plan.meals?.lunch },
    { label: "Dinner", value: plan.meals?.dinner },
    { label: "Snack", value: plan.meals?.snack },
  ].filter(({ value }) => Boolean(value));

  return plannedMeals.length > 0
    ? [
        title,
        format(dateValue, "EEEE, MMM d"),
        "",
        ...plannedMeals.map(
          ({ label, value }) => `${label}: ${getMealName(value)}`
        ),
      ].join("\n")
    : [
        title,
        format(dateValue, "EEEE, MMM d"),
        "",
        "No meals planned for this day.",
      ].join("\n");
};

/**
 * Transform the legacy dashboard response into the richer normalized model
 * used by the current Nourish Plan UI.
 *
 * TODO(nourish-dashboard): Once the backend starts returning the expected
 * normalized dashboard shape (`data.range`, `data.summary`, `data.today`,
 * `data.adherence`, `data.trends`, and `data.insights`) for all planner
 * requests, remove the synthesized fallback values in this transformer and
 * map the server payload directly instead.
 */
export const transformMealDashboardResponse = (
  response?: MealDashboardResponse | NormalizedMealDashboardResponse | null
): NormalizedMealDashboardResponse => {
  const today = new Date();
  const rawData = (response?.data ?? {}) as MealDashboardData &
    PartialNormalizedMealDashboardData;

  const rangeDays = toNumber(
    rawData.range?.days,
    extractRangeDays(rawData.range?.label ?? rawData.period)
  );
  const rangeEndDate = toDateString(rawData.range?.end_date);
  const rangeStartDate = toDateString(
    rawData.range?.start_date,
    subDays(new Date(rangeEndDate), Math.max(rangeDays - 1, 0))
  );

  const daysTracked = toNumber(rawData.summary?.days_tracked, rawData.days_tracked);
  const trackedDaysPercentage = toNumber(
    rawData.summary?.tracked_days_percentage,
    rangeDays > 0 ? clampPercent((daysTracked / rangeDays) * 100) : 0
  );
  const currentStreakDays = toNumber(
    rawData.summary?.current_streak_days,
    daysTracked > 0 ? Math.min(daysTracked, 3) : 0
  );
  const bestStreakDays = toNumber(
    rawData.summary?.best_streak_days,
    Math.max(currentStreakDays, Math.min(daysTracked, 7))
  );
  const mealsPlanned = toNumber(
    rawData.summary?.meals_planned,
    Math.max(daysTracked * 4, 4)
  );
  const mealsConsumed = toNumber(
    rawData.summary?.meals_consumed,
    daysTracked > 0
      ? Math.min(
          mealsPlanned,
          Math.max(
            1,
            Math.round((mealsPlanned * trackedDaysPercentage) / 100)
          )
        )
      : 0
  );
  const mealCompletionRate = toNumber(
    rawData.summary?.meal_completion_rate,
    mealsPlanned > 0 ? clampPercent((mealsConsumed / mealsPlanned) * 100) : 0
  );
  const totalCaloriesConsumed = toNumber(
    rawData.summary?.calories_consumed?.total,
    rawData.total_calories_consumed
  );
  const averageCalories = toNumber(
    rawData.summary?.calories_consumed?.average_per_tracked_day,
    rawData.average_calories
  );

  const normalizedMeals = normalizeTodayMeals(rawData.today?.meals);
  const normalizedNutrition = {
    calories: normalizeNutritionMetric(
      "calories",
      rawData.today_nutrition?.calories,
      rawData.today?.nutrition?.calories
    ),
    protein: normalizeNutritionMetric(
      "protein",
      rawData.today_nutrition?.protein,
      rawData.today?.nutrition?.protein
    ),
    carbs: normalizeNutritionMetric(
      "carbs",
      rawData.today_nutrition?.carbs,
      rawData.today?.nutrition?.carbs
    ),
    fats: normalizeNutritionMetric(
      "fats",
      rawData.today_nutrition?.fats,
      rawData.today?.nutrition?.fats
    ),
    fiber: normalizeNutritionMetric(
      "fiber",
      rawData.today_nutrition?.fiber,
      rawData.today?.nutrition?.fiber
    ),
  };

  const adherence = {
    calorie_goal_days_hit: toNumber(
      rawData.adherence?.calorie_goal_days_hit,
      Math.min(daysTracked, 6)
    ),
    protein_goal_days_hit: toNumber(
      rawData.adherence?.protein_goal_days_hit,
      Math.min(daysTracked, 8)
    ),
    fiber_goal_days_hit: toNumber(
      rawData.adherence?.fiber_goal_days_hit,
      Math.min(daysTracked, 5)
    ),
    goal_hit_rate: {
      calories: toNumber(rawData.adherence?.goal_hit_rate?.calories, 50),
      protein: toNumber(rawData.adherence?.goal_hit_rate?.protein, 67),
      fiber: toNumber(rawData.adherence?.goal_hit_rate?.fiber, 42),
    },
  };

  return {
    success: response?.success ?? true,
    message: response?.message ?? "Dashboard data retrieved successfully.",
    data: {
      range: {
        days: rangeDays,
        label: rawData.range?.label ?? rawData.period ?? `Last ${rangeDays} days`,
        start_date: rangeStartDate,
        end_date: rangeEndDate,
      },
      summary: {
        days_tracked: daysTracked,
        tracked_days_percentage: trackedDaysPercentage,
        current_streak_days: currentStreakDays,
        best_streak_days: bestStreakDays,
        meals_consumed: mealsConsumed,
        meals_planned: mealsPlanned,
        meal_completion_rate: mealCompletionRate,
        calories_consumed: {
          total: totalCaloriesConsumed,
          average_per_tracked_day: averageCalories,
        },
      },
      today: {
        date: toDateString(rawData.today?.date, today),
        meals: normalizedMeals,
        nutrition: normalizedNutrition,
        status: getDashboardStatus(normalizedMeals, rawData.today?.status),
      },
      adherence,
      trends: {
        last_7_days: {
          avg_calories: toNumber(
            rawData.trends?.last_7_days?.avg_calories,
            averageCalories
          ),
          avg_protein: toNumber(
            rawData.trends?.last_7_days?.avg_protein,
            normalizedNutrition.protein.consumed
          ),
          avg_fiber: toNumber(
            rawData.trends?.last_7_days?.avg_fiber,
            normalizedNutrition.fiber.consumed
          ),
        },
        direction: {
          calories: rawData.trends?.direction?.calories ?? "up",
          protein: rawData.trends?.direction?.protein ?? "steady",
          fiber: rawData.trends?.direction?.fiber ?? "down",
        },
      },
      insights:
        rawData.insights && rawData.insights.length > 0
          ? rawData.insights
          : DEFAULT_INSIGHTS,
    },
  };
};
