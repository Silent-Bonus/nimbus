export type AffirmationTone = "calm" | "confidence" | "reset" | "sleep";

export type AffirmationCard = {
  id: string;
  tone: AffirmationTone;
  quote: string;
  detail: string;
};

export const AFFIRMATION_CARDS: AffirmationCard[] = [
  {
    id: "steady-breath",
    tone: "calm",
    quote: "I can move slowly and still arrive with clarity.",
    detail: "A gentle reset for days that feel too loud.",
  },
  {
    id: "clear-steps",
    tone: "confidence",
    quote: "My next step does not need to be perfect to be enough.",
    detail: "Use this when the mind wants to over-edit the moment.",
  },
  {
    id: "soft-return",
    tone: "reset",
    quote: "Every breath gives me a clean way back to myself.",
    detail: "A simple line to come back to when attention drifts.",
  },
  {
    id: "rest-is-allowed",
    tone: "sleep",
    quote: "Rest is part of the work, not a pause from it.",
    detail: "A quiet reminder for evening or recovery.",
  },
  {
    id: "open-space",
    tone: "calm",
    quote: "I can make room for what is true without forcing it.",
    detail: "Let the shoulders soften before making a decision.",
  },
  {
    id: "quiet-power",
    tone: "confidence",
    quote: "Steady energy is stronger than rushed effort.",
    detail: "A cleaner rhythm for focus, study, and follow-through.",
  },
];

export const AFFIRMATION_FILTERS = [
  { label: "All", value: "all" },
  { label: "Calm", value: "calm" },
  { label: "Confidence", value: "confidence" },
  { label: "Reset", value: "reset" },
  { label: "Sleep", value: "sleep" },
] as const;

export const filterAffirmations = <T extends { tone: AffirmationTone }>(
  items: T[],
  selectedTone: AffirmationTone | "all"
) => {
  if (selectedTone === "all") return items;
  return items.filter((item) => item.tone === selectedTone);
};

export const formatAffirmationToneLabel = (tone: AffirmationTone) =>
  tone.charAt(0).toUpperCase() + tone.slice(1);

export type BreathPhase = {
  label: string;
  seconds: number;
  color?: string;
  sanskrit?: string;
  frequency?: number;
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
};

export type BreathTone = "grounding" | "steady" | "release" | "sleep";

export type BreathPattern = {
  id: string;
  tone: BreathTone;
  title: string;
  description: string;
  benefit: string;
  phases: BreathPhase[];
};

export type BreathMotionVariant = "box" | "orb";

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

export const getBreathMotionVariant = (
  patternId: string,
  fallback: BreathMotionVariant = "orb"
) => BREATH_MOTION_VARIANTS[patternId] ?? fallback;
