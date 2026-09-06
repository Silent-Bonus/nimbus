import type {
  BodyVitalsCalorieGoal,
  BodyVitalsContext,
  BodyVitalsProteinGoal,
} from "@/features/self-care/types/bodyVitals";
import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_PROTEIN_GOAL,
} from "./defaults";

// Panel mappers adapt normalized vitals data into the route and display shapes
// expected by the protein and calorie detail screens.
export type CaloriePanelData = {
  totalCalorie: number;
  maintenanceCalories: number;
  optimalBurnCalories: number;
  buildCalories: number;
  unit: string;
  tip: string;
  source: "api" | "mock";
};

export type CaloriePanelTier = {
  key: "maintenance" | "burn" | "build";
  label: string;
  title: string;
  calories: number;
  highlight?: boolean;
};

export type CaloriePanelParams = {
  total_calorie?: string | string[];
  maintenance_calories?: string | string[];
  optimal_burn_calories?: string | string[];
  build?: string | string[];
  burn?: string | string[];
  unit?: string | string[];
  tip?: string | string[];
  calories?: string | string[];
  maintenanceCalories?: string | string[];
  targetCalories?: string | string[];
  maintenance?: string | string[];
};

export type ProteinPanelData = {
  totalRequirement: number;
  mealOne: number;
  mealTwo: number;
  mealThree: number;
  unit: string;
  tip: string;
  source: "api" | "mock";
};

export type ProteinPanelMealSlot = {
  key: "meal-1" | "meal-2" | "meal-3";
  label: string;
  grams: number;
};

export type ProteinPanelParams = {
  total_requirement?: string | string[];
  meal_one?: string | string[];
  meal_two?: string | string[];
  meal_three?: string | string[];
  unit?: string | string[];
  tip?: string | string[];
  protein?: string | string[];
};

const FALLBACK_CALORIE_PANEL_DATA: CaloriePanelData = {
  totalCalorie: DEFAULT_CALORIE_GOAL.total_calorie ?? 1949,
  maintenanceCalories: DEFAULT_CALORIE_GOAL.maintenance_calories ?? 2199,
  optimalBurnCalories: DEFAULT_CALORIE_GOAL.optimal_burn_calories ?? 1949,
  buildCalories: DEFAULT_CALORIE_GOAL.build_calories ?? 2449,
  unit: DEFAULT_CALORIE_GOAL.unit ?? "kcal",
  tip:
    DEFAULT_CALORIE_GOAL.tip ??
    "This is a larger deficit. Watch recovery, hunger, and training performance closely.",
  source: "mock",
};

const FALLBACK_PROTEIN_PANEL_DATA: ProteinPanelData = {
  totalRequirement: DEFAULT_PROTEIN_GOAL.total_requirement ?? 124,
  mealOne: DEFAULT_PROTEIN_GOAL.meal_one ?? 29,
  mealTwo: DEFAULT_PROTEIN_GOAL.meal_two ?? 34,
  mealThree: DEFAULT_PROTEIN_GOAL.meal_three ?? 28,
  unit: DEFAULT_PROTEIN_GOAL.unit ?? "gm",
  tip:
    DEFAULT_PROTEIN_GOAL.tip ??
    "Anchor each meal with a clear protein source and keep snacks protein-forward.",
  source: "mock",
};

function readFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeCalorieGoal(goal?: BodyVitalsCalorieGoal | null): CaloriePanelData {
  if (!goal) {
    return FALLBACK_CALORIE_PANEL_DATA;
  }

  const totalCalorie =
    toNumber(goal.total_calorie) ??
    toNumber(goal.optimal_burn_calories) ??
    toNumber(goal.burn) ??
    FALLBACK_CALORIE_PANEL_DATA.totalCalorie;

  const maintenanceCalories =
    toNumber(goal.maintenance_calories) ??
    toNumber(goal.maintaince) ??
    Math.round(totalCalorie + 250);

  const optimalBurnCalories =
    toNumber(goal.optimal_burn_calories) ??
    toNumber(goal.burn) ??
    totalCalorie;

  const buildCalories =
    toNumber(goal.build_calories) ??
    toNumber(goal.build) ??
    Math.round(maintenanceCalories + 250);

  return {
    totalCalorie,
    maintenanceCalories,
    optimalBurnCalories,
    buildCalories,
    unit: toText(goal.unit, FALLBACK_CALORIE_PANEL_DATA.unit),
    tip: toText(goal.tip, FALLBACK_CALORIE_PANEL_DATA.tip),
    source: "api",
  };
}

