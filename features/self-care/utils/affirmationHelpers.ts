import type {
  AffirmationCard,
  AffirmationTone,
} from "@/features/self-care/types/affirmation";

const AFFIRMATION_TONES: AffirmationTone[] = [
  "calm",
  "confidence",
  "reset",
  "sleep",
];

const AFFIRMATION_TONE_KEYWORDS: Record<AffirmationTone, string[]> = {
  calm: [
    "calm",
    "calmness",
    "ground",
    "grounding",
    "breathe",
    "breath",
    "quiet",
    "peace",
    "mindfulness",
    "serenity",
    "tranquility",
    "zen",
    "pause",
    "presence",
    "grace",
  ],
  confidence: [
    "confidence",
    "focus",
    "study",
    "steady",
    "power",
    "progress",
    "wealth",
    "abundance",
    "prosperity",
    "success",
  ],
  reset: [
    "reset",
    "restart",
    "release",
    "fresh",
    "clear",
    "health",
    "healing",
    "wellness",
    "fitness",
    "vitality",
    "rejuvenation",
    "body-love",
    "recovery",
  ],
  sleep: ["sleep", "rest", "night", "dream", "wind", "relaxation"],
};

export const buildAffirmationFilters = <T extends { tone: string }>(items: T[]) =>
  [
    { label: "All", value: "all" },
    ...Array.from(
      new Set(items.map((item) => item.tone.trim()).filter(Boolean))
    ).map((tone) => ({
      label: tone,
      value: tone,
    })),
  ] as const;

export const filterAffirmations = <T extends { tone: string }>(
  items: T[],
  selectedTone: string | "all"
) => {
  if (selectedTone === "all") {
    return items;
  }

  return items.filter((item) => item.tone === selectedTone);
};

export const formatAffirmationToneLabel = (tone: string) =>
  tone
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const resolveAffirmationTone = (
  tone: unknown,
  tags: string[] = []
): AffirmationTone => {
  const normalizedTone =
    typeof tone === "string" ? tone.trim().toLowerCase() : "";

  if (["sleep", "rest", "night"].includes(normalizedTone)) {
    return "sleep";
  }

  if (
    [
      "reset",
      "health",
      "healing",
      "wellness",
      "fitness",
      "rejuvenation",
      "recovery",
    ].includes(normalizedTone)
  ) {
    return "reset";
  }

  if (
    [
      "calm",
      "calmness",
      "peace",
      "serenity",
      "tranquility",
      "mindfulness",
      "zen",
    ].includes(normalizedTone)
  ) {
    return "calm";
  }

  if (
    ["confidence", "wealth", "abundance", "prosperity", "success"].includes(
      normalizedTone
    )
  ) {
    return "confidence";
  }

  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());

  if (
    normalizedTags.some((tag) => AFFIRMATION_TONE_KEYWORDS.sleep.includes(tag))
  ) {
    return "sleep";
  }

  if (
    normalizedTags.some((tag) => AFFIRMATION_TONE_KEYWORDS.reset.includes(tag))
  ) {
    return "reset";
  }

  if (
    normalizedTags.some((tag) => AFFIRMATION_TONE_KEYWORDS.calm.includes(tag))
  ) {
    return "calm";
  }

  return "confidence";
};

export const resolveAffirmationToneFromTags = (
  tags: string[]
): AffirmationTone => {
  for (const tone of AFFIRMATION_TONES) {
    if (
      tags.some(
        (tag) => tag === tone || AFFIRMATION_TONE_KEYWORDS[tone].includes(tag)
      )
    ) {
      return tone;
    }
  }

  return "confidence";
};

export type { AffirmationCard };
