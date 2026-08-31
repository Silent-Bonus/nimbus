import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  // ArticleDataDetails,
  ArticleListResponse,
  AudioBookListResponse,
  FavoriteNewsletterListResponse,
  NewsletterCategoryListResponse,
  NewsletterDetailResponse,
  NewsletterFavoriteResponse,
  NewsletterListResponse,
  NewsletterReviewCreateResponse,
  NewsletterReviewPayload,
  NewsletterReviewListResponse,
  ShortVideoListResponse,
  SoundscapeListResponse,
  bodyShapeCalculatorRequest,
  bodyShapeCalculatorResponse,
  calorieCalculatorRequest,
  calorieCalculatorResponse,
  proteinIntakeCalculatorRequest,
  proteinIntakeCalculatorResponse,
} from "@/features/tools/types/toolsTypes";

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

// get article list
// TODO: parsing data check image, source, filter functionality
export const getArticleList = async (
  category?: string
): Promise<ArticleListResponse> => {
  try {
    const endpoint = category
      ? `${API_ENDPOINTS.getArticleList}&category=${category}`
      : API_ENDPOINTS.getArticleList;
    const response: AxiosResponse<ArticleListResponse> = await axios.get(
      endpoint
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
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
  async (): Promise<FavoriteNewsletterListResponse> => {
    try {
      const response: AxiosResponse<FavoriteNewsletterListResponse> =
        await axios.get(API_ENDPOINTS.getNewsletterFavorites);
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

//  TODO: Need to integrate
export const getArticleDetails = async (id: number): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.get(
      `${API_ENDPOINTS.getArticleDetails}${id}/`
    );
    return response.data; // Return the list data
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

// TODO: parsing data check image, source
export const getSoundscapeList = async (): Promise<SoundscapeListResponse> => {
  try {
    const response: AxiosResponse<SoundscapeListResponse> = await axios.get(
      API_ENDPOINTS.getSoundscapeList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getShortVideo = async (): Promise<ShortVideoListResponse> => {
  try {
    const response: AxiosResponse<ShortVideoListResponse> = await axios.get(
      API_ENDPOINTS.getShortVideoList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getAudioBookList = async (): Promise<AudioBookListResponse> => {
  try {
    const response: AxiosResponse<AudioBookListResponse> = await axios.get(
      API_ENDPOINTS.getAudioBookList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getCalorieIntakeInfo = async (
  data: calorieCalculatorRequest
): Promise<calorieCalculatorResponse> => {
  try {
    const response: AxiosResponse<calorieCalculatorResponse> = await axios.post(
      API_ENDPOINTS.calorieCalculator,
      data
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getProteinIntakeInfo = async (
  data: proteinIntakeCalculatorRequest
): Promise<proteinIntakeCalculatorResponse> => {
  try {
    const response: AxiosResponse<proteinIntakeCalculatorResponse> =
      await axios.post(API_ENDPOINTS.proteinIntakeCalculator, data);
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getBodyShapeInfo = async (
  data: bodyShapeCalculatorRequest
): Promise<bodyShapeCalculatorResponse> => {
  try {
    const response: AxiosResponse<bodyShapeCalculatorResponse> =
      await axios.post(API_ENDPOINTS.bodyShapeCalculator, data);
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
