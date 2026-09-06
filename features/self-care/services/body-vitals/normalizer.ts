import type {
  BodyVitalsBanner,
  BodyVitalsBodyShape,
  BodyVitalsCalorieGoal,
  BodyVitalsCalculatorReadiness,
  BodyVitalsContext,
  BodyVitalsDietGoal,
  BodyVitalsFormulaVersions,
  BodyVitalsInputs,
  BodyVitalsLatestSnapshot,
  BodyVitalsMeasurements,
  BodyVitalsMissingFields,
  BodyVitalsOutputs,
  BodyVitalsProfile,
  BodyVitalsProteinGoal,
  BodyVitalsSavedSummary,
} from "@/features/self-care/types/bodyVitals";
import {
  DEFAULT_BANNER,
  DEFAULT_BODY_SHAPE,
  DEFAULT_CALORIE_GOAL,
  DEFAULT_DIET_GOAL,
  DEFAULT_FORMULA_VERSIONS,
  DEFAULT_MEASUREMENTS,
  DEFAULT_PROFILE_COMPLETION_FIELDS,
  DEFAULT_PROTEIN_GOAL,
} from "./defaults";

// Normalizes the backend vitals context into one shape that legacy and new UI
// surfaces can both consume safely.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

function toGender<T extends "male" | "female">(value: unknown): T | null {
  return value === "male" || value === "female" ? (value as T) : null;
}

function readStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const next = value.filter((item): item is string => typeof item === "string");
  return next.length > 0 ? next : [...fallback];
}

function normalizeMeasurements(raw: unknown): BodyVitalsMeasurements {
  const source = isRecord(raw) ? raw : {};

  return {
    bust_cm: toNumber(source.bust_cm),
    waist_cm: toNumber(source.waist_cm),
    high_hip_cm: toNumber(source.high_hip_cm),
    low_hip_cm: toNumber(source.low_hip_cm),
  };
}

function normalizeProteinGoal(raw: unknown): BodyVitalsProteinGoal {
  const source = isRecord(raw) ? raw : {};

  return {
    total_requirement:
      toNumber(source.total_requirement) ?? DEFAULT_PROTEIN_GOAL.total_requirement,
    meal_one: toNumber(source.meal_one) ?? DEFAULT_PROTEIN_GOAL.meal_one,
    meal_two: toNumber(source.meal_two) ?? DEFAULT_PROTEIN_GOAL.meal_two,
    meal_three: toNumber(source.meal_three) ?? DEFAULT_PROTEIN_GOAL.meal_three,
    unit: toStringOrNull(source.unit) ?? DEFAULT_PROTEIN_GOAL.unit,
    protein_target_g:
      toNumber(source.protein_target_g) ?? DEFAULT_PROTEIN_GOAL.protein_target_g,
    protein_per_meal_g:
      toNumber(source.protein_per_meal_g) ??
      DEFAULT_PROTEIN_GOAL.protein_per_meal_g,
    tip: toStringOrNull(source.tip) ?? DEFAULT_PROTEIN_GOAL.tip,
  };
}

function normalizeCalorieGoal(raw: unknown): BodyVitalsCalorieGoal {
  const source = isRecord(raw) ? raw : {};
  const totalCalorie =
    toNumber(source.total_calorie) ??
    toNumber(source.optimal_burn_calories) ??
    toNumber(source.burn) ??
    DEFAULT_CALORIE_GOAL.total_calorie;
  const maintenanceCalories =
    toNumber(source.maintenance_calories) ??
    toNumber(source.maintaince) ??
    DEFAULT_CALORIE_GOAL.maintenance_calories;
  const optimalBurnCalories =
    toNumber(source.optimal_burn_calories) ??
    toNumber(source.burn) ??
    DEFAULT_CALORIE_GOAL.optimal_burn_calories;
  const buildCalories =
    toNumber(source.build_calories) ??
    toNumber(source.build) ??
    DEFAULT_CALORIE_GOAL.build_calories;

  return {
    total_calorie: totalCalorie,
    maintenance_calories: maintenanceCalories,
    optimal_burn_calories: optimalBurnCalories,
    build_calories: buildCalories,
    maintaince: maintenanceCalories,
    burn: optimalBurnCalories,
    build: buildCalories,
    unit: toStringOrNull(source.unit) ?? DEFAULT_CALORIE_GOAL.unit,
    tip: toStringOrNull(source.tip) ?? DEFAULT_CALORIE_GOAL.tip,
  };
}

