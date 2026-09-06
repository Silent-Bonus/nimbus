import {
  calculateCalorieVitals,
  calculateProteinVitals,
  getUserDetails,
  patchBodyVitalsProfile,
} from "@/features/auth/services/loginService";
import { syncAndPublishUserProfile } from "@/features/auth/services/userProfileSyncService";
import {
  clampHeightCm,
  getActivityOption,
  parseMetricNumber,
} from "@/features/self-care/utils/bodyVitalsUtils";
import type {
  BodyVitalsCalculationApiResponse,
  BodyVitalsBodyShapeCalculationPayload,
  BodyVitalsCalculationPayload,
  BodyVitalsCalculationResults,
  BodyVitalsApiGender,
  BodyVitalsCalorieGoal,
  BodyVitalsCalculationType,
  BodyVitalsContext,
  BodyVitalsDietGoal,
  BodyVitalsFormState,
  BodyVitalsNormalizedCalculationResponse,
  BodyVitalsProfilePatchPayload,
  BodyVitalsProteinGoal,
} from "@/features/self-care/types/bodyVitals";
import {
  DEFAULT_BODY_SHAPE,
  DEFAULT_BMR,
  DEFAULT_CALORIE_GOAL,
  DEFAULT_DIET_GOAL,
  DEFAULT_PROTEIN_GOAL,
} from "./defaults";
import {
  getStoredBodyVitalsContext,
  resolveBodyVitalsFormState,
  DEFAULT_BODY_VITALS_FORM,
} from "./storage";

// These fallbacks keep panel and calculation flows usable while the API
// response shape is still partially normalized client-side.

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

function unique(items: (string | null | undefined)[]): string[] {
  return Array.from(
    new Set(
      items.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    )
  );
}

function resolveCommonVitals(form: BodyVitalsFormState, savedContext: BodyVitalsContext | null) {
  const fallback = resolveBodyVitalsFormState(
    savedContext,
    DEFAULT_BODY_VITALS_FORM
  );

  const age = parseMetricNumber(
    form.age,
    parseMetricNumber(fallback.age, parseMetricNumber(DEFAULT_BODY_VITALS_FORM.age, 32))
  );
  const weightKg = parseMetricNumber(
    form.weight,
    parseMetricNumber(
      fallback.weight,
      parseMetricNumber(DEFAULT_BODY_VITALS_FORM.weight, 74.5)
    )
  );
  const heightCm = clampHeightCm(
    parseMetricNumber(
      form.height,
      parseMetricNumber(
        fallback.height,
        parseMetricNumber(DEFAULT_BODY_VITALS_FORM.height, 182)
      )
    )
  );

  return {
    gender: mapSomaticGenderToApiGender(form.gender),
    age: Math.round(age),
    weight_kg: Number(weightKg.toFixed(1)),
    height_cm: Math.round(heightCm),
    activity_level: getActivityOption(form.activityLevel).key as BodyVitalsProfilePatchPayload["activity_level"],
  };
}

