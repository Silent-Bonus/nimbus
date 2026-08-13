import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  buildAffirmationRecommendation,
  buildAffirmationRecommendations,
} from "@/features/self-care/utils/affirmationPresentation";
import {
  formatAffirmationToneLabel,
  resolveAffirmationTone,
} from "@/features/self-care/utils/affirmationHelpers";
import type {
  AffirmationApiCreateRequest,
  AffirmationApiCreateResponse,
  AffirmationApiDetailResponse,
  AffirmationApiItem,
  AffirmationApiListResponse,
  AffirmationDeck,
  AffirmationResolvedItem,
} from "@/features/self-care/types/affirmation";

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

function getNormalizedTags(item: AffirmationApiItem) {
  return Array.from(
    new Set([
      ...toTextList(item.tags),
      ...toTextList(item.quotes?.tags),
    ])
  );
}

function getQuoteLines(item: AffirmationApiItem) {
  return toTextList(item.quotes?.quote_content);
}

function getPreviewQuote(lines: string[], fallback: string) {
  return lines[0] ?? fallback;
}

function getStoryQuote(lines: string[], fallback: string) {
  return lines.length > 0 ? lines.join("\n") : fallback;
}

function getAffirmationSeedId(index: number, id?: string | null) {
  return id?.trim() || `affirmation-${index + 1}`;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isRecord(error)) {
    const responseData = isRecord(error.response) ? error.response.data : null;

    if (isRecord(responseData) && typeof responseData.message === "string") {
      const responseMessage = responseData.message.trim();

      if (responseMessage) {
        return responseMessage;
      }
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function normalizeAffirmationApiItem(
  item: AffirmationApiItem,
  index: number
): AffirmationResolvedItem {
  const tags = getNormalizedTags(item);
  const toneCategory = resolveAffirmationTone(item.tone, tags);
  const id = toText(item.id, `${getAffirmationSeedId(index, item.id)}-${index}`);
  const toneLabel = toText(item.tone, formatAffirmationToneLabel(toneCategory));
  const title = toText(
    item.title ?? item.quotes?.quote_title,
    toneLabel
  );
  const quoteLines = getQuoteLines(item);
  const quote = getPreviewQuote(quoteLines, title);
  const storyQuote = getStoryQuote(quoteLines, quote);
  const detail = toText(item.quote_detail, quote);
  const tag = formatTagLabel(tags[0] ?? toneLabel);

  return {
    card: {
      id,
      title,
      tone: toneLabel,
      toneCategory,
      quote,
      storyQuote,
      detail,
      tags,
      statements: quoteLines.length ? quoteLines : [quote],
      paletteKey: toneCategory,
    },
    recommendation: {
      ...buildAffirmationRecommendation({
        id,
        title,
        tone: toneLabel,
        toneCategory,
        quote,
        storyQuote,
        detail,
        paletteKey: toneCategory,
      }),
      tag: tag || toneLabel,
    },
  };
}

function normalizeAffirmationDeck(
  payload: AffirmationApiListResponse | null | undefined
): AffirmationDeck | null {
  if (!payload?.success || !Array.isArray(payload.data)) {
    return null;
  }

  const normalized = payload.data
    .filter((item) => isRecord(item))
    .map((item, index) =>
      normalizeAffirmationApiItem(item as AffirmationApiItem, index)
    );

  return {
    cards: normalized.map((item) => item.card),
    recommendations: buildAffirmationRecommendations(
      normalized.map((item) => item.card)
    ),
  };
}

function normalizeResolvedAffirmation(
  payload: AffirmationApiDetailResponse | AffirmationApiCreateResponse | null | undefined
): AffirmationResolvedItem | null {
  if (!payload?.success || !payload.data || !isRecord(payload.data)) {
    return null;
  }

  return normalizeAffirmationApiItem(payload.data as AffirmationApiItem, 0);
}

export async function getAffirmations(): Promise<AffirmationDeck> {
  try {
    const response = await axios.get<AffirmationApiListResponse>(
      API_ENDPOINTS.getAffirmations
    );

    const normalized = normalizeAffirmationDeck(response.data);
    if (normalized) {
      return normalized;
    }

    throw new Error(
      toText(response.data?.message, "Unable to load affirmations right now.")
    );
  } catch (error) {
    console.warn("Failed to load affirmations from API.", error);
    throw new Error(
      getApiErrorMessage(error, "Unable to load affirmations right now.")
    );
  }
}

export async function getAffirmationBySlug(
  slug: string
): Promise<AffirmationResolvedItem> {
  try {
    const response = await axios.get<AffirmationApiDetailResponse>(
      API_ENDPOINTS.getAffirmationDetail(slug)
    );

    const normalized = normalizeResolvedAffirmation(response.data);
    if (normalized) {
      return normalized;
    }

    throw new Error(
      toText(
        response.data?.message,
        "Unable to open this affirmation right now."
      )
    );
  } catch (error) {
    console.warn(`Failed to load affirmation detail for "${slug}".`, error);
    throw new Error(
      getApiErrorMessage(error, "Unable to open this affirmation right now.")
    );
  }
}

export async function createAffirmation(
  payload: AffirmationApiCreateRequest
): Promise<AffirmationResolvedItem> {
  try {
    const response = await axios.post<AffirmationApiCreateResponse>(
      API_ENDPOINTS.createAffirmation,
      payload
    );

    const normalized = normalizeResolvedAffirmation(response.data);
    if (normalized) {
      return normalized;
    }

    throw new Error(
      toText(
        response.data?.message,
        "Unable to create the affirmation right now."
      )
    );
  } catch (error) {
    console.warn("Failed to create affirmation from API.", error);
    throw new Error(
      getApiErrorMessage(error, "Unable to create the affirmation right now.")
    );
  }
}