function normalizeDietGoal(raw: unknown): BodyVitalsDietGoal {
  const source = isRecord(raw) ? raw : {};

  return {
    carbs_goal: toNumber(source.carbs_goal) ?? DEFAULT_DIET_GOAL.carbs_goal,
    fats_goal: toNumber(source.fats_goal) ?? DEFAULT_DIET_GOAL.fats_goal,
    fiber_goal: toNumber(source.fiber_goal) ?? DEFAULT_DIET_GOAL.fiber_goal,
    tip: toStringOrNull(source.tip) ?? DEFAULT_DIET_GOAL.tip,
  };
}

function normalizeBodyShape(raw: unknown): BodyVitalsBodyShape {
  const source = isRecord(raw) ? raw : {};

  return {
    code: toStringOrNull(source.code) ?? DEFAULT_BODY_SHAPE.code,
    label: toStringOrNull(source.label) ?? DEFAULT_BODY_SHAPE.label,
    confidence: toNumber(source.confidence) ?? DEFAULT_BODY_SHAPE.confidence,
    movement_strategy:
      toStringOrNull(source.movement_strategy) ??
      DEFAULT_BODY_SHAPE.movement_strategy,
    measurements: normalizeMeasurements(source.measurements),
  };
}

function normalizeFormulaVersions(raw: unknown): BodyVitalsFormulaVersions {
  const source = isRecord(raw) ? raw : {};

  return {
    calories: toStringOrNull(source.calories) ?? DEFAULT_FORMULA_VERSIONS.calories,
    protein: toStringOrNull(source.protein) ?? DEFAULT_FORMULA_VERSIONS.protein,
    diet: toStringOrNull(source.diet) ?? DEFAULT_FORMULA_VERSIONS.diet,
    body_shape:
      toStringOrNull(source.body_shape) ?? DEFAULT_FORMULA_VERSIONS.body_shape,
  };
}

function normalizeInputs(raw: unknown, legacyProfile: unknown): BodyVitalsInputs {
  const source = isRecord(raw) ? raw : {};
  const legacy = isRecord(legacyProfile) ? legacyProfile : {};

  return {
    height_cm: toNumber(source.height_cm) ?? toNumber(legacy.height_cm),
    weight_kg: toNumber(source.weight_kg) ?? toNumber(legacy.weight_kg),
    age: toNumber(source.age) ?? toNumber(legacy.age),
    gender: toGender(source.gender) ?? toGender(legacy.gender) ?? "female",
    gender_prefer_not_to_say:
      toBoolean(source.gender_prefer_not_to_say) ??
      toBoolean(legacy.gender_prefer_not_to_say) ??
      false,
    activity_level:
      toStringOrNull(source.activity_level) ??
      toStringOrNull(legacy.activity_level) ??
      "active",
    sleep_time: toStringOrNull(source.sleep_time) ?? toStringOrNull(legacy.sleep_time),
    sleep_duration:
      toNumber(source.sleep_duration) ?? toNumber(legacy.sleep_duration),
    start_of_day:
      toStringOrNull(source.start_of_day) ?? toStringOrNull(legacy.start_of_day),
    measurements:
      normalizeMeasurements(source.measurements ?? legacy.measurements ?? DEFAULT_MEASUREMENTS),
  };
}

function normalizeLegacyProfile(raw: unknown): BodyVitalsProfile {
  const source = isRecord(raw) ? raw : {};
  const calorieGoal = normalizeCalorieGoal(source.calorie_goal);
  const proteinGoal = normalizeProteinGoal(source.protein_goal);
  const bodyShape = normalizeBodyShape({
    code: source.body_shape_code,
    label: source.body_shape_label,
    confidence: source.body_shape_confidence,
    movement_strategy: source.movement_strategy,
    measurements: source.measurements,
  });

  return {
    height_cm: toNumber(source.height_cm),
    weight_kg: toNumber(source.weight_kg),
    age: toNumber(source.age),
    gender: toGender(source.gender),
    gender_prefer_not_to_say: toBoolean(source.gender_prefer_not_to_say),
    activity_level: toStringOrNull(source.activity_level),
    sleep_time: toStringOrNull(source.sleep_time),
    sleep_duration: toNumber(source.sleep_duration),
    start_of_day: toStringOrNull(source.start_of_day),
    protein_goal: proteinGoal,
    calorie_goal: calorieGoal,
    diet_goal: normalizeDietGoal(source.diet_goal),
    bmr: toNumber(source.bmr),
    measurements: normalizeMeasurements(source.measurements),
    body_shape_code: bodyShape.code,
    body_shape_label: bodyShape.label,
    body_shape_confidence: bodyShape.confidence,
    movement_strategy: bodyShape.movement_strategy,
    metabolic_insight: toStringOrNull(source.metabolic_insight),
    vitals_formula_version:
      toStringOrNull(source.vitals_formula_version) ??
      DEFAULT_FORMULA_VERSIONS.body_shape,
    vitals_last_calculated_at: toStringOrNull(source.vitals_last_calculated_at),
    vitals_updated_at:
      toStringOrNull(source.vitals_updated_at) ??
      toStringOrNull(source.vitals_last_calculated_at),
  };
}

