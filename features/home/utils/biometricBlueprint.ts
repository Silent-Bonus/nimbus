import type { ColorSet } from "@/theme/types";
import type {
  DailyCheckIn,
  DailyCheckInListResponse,
} from "@/features/check-in/types/dailyCheckin";
import { resolveUnit, routeFor } from "@/features/check-in/utils/dailyCheckin";
import type {
  BlueprintCard,
  BlueprintKey,
  BlueprintTemplate,
  CheckInRoute,
  LoadedCheckin,
  TransformedDailyCheckin,
} from "@/features/home/types/biometricBlueprint";

type BlueprintRawCheckin = {
  id?: unknown;
  name?: unknown;
  target_unit?: unknown;
  goal?: unknown;
  metric_count?: unknown;
  completed_unit?: unknown;
  completed?: unknown;
  metric_unit?: string | null;
};

const normalize = (value?: string) => (value || "").toLowerCase();

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? `${rounded.toFixed(0)}`
    : `${rounded.toFixed(1)}`;
};

type DailyCheckinMetadata = DailyCheckIn & {
  template_name?: string | null;
  tips?: string[] | null;
  interesting_text?: string | null;
  completion_percentage?: number | null;
};

const toFiniteNumber = (value: number | null | undefined, fallback = 0) => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const getCompletionPercentage = (
  item: DailyCheckinMetadata,
  target: number,
  completed: number,
) => {
  if (typeof item.completion_percentage === "number") {
    return item.completion_percentage;
  }

  if (target <= 0) return 0;
  return Math.max(0, Math.min((completed / target) * 100, 100));
};

/** Converts one daily check-in API item into the template-ready home shape. */
export const transformDailyCheckin = (
  value: DailyCheckIn,
): TransformedDailyCheckin => {
  const item = value as DailyCheckinMetadata;
  const targetUnit = toFiniteNumber(item.target_unit);
  const completedUnit = toFiniteNumber(item.completed_unit);
  const metricCount = toFiniteNumber(item.metric_count);
  const metricUnit = item.metric_unit?.trim() || "unit";
  const completionPercentage = getCompletionPercentage(
    item,
    targetUnit,
    completedUnit,
  );
  const goalTarget = metricCount || targetUnit;
  const goalCompleted = completedUnit;

  return {
    id: item.id,
    name: item.name,
    target_unit: targetUnit,
    completed_unit: completedUnit,
    completion_percentage: completionPercentage,
    daily_checkin: {
      protocol_details: {
        habit_id: item.id,
        habit_name: item.name,
        template_name: item.template_name?.trim() || "Daily Trackers",
        metric_unit: metricUnit,
        metric_count: metricCount,
      },
      goal_details: {
        target: goalTarget,
        completed: goalCompleted,
        completion_percentage: completionPercentage,
        remaining: Math.max(goalTarget - goalCompleted, 0),
        unit: metricUnit,
        description: `Reach ${goalTarget} ${metricUnit} today.`,
      },
      tips: Array.isArray(item.tips) ? item.tips : [],
      interesting_text: item.interesting_text?.trim() || "",
    },
  };
};

/** Transforms every item in a daily check-in list response. */
export const transformDailyCheckinList = (
  response: DailyCheckInListResponse | DailyCheckIn[],
): TransformedDailyCheckin[] => {
  const items = Array.isArray(response) ? response : response.data;
  return items.map(transformDailyCheckin);
};

/** Extracts the API list from either a direct array or a data envelope. */
export const getBlueprintItems = (value: unknown): LoadedCheckin[] => {
  const source = Array.isArray(value)
    ? value
    : value &&
        typeof value === "object" &&
        Array.isArray((value as { data?: unknown }).data)
      ? ((value as { data: unknown[] }).data ?? [])
      : [];

  return source
    .map((item) => toLoadedCheckin(item))
    .filter((item): item is LoadedCheckin => Boolean(item));
};

