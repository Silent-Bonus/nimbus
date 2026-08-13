import type { AffirmationRecommendation } from "@/features/self-care/utils/affirmationPresentation";

export type AffirmationTone = "calm" | "confidence" | "reset" | "sleep";

export type AffirmationCard = {
  id: string;
  title: string;
  tone: string;
  toneCategory: AffirmationTone;
  quote: string;
  storyQuote?: string;
  detail: string;
  tags?: string[];
  statements?: string[];
  paletteKey?: string;
};

export type AffirmationApiQuote = {
  quote_title?: string | null;
  tags?: string[] | null;
  quote_content?: string[] | null;
};

export type AffirmationApiItem = {
  id?: string | null;
  title?: string | null;
  tone?: string | null;
  tags?: string[] | null;
  published_at?: string | null;
  quotes?: AffirmationApiQuote | null;
  quote_detail?: string | null;
};

export type AffirmationApiPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results_count: number;
};

export type AffirmationApiListResponse = {
  success: boolean;
  message: string;
  data: AffirmationApiItem[];
  pagination?: AffirmationApiPagination | null;
};

export type AffirmationApiDetailResponse = {
  success: boolean;
  message: string;
  data: AffirmationApiItem | null;
};

export type AffirmationApiCreateRequest = {
  title: string;
  tone: string;
  tags: string[];
  statements: string[];
  quote_detail: string;
};

export type AffirmationApiCreateResponse = AffirmationApiDetailResponse;
export type AffirmationApiResponse = AffirmationApiListResponse;

export type AffirmationDeck = {
  cards: AffirmationCard[];
  recommendations: AffirmationRecommendation[];
};

export type AffirmationResolvedItem = {
  card: AffirmationCard;
  recommendation: AffirmationRecommendation;
};