function resolveFallbackResults(savedContext: BodyVitalsContext | null | undefined): BodyVitalsCalculationResults {
  const outputs = savedContext?.latest_snapshot?.outputs;
  const profile = savedContext?.profile;
  const savedSummary = savedContext?.saved_summary;

  const maintenanceCalories =
    outputs?.calorie_goal?.maintenance_calories ??
    profile?.calorie_goal?.maintenance_calories ??
    savedSummary?.maintenance_calories ??
    DEFAULT_CALORIE_GOAL.maintenance_calories;
  const optimalBurnCalories =
    outputs?.calorie_goal?.optimal_burn_calories ??
    profile?.calorie_goal?.optimal_burn_calories ??
    savedSummary?.optimal_burn_calories ??
    DEFAULT_CALORIE_GOAL.optimal_burn_calories;
  const buildCalories =
    outputs?.calorie_goal?.build_calories ??
    profile?.calorie_goal?.build_calories ??
    DEFAULT_CALORIE_GOAL.build_calories;

  return {
    bmr: outputs?.bmr ?? profile?.bmr ?? savedSummary?.bmr ?? DEFAULT_BMR,
    protein_goal: {
      total_requirement:
        outputs?.protein_goal?.total_requirement ??
        profile?.protein_goal?.total_requirement ??
        DEFAULT_PROTEIN_GOAL.total_requirement,
      meal_one:
        outputs?.protein_goal?.meal_one ??
        profile?.protein_goal?.meal_one ??
        DEFAULT_PROTEIN_GOAL.meal_one,
      meal_two:
        outputs?.protein_goal?.meal_two ??
        profile?.protein_goal?.meal_two ??
        DEFAULT_PROTEIN_GOAL.meal_two,
      meal_three:
        outputs?.protein_goal?.meal_three ??
        profile?.protein_goal?.meal_three ??
        DEFAULT_PROTEIN_GOAL.meal_three,
      unit:
        outputs?.protein_goal?.unit ??
        profile?.protein_goal?.unit ??
        DEFAULT_PROTEIN_GOAL.unit,
      protein_target_g:
        outputs?.protein_goal?.protein_target_g ??
        profile?.protein_goal?.protein_target_g ??
        savedSummary?.protein_target_g ??
        DEFAULT_PROTEIN_GOAL.protein_target_g,
      protein_per_meal_g:
        outputs?.protein_goal?.protein_per_meal_g ??
        profile?.protein_goal?.protein_per_meal_g ??
        savedSummary?.protein_per_meal_g ??
        DEFAULT_PROTEIN_GOAL.protein_per_meal_g,
      tip:
        outputs?.protein_goal?.tip ??
        profile?.protein_goal?.tip ??
        DEFAULT_PROTEIN_GOAL.tip,
    },
    calorie_goal: {
      total_calorie:
        outputs?.calorie_goal?.total_calorie ??
        profile?.calorie_goal?.total_calorie ??
        profile?.calorie_goal?.optimal_burn_calories ??
        savedSummary?.calorie_goal ??
        optimalBurnCalories,
      maintenance_calories: maintenanceCalories,
      optimal_burn_calories: optimalBurnCalories,
      build_calories: buildCalories,
      maintaince: maintenanceCalories,
      burn: optimalBurnCalories,
      build: buildCalories,
      unit:
        outputs?.calorie_goal?.unit ??
        profile?.calorie_goal?.unit ??
        DEFAULT_CALORIE_GOAL.unit,
      tip:
        outputs?.calorie_goal?.tip ??
        profile?.calorie_goal?.tip ??
        DEFAULT_CALORIE_GOAL.tip,
    },
    diet_goal: {
      carbs_goal:
        outputs?.diet_goal?.carbs_goal ??
        profile?.diet_goal?.carbs_goal ??
        DEFAULT_DIET_GOAL.carbs_goal,
      fats_goal:
        outputs?.diet_goal?.fats_goal ??
        profile?.diet_goal?.fats_goal ??
        DEFAULT_DIET_GOAL.fats_goal,
      fiber_goal:
        outputs?.diet_goal?.fiber_goal ??
        profile?.diet_goal?.fiber_goal ??
        DEFAULT_DIET_GOAL.fiber_goal,
      tip:
        outputs?.diet_goal?.tip ??
        profile?.diet_goal?.tip ??
        DEFAULT_DIET_GOAL.tip,
    },
    body_shape: {
      code:
        outputs?.body_shape?.code ??
        profile?.body_shape_code ??
        savedSummary?.body_shape_code ??
        DEFAULT_BODY_SHAPE.code,
      label:
        outputs?.body_shape?.label ??
        profile?.body_shape_label ??
        savedSummary?.body_shape_label ??
        DEFAULT_BODY_SHAPE.label,
      confidence:
        outputs?.body_shape?.confidence ??
        profile?.body_shape_confidence ??
        savedSummary?.body_shape_confidence ??
        DEFAULT_BODY_SHAPE.confidence,
      movement_strategy:
        outputs?.body_shape?.movement_strategy ??
        profile?.movement_strategy ??
        savedSummary?.movement_strategy ??
        DEFAULT_BODY_SHAPE.movement_strategy,
      measurements: outputs?.body_shape?.measurements ?? null,
    },
    metabolic_insight:
      outputs?.metabolic_insight ??
      profile?.metabolic_insight ??
      savedSummary?.metabolic_insight ??
      null,
  };
}