/** Converts one API record into the small shape needed by the home cards. */
export const toLoadedCheckin = (value: unknown): LoadedCheckin | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as BlueprintRawCheckin;
  const name =
    typeof candidate.name === "string" && candidate.name.trim()
      ? candidate.name
      : "Habit";

  return {
    id: Number(candidate.id ?? 0),
    name,
    goalQuantity: Number(
      candidate.target_unit ?? candidate.goal ?? candidate.metric_count ?? 0,
    ),
    completedQuantity: Number(candidate.completed_unit ?? 0),
    unit: resolveUnit({
      metric_unit:
        typeof candidate.metric_unit === "string"
          ? candidate.metric_unit
          : null,
      name,
    }),
    route: routeFor(name) as CheckInRoute,
    completed: Boolean(candidate.completed),
  };
};

/** Formats the primary metric displayed for a blueprint card. */
export const buildMetric = (key: BlueprintKey, item?: LoadedCheckin) => {
  if (!item) {
    return key === "water" ? "0%" : key === "sleep" ? "0 HR" : "0 min";
  }

  const goal = Number(item.goalQuantity ?? 0);
  const completed = Number(item.completedQuantity ?? 0);
  const effectiveGoal = goal > 0 ? goal : completed;

  if (key === "water") {
    const pct =
      effectiveGoal > 0 ? Math.min((completed / effectiveGoal) * 100, 100) : 0;
    return `${Math.round(pct)}%`;
  }

  if (key === "sleep") {
    return `${formatNumber(effectiveGoal || completed)} HR`;
  }

  return `${Math.round(effectiveGoal || completed)} min`;
};

/** Returns a clamped progress value so UI widths always stay within 0–100%. */
export const getProgress = (item?: LoadedCheckin) => {
  if (!item) return 0;
  const goal = Number(item.goalQuantity ?? 0);
  const completed = Number(item.completedQuantity ?? 0);
  const effectiveGoal = goal > 0 ? goal : completed;
  if (effectiveGoal <= 0) return 0;
  return Math.max(0, Math.min(completed / effectiveGoal, 1));
};

/** Builds the stable, themed card definitions used by the home panel. */
export const buildTemplates = (theme: ColorSet): BlueprintTemplate[] => [
  {
    key: "water",
    title: "Hydration",
    kicker: "JALA",
    icon: "water-outline",
    route: "/(auth)/check-in/water",
    accent: theme.chart1 ?? theme.accent ?? "#CFE86C",
    gradientEnd: theme.gradLime ?? theme.accentPressed ?? "#D6F083",
    tint: theme.selected ?? "rgba(163,190,140,0.12)",
    previewMetric: "68%",
    previewProgress: 0.68,
    searchTerms: ["water"],
    layout: "compact",
  },
  {
    key: "sleep",
    title: "Deep Sleep",
    kicker: "NIDRA",
    icon: "moon-outline",
    route: "/(auth)/check-in/sleep",
    accent: theme.chart2 ?? theme.info ?? "#5E81AC",
    gradientEnd: theme.gradBlue ?? theme.chart2 ?? "#A9C7F7",
    tint: "rgba(94,129,172,0.12)",
    previewMetric: "7 HR",
    previewProgress: 0.58,
    searchTerms: ["sleep"],
    layout: "compact",
  },
  {
    key: "meditation",
    title: "Meditation",
    kicker: "Dhyana",
    icon: "leaf-outline",
    route: "/(auth)/check-in/meditation",
    accent: theme.accent ?? theme.chart1 ?? "#A3BE8C",
    gradientEnd: theme.gradAccent ?? theme.gradLime ?? "#B8D39B",
    tint: theme.selected ?? "rgba(163,190,140,0.12)",
    previewMetric: "18 min",
    previewProgress: 0.74,
    searchTerms: ["medit"],
    layout: "wide",
  },
];

/** Combines live check-ins with templates, retaining previews when data is absent. */
export const buildBlueprintCards = (
  items: LoadedCheckin[],
  templates: BlueprintTemplate[],
): BlueprintCard[] =>
  templates.map((template) => {
    const item = items.find((entry) =>
      template.searchTerms.some((term) => normalize(entry.name).includes(term)),
    );
    const actualProgress = getProgress(item);
    const hasMeaningfulProgress = actualProgress > 0;

    return {
      ...template,
      item,
      progress: hasMeaningfulProgress
        ? actualProgress
        : template.previewProgress,
      metric: hasMeaningfulProgress
        ? buildMetric(template.key, item)
        : template.previewMetric,
      disabled: !item?.id,
    };
  });
