import type {
  BodyVitalsCalorieGoal,
  BodyVitalsContext,
} from "@/features/self-care/types/bodyVitals";

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

const FALLBACK_CALORIE_PANEL_DATA: CaloriePanelData = {
  totalCalorie: 1949,
  maintenanceCalories: 2199,
  optimalBurnCalories: 1949,
  buildCalories: 2449,
  unit: "kcal",
  tip: "This is a larger deficit. Watch recovery, hunger, and training performance closely.",
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
    toNumber(goal.build) ?? Math.round(maintenanceCalories + 250);

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

export function resolveCaloriePanelDataFromContext(
  context: BodyVitalsContext | null | undefined
): CaloriePanelData {
  return normalizeCalorieGoal(context?.profile?.calorie_goal);
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

export { FALLBACK_CALORIE_PANEL_DATA };
