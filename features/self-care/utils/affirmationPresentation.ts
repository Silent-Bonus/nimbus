import {
  formatAffirmationToneLabel,
} from "@/features/self-care/utils/affirmationHelpers";
import type {
  AffirmationCard,
  AffirmationTone,
} from "@/features/self-care/types/affirmation";

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
  tone: string;
  toneCategory: AffirmationTone;
  title: string;
  affirmation: string;
  detail?: string;
  tag: string;
  palette: AffirmationRecommendationPalette;
};

const TONE_PALETTES: Record<AffirmationTone, AffirmationRecommendationPalette> = {
  calm: {
    colors: ["#F6F1E4", "#D8E7C5"],
    accent: "#5B7746",
    accentSoft: "rgba(91, 119, 70, 0.18)",
    text: "#182114",
    tagBg: "rgba(255, 255, 255, 0.58)",
    tagBorder: "rgba(35, 48, 26, 0.12)",
    tagText: "#35592A",
  },
  confidence: {
    colors: ["#EAF4FF", "#BAD4F1"],
    accent: "#2F628E",
    accentSoft: "rgba(47, 98, 142, 0.18)",
    text: "#132235",
    tagBg: "rgba(255, 255, 255, 0.62)",
    tagBorder: "rgba(19, 34, 53, 0.10)",
    tagText: "#2F628E",
  },
  reset: {
    colors: ["#F8E4E0", "#F0B7C5"],
    accent: "#A14668",
    accentSoft: "rgba(161, 70, 104, 0.16)",
    text: "#2D1822",
    tagBg: "rgba(255, 255, 255, 0.58)",
    tagBorder: "rgba(45, 24, 34, 0.10)",
    tagText: "#A14668",
  },
  sleep: {
    colors: ["#FFF2DA", "#F5C86D"],
    accent: "#A15C10",
    accentSoft: "rgba(161, 92, 16, 0.16)",
    text: "#2A1A08",
    tagBg: "rgba(255, 255, 255, 0.64)",
    tagBorder: "rgba(42, 26, 8, 0.10)",
    tagText: "#A15C10",
  },
};

export const limitWords = (value: string, maxWords: number) => {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return value.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}…`;
};

export const getAffirmationRecommendationPalette = (
  tone: AffirmationTone
): AffirmationRecommendationPalette => TONE_PALETTES[tone] ?? TONE_PALETTES.confidence;

export const buildAffirmationRecommendation = (
  card: AffirmationCard
): AffirmationRecommendation => ({
  id: card.id,
  tone: card.tone,
  toneCategory: card.toneCategory,
  title: card.title || formatAffirmationToneLabel(card.tone),
  affirmation: card.storyQuote ?? card.quote,
  detail: card.detail,
  tag: card.tone,
  palette: getAffirmationRecommendationPalette(card.toneCategory),
});

export const buildAffirmationRecommendations = (
  cards: AffirmationCard[]
): AffirmationRecommendation[] => {
  const seenTones = new Set<string>();

  return cards
    .filter((card) => {
      if (seenTones.has(card.tone)) {
        return false;
      }

      seenTones.add(card.tone);
      return true;
    })
    .map(buildAffirmationRecommendation);
};

export const buildAffirmationStorySlides = (
  cards: AffirmationCard[]
): AffirmationRecommendation[] => cards.map(buildAffirmationRecommendation);
