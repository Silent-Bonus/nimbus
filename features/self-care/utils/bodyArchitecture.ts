import { formatFlexibleDecimal } from "@/features/self-care/utils/bodyVitalsUtils";
import type {
  BodyVitalsBodyShape,
  BodyVitalsContext,
  BodyVitalsMeasurements,
} from "@/features/self-care/types/bodyVitals";

export type StatCard = {
  label: string;
  value: string;
};

export type MeasurementFormState = {
  bust_cm: string;
  waist_cm: string;
  high_hip_cm: string;
  low_hip_cm: string;
};

export type ShapeResult = {
  rawShape: string | null;
  label: string;
  description: string;
  movementStrategy: string;
  confidence: number | null;
  metabolicInsight: string | null;
};

export const DEFAULT_MEASUREMENT_FORM: MeasurementFormState = {
  bust_cm: "",
  waist_cm: "",
  high_hip_cm: "",
  low_hip_cm: "",
};

export function formatLabelForHero(value: string) {
  return value.toUpperCase();
}

export function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${Math.round(value * 100)}%`;
}

export function formatActivityLabel(value: string | null | undefined) {
  if (!value) {
    return "Active";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function normalizeBodyShapeKey(value: string | null | undefined) {
  if (!value) {
    return "undefined";
  }

  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[ /-]+/g, "_")
    .toLowerCase();
}

export function formatBodyShapeLabel(value: string | null | undefined) {
  if (!value) {
    return "Awaiting Calculation";
  }

  const key = normalizeBodyShapeKey(value);

  const labels: Record<string, string> = {
    pear: "Pear",
    hourglass: "Hourglass",
    pear_hourglass_hybrid: "Pear / Hourglass Hybrid",
    rectangle: "Rectangle",
    inverted_triangle: "Inverted Triangle",
    apple: "Apple",
    balanced_mesomorph: "Balanced Mesomorph",
    undefined: "Awaiting Calculation",
  };

  if (labels[key]) {
    return labels[key];
  }

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function getBodyShapeDescription(value: string | null | undefined) {
  const key = normalizeBodyShapeKey(value);

  const descriptions: Record<string, string> = {
    pear:
      "Your lower body carries more volume than your upper frame, with a visible waist line and fuller hips.",
    hourglass:
      "Your bust and hips stay closely balanced, while the waist reads more defined through the center.",
    pear_hourglass_hybrid:
      "Your waist is defined and your hips lead slightly, while the upper and lower frame still retain balanced curves.",
    rectangle:
      "Your bust, waist, and hips read more evenly, creating a straighter silhouette through the torso.",
    inverted_triangle:
      "Your upper frame leads over the hips, with more width through the shoulders or bust than the lower body.",
    apple:
      "Your midsection carries more visual emphasis, while the shoulders and hips read comparatively softer.",
    balanced_mesomorph:
      "Your proportions read athletic and balanced, with even distribution through the torso and lower body.",
    undefined:
      "Add the four measurements to calculate a more precise reading of your current body shape.",
  };

  return descriptions[key] ?? descriptions.undefined;
}

export function getBodyShapeMovementStrategy(value: string | null | undefined) {
  const key = normalizeBodyShapeKey(value);

  const strategies: Record<string, string> = {
    pear:
      "Build lower-body strength with glute work, then balance the frame with posture, back, and shoulder volume.",
    hourglass:
      "Stay balanced across upper and lower body, with steady core work to support symmetry and control.",
    pear_hourglass_hybrid:
      "Blend glute activation with core control and enough upper-body work to keep the frame visually balanced.",
    rectangle:
      "Create more contrast through glutes, shoulders, and rotational core work while preserving clean posture.",
    inverted_triangle:
      "Bias lower-body strength, posterior chain work, and mobility to ground the frame and soften upper dominance.",
    apple:
      "Use steady conditioning, trunk stability, and posture work to improve control through the center line.",
    balanced_mesomorph:
      "Maintain full-body balance with progressive strength work, stable core training, and measured recovery.",
    undefined:
      "Measure again with the tape level around the body to unlock a more useful movement recommendation.",
  };

  return strategies[key] ?? strategies.undefined;
}

export function formatMeasurementInput(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }

  return formatFlexibleDecimal(value, 1);
}

export function toMeasurementNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveMeasurementForm(
  context: BodyVitalsContext | null | undefined
): MeasurementFormState {
  const measurements: BodyVitalsMeasurements | null | undefined =
    context?.inputs?.measurements ??
    context?.latest_snapshot?.outputs?.body_shape?.measurements ??
    context?.profile?.measurements ??
    null;

  return {
    bust_cm: formatMeasurementInput(measurements?.bust_cm),
    waist_cm: formatMeasurementInput(measurements?.waist_cm),
    high_hip_cm: formatMeasurementInput(measurements?.high_hip_cm),
    low_hip_cm: formatMeasurementInput(measurements?.low_hip_cm),
  };
}

export function buildShapeResult(
  shape: BodyVitalsBodyShape | string | null | undefined,
  metabolicInsight?: string | null
): ShapeResult {
  const shapeValue =
    typeof shape === "string" ? shape : shape?.label ?? shape?.code ?? null;

  return {
    rawShape:
      typeof shape === "string" ? shape : shape?.code ?? shape?.label ?? null,
    label: formatBodyShapeLabel(shapeValue),
    description: getBodyShapeDescription(shapeValue),
    movementStrategy:
      typeof shape === "string"
        ? getBodyShapeMovementStrategy(shape)
        : shape?.movement_strategy ?? getBodyShapeMovementStrategy(shapeValue),
    confidence: typeof shape === "string" ? null : shape?.confidence ?? null,
    metabolicInsight: metabolicInsight ?? null,
  };
}

export function resolveSavedShapeResult(
  context: BodyVitalsContext | null
): ShapeResult | null {
  const savedShape =
    context?.latest_snapshot?.outputs?.body_shape ??
    (context?.profile?.body_shape_label || context?.profile?.body_shape_code
      ? {
          label: context.profile?.body_shape_label,
          code: context.profile?.body_shape_code,
          confidence: context.profile?.body_shape_confidence,
          movement_strategy: context.profile?.movement_strategy,
        }
      : null) ??
    (context?.saved_summary?.body_shape_label ||
    context?.saved_summary?.body_shape_code
      ? {
          label: context.saved_summary?.body_shape_label,
          code: context.saved_summary?.body_shape_code,
          confidence: context.saved_summary?.body_shape_confidence,
          movement_strategy: context.saved_summary?.movement_strategy,
        }
      : null);

  if (!savedShape) {
    return null;
  }

  return buildShapeResult(
    savedShape,
    context?.latest_snapshot?.outputs?.metabolic_insight ??
      context?.profile?.metabolic_insight ??
      context?.saved_summary?.metabolic_insight ??
      null
  );
}

export function resolveResultStrategy(
  calculatedResult: ShapeResult | null,
  savedShape: BodyVitalsBodyShape | null,
  context: BodyVitalsContext | null
) {
  if (calculatedResult) {
    return calculatedResult.movementStrategy;
  }

  return (
    savedShape?.movement_strategy ??
    context?.profile?.movement_strategy ??
    getBodyShapeMovementStrategy(savedShape?.label ?? savedShape?.code)
  );
}

export function resolveResultWisdom(
  calculatedResult: ShapeResult | null,
  context: BodyVitalsContext | null
) {
  if (calculatedResult) {
    return (
      calculatedResult.metabolicInsight ??
      `Your current blueprint reads as ${calculatedResult.label.toLowerCase()}. ${
        calculatedResult.movementStrategy
      }`
    );
  }

  return (
    context?.latest_snapshot?.outputs?.metabolic_insight ??
    context?.profile?.metabolic_insight ??
    "Add your measurements and calculate your current body blueprint to unlock a more precise interpretation."
  );
}
