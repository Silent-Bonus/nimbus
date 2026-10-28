import { toApiDate } from "@/utils/date-time";
import type {
  BulkMealUpdateEntry,
  BulkMealUpdatePayload,
  DayPlan,
  Meal,
  MealPlannerApiMealType,
  MealPlannerDraftEntry,
  MealPlannerWeeklyPlanStore,
} from "@/features/tools/types/mealPlannerTypes";
import { getMealName } from "@/features/tools/utils/mealPlannerUtils";

const WEEKLY_MEAL_TYPES: readonly MealPlannerApiMealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

const firstMeal = (meal: Meal | Meal[] | null | undefined): Meal | null => {
  if (Array.isArray(meal)) {
    return meal.find(Boolean) ?? null;
  }

  return meal ?? null;
};

const mealToPayload = (meal: Meal): BulkMealUpdateEntry => {
  const recipe = meal.recipe;
  const recipeId =
    typeof recipe === "number"
      ? recipe
      : recipe && typeof recipe === "object"
      ? recipe.id
      : undefined;

  if (recipeId) {
    return { recipe_id: recipeId };
  }

  const nutrition = meal as Meal & {
    carbohydrates?: number;
    fats?: number;
  };

  return {
    name: getMealName(meal),
    calories: meal.calories ?? 0,
    protein: meal.protein,
    carbohydrates: nutrition.carbohydrates,
    fats: nutrition.fats,
    fiber: meal.fiber,
  };
};

const draftToPayload = (entry: MealPlannerDraftEntry): BulkMealUpdateEntry =>
  entry.recipeId
    ? { recipe_id: entry.recipeId }
    : {
        name: entry.foodName,
        calories: entry.calories || 0,
        protein: entry.protein,
        carbohydrates: entry.carbohydrates,
        fats: entry.fats,
        fiber: entry.fiber,
      };

/**
 * Creates a complete, per-day payload so editing one slot cannot drop the
 * other meals already returned by the selected date-range query.
 */
export const buildWeeklyMealPlanPayload = (
  weekDates: readonly Date[],
  existingPlans: readonly DayPlan[],
  weeklyDraft: MealPlannerWeeklyPlanStore
): BulkMealUpdatePayload => {
  const existingByDate = new Map(
    existingPlans.map((plan) => [toApiDate(new Date(plan.date)), plan])
  );
  const payload: BulkMealUpdatePayload = {};

  weekDates.forEach((date) => {
    const dateKey = toApiDate(date);
    const existingPlan = existingByDate.get(dateKey);
    const draft = weeklyDraft[dateKey] ?? {};
    const datePayload: BulkMealUpdatePayload[string] = {};

    WEEKLY_MEAL_TYPES.forEach((mealType) => {
      if (Object.prototype.hasOwnProperty.call(draft, mealType)) {
        const draftEntry = draft[mealType];
        datePayload[mealType] = draftEntry ? draftToPayload(draftEntry) : null;
        return;
      }

      const existingMeal = firstMeal(existingPlan?.meals?.[mealType]);
      if (existingMeal) {
        datePayload[mealType] = mealToPayload(existingMeal);
      }
    });

    if (Object.keys(datePayload).length > 0) {
      payload[dateKey] = datePayload;
    }
  });

  return payload;
};
