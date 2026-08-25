import type {
  BreathMotionVariant,
  BreathPattern,
  BreathPhase,
  BreathworkStyle,
} from "@/features/self-care/types/wellnessContentTypes";

// Breathwork list responses do not carry a normalized presentation model yet.
// These defaults keep the library and placeholder detail screens functional
// until the backend sends a richer breathwork schema.
const BREATHWORK_STYLE_DEFAULTS: Record<
  BreathworkStyle,
  Omit<BreathPattern, "style" | "phases">
> = {
  grounding: {
    id: "box-breath",
    title: "Box Breath",
    description: "Equal counts to settle the body and sharpen attention.",
    benefit: "A square rhythm that helps the mind feel organized again.",
  },
  steady: {
    id: "coherent-breath",
    title: "Coherent Breath",
    description: "A smooth 5 in and 5 out to create a calm internal tempo.",
    benefit: "Useful when the nervous system wants a little more space.",
  },
  release: {
    id: "release-breath",
    title: "Release Breath",
    description: "Longer exhale to soften tension and loosen the edges.",
    benefit: "Helps the exhale carry more of the effort than the inhale.",
  },
  sleep: {
    id: "sleep-breath",
    title: "Sleep Breath",
    description: "A slower loop designed to prepare the body for rest.",
    benefit: "Use this when the evening needs a quieter landing.",
  },
};

const BREATHWORK_STYLE_PHASES: Record<BreathworkStyle, BreathPhase[]> = {
  grounding: [
    { label: "Inhale", seconds: 4 },
    { label: "Hold", seconds: 4 },
    { label: "Exhale", seconds: 4 },
    { label: "Hold", seconds: 4 },
  ],
  steady: [
    { label: "Inhale", seconds: 5 },
    { label: "Exhale", seconds: 5 },
  ],
  release: [
    { label: "Inhale", seconds: 4 },
    { label: "Exhale", seconds: 6 },
  ],
  sleep: [
    { label: "Inhale", seconds: 4 },
    { label: "Hold", seconds: 2 },
    { label: "Exhale", seconds: 6 },
    { label: "Hold", seconds: 2 },
  ],
};

const cloneBreathPhases = (phases: BreathPhase[]) =>
  phases.map((phase) => ({ ...phase }));

export const createFallbackBreathPhases = (
  style: BreathworkStyle = "grounding"
): BreathPhase[] =>
  cloneBreathPhases(
    BREATHWORK_STYLE_PHASES[style] ?? BREATHWORK_STYLE_PHASES.grounding
  );

// Builds a lightweight fallback breath pattern from the resolved style so the
// UI can still render before detail data arrives from the backend.
export const createFallbackBreathPattern = (
  style: BreathworkStyle = "grounding",
  overrides?: Partial<Omit<BreathPattern, "style">>
): BreathPattern => {
  const defaults =
    BREATHWORK_STYLE_DEFAULTS[style] ?? BREATHWORK_STYLE_DEFAULTS.grounding;

  return {
    id: overrides?.id?.trim() || defaults.id,
    style,
    title: overrides?.title?.trim() || defaults.title,
    description: overrides?.description?.trim() || defaults.description,
    benefit: overrides?.benefit?.trim() || defaults.benefit,
    phases:
      overrides?.phases && overrides.phases.length > 0
        ? cloneBreathPhases(overrides.phases)
        : createFallbackBreathPhases(style),
  };
};

export const BREATH_MOTION_VARIANTS: Record<string, BreathMotionVariant> = {
  "box-breath": "box",
  "coherent-breath": "orb",
  "release-breath": "orb",
  "sleep-breath": "box",
};

const BREATH_MOTION_VARIANT_ALIASES: Array<{
  tokens: string[];
  variant: BreathMotionVariant;
}> = [
  {
    tokens: ["box-breathing", "box-breath", "4-4-4-4", "4444"],
    variant: "box",
  },
  {
    tokens: ["coherent-flow", "coherence-flow", "coherent-breath", "5-5", "55"],
    variant: "orb",
  },
  {
    tokens: ["release-path", "release-breath", "calm-reset", "4-6", "46"],
    variant: "orb",
  },
  {
    tokens: ["night-drift", "sleep-breath", "4-2-6-2", "4262"],
    variant: "box",
  },
];

const normalizeBreathMotionKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const BREATH_FILTERS = [
  { label: "All", value: "all" },
  { label: "Grounding", value: "grounding" },
  { label: "Steady", value: "steady" },
  { label: "Release", value: "release" },
  { label: "Sleep", value: "sleep" },
] as const;

export const formatBreathCadence = (pattern: BreathPattern) =>
  pattern.phases.map((phase) => phase.seconds).join(" - ");

export const filterBreathPatterns = <T extends BreathPattern>(
  items: T[],
  selectedStyle: BreathworkStyle | "all"
) => {
  if (selectedStyle === "all") {
    return items;
  }

  return items.filter((item) => item.style === selectedStyle);
};

export const formatBreathStyleLabel = (style: BreathworkStyle) =>
  style.charAt(0).toUpperCase() + style.slice(1);

export const resolveBreathworkColor = (
  color: string | undefined,
  fallback: string
) => {
  if (!color) return fallback;

  const trimmed = color.trim();
  if (!trimmed || trimmed.startsWith("var(")) {
    return fallback;
  }

  return trimmed;
};

// Motion is a presentation choice, not backend content, so we map from the
// most stable identifier or title tokens available.
export const getBreathMotionVariant = (
  patternId: string,
  fallback: BreathMotionVariant = "orb"
) => {
  const normalized = normalizeBreathMotionKey(patternId);
  if (!normalized) {
    return fallback;
  }

  const directVariant = BREATH_MOTION_VARIANTS[normalized];
  if (directVariant) {
    return directVariant;
  }

  for (const alias of BREATH_MOTION_VARIANT_ALIASES) {
    if (
      alias.tokens.some(
        (token) => normalized === token || normalized.includes(token)
      )
    ) {
      return alias.variant;
    }
  }

  return fallback;
};

export const normalizeBreathworkCategoryValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