function normalizeProteinGoal(goal?: BodyVitalsProteinGoal | null): ProteinPanelData {
  if (!goal) {
    return FALLBACK_PROTEIN_PANEL_DATA;
  }

  return {
    totalRequirement:
      toNumber(goal.total_requirement) ?? FALLBACK_PROTEIN_PANEL_DATA.totalRequirement,
    mealOne: toNumber(goal.meal_one) ?? FALLBACK_PROTEIN_PANEL_DATA.mealOne,
    mealTwo: toNumber(goal.meal_two) ?? FALLBACK_PROTEIN_PANEL_DATA.mealTwo,
    mealThree:
      toNumber(goal.meal_three) ?? FALLBACK_PROTEIN_PANEL_DATA.mealThree,
    unit: toText(goal.unit, FALLBACK_PROTEIN_PANEL_DATA.unit),
    tip: toText(goal.tip, FALLBACK_PROTEIN_PANEL_DATA.tip),
    source: "api",
  };
}

export function resolveCaloriePanelDataFromContext(
  context: BodyVitalsContext | null | undefined
): CaloriePanelData {
  return normalizeCalorieGoal(
    context?.latest_snapshot?.outputs?.calorie_goal ?? context?.profile?.calorie_goal
  );
}

export function resolveCaloriePanelDataFromParams(
  params: CaloriePanelParams
): CaloriePanelData {
  const totalCalorie =
    toNumber(readFirstParam(params.total_calorie)) ??
    toNumber(readFirstParam(params.calories)) ??
    toNumber(readFirstParam(params.maintenanceCalories)) ??
    toNumber(readFirstParam(params.maintenance)) ??
    FALLBACK_CALORIE_PANEL_DATA.totalCalorie;

  const maintenanceCalories =
    toNumber(readFirstParam(params.maintenance_calories)) ??
    toNumber(readFirstParam(params.maintenanceCalories)) ??
    toNumber(readFirstParam(params.maintenance)) ??
    Math.round(totalCalorie + 250);

  const optimalBurnCalories =
    toNumber(readFirstParam(params.optimal_burn_calories)) ??
    toNumber(readFirstParam(params.targetCalories)) ??
    toNumber(readFirstParam(params.burn)) ??
    totalCalorie;

  const buildCalories =
    toNumber(readFirstParam(params.build)) ??
    Math.round(maintenanceCalories + 250);

  const unit = toText(
    readFirstParam(params.unit),
    FALLBACK_CALORIE_PANEL_DATA.unit
  );
  const tip = toText(
    readFirstParam(params.tip),
    FALLBACK_CALORIE_PANEL_DATA.tip
  );

  const hasApiParams =
    params.total_calorie !== undefined ||
    params.maintenance_calories !== undefined ||
    params.optimal_burn_calories !== undefined ||
    params.build !== undefined ||
    params.burn !== undefined ||
    params.unit !== undefined ||
    params.tip !== undefined ||
    params.calories !== undefined ||
    params.maintenanceCalories !== undefined ||
    params.targetCalories !== undefined ||
    params.maintenance !== undefined;

  return {
    totalCalorie,
    maintenanceCalories,
    optimalBurnCalories,
    buildCalories,
    unit,
    tip,
    source: hasApiParams ? "api" : "mock",
  };
}

