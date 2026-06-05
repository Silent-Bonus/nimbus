import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  AFFIRMATION_RECOMMENDATIONS,
  type AffirmationRecommendation,
} from "@/features/self-care/utils/affirmationLibrary";
import {
  AFFIRMATION_CARDS,
  formatAffirmationToneLabel,
  type AffirmationTone,
} from "@/features/self-care/utils/mindPractices";
import type {
  AffirmationApiItem,
  AffirmationApiResponse,
  AffirmationDeck,
} from "@/features/self-care/types/affirmation";

const FALLBACK_SOURCE_MESSAGE = "Mock affirmations loaded for now.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toTextList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function joinQuoteContent(value: unknown, fallback: string) {
  const items = toTextList(value);
  return items.length > 0 ? items.join(" ") : fallback;
}

function formatTagLabel(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeAffirmationTone(
  tone: unknown,
  tags: string[] = []
): AffirmationTone {
  if (typeof tone === "string") {
    const normalizedTone = tone.trim().toLowerCase();
    if (
      normalizedTone === "calm" ||
      normalizedTone === "confidence" ||
      normalizedTone === "reset" ||
      normalizedTone === "sleep"
    ) {
      return normalizedTone;
    }
  }

  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());

  if (
    normalizedTags.some((tag) =>
      ["sleep", "rest", "night", "dream"].includes(tag)
    )
  ) {
    return "sleep";
  }

  if (
    normalizedTags.some((tag) =>
      ["reset", "restart", "release", "cleanse"].includes(tag)
    )
  ) {
    return "reset";
  }

  if (
    normalizedTags.some((tag) =>
      ["calm", "ground", "breathe", "breath", "quiet"].includes(tag)
    )
  ) {
    return "calm";
  }

  return "confidence";
}

function getPaletteSeed(index: number) {
  return (
    AFFIRMATION_RECOMMENDATIONS[index % AFFIRMATION_RECOMMENDATIONS.length] ??
    AFFIRMATION_RECOMMENDATIONS[0]
  );
}

function normalizeAffirmationApiItem(
  item: AffirmationApiItem,
  index: number
): {
  card: (typeof AFFIRMATION_CARDS)[number];
  recommendation: AffirmationRecommendation;
} {
  const paletteSeed = getPaletteSeed(index);
  const quoteTags = toTextList(item.quotes?.tags);
  const tone = normalizeAffirmationTone(item.tone, quoteTags);
  const id = toText(item.id, `${paletteSeed.id}-${index}`);
  const title = toText(
    item.quotes?.quote_title,
    formatAffirmationToneLabel(tone)
  );
  const quote = joinQuoteContent(
    item.quotes?.quote_content,
    title
  );
  const detail = toText(item.quote_detail, quote);
  const tag = formatTagLabel(quoteTags[0] ?? tone);

  return {
    card: {
      id,
      tone,
      quote,
      detail,
      paletteKey: paletteSeed.id,
    },
    recommendation: {
      id,
      tone,
      title,
      affirmation: quote,
      tag: tag || formatAffirmationToneLabel(tone),
      palette: paletteSeed.palette,
    },
  };
}

function buildMockAffirmationDeck(): AffirmationDeck {
  return {
    cards: AFFIRMATION_CARDS.map((card, index) => ({
      ...card,
      paletteKey:
        AFFIRMATION_RECOMMENDATIONS[index % AFFIRMATION_RECOMMENDATIONS.length]
          ?.id ?? card.id,
    })),
    recommendations: AFFIRMATION_RECOMMENDATIONS,
    source: "mock",
    message: FALLBACK_SOURCE_MESSAGE,
  };
}

function normalizeAffirmationDeck(
  payload: AffirmationApiResponse | null | undefined
): AffirmationDeck | null {
  if (!payload?.success || !Array.isArray(payload.data) || payload.data.length === 0) {
    return null;
  }

  const normalized = payload.data
    .filter((item) => isRecord(item))
    .map((item, index) => normalizeAffirmationApiItem(item as AffirmationApiItem, index));

  if (!normalized.length) {
    return null;
  }

  return {
    cards: normalized.map((item) => item.card),
    recommendations: normalized.map((item) => item.recommendation),
    source: "api",
    message: payload.message,
  };
}

export function getMockAffirmationDeck(): AffirmationDeck {
  return buildMockAffirmationDeck();
}

export async function getAffirmations(): Promise<AffirmationDeck> {
  try {
    const response = await axios.get<AffirmationApiResponse>(
      API_ENDPOINTS.getAffirmations
    );

    const normalized = normalizeAffirmationDeck(response.data);
    if (normalized) {
      return normalized;
    }
  } catch (error) {
    console.warn("Failed to load affirmations from API, using mock deck.", error);
  }

  return buildMockAffirmationDeck();
}
