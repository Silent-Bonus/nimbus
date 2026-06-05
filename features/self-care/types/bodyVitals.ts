import type { SomaticGender } from "@/features/self-care/components/body-vitals/types";

export type BodyVitalsActivityLevel = "sedentary" | "active" | "optimal" | string;
export type BodyVitalsApiGender = "male" | "female";
export type BodyVitalsApiActivityLevel = "sedentary" | "active" | "optimal";

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
};

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

export type BodyVitalsCalculatorReadiness = {
  protein?: boolean;
  calories?: boolean;
  body_shape?: boolean;
};

export type BodyVitalsBanner = {
  show?: boolean | null;
  message?: string | null;
};

export type BodyVitalsContext = {
  profile?: BodyVitalsProfile | null;
  prefill?: BodyVitalsPrefill | null;
  saved_summary?: BodyVitalsSavedSummary | null;
  missing_fields?: string[] | null;
  profile_status?: string | null;
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
