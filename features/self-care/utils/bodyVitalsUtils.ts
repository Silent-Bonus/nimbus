import type { SomaticGender } from "@/features/self-care/types/bodyVitals";

// Shared body-vitals input, formatting, and lightweight calculation helpers.
// These are used by screens, services, and UI components, so they live at the
// feature layer instead of under `components/`.

export const HEIGHT_MIN_CM = 137;
export const HEIGHT_MAX_CM = 198;

export type ActivityLevelKey = "sedentary" | "active" | "optimal";

export type ActivityLevelOption = {
  key: ActivityLevelKey;
  label: string;
  value: number;
  description: string;
};

export const ACTIVITY_LEVEL_OPTIONS: ActivityLevelOption[] = [
  {
    key: "sedentary",
    label: "Sedentary",
    value: 0.2,
    description: "Low output",
  },
  {
    key: "active",
    label: "Active",
    value: 0.55,
    description: "Balanced",
  },
  {
    key: "optimal",
    label: "Optimal",
    value: 0.85,
    description: "High flow",
  },
];

export const sanitizeIntegerInput = (text: string) =>
  text.replace(/[^0-9]/g, "");

export const sanitizeDecimalInput = (text: string, decimals = 1) => {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const [whole = "", fraction = ""] = cleaned.split(".");

  if (!cleaned.includes(".")) {
    return whole;
  }

  const nextFraction = fraction.slice(0, decimals);
  return `${whole}.${nextFraction}`;
};

export const parseMetricNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatFlexibleDecimal = (value: number, decimals = 1) => {
  const rounded = Number(value.toFixed(decimals));
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(decimals);
};

const formatWeight = (value: number) => formatFlexibleDecimal(value, 1);

export const clampHeightCm = (value: number) =>
  Math.max(HEIGHT_MIN_CM, Math.min(HEIGHT_MAX_CM, value));

export const stepWeight = (current: string, delta: number) => {
  const next = parseMetricNumber(current, 0) + delta;
  return formatWeight(Math.max(35, Math.min(220, next)));
};

export const calculateProteinTarget = (
  weightKg: number,
  activityLevel: number
) => {
  const factor = 1.55 + activityLevel * 0.75;
  return Math.max(0, Math.round((weightKg * factor) / 5) * 5);
};

export const calculateMaintenanceCalories = (params: {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: SomaticGender;
  activityLevel: number;
}) => {
  const { age, heightCm, weightKg, gender, activityLevel } = params;
  const genderBias = gender === "masculine" ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderBias;
  const multiplier = 1.12 + activityLevel * 0.42;
  return Math.max(0, Math.round((bmr * multiplier) / 25) * 25);
};

export const deriveArchitecture = (params: {
  heightCm: number;
  weightKg: number;
  activityLevel: number;
}) => {
  const { heightCm, weightKg, activityLevel } = params;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM || 1);

  if (bmi < 19.5) {
    return activityLevel > 0.55 ? "Ecto-Mesomorph" : "Ectomorph";
  }

  if (bmi < 23.5) {
    return activityLevel > 0.6 ? "Ecto-Mesomorph" : "Balanced Mesomorph";
  }

  if (bmi < 27.5) {
    return activityLevel > 0.55 ? "Meso-Endomorph" : "Mesomorph";
  }

  if (bmi < 31) {
    return "Endo-Mesomorph";
  }

  return "Endomorph";
};

export const getActivityOption = (value: number) => {
  return ACTIVITY_LEVEL_OPTIONS.reduce((best, option) => {
    if (!best) return option;
    return Math.abs(option.value - value) < Math.abs(best.value - value)
      ? option
      : best;
  }, ACTIVITY_LEVEL_OPTIONS[1]);
};
