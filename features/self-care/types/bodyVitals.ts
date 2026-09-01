import type { SomaticGender } from "@/features/self-care/components/body-vitals/types";

export type BodyVitalsActivityLevel = "sedentary" | "active" | "optimal" | string;
export type BodyVitalsApiGender = "male" | "female";
export type BodyVitalsApiActivityLevel = "sedentary" | "active" | "optimal";
export type BodyVitalsBodyShapeApiActivityLevel =
  | BodyVitalsApiActivityLevel
  | "moderate";

export type BodyVitalsMeasurements = {
  bust_cm?: number | null;
  waist_cm?: number | null;
  high_hip_cm?: number | null;
  low_hip_cm?: number | null;
};

export type BodyVitalsPrefill = {
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  gender?: "male" | "female" | null;
  gender_prefer_not_to_say?: boolean | null;
  activity_level?: BodyVitalsActivityLevel | null;
  sleep_time?: string | null;
  sleep_duration?: number | null;
  start_of_day?: string | null;
  measurements?: BodyVitalsMeasurements | null;
};

export type BodyVitalsInputs = BodyVitalsPrefill;

export type BodyVitalsProteinGoal = {
  total_requirement?: number | null;
  meal_one?: number | null;
  meal_two?: number | null;
  meal_three?: number | null;
  unit?: string | null;
  protein_target_g?: number | null;
  protein_per_meal_g?: number | null;
  tip?: string | null;
};

export type BodyVitalsCalorieGoal = {
  total_calorie?: number | null;
  maintenance_calories?: number | null;
  optimal_burn_calories?: number | null;
  build_calories?: number | null;
  unit?: string | null;
  maintaince?: number | null;
  burn?: number | null;
  build?: number | null;
  tip?: string | null;
};

export type BodyVitalsDietGoal = {
  carbs_goal?: number | null;
  fats_goal?: number | null;
  fiber_goal?: number | null;
  tip?: string | null;
};

export type BodyVitalsBodyShape = {
  code?: string | null;
  label?: string | null;
  confidence?: number | null;
  movement_strategy?: string | null;
  measurements?: BodyVitalsMeasurements | null;
};

export type BodyVitalsProfile = {
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  gender?: "male" | "female" | null;
  gender_prefer_not_to_say?: boolean | null;
  activity_level?: BodyVitalsActivityLevel | null;
  sleep_time?: string | null;
  sleep_duration?: number | null;
  start_of_day?: string | null;
  protein_goal?: BodyVitalsProteinGoal | null;
  calorie_goal?: BodyVitalsCalorieGoal | null;
  diet_goal?: BodyVitalsDietGoal | null;
  bmr?: number | null;
  measurements?: BodyVitalsMeasurements | null;
  body_shape_code?: string | null;
  body_shape_label?: string | null;
  body_shape_confidence?: number | null;
  movement_strategy?: string | null;
  metabolic_insight?: string | null;
  vitals_formula_version?: string | null;
  vitals_last_calculated_at?: string | null;
  vitals_updated_at?: string | null;
};

export type BodyVitalsSavedSummary = {
  is_generated?: boolean | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  gender?: "male" | "female" | null;
  gender_prefer_not_to_say?: boolean | null;
  calorie_goal?: number | null;
  protein_goal?: number | null;
  bmr?: number | null;
  maintenance_calories?: number | null;
  optimal_burn_calories?: number | null;
  protein_target_g?: number | null;
  protein_per_meal_g?: number | null;
  body_shape_code?: string | null;
  body_shape_label?: string | null;
  body_shape_confidence?: number | null;
  movement_strategy?: string | null;
  metabolic_insight?: string | null;
  vitals_formula_version?: string | null;
  calculated_at?: string | null;
};

export type BodyVitalsFormulaVersions = {
  calories?: string | null;
  protein?: string | null;
  diet?: string | null;
  body_shape?: string | null;
};

export type BodyVitalsOutputs = {
  bmr?: number | null;
  protein_goal?: BodyVitalsProteinGoal | null;
  calorie_goal?: BodyVitalsCalorieGoal | null;
  diet_goal?: BodyVitalsDietGoal | null;
  body_shape?: BodyVitalsBodyShape | null;
  metabolic_insight?: string | null;
};

export type BodyVitalsLatestSnapshot = {
  snapshot_id?: number | null;
  source?: string | null;
  calculated_at?: string | null;
  status?: string | null;
  formula_versions?: BodyVitalsFormulaVersions | null;
  outputs?: BodyVitalsOutputs | null;
};

export type BodyVitalsCalculatorReadiness = {
  protein?: boolean;
  calories?: boolean;
  body_shape?: boolean;
};

export type BodyVitalsMissingFields = {
  profile_completion: string[];
  calculators: {
    calories: string[];
    protein: string[];
    body_shape: string[];
  };
};

