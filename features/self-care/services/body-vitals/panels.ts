import type {
  BodyVitalsCalorieGoal,
  BodyVitalsContext,
  BodyVitalsProteinGoal,
} from "@/features/self-care/types/bodyVitals";
// Panel mappers adapt normalized vitals data into the route and display shapes
// expected by the protein and calorie detail screens.
export type CaloriePanelData = {
  totalCalorie: number | null;
  maintenanceCalories: number | null;
  optimalBurnCalories: number | null;
  buildCalories: number | null;
  unit: string;
  tip: string;
  source: "api" | "unavailable";
};

export type CaloriePanelTier = {
  key: "maintenance" | "burn" | "build";
  label: string;
  title: string;
  calories: number | null;
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
  totalRequirement: number | null;
  mealOne: number | null;
  mealTwo: number | null;
  mealThree: number | null;
  unit: string;
  tip: string;
  source: "api" | "unavailable";
};

export type ProteinPanelMealSlot = {
  key: "meal-1" | "meal-2" | "meal-3";
  label: string;
  grams: number | null;
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

const UNAVAILABLE_CALORIE_PANEL_DATA: CaloriePanelData = {
  totalCalorie: null,
  maintenanceCalories: null,
  optimalBurnCalories: null,
  buildCalories: null,
  unit: "kcal",
  tip: "Calorie targets will appear after your vitals are calculated.",
  source: "unavailable",
};

const UNAVAILABLE_PROTEIN_PANEL_DATA: ProteinPanelData = {
  totalRequirement: null,
  mealOne: null,
  mealTwo: null,
  mealThree: null,
  unit: "g",
  tip: "Protein targets will appear after your vitals are calculated.",
  source: "unavailable",
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
    return UNAVAILABLE_CALORIE_PANEL_DATA;
  }

  const totalCalorie =
    toNumber(goal.total_calorie) ??
    toNumber(goal.optimal_burn_calories) ??
    toNumber(goal.burn) ??
    null;

  const maintenanceCalories =
    toNumber(goal.maintenance_calories) ??
    toNumber(goal.maintaince) ??
    null;

  const optimalBurnCalories =
    toNumber(goal.optimal_burn_calories) ??
    toNumber(goal.burn) ??
    null;

  const buildCalories =
    toNumber(goal.build_calories) ??
    toNumber(goal.build) ??
    null;

  return {
    totalCalorie,
    maintenanceCalories,
    optimalBurnCalories,
    buildCalories,
    unit: toText(goal.unit, "kcal"),
    tip: toText(goal.tip, UNAVAILABLE_CALORIE_PANEL_DATA.tip),
    source: "api",
  };
}

function normalizeProteinGoal(goal?: BodyVitalsProteinGoal | null): ProteinPanelData {
  if (!goal) {
    return UNAVAILABLE_PROTEIN_PANEL_DATA;
  }

  return {
    totalRequirement:
      toNumber(goal.total_requirement),
    mealOne: toNumber(goal.meal_one),
    mealTwo: toNumber(goal.meal_two),
    mealThree: toNumber(goal.meal_three),
    unit: toText(goal.unit, "g"),
    tip: toText(goal.tip, UNAVAILABLE_PROTEIN_PANEL_DATA.tip),
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
    null;

  const maintenanceCalories =
    toNumber(readFirstParam(params.maintenance_calories)) ??
    toNumber(readFirstParam(params.maintenanceCalories)) ??
    toNumber(readFirstParam(params.maintenance)) ??
    null;

  const optimalBurnCalories =
    toNumber(readFirstParam(params.optimal_burn_calories)) ??
    toNumber(readFirstParam(params.targetCalories)) ??
    toNumber(readFirstParam(params.burn)) ??
    null;

  const buildCalories =
    toNumber(readFirstParam(params.build)) ??
    null;

  const unit = toText(
    readFirstParam(params.unit),
    "kcal"
  );
  const tip = toText(
    readFirstParam(params.tip),
    UNAVAILABLE_CALORIE_PANEL_DATA.tip
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
    source: hasApiParams ? "api" : "unavailable",
  };
}

export function buildCaloriePanelRouteParams(data: CaloriePanelData) {
  return {
    ...(data.totalCalorie == null ? {} : { total_calorie: String(data.totalCalorie) }),
    ...(data.maintenanceCalories == null ? {} : { maintenance_calories: String(data.maintenanceCalories) }),
    ...(data.optimalBurnCalories == null ? {} : { optimal_burn_calories: String(data.optimalBurnCalories) }),
    ...(data.buildCalories == null ? {} : { build: String(data.buildCalories) }),
    unit: data.unit,
    tip: data.tip,
    ...(data.totalCalorie == null ? {} : { calories: String(data.totalCalorie) }),
    ...(data.maintenanceCalories == null ? {} : { maintenanceCalories: String(data.maintenanceCalories) }),
    ...(data.optimalBurnCalories == null ? {} : { targetCalories: String(data.optimalBurnCalories) }),
    ...(data.maintenanceCalories == null ? {} : { maintenance: String(data.maintenanceCalories) }),
    ...(data.optimalBurnCalories == null ? {} : { burn: String(data.optimalBurnCalories) }),
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
    null;
  const mealOne =
    toNumber(readFirstParam(params.meal_one)) ??
    null;
  const mealTwo =
    toNumber(readFirstParam(params.meal_two)) ??
    null;
  const mealThree =
    toNumber(readFirstParam(params.meal_three)) ??
    null;
  const unit = toText(
    readFirstParam(params.unit),
    "g"
  );
  const tip = toText(
    readFirstParam(params.tip),
    UNAVAILABLE_PROTEIN_PANEL_DATA.tip
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
    source: hasApiParams ? "api" : "unavailable",
  };
}

export function buildProteinPanelRouteParams(data: ProteinPanelData) {
  return {
    ...(data.totalRequirement == null
      ? {}
      : {
          protein: String(data.totalRequirement),
          total_requirement: String(data.totalRequirement),
        }),
    ...(data.mealOne == null ? {} : { meal_one: String(data.mealOne) }),
    ...(data.mealTwo == null ? {} : { meal_two: String(data.mealTwo) }),
    ...(data.mealThree == null ? {} : { meal_three: String(data.mealThree) }),
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