function normalizeProteinGoal(
  raw: unknown,
  fallback: BodyVitalsProteinGoal | null | undefined,
  data: BodyVitalsCalculationApiResponse["data"]
): BodyVitalsProteinGoal {
  const source = isRecord(raw) ? raw : {};

  return {
    total_requirement:
      toNumber(source.total_requirement) ??
      fallback?.total_requirement ??
      DEFAULT_PROTEIN_GOAL.total_requirement,
    meal_one:
      toNumber(source.meal_one) ?? fallback?.meal_one ?? DEFAULT_PROTEIN_GOAL.meal_one,
    meal_two:
      toNumber(source.meal_two) ?? fallback?.meal_two ?? DEFAULT_PROTEIN_GOAL.meal_two,
    meal_three:
      toNumber(source.meal_three) ??
      fallback?.meal_three ??
      DEFAULT_PROTEIN_GOAL.meal_three,
    unit: toStringOrNull(source.unit) ?? fallback?.unit ?? DEFAULT_PROTEIN_GOAL.unit,
    protein_target_g:
      toNumber(source.protein_target_g) ??
      data?.protein_target_g ??
      fallback?.protein_target_g ??
      DEFAULT_PROTEIN_GOAL.protein_target_g,
    protein_per_meal_g:
      toNumber(source.protein_per_meal_g) ??
      data?.protein_per_meal_g ??
      fallback?.protein_per_meal_g ??
      DEFAULT_PROTEIN_GOAL.protein_per_meal_g,
    tip: toStringOrNull(source.tip) ?? fallback?.tip ?? DEFAULT_PROTEIN_GOAL.tip,
  };
}

function normalizeCalorieGoal(
  raw: unknown,
  fallback: BodyVitalsCalorieGoal | null | undefined,
  data: BodyVitalsCalculationApiResponse["data"]
): BodyVitalsCalorieGoal {
  const source = isRecord(raw) ? raw : {};
  const maintenanceCalories =
    toNumber(source.maintenance_calories) ??
    data?.maintenance_calories ??
    fallback?.maintenance_calories ??
    fallback?.maintaince ??
    DEFAULT_CALORIE_GOAL.maintenance_calories;
  const optimalBurnCalories =
    toNumber(source.optimal_burn_calories) ??
    data?.optimal_burn_calories ??
    fallback?.optimal_burn_calories ??
    fallback?.burn ??
    DEFAULT_CALORIE_GOAL.optimal_burn_calories;
  const buildCalories =
    toNumber(source.build_calories) ??
    data?.build_calories ??
    fallback?.build_calories ??
    fallback?.build ??
    DEFAULT_CALORIE_GOAL.build_calories;

  return {
    total_calorie:
      toNumber(source.total_calorie) ??
      optimalBurnCalories,
    maintenance_calories: maintenanceCalories,
    optimal_burn_calories: optimalBurnCalories,
    build_calories: buildCalories,
    maintaince: maintenanceCalories,
    burn: optimalBurnCalories,
    build: buildCalories,
    unit: toStringOrNull(source.unit) ?? fallback?.unit ?? DEFAULT_CALORIE_GOAL.unit,
    tip: toStringOrNull(source.tip) ?? fallback?.tip ?? DEFAULT_CALORIE_GOAL.tip,
  };
}

function normalizeDietGoal(
  raw: unknown,
  fallback: BodyVitalsDietGoal | null | undefined
): BodyVitalsDietGoal {
  const source = isRecord(raw) ? raw : {};

  return {
    carbs_goal:
      toNumber(source.carbs_goal) ?? fallback?.carbs_goal ?? DEFAULT_DIET_GOAL.carbs_goal,
    fats_goal:
      toNumber(source.fats_goal) ?? fallback?.fats_goal ?? DEFAULT_DIET_GOAL.fats_goal,
    fiber_goal:
      toNumber(source.fiber_goal) ?? fallback?.fiber_goal ?? DEFAULT_DIET_GOAL.fiber_goal,
    tip: toStringOrNull(source.tip) ?? fallback?.tip ?? DEFAULT_DIET_GOAL.tip,
  };
}

function normalizeBodyShape(raw: unknown, fallback: BodyVitalsCalculationResults["body_shape"]) {
  const source = isRecord(raw) ? raw : {};

  return {
    code: toStringOrNull(source.code) ?? fallback?.code ?? DEFAULT_BODY_SHAPE.code,
    label: toStringOrNull(source.label) ?? fallback?.label ?? DEFAULT_BODY_SHAPE.label,
    confidence:
      toNumber(source.confidence) ?? fallback?.confidence ?? DEFAULT_BODY_SHAPE.confidence,
    movement_strategy:
      toStringOrNull(source.movement_strategy) ??
      fallback?.movement_strategy ??
      DEFAULT_BODY_SHAPE.movement_strategy,
    measurements: isRecord(source.measurements)
      ? {
          bust_cm: toNumber(source.measurements.bust_cm),
          waist_cm: toNumber(source.measurements.waist_cm),
          high_hip_cm: toNumber(source.measurements.high_hip_cm),
          low_hip_cm: toNumber(source.measurements.low_hip_cm),
        }
      : fallback?.measurements ?? null,
  };
}