function normalizeOutputs(raw: unknown, legacyProfile: BodyVitalsProfile): BodyVitalsOutputs {
  const source = isRecord(raw) ? raw : {};
  const bodyShape = normalizeBodyShape(
    source.body_shape ?? {
      code: legacyProfile.body_shape_code,
      label: legacyProfile.body_shape_label,
      confidence: legacyProfile.body_shape_confidence,
      movement_strategy: legacyProfile.movement_strategy,
      measurements: legacyProfile.measurements,
    }
  );

  return {
    bmr: toNumber(source.bmr) ?? legacyProfile.bmr,
    protein_goal: normalizeProteinGoal(source.protein_goal ?? legacyProfile.protein_goal),
    calorie_goal: normalizeCalorieGoal(source.calorie_goal ?? legacyProfile.calorie_goal),
    diet_goal: normalizeDietGoal(source.diet_goal ?? legacyProfile.diet_goal),
    body_shape: bodyShape,
    metabolic_insight:
      toStringOrNull(source.metabolic_insight) ??
      legacyProfile.metabolic_insight ??
      `Your body blueprint reads as ${bodyShape.label?.toLowerCase()}. ${bodyShape.movement_strategy}`,
  };
}

function normalizeLatestSnapshot(
  raw: unknown,
  legacyProfile: BodyVitalsProfile
): BodyVitalsLatestSnapshot {
  const source = isRecord(raw) ? raw : {};
  const outputs = normalizeOutputs(source.outputs, legacyProfile);
  const calculatedAt =
    toStringOrNull(source.calculated_at) ??
    legacyProfile.vitals_last_calculated_at ??
    legacyProfile.vitals_updated_at;

  return {
    snapshot_id: toNumber(source.snapshot_id),
    source: toStringOrNull(source.source) ?? "vitals",
    calculated_at: calculatedAt,
    status: toStringOrNull(source.status) ?? "available",
    formula_versions: normalizeFormulaVersions(
      source.formula_versions ?? {
        body_shape: legacyProfile.vitals_formula_version,
      }
    ),
    outputs,
  };
}

function normalizeMissingFields(raw: unknown): BodyVitalsMissingFields {
  if (Array.isArray(raw)) {
    return {
      profile_completion: readStringArray(raw, DEFAULT_PROFILE_COMPLETION_FIELDS),
      calculators: {
        calories: [],
        protein: [],
        body_shape: [],
      },
    };
  }

  const source = isRecord(raw) ? raw : {};
  const calculators = isRecord(source.calculators) ? source.calculators : {};

  return {
    profile_completion: readStringArray(
      source.profile_completion,
      DEFAULT_PROFILE_COMPLETION_FIELDS
    ),
    calculators: {
      calories: readStringArray(calculators.calories),
      protein: readStringArray(calculators.protein),
      body_shape: readStringArray(calculators.body_shape),
    },
  };
}

function normalizeCalculatorReadiness(raw: unknown): BodyVitalsCalculatorReadiness {
  const source = isRecord(raw) ? raw : {};

  return {
    calories: toBoolean(source.calories) ?? true,
    protein: toBoolean(source.protein) ?? true,
    body_shape: toBoolean(source.body_shape) ?? true,
  };
}

function normalizeBanner(raw: unknown): BodyVitalsBanner {
  const source = isRecord(raw) ? raw : {};

  return {
    show: toBoolean(source.show) ?? DEFAULT_BANNER.show,
    type: toStringOrNull(source.type) ?? DEFAULT_BANNER.type,
    message: toStringOrNull(source.message) ?? DEFAULT_BANNER.message,
  };
}