export type BodyVitalsBanner = {
  show?: boolean | null;
  type?: string | null;
  message?: string | null;
};

export type BodyVitalsContext = {
  inputs?: BodyVitalsInputs | null;
  latest_snapshot?: BodyVitalsLatestSnapshot | null;
  profile?: BodyVitalsProfile | null;
  prefill?: BodyVitalsPrefill | null;
  saved_summary?: BodyVitalsSavedSummary | null;
  missing_fields?: BodyVitalsMissingFields | null;
  profile_status?: string | null;
  days_since_last_snapshot?: number | null;
  days_since_last_update?: number | null;
  calculator_readiness?: BodyVitalsCalculatorReadiness | null;
  banner?: BodyVitalsBanner | null;
};

export type BodyVitalsFormState = {
  gender: SomaticGender;
  age: string;
  weight: string;
  height: string;
  activityLevel: number;
};

export type BodyVitalsCalculationType =
  | "protein"
  | "calories"
  | "body_shape"
  | "all";

export type BodyVitalsModuleCalculationPayload = {
  calculation_type: "protein" | "calories";
  save_to_profile: true;
  vitals: {
    age: number;
    weight_kg: number;
    height_cm: number;
    activity_level: BodyVitalsApiActivityLevel;
    gender?: BodyVitalsApiGender;
  };
};

export type BodyVitalsBodyShapeCalculationPayload = {
  calculation_type: "body_shape";
  save_to_profile: true;
  vitals: {
    gender: BodyVitalsApiGender;
    age: number;
    weight_kg: number;
    height_cm: number;
    activity_level: BodyVitalsBodyShapeApiActivityLevel;
    measurements: {
      bust_cm: number;
      waist_cm: number;
      high_hip_cm: number;
      low_hip_cm: number;
    };
  };
};

export type BodyVitalsAllCalculationPayload = {
  calculation_type: "all";
  save_to_profile: true;
};

export type BodyVitalsCalculationPayload =
  | BodyVitalsModuleCalculationPayload
  | BodyVitalsBodyShapeCalculationPayload
  | BodyVitalsAllCalculationPayload;

export type BodyVitalsProfilePatchPayload = {
  age: number;
  height_cm: number;
  weight_kg: number;
  gender: BodyVitalsApiGender;
  activity_level: BodyVitalsApiActivityLevel;
};

export type BodyVitalsCalculationResults = BodyVitalsOutputs;

export type BodyVitalsTemporaryCalculationData = {
  status?: string | null;
  saved_to_profile?: boolean | null;
  recalculated_modules?: string[] | null;
  reused_modules?: string[] | null;
  results?: BodyVitalsCalculationResults | null;
  bmr?: number | null;
  maintenance_calories?: number | null;
  optimal_burn_calories?: number | null;
  build_calories?: number | null;
  protein_target_g?: number | null;
  protein_per_meal_g?: number | null;
  diet_goal?: BodyVitalsDietGoal | null;
  body_shape?: BodyVitalsBodyShape | null;
  metabolic_insight?: string | null;
  trend?: {
    weight_change_30d?: number | null;
    waist_change_30d?: number | null;
    runs_count?: number | null;
  } | null;
  missing_modules?: string[] | null;
  missing_fields?: string[] | null;
  formula_version?: string | null;
};

export type BodyVitalsCalculationApiResponse = {
  success: boolean;
  message?: string;
  data?: BodyVitalsTemporaryCalculationData | null;
};

export type BodyVitalsNormalizedCalculationResponse = {
  success: boolean;
  message: string;
  data: {
    status: string;
    saved_to_profile: boolean;
    recalculated_modules: string[];
    reused_modules: string[];
    results: BodyVitalsCalculationResults;
  };
};

export type BodyVitalsTrendRange = "7d" | "30d" | "90d";
export type BodyVitalsTrendMetric = "all" | "weight" | "waist";

export type BodyVitalsTrendSummary = {
  weight_change_30d?: number | null;
  waist_change_30d?: number | null;
  snapshots_count?: number | null;
};

export type BodyVitalsTrendTimelinePoint = {
  date: string;
  weight_kg?: number | null;
  waist_cm?: number | null;
};

export type BodyVitalsTrendResponse = {
  range: BodyVitalsTrendRange;
  metric: BodyVitalsTrendMetric;
  summary: BodyVitalsTrendSummary;
  timeline: BodyVitalsTrendTimelinePoint[];
};

export type BodyVitalsUpdatePayload = {
  calculation_type: "all";
  save_to_profile: true;
  vitals: {
    gender: BodyVitalsApiGender;
    age: number;
    weight_kg: number;
    height_cm: number;
    activity_level: BodyVitalsApiActivityLevel;
  };
};
