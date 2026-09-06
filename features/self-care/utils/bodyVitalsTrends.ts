import type {
  BodyVitalsTrendMetric,
  BodyVitalsTrendRange,
  BodyVitalsTrendTimelinePoint,
} from "@/features/self-care/types/bodyVitals";

// Shared filter options and formatting helpers for the trends view.
export const BODY_VITALS_TREND_RANGE_OPTIONS: BodyVitalsTrendRange[] = [
  "7d",
  "30d",
  "90d",
];

export const BODY_VITALS_TREND_METRIC_OPTIONS: BodyVitalsTrendMetric[] = [
  "all",
  "weight",
  "waist",
];

export function formatBodyVitalsTrendMetricLabel(
  metric: BodyVitalsTrendMetric
) {
  if (metric === "all") return "All Metrics";
  if (metric === "weight") return "Weight";
  return "Waist";
}

export function formatBodyVitalsTrendRangeLabel(range: BodyVitalsTrendRange) {
  if (range === "7d") return "7 Days";
  if (range === "30d") return "30 Days";
  return "90 Days";
}

export function formatBodyVitalsTrendChange(
  value: number | null | undefined,
  unit: string
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${unit}`;
}

export function formatBodyVitalsTrendSnapshotDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getBodyVitalsTrendMetricValues(
  timeline: BodyVitalsTrendTimelinePoint[],
  metric: "weight_kg" | "waist_cm"
) {
  return timeline
    .map((point) => point[metric])
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value)
    );
}

export function getBodyVitalsTrendBarHeight(
  value: number | null | undefined,
  min: number,
  max: number
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.28;
  }

  if (max === min) {
    return 0.62;
  }

  return 0.28 + ((value - min) / (max - min)) * 0.58;
}
