/**
 * Legacy compatibility wrapper for older normalized dashboard imports.
 *
 * New meal planner code should import dashboard helpers from
 * `utils/mealPlannerUtils` and shared models from `types/mealPlannerTypes`.
 */

export {
  transformMealDashboardResponse,
} from "@/features/tools/utils/mealPlannerUtils";
export type {
  NormalizedMealDashboardData,
  NormalizedMealDashboardResponse,
} from "@/features/tools/types/mealPlannerTypes";
