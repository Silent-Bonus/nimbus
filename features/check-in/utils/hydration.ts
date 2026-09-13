export type WeeklyPoint = {
  day: string;
  percent: number;
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const WATER_STEP_ML = 250;
export const WATER_GOAL_ML = 3000;
export const REMINDER_OPTIONS = [30, 60, 90, 120] as const;

/** Convert a hydration delta in ml to the habit's configured API unit. */
export const toHydrationIncrement = (
  deltaMl: number,
  metricUnit?: string | null
) => {
  const normalizedUnit = String(metricUnit ?? "").trim().toLowerCase();
  const safeDeltaMl = Math.max(0, Math.round(deltaMl));

  if (normalizedUnit.includes("ml")) {
    return safeDeltaMl;
  }

  if (normalizedUnit.includes("l")) {
    return safeDeltaMl / 1000;
  }

  return safeDeltaMl;
};

export const DEFAULT_WEEKLY_SERIES: WeeklyPoint[] = WEEK_DAYS.map((day) => ({
  day,
  percent: 0,
}));

export const MOCK_WEEKLY_SERIES: WeeklyPoint[] = [
  { day: "Mon", percent: 42 },
  { day: "Tue", percent: 58 },
  { day: "Wed", percent: 64 },
  { day: "Thu", percent: 49 },
  { day: "Fri", percent: 72 },
  { day: "Sat", percent: 81 },
  { day: "Sun", percent: 68 },
];

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const roundToStep = (value: number, step = WATER_STEP_ML) => {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
    return 0;
  }

  return Math.round(value / step) * step;
};

export const formatLiters = (ml: number) => {
  const liters = Number.isFinite(ml) ? Math.max(0, ml) / 1000 : 0;

  if (liters <= 0) return "0L";

  const rounded = Math.round(liters * 10) / 10;
  return Number.isInteger(rounded)
    ? `${rounded.toFixed(0)}L`
    : `${rounded.toFixed(1)}L`;
};

export const toHydrationMl = (rawValue: unknown, metricUnit?: string | null) => {
  const value = Number(rawValue ?? 0);
  if (!Number.isFinite(value) || value <= 0) return 0;

  const unit = String(metricUnit ?? "").toLowerCase();

  if (unit.includes("ml")) {
    return roundToStep(value, WATER_STEP_ML);
  }

  if (unit.includes("l")) {
    return roundToStep(value * 1000, WATER_STEP_ML);
  }

  // Default water check-ins in this app are glass-based.
  return roundToStep(value * WATER_STEP_ML, WATER_STEP_ML);
};

const isWeeklyPointObject = (
  value: unknown
): value is { day?: unknown; percent?: unknown; value?: unknown } =>
  typeof value === "object" && value !== null;

export const buildWeeklySeries = (raw: unknown): WeeklyPoint[] => {
  const source = Array.isArray(raw) ? raw : [];

  return WEEK_DAYS.map((day, index) => {
    const entry = source[index];

    if (typeof entry === "number") {
      return { day, percent: clamp(entry, 0, 100) };
    }

    if (isWeeklyPointObject(entry)) {
      return {
        day: String(entry.day ?? day),
        percent: clamp(Number(entry.percent ?? entry.value ?? 0), 0, 100),
      };
    }

    return { day, percent: 0 };
  });
};

export const hasMeaningfulWeeklyData = (data: WeeklyPoint[]) =>
  data.some((point) => point.percent > 0);

export const getAverage = (data: WeeklyPoint[]) => {
  if (!data.length) return 0;

  const total = data.reduce((sum, point) => sum + point.percent, 0);
  return Math.round((total / data.length) * 10) / 10;
};