export function mapSomaticGenderToApiGender(
  gender: BodyVitalsFormState["gender"]
): BodyVitalsApiGender {
  return gender === "feminine" ? "female" : "male";
}

export function buildBodyVitalsCalculatorPayload(
  form: BodyVitalsFormState,
  savedContext: BodyVitalsContext | null,
  calculationType: Extract<BodyVitalsCalculationType, "protein" | "calories">
): BodyVitalsCalculationPayload {
  const vitals = resolveCommonVitals(form, savedContext);

  if (calculationType === "protein") {
    return {
      calculation_type: "protein",
      save_to_profile: true,
      vitals: {
        age: vitals.age,
        weight_kg: vitals.weight_kg,
        height_cm: vitals.height_cm,
        activity_level: vitals.activity_level,
      },
    };
  }

  return {
    calculation_type: "calories",
    save_to_profile: true,
    vitals,
  };
}

export function buildBodyShapeCalculationPayload(
  measurements: {
    bust_cm: number;
    waist_cm: number;
    high_hip_cm: number;
    low_hip_cm: number;
  },
  savedContext: BodyVitalsContext | null
): BodyVitalsBodyShapeCalculationPayload {
  const form = resolveBodyVitalsFormState(
    savedContext,
    DEFAULT_BODY_VITALS_FORM
  );
  const vitals = resolveCommonVitals(form, savedContext);

  return {
    calculation_type: "body_shape",
    save_to_profile: true,
    vitals: {
      gender: vitals.gender,
      age: vitals.age,
      weight_kg: vitals.weight_kg,
      height_cm: vitals.height_cm,
      activity_level:
        vitals.activity_level === "active"
          ? "moderate"
          : vitals.activity_level,
      measurements,
    },
  };
}

export function buildBodyVitalsProfilePatchPayload(
  form: BodyVitalsFormState,
  savedContext: BodyVitalsContext | null
): BodyVitalsProfilePatchPayload {
  const vitals = resolveCommonVitals(form, savedContext);

  return {
    age: vitals.age,
    height_cm: vitals.height_cm,
    weight_kg: vitals.weight_kg,
    gender: vitals.gender,
    activity_level: vitals.activity_level,
  };
}

export async function refreshBodyVitalsContext() {
  try {
    const response = await getUserDetails();

    if (!response?.success || !response.data) {
      return await getStoredBodyVitalsContext();
    }

    const normalizedProfile = await syncAndPublishUserProfile(response.data);

    return normalizedProfile?.vitals_context ?? (await getStoredBodyVitalsContext());
  } catch (error) {
    console.warn("body vitals refresh error", error);
    return await getStoredBodyVitalsContext();
  }
}

export async function saveAndRefreshBodyVitals(
  form: BodyVitalsFormState,
  savedContext: BodyVitalsContext | null
) {
  const profilePayload = buildBodyVitalsProfilePatchPayload(form, savedContext);
  const proteinPayload = buildBodyVitalsCalculatorPayload(
    form,
    savedContext,
    "protein"
  );
  const caloriePayload = buildBodyVitalsCalculatorPayload(
    form,
    savedContext,
    "calories"
  );

  await patchBodyVitalsProfile(profilePayload);

  const [proteinResult, calorieResult] = await Promise.all([
    calculateProteinVitals(proteinPayload),
    calculateCalorieVitals(caloriePayload),
  ]);
  const normalizedProteinResult = normalizeBodyVitalsCalculationResponse(
    proteinResult,
    "protein",
    savedContext
  );
  const normalizedCalorieResult = normalizeBodyVitalsCalculationResponse(
    calorieResult,
    "calories",
    savedContext
  );
  const normalizedResult = mergeBodyVitalsCalculationResponses(
    normalizedProteinResult,
    normalizedCalorieResult
  );

  if (!normalizedResult.success) {
    return {
      normalizedResult,
      refreshedContext: savedContext,
    };
  }

  return {
    normalizedResult,
    refreshedContext: await refreshBodyVitalsContext(),
  };
}

