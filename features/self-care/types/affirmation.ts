import type { AffirmationRecommendation } from "@/features/self-care/utils/affirmationLibrary";
import type { AffirmationCard } from "@/features/self-care/utils/mindPractices";

export type AffirmationApiQuote = {
  quote_title?: string | null;
  tags?: string[] | null;
  quote_content?: string[] | null;
};

export type AffirmationApiItem = {
  id?: string | null;
  tone?: string | null;
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

export type AffirmationApiResponse = {
  success: boolean;
  message: string;
  data: AffirmationApiItem[];
  pagination?: AffirmationApiPagination | null;
};

export type AffirmationDeck = {
  cards: AffirmationCard[];
  recommendations: AffirmationRecommendation[];
  source: "api" | "mock";
  message: string;
};
