import type { BodyVitalsContext, BodyVitalsProteinGoal } from "@/features/self-care/types/bodyVitals";

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

type ProteinPanelParams = {
  total_requirement?: string | string[];
  meal_one?: string | string[];
  meal_two?: string | string[];
  meal_three?: string | string[];
  unit?: string | string[];
  tip?: string | string[];
  protein?: string | string[];
};

const FALLBACK_PROTEIN_PANEL_DATA: ProteinPanelData = {
  totalRequirement: 124,
  mealOne: 29,
  mealTwo: 34,
  mealThree: 28,
  unit: "gm",
  tip: "Anchor each meal with a clear protein source and keep snacks protein-forward.",
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

export function resolveProteinPanelDataFromContext(
  context: BodyVitalsContext | null | undefined
): ProteinPanelData {
  return normalizeProteinGoal(context?.profile?.protein_goal);
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
    params.tip !== undefined;

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

export { FALLBACK_PROTEIN_PANEL_DATA };
