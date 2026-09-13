/* ---------------- helpers ---------------- */

import {
  type DailyCheckInDetail,
  type DailyCheckInDetailResponse,
  type DailyCheckInListResponse,
  type NormalizedHabitDetailResponse,
  type Unit,
} from "@/features/check-in/types/dailyCheckin";

export type HabitProgressUnit = "ml" | "hours" | "minutes";

/** Sanitize progress increments before sending them to the habit API. */
export const sanitizeHabitIncrement = (
  value: unknown,
  unit: HabitProgressUnit,
  max?: number
) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;

  const nonNegativeValue = Math.max(0, numericValue);
  const cappedValue = max === undefined
    ? nonNegativeValue
    : Math.min(nonNegativeValue, max);

  if (unit === "hours") {
    return Math.round(cappedValue * 100) / 100;
  }

  return Math.round(cappedValue);
};

// Temporary compatibility adapter: remove this function once the habit-detail
// API returns the normalized contract consumed below directly. At that point,
// getHabitDetailsByDate can return the API response without this intermediate
// mapping layer.
export const transformHabitDetailResponse = (
  response: DailyCheckInDetailResponse | NormalizedHabitDetailResponse
): NormalizedHabitDetailResponse => {
  if (
    "protocol_details" in response.data &&
    "goal_details" in response.data &&
    "streak" in response.data
  ) {
    return response as NormalizedHabitDetailResponse;
  }

  const detail = response.data;
  const target = Number(detail.target_unit ?? detail.metric_count ?? 0);
  const completed = Number(detail.completed_unit ?? 0);
  const completionPercentage =
    target > 0 ? Math.round((completed / target) * 100) : 0;
  const unit = detail.metric_unit ?? "unit";

  return {
    success: response.success,
    message: response.message,
    data: {
      habit: {
        id: detail.id,
        name: detail.name,
        description: detail.description,
        color: detail.color,
        icon: (detail as DailyCheckInDetail & { icon?: string | null }).icon ?? null,
        frequency: detail.frequency,
        start_time: detail.start_time,
        end_time: detail.end_time,
        last_completed: detail.last_completed,
        completed: detail.completed,
        habit_type_tracking: detail.habit_type_tracking,
      },
      protocol_details: {
        template_name: detail.name,
        template_type: detail.is_daily_checkin ? "daily_checkin" : "habit",
        source: detail.source,
        frequency_type: detail.frequency,
        start_date: detail.start_date,
        end_date: detail.end_date,
        all_day: detail.all_day,
        reminder_time: detail.reminder_time,
      },
      goal_details: {
        goal: detail.goal,
        metric_details: {
          unit,
          target,
          completed,
          remaining: Math.max(0, target - completed),
          completion_percentage: completionPercentage,
        },
        description: `Reach ${target} ${unit} today.`,
      },
      progress: {
        last_7_days_completion: detail.last_7_days_completion ?? [],
        completed_days_in_month: [],
        success_rate: 0,
        total_completed_habits: 0,
        // These insight fields now belong to progress in the normalized API
        // contract. Keep safe defaults while the compatibility adapter is used.
        tips: [],
        interesting_text: null,
      },
      trends: null,
      streak: {
        current_streak: detail.current_streak,
        longest_streak: detail.longest_streak,
      },
      daily_checkin: {
        tips: [],
        interesting_text: "",
      },
    },
  };
};

// Temporary compatibility adapter: remove this function once the daily
// check-in list API returns the normalized contract directly.
export const transformDailyCheckInListResponse = (
  response: DailyCheckInListResponse
): DailyCheckInListResponse => ({
  ...response,
  data: (Array.isArray(response.data) ? response.data : []).map((item) => ({
    ...item,
    tags: Array.isArray(item.tags) ? item.tags : [],
    last_7_days_completion: Array.isArray(item.last_7_days_completion)
      ? item.last_7_days_completion
      : [],
  })),
});

export function pickIcon(name?: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("water")) return "💧";
  if (n.includes("sleep")) return "😴";
  if (n.includes("medit")) return "🧘";
  return "⭐️";
}
export function pickColor(name?: string, theme?: any) {
  const n = (name || "").toLowerCase();
  if (n.includes("water")) return "#81A1C1";
  if (n.includes("sleep")) return "#EBCB8B";
  if (n.includes("medit")) return theme?.accent ?? "#A3BE8C";
  return theme?.surface ?? "#2A2D24";
}
export function routeFor(name?: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("water")) return "/(auth)/check-in/water";
  if (n.includes("sleep")) return "/(auth)/check-in/sleep";
  if (n.includes("medit")) return "/(auth)/check-in/meditation";
  return "/(auth)/check-in"; // fallback
}
export function resolveUnit(h: any): string {
  // Try to humanize units (backend may return "19" or similar)
  // You can extend this mapping if you have unit catalog.
  if (h.metric_unit && typeof h.metric_unit === "string") {
    const u = h.metric_unit.toLowerCase();
    if (u === "19") return "glass";
    if (u === "20") return "hr";
    if (u === "21") return "mintues";
  }
  // Fall back to sensible defaults per habit name
  const n = (h.name || "").toLowerCase();
  if (n.includes("water")) return "glass";
  if (n.includes("sleep")) return "hours";
  if (n.includes("medit")) return "min";
  return "unit";
}

export const stepFor = (it: any): number => {
  const n = it.name.toLowerCase();
  if (n.includes("water")) return 1; // glasses
  if (n.includes("sleep")) return 0.5; // hours
  if (n.includes("medit")) return 5; // minutes
  return 1;
};

export const roundForUnit = (v: number, unit?: Unit) => {
  if (unit === "hours") return Math.round(v * 10) / 10; // 1 decimal
  return Math.round(v); // integer for glasses/min
};

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// ---- Unit helpers
export const toMinutes = (val: number, unit?: string) => {
  if (!Number.isFinite(val)) return 0;
  const u = (unit || "").toLowerCase();
  if (
    u.includes("hour") ||
    u === "hr" ||
    u === "19" /* backend enum for hr? */
  ) {
    return Math.round(val * 60);
  }
  // assume already minutes
  return Math.round(val);
};

export const minutesToHhMm = (m: number) => {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};