export function normalizeBodyVitalsCalculationResponse(
  response: BodyVitalsCalculationApiResponse,
  calculationType: BodyVitalsCalculationType,
  savedContext: BodyVitalsContext | null = null
): BodyVitalsNormalizedCalculationResponse {
  const data = response.data ?? null;
  const fallbackResults = resolveFallbackResults(savedContext);
  const resultSource = isRecord(data?.results) ? data?.results : null;

  const results: BodyVitalsCalculationResults = {
    bmr:
      toNumber(resultSource?.bmr) ??
      data?.bmr ??
      fallbackResults.bmr ??
      DEFAULT_BMR,
    protein_goal: normalizeProteinGoal(
      resultSource?.protein_goal,
      fallbackResults.protein_goal,
      data
    ),
    calorie_goal: normalizeCalorieGoal(
      resultSource?.calorie_goal,
      fallbackResults.calorie_goal,
      data
    ),
    diet_goal: normalizeDietGoal(
      resultSource?.diet_goal ?? data?.diet_goal,
      fallbackResults.diet_goal
    ),
    body_shape: normalizeBodyShape(
      resultSource?.body_shape ?? data?.body_shape,
      fallbackResults.body_shape
    ),
    metabolic_insight:
      toStringOrNull(resultSource?.metabolic_insight) ??
      data?.metabolic_insight ??
      fallbackResults.metabolic_insight ??
      null,
  };

  const recalculatedModules =
    data?.recalculated_modules && data.recalculated_modules.length > 0
      ? data.recalculated_modules
      : calculationType === "all"
        ? ["protein", "calories", "diet", "body_shape"]
      : calculationType === "body_shape"
        ? ["body_shape"]
      : calculationType === "calories"
        ? ["calories", "diet"]
        : ["protein"];
  const reusedModules =
    data?.reused_modules && data.reused_modules.length > 0
      ? data.reused_modules
      : calculationType === "all"
        ? []
      : calculationType === "body_shape"
        ? ["protein", "calories", "diet"]
      : calculationType === "calories"
        ? ["protein", "body_shape"]
        : ["calories", "diet", "body_shape"];

  return {
    success: response.success,
    message: response.message ?? "Vitals calculated successfully.",
    data: {
      status: data?.status ?? "success",
      saved_to_profile: data?.saved_to_profile ?? true,
      recalculated_modules: unique(recalculatedModules),
      reused_modules: unique(
        reusedModules.filter((module) => !recalculatedModules.includes(module))
      ),
      results,
    },
  };
}

export function mergeBodyVitalsCalculationResponses(
  proteinResponse: BodyVitalsNormalizedCalculationResponse,
  calorieResponse: BodyVitalsNormalizedCalculationResponse
): BodyVitalsNormalizedCalculationResponse {
  const proteinResults = proteinResponse.data.results;
  const calorieResults = calorieResponse.data.results;
  const recalculatedModules = unique([
    ...proteinResponse.data.recalculated_modules,
    ...calorieResponse.data.recalculated_modules,
  ]);

  return {
    success: proteinResponse.success && calorieResponse.success,
    message: calorieResponse.message || proteinResponse.message,
    data: {
      status:
        calorieResponse.data.status === "success" && proteinResponse.data.status === "success"
          ? "success"
          : calorieResponse.data.status || proteinResponse.data.status,
      saved_to_profile:
        proteinResponse.data.saved_to_profile && calorieResponse.data.saved_to_profile,
      recalculated_modules: recalculatedModules,
      reused_modules: unique([
        ...proteinResponse.data.reused_modules,
        ...calorieResponse.data.reused_modules,
      ]).filter((module) => !recalculatedModules.includes(module)),
      results: {
        bmr: calorieResults.bmr ?? proteinResults.bmr ?? DEFAULT_BMR,
        protein_goal: proteinResults.protein_goal ?? calorieResults.protein_goal ?? null,
        calorie_goal: calorieResults.calorie_goal ?? proteinResults.calorie_goal ?? null,
        diet_goal: calorieResults.diet_goal ?? proteinResults.diet_goal ?? null,
        body_shape: calorieResults.body_shape ?? proteinResults.body_shape ?? null,
        metabolic_insight:
          calorieResults.metabolic_insight ?? proteinResults.metabolic_insight ?? null,
      },
    },
  };
}
