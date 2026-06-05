export type AffirmationTone = "calm" | "confidence" | "reset" | "sleep";

export type AffirmationCard = {
  id: string;
  tone: AffirmationTone;
  quote: string;
  detail: string;
  paletteKey?: string;
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

export * from "./breathworkUtils";