function buildSavedSummary(
  inputs: BodyVitalsInputs,
  latestSnapshot: BodyVitalsLatestSnapshot
): BodyVitalsSavedSummary {
  const bodyShape = latestSnapshot.outputs?.body_shape;
  const calorieGoal = latestSnapshot.outputs?.calorie_goal;
  const proteinGoal = latestSnapshot.outputs?.protein_goal;

  return {
    is_generated: latestSnapshot.status === "available",
    height_cm: inputs.height_cm,
    weight_kg: inputs.weight_kg,
    age: inputs.age,
    gender: inputs.gender,
    gender_prefer_not_to_say: inputs.gender_prefer_not_to_say,
    calorie_goal: calorieGoal?.total_calorie,
    protein_goal: proteinGoal?.total_requirement,
    bmr: latestSnapshot.outputs?.bmr,
    maintenance_calories: calorieGoal?.maintenance_calories,
    optimal_burn_calories: calorieGoal?.optimal_burn_calories,
    protein_target_g: proteinGoal?.protein_target_g,
    protein_per_meal_g: proteinGoal?.protein_per_meal_g,
    body_shape_code: bodyShape?.code,
    body_shape_label: bodyShape?.label,
    body_shape_confidence: bodyShape?.confidence,
    movement_strategy: bodyShape?.movement_strategy,
    metabolic_insight: latestSnapshot.outputs?.metabolic_insight,
    vitals_formula_version: latestSnapshot.formula_versions?.body_shape,
    calculated_at: latestSnapshot.calculated_at,
  };
}

export function normalizeBodyVitalsContext(raw: unknown): BodyVitalsContext | null {
  if (!isRecord(raw)) {
    return null;
  }

  const legacyProfile = normalizeLegacyProfile(raw.profile);
  const inputs = normalizeInputs(raw.inputs ?? raw.prefill ?? raw.profile, raw.profile);
  const latestSnapshot = normalizeLatestSnapshot(raw.latest_snapshot, legacyProfile);
  const missingFields = normalizeMissingFields(raw.missing_fields);
  const banner = normalizeBanner(raw.banner);
  const profileStatus =
    toStringOrNull(raw.profile_status) ??
    (missingFields.profile_completion.length > 0 ? "incomplete" : "complete");
  const daysSinceLastSnapshot =
    toNumber(raw.days_since_last_snapshot) ?? toNumber(raw.days_since_last_update) ?? 0;

  return {
    inputs,
    latest_snapshot: latestSnapshot,
    missing_fields: missingFields,
    profile_status: profileStatus,
    days_since_last_snapshot: daysSinceLastSnapshot,
    days_since_last_update: daysSinceLastSnapshot,
    calculator_readiness: normalizeCalculatorReadiness(raw.calculator_readiness),
    banner,

    // Legacy compatibility for existing screens.
    prefill: inputs,
    profile: {
      ...legacyProfile,
      height_cm: inputs.height_cm ?? legacyProfile.height_cm,
      weight_kg: inputs.weight_kg ?? legacyProfile.weight_kg,
      age: inputs.age ?? legacyProfile.age,
      gender: inputs.gender ?? legacyProfile.gender,
      gender_prefer_not_to_say:
        inputs.gender_prefer_not_to_say ?? legacyProfile.gender_prefer_not_to_say,
      activity_level: inputs.activity_level ?? legacyProfile.activity_level,
      sleep_time: inputs.sleep_time ?? legacyProfile.sleep_time,
      sleep_duration: inputs.sleep_duration ?? legacyProfile.sleep_duration,
      start_of_day: inputs.start_of_day ?? legacyProfile.start_of_day,
      protein_goal: latestSnapshot.outputs?.protein_goal ?? legacyProfile.protein_goal,
      calorie_goal: latestSnapshot.outputs?.calorie_goal ?? legacyProfile.calorie_goal,
      diet_goal: latestSnapshot.outputs?.diet_goal ?? legacyProfile.diet_goal,
      bmr: latestSnapshot.outputs?.bmr ?? legacyProfile.bmr,
      body_shape_code:
        latestSnapshot.outputs?.body_shape?.code ?? legacyProfile.body_shape_code,
      body_shape_label:
        latestSnapshot.outputs?.body_shape?.label ?? legacyProfile.body_shape_label,
      body_shape_confidence:
        latestSnapshot.outputs?.body_shape?.confidence ??
        legacyProfile.body_shape_confidence,
      movement_strategy:
        latestSnapshot.outputs?.body_shape?.movement_strategy ??
        legacyProfile.movement_strategy,
      metabolic_insight:
        latestSnapshot.outputs?.metabolic_insight ?? legacyProfile.metabolic_insight,
      vitals_formula_version:
        latestSnapshot.formula_versions?.body_shape ??
        legacyProfile.vitals_formula_version,
      vitals_last_calculated_at:
        latestSnapshot.calculated_at ?? legacyProfile.vitals_last_calculated_at,
      vitals_updated_at:
        latestSnapshot.calculated_at ?? legacyProfile.vitals_updated_at,
    },
    saved_summary: buildSavedSummary(inputs, latestSnapshot),
  };
}
