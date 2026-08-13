import {
  AFFIRMATION_CARDS,
  formatAffirmationToneLabel,
  type AffirmationTone,
} from "@/features/self-care/utils/mindPractices";

export type AffirmationRecommendationPalette = {
  colors: [string, string];
  accent: string;
  accentSoft: string;
  text: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
};

export type AffirmationRecommendation = {
  id: string;
  tone: AffirmationTone;
  title: string;
  affirmation: string;
  detail?: string;
  tag: string;
  palette: AffirmationRecommendationPalette;
};

const RECOMMENDATION_TITLES: Record<string, string> = {
  "steady-breath": "Quiet Ground",
  "clear-steps": "Clear Path",
  "soft-return": "Soft Return",
  "rest-is-allowed": "Rest Mode",
  "open-space": "Open Space",
  "quiet-power": "Steady Flame",
};

const RECOMMENDATION_PALETTES: AffirmationRecommendationPalette[] = [
  {
    colors: ["#F6F1E4", "#D8E7C5"],
    accent: "#5B7746",
    accentSoft: "rgba(91, 119, 70, 0.18)",
    text: "#182114",
    tagBg: "rgba(255, 255, 255, 0.58)",
    tagBorder: "rgba(35, 48, 26, 0.12)",
    tagText: "#35592A",
  },
  {
    colors: ["#EAF4FF", "#BAD4F1"],
    accent: "#2F628E",
    accentSoft: "rgba(47, 98, 142, 0.18)",
    text: "#132235",
    tagBg: "rgba(255, 255, 255, 0.62)",
    tagBorder: "rgba(19, 34, 53, 0.10)",
    tagText: "#2F628E",
  },
  {
    colors: ["#F8E4E0", "#F0B7C5"],
    accent: "#A14668",
    accentSoft: "rgba(161, 70, 104, 0.16)",
    text: "#2D1822",
    tagBg: "rgba(255, 255, 255, 0.58)",
    tagBorder: "rgba(45, 24, 34, 0.10)",
    tagText: "#A14668",
  },
  {
    colors: ["#FFF2DA", "#F5C86D"],
    accent: "#A15C10",
    accentSoft: "rgba(161, 92, 16, 0.16)",
    text: "#2A1A08",
    tagBg: "rgba(255, 255, 255, 0.64)",
    tagBorder: "rgba(42, 26, 8, 0.10)",
    tagText: "#A15C10",
  },
  {
    colors: ["#EFE8FF", "#CEBCFB"],
    accent: "#6A55A4",
    accentSoft: "rgba(106, 85, 164, 0.16)",
    text: "#241A39",
    tagBg: "rgba(255, 255, 255, 0.60)",
    tagBorder: "rgba(36, 26, 57, 0.10)",
    tagText: "#6A55A4",
  },
  {
    colors: ["#E7F7EF", "#BDE4D0"],
    accent: "#2E7B63",
    accentSoft: "rgba(46, 123, 99, 0.16)",
    text: "#11231D",
    tagBg: "rgba(255, 255, 255, 0.62)",
    tagBorder: "rgba(17, 35, 29, 0.10)",
    tagText: "#2E7B63",
  },
];

export const limitWords = (value: string, maxWords: number) => {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return value.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}…`;
};

export const AFFIRMATION_RECOMMENDATIONS: AffirmationRecommendation[] =
  AFFIRMATION_CARDS.map((card, index) => ({
    id: card.id,
    tone: card.tone,
    title:
      RECOMMENDATION_TITLES[card.id] ??
      formatAffirmationToneLabel(card.tone),
    affirmation: limitWords(card.quote, 20),
    detail: card.detail,
    tag: formatAffirmationToneLabel(card.tone),
    palette:
      RECOMMENDATION_PALETTES[index % RECOMMENDATION_PALETTES.length],
  }));

export const AFFIRMATION_RECOMMENDATION_LOOKUP = Object.fromEntries(
  AFFIRMATION_RECOMMENDATIONS.map((item) => [item.id, item])
) as Record<string, AffirmationRecommendation>;

export const getAffirmationRecommendationById = (id: string) =>
  AFFIRMATION_RECOMMENDATION_LOOKUP[id] ?? AFFIRMATION_RECOMMENDATIONS[0];

export const getAffirmationRecommendationPaletteById = (id: string) =>
  getAffirmationRecommendationById(id).palette;
