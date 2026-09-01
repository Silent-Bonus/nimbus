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
