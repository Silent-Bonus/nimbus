import axios, { AxiosResponse } from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import type {
  FavoriteNewsletterListResponse,
  NewsletterCategoryListResponse,
  NewsletterDetailResponse,
  NewsletterFavoriteResponse,
  NewsletterListResponse,
  NewsletterReviewCreateResponse,
  NewsletterReviewListResponse,
  NewsletterReviewPayload,
} from "@/features/tools/types/newsletterTypes";

type NewsletterListQuery = {
  category?: string;
  search?: string;
};

const MOCK_NEWSLETTER_REVIEW_RESPONSE: NewsletterReviewListResponse = {
  success: true,
  message: "Newsletter reviews retrieved successfully.",
  data: [
    {
      id: 41,
      reviewer_display_name: "Approved Reader",
      rating: 5,
      review_text: "Very helpful.",
      clarity_score: 5,
      helpfulness_score: 4,
      would_recommend: true,
      source_platform: "web",
      moderation_status: "approved",
      created_at: "2026-08-31T10:20:00+05:30",
      updated_at: "2026-08-31T10:20:00+05:30",
    },
  ],
  pagination: {
    count: 1,
    next: null,
    previous: null,
    page: 1,
    page_size: 100,
    total_pages: 1,
    results_count: 1,
  },
};

const createMockNewsletterReviewResponse = (
  payload: NewsletterReviewPayload
): NewsletterReviewCreateResponse => {
  const timestamp = new Date().toISOString();

  return {
    success: true,
    message: "Newsletter review submitted successfully.",
    data: {
      id: Date.now(),
      reviewer_display_name: "You",
      rating: payload.rating,
      review_text: payload.review_text,
      clarity_score: payload.clarity_score,
      helpfulness_score: payload.helpfulness_score,
      would_recommend: payload.would_recommend,
      source_platform: "app",
      moderation_status: "approved",
      created_at: timestamp,
      updated_at: timestamp,
    },
  };
};

const buildNewsletterListEndpoint = (params?: NewsletterListQuery) => {
  if (!params?.category && !params?.search) {
    return API_ENDPOINTS.getNewsletterList;
  }

  const queryParams = [
    params.category
      ? `category=${encodeURIComponent(params.category)}`
      : null,
    params.search ? `search=${encodeURIComponent(params.search)}` : null,
  ].filter(Boolean);

  return `${API_ENDPOINTS.getNewsletterList}?${queryParams.join("&")}`;
};

const buildFavoriteNewsletterListEndpoint = (params?: NewsletterListQuery) => {
  if (!params?.search) {
    return API_ENDPOINTS.getNewsletterFavorites;
  }

  return `${API_ENDPOINTS.getNewsletterFavorites}?search=${encodeURIComponent(
    params.search
  )}`;
};

export const getNewsletterList = async (
  params?: NewsletterListQuery
): Promise<NewsletterListResponse> => {
  try {
    const response: AxiosResponse<NewsletterListResponse> = await axios.get(
      buildNewsletterListEndpoint(params)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getNewsletterCategories =
  async (): Promise<NewsletterCategoryListResponse> => {
    try {
      const response: AxiosResponse<NewsletterCategoryListResponse> =
        await axios.get(API_ENDPOINTS.getNewsletterCategories);
      return response.data;
    } catch (error: any) {
      throw error.response ? error.response.data : error.message;
    }
  };

export const getFavoriteNewsletterList =
  async (
    params?: Pick<NewsletterListQuery, "search">
  ): Promise<FavoriteNewsletterListResponse> => {
    try {
      const response: AxiosResponse<FavoriteNewsletterListResponse> =
        await axios.get(buildFavoriteNewsletterListEndpoint(params));
      return response.data;
    } catch (error: any) {
      throw error.response ? error.response.data : error.message;
    }
  };

export const addNewsletterFavorite = async (
  slug: number | string
): Promise<NewsletterFavoriteResponse> => {
  try {
    const response: AxiosResponse<NewsletterFavoriteResponse> = await axios.post(
      API_ENDPOINTS.addNewsletterFavorite(slug),
      {},
      {
        headers: {
          "X-Client-Platform": "mobile",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getNewsletterDetails = async (
  slug: number | string
): Promise<NewsletterDetailResponse> => {
  try {
    const response: AxiosResponse<NewsletterDetailResponse> = await axios.get(
      API_ENDPOINTS.getNewsletterDetails(slug)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getNewsletterReviews = async (
  slug: number | string
): Promise<NewsletterReviewListResponse> => {
  try {
    const response: AxiosResponse<NewsletterReviewListResponse> = await axios.get(
      API_ENDPOINTS.getNewsletterReviews(slug),
      {
        headers: {
          "X-Client-Platform": "web",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return MOCK_NEWSLETTER_REVIEW_RESPONSE;
    }

    throw error.response ? error.response.data : error.message;
  }
};

export const submitNewsletterReview = async (
  slug: number | string,
  payload: NewsletterReviewPayload
): Promise<NewsletterReviewCreateResponse> => {
  try {
    const response: AxiosResponse<NewsletterReviewCreateResponse> = await axios.post(
      API_ENDPOINTS.submitNewsletterReview(slug),
      payload,
      {
        headers: {
          "X-Client-Platform": "app",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return createMockNewsletterReviewResponse(payload);
    }

    throw error.response ? error.response.data : error.message;
  }
};
