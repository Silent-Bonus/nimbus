import { buildWeeklyMealPlanPayload } from "./mealPlannerPayload";
import type {
  DayPlan,
  MealPlannerWeeklyPlanStore,
} from "@/features/tools/types/mealPlannerTypes";

describe("buildWeeklyMealPlanPayload", () => {
  it("preserves existing slots while overriding an edited slot", () => {
    const existingPlans = [
      {
        date: "2026-10-29",
        meals: {
          breakfast: {
            id: 1,
            name: "Old breakfast",
            recipe: 10,
            is_consumed: false,
          },
          lunch: {
            id: 2,
            name: "Existing lunch",
            recipe: 20,
            is_consumed: false,
          },
          dinner: null,
          snack: [],
        },
      },
    ] as unknown as DayPlan[];
    const weeklyDraft = {
      "2026-10-29": {
        breakfast: {
          foodName: "New breakfast",
          recipeId: 30,
          calories: 400,
        },
      },
    } satisfies MealPlannerWeeklyPlanStore;

    expect(
      buildWeeklyMealPlanPayload(
        [new Date(2026, 9, 29)],
        existingPlans,
        weeklyDraft
      )
    ).toEqual({
      "2026-10-29": {
        breakfast: { recipe_id: 30 },
        lunch: { recipe_id: 20 },
      },
    });
  });
});
