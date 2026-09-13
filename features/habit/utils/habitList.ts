import type { HabitListResponse } from "@/features/habit/types/habitTypes";

export type HabitMetricDetails = {
  unit: string;
  target: number;
  completed: number;
  remaining: number;
  completion_percentage: number;
};

export type NormalizedHabitListItem = {
  id: number | string;
  name: string;
  description: string;
  color: string;
  icon: string;
  frequency: string;
  start_time: string | null;
  end_time: string | null;
  last_completed: string | null;
  completed: boolean;
  habit_type_tracking: string;
  metric_details: HabitMetricDetails;
  goal: number | null;
  daily_checkin: unknown | null;
  // Legacy fields remain available temporarily for existing daily-check-in UI.
  metric_count?: number | null;
  metric_unit?: string | null;
  completed_unit?: number | null;
  current_streak?: number;
  longest_streak?: number;
  last_7_days_completion?: unknown[] | null;
  time?: string;
};

export type NormalizedHabitListResponse = Omit<
  HabitListResponse,
  "data" | "success"
> & {
  success: boolean;
  data: NormalizedHabitListItem[];
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toCompletionPercentage = (completed: number, target: number) =>
  target > 0 ? Math.round((completed / target) * 100) : 0;

type HabitListResponseLike = {
  success: boolean | string;
  message: string;
  data?: unknown[];
};

// Temporary compatibility adapter: remove this function once the habit-list
// API returns the normalized nested contract directly.
export const transformHabitListResponse = (
  response: HabitListResponse | NormalizedHabitListResponse | HabitListResponseLike
): NormalizedHabitListResponse => ({
  ...response,
  success: response.success === true || response.success === "true",
  data: (Array.isArray(response.data) ? response.data : []).map((item) => {
    const legacyItem = item as Record<string, any>;
    const target = toFiniteNumber(
      legacyItem.metric_details?.target ?? legacyItem.metric_count ?? legacyItem.goal
    );
    const completed = toFiniteNumber(legacyItem.metric_details?.completed ?? 0);
    const unit = String(
      legacyItem.metric_details?.unit ?? legacyItem.metric_unit ?? "unit"
    );

    return {
      ...legacyItem,
      metric_details: {
        unit,
        target,
        completed,
        remaining: Math.max(
          0,
          toFiniteNumber(legacyItem.metric_details?.remaining, target - completed)
        ),
        completion_percentage: toFiniteNumber(
          legacyItem.metric_details?.completion_percentage,
          toCompletionPercentage(completed, target)
        ),
      },
      goal: legacyItem.goal == null ? null : toFiniteNumber(legacyItem.goal),
      daily_checkin: legacyItem.daily_checkin ?? null,
    } as NormalizedHabitListItem;
  }),
});