export function buildCaloriePanelRouteParams(data: CaloriePanelData) {
  return {
    total_calorie: String(data.totalCalorie),
    maintenance_calories: String(data.maintenanceCalories),
    optimal_burn_calories: String(data.optimalBurnCalories),
    build: String(data.buildCalories),
    unit: data.unit,
    tip: data.tip,
    calories: String(data.totalCalorie),
    maintenanceCalories: String(data.maintenanceCalories),
    targetCalories: String(data.optimalBurnCalories),
    maintenance: String(data.maintenanceCalories),
    burn: String(data.optimalBurnCalories),
  };
}

export function buildCaloriePanelTiers(
  data: CaloriePanelData
): CaloriePanelTier[] {
  return [
    {
      key: "maintenance",
      label: "METABOLIC FLUX",
      title: "Maintenance",
      calories: data.maintenanceCalories,
    },
    {
      key: "burn",
      label: "OPTIMAL IGNITION",
      title: "Burn (Fat Loss)",
      calories: data.optimalBurnCalories,
      highlight: true,
    },
    {
      key: "build",
      label: "STRUCTURAL GROWTH",
      title: "Build (Muscle)",
      calories: data.buildCalories,
    },
  ];
}

export function resolveProteinPanelDataFromContext(
  context: BodyVitalsContext | null | undefined
): ProteinPanelData {
  return normalizeProteinGoal(
    context?.latest_snapshot?.outputs?.protein_goal ?? context?.profile?.protein_goal
  );
}

export function resolveProteinPanelDataFromParams(
  params: ProteinPanelParams
): ProteinPanelData {
  const totalRequirement =
    toNumber(readFirstParam(params.total_requirement)) ??
    toNumber(readFirstParam(params.protein)) ??
    FALLBACK_PROTEIN_PANEL_DATA.totalRequirement;
  const mealOne =
    toNumber(readFirstParam(params.meal_one)) ??
    FALLBACK_PROTEIN_PANEL_DATA.mealOne;
  const mealTwo =
    toNumber(readFirstParam(params.meal_two)) ??
    FALLBACK_PROTEIN_PANEL_DATA.mealTwo;
  const mealThree =
    toNumber(readFirstParam(params.meal_three)) ??
    FALLBACK_PROTEIN_PANEL_DATA.mealThree;
  const unit = toText(
    readFirstParam(params.unit),
    FALLBACK_PROTEIN_PANEL_DATA.unit
  );
  const tip = toText(
    readFirstParam(params.tip),
    FALLBACK_PROTEIN_PANEL_DATA.tip
  );

  const hasApiParams =
    params.total_requirement !== undefined ||
    params.meal_one !== undefined ||
    params.meal_two !== undefined ||
    params.meal_three !== undefined ||
    params.unit !== undefined ||
    params.tip !== undefined ||
    params.protein !== undefined;

  return {
    totalRequirement,
    mealOne,
    mealTwo,
    mealThree,
    unit,
    tip,
    source: hasApiParams ? "api" : "mock",
  };
}

export function buildProteinPanelRouteParams(data: ProteinPanelData) {
  return {
    protein: String(data.totalRequirement),
    total_requirement: String(data.totalRequirement),
    meal_one: String(data.mealOne),
    meal_two: String(data.mealTwo),
    meal_three: String(data.mealThree),
    unit: data.unit,
    tip: data.tip,
  };
}

export function buildProteinPanelMealSlots(
  data: ProteinPanelData
): ProteinPanelMealSlot[] {
  return [
    {
      key: "meal-1",
      label: "MEAL 1",
      grams: data.mealOne,
    },
    {
      key: "meal-2",
      label: "MEAL 2",
      grams: data.mealTwo,
    },
    {
      key: "meal-3",
      label: "MEAL 3",
      grams: data.mealThree,
    },
  ];
}

export { FALLBACK_CALORIE_PANEL_DATA };
export { FALLBACK_PROTEIN_PANEL_DATA };
