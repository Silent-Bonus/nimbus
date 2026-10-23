import type {
  BodyVitalsBanner,
  BodyVitalsBodyShape,
  BodyVitalsDietGoal,
  BodyVitalsFormulaVersions,
  BodyVitalsMeasurements,
} from "@/features/self-care/types/bodyVitals";

// Centralized vitals fallbacks used while the backend response remains
// partially normalized client-side across storage, calculators, and panels.
export const DEFAULT_PROFILE_COMPLETION_FIELDS = [
  "sleep_time",
  "sleep_duration",
];

export const DEFAULT_FORMULA_VERSIONS: BodyVitalsFormulaVersions = {
  calories: "mifflin-st-jeor-v1",
  protein: "lbm-v1",
  diet: "macro-balance-v1",
  body_shape: "ratio-blueprint-v1",
};

export const DEFAULT_MEASUREMENTS: BodyVitalsMeasurements = {
  bust_cm: null,
  waist_cm: null,
  high_hip_cm: null,
  low_hip_cm: null,
};

export const DEFAULT_DIET_GOAL: BodyVitalsDietGoal = {
  carbs_goal: 233,
  fats_goal: 65,
  fiber_goal: 27,
  tip: "Use balanced carbs and fats, and keep fiber high enough to support satiety and digestion.",
};

export const DEFAULT_BODY_SHAPE: BodyVitalsBodyShape = {
  code: "pear_hourglass_hybrid",
  label: "Pear / Hourglass Hybrid",
  confidence: 0.86,
  movement_strategy:
    "Blend glute activation with core work and balanced upper-body volume.",
  measurements: DEFAULT_MEASUREMENTS,
};

export const DEFAULT_BANNER: BodyVitalsBanner = {
  show: true,
  type: "profile_completion",
  message: "Add sleep time and sleep duration to complete your vitals profile.",
};
