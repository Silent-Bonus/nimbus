import type {
  BreathMotionVariant,
  BreathPattern,
  BreathPhase,
  BreathTone,
  BreathWorkDetail,
} from "@/features/self-care/types/breathworkTypes";

export type {
  BreathMotionVariant,
  BreathPattern,
  BreathPhase,
  BreathRecommendation,
  BreathRecommendationPalette,
  BreathTone,
  BreathWorkCategoryOption,
  BreathWorkDetail,
  BreathWorkMetadataStep,
  BreathWorkRouteParams,
  RawBreathWorkDetailItem,
  RawBreathWorkTemplate,
} from "@/features/self-care/types/breathworkTypes";

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: "box-breath",
    tone: "grounding",
    title: "Box Breath",
    description: "Equal counts to settle the body and sharpen attention.",
    benefit: "A square rhythm that helps the mind feel organized again.",
    phases: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
    ],
  },
  {
    id: "coherent-breath",
    tone: "steady",
    title: "Coherent Breath",
    description: "A smooth 5 in and 5 out to create a calm internal tempo.",
    benefit: "Useful when the nervous system wants a little more space.",
    phases: [
      { label: "Inhale", seconds: 5 },
      { label: "Exhale", seconds: 5 },
    ],
  },
  {
    id: "release-breath",
    tone: "release",
    title: "Release Breath",
    description: "Longer exhale to soften tension and loosen the edges.",
    benefit: "Helps the exhale carry more of the effort than the inhale.",
    phases: [
      { label: "Inhale", seconds: 4 },
      { label: "Exhale", seconds: 6 },
    ],
  },
  {
    id: "sleep-breath",
    tone: "sleep",
    title: "Sleep Breath",
    description: "A slower loop designed to prepare the body for rest.",
    benefit: "Use this when the evening needs a quieter landing.",
    phases: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 2 },
      { label: "Exhale", seconds: 6 },
      { label: "Hold", seconds: 2 },
    ],
  },
];

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
  selectedTone: BreathTone | "all"
) => {
  if (selectedTone === "all") {
    return items;
  }

  return items.filter((item) => item.tone === selectedTone);
};

export const formatBreathToneLabel = (tone: BreathTone) =>
  tone.charAt(0).toUpperCase() + tone.slice(1);

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

const BREATH_PATTERN_BY_TONE: Record<BreathPattern["tone"], BreathPattern> = {
  grounding: BREATH_PATTERNS[0],
  steady: BREATH_PATTERNS[1],
  release: BREATH_PATTERNS[2],
  sleep: BREATH_PATTERNS[3],
};

export const getBreathPatternByTone = (tone: BreathPattern["tone"]) =>
  BREATH_PATTERN_BY_TONE[tone] ?? BREATH_PATTERNS[0];

export const normalizeBreathworkCategoryValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const filterBreathWorkDetails = (
  items: BreathWorkDetail[],
  selectedTone: BreathPattern["tone"] | "all"
) => {
  if (selectedTone === "all") {
    return items;
  }

  return items.filter((item) => item.tone === selectedTone);
};
