import axios, { AxiosResponse } from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import type {
  AddRecipeFavoriteResponse,
  RecipeCategoryListResponse,
  RecipeDetailResponse,
  RecipeListResponse,
  RecipeReviewPayload,
  RecipeReviewResponse,
} from "@/features/tools/types/recipeTypes";

type RecipeListQuery = {
  category?: string;
  search?: string;
};

const buildRecipeListEndpoint = (params?: RecipeListQuery) => {
  if (!params?.category && !params?.search) {
    return API_ENDPOINTS.getRecipeList;
  }

  const queryParams = [
    params.category
      ? `category=${encodeURIComponent(params.category)}`
      : null,
    params.search ? `search=${encodeURIComponent(params.search)}` : null,
  ].filter(Boolean);

  return `${API_ENDPOINTS.getRecipeList}?${queryParams.join("&")}`;
};

export const getRecipeList = async (
  params?: RecipeListQuery
): Promise<RecipeListResponse> => {
  try {
    const response: AxiosResponse<RecipeListResponse> = await axios.get(
      buildRecipeListEndpoint(params)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getRecipeCategories =
  async (): Promise<RecipeCategoryListResponse> => {
    try {
      const response: AxiosResponse<RecipeCategoryListResponse> =
        await axios.get(API_ENDPOINTS.getRecipeCategories);
      return response.data;
    } catch (error: any) {
      throw error.response ? error.response.data : error.message;
    }
  };

export const getFavoriteRecipeList = async (): Promise<RecipeListResponse> => {
  try {
    const response: AxiosResponse<RecipeListResponse> = await axios.get(
      API_ENDPOINTS.getRecipeFavorites
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getRecipeDetails = async (
  recipeKey: number | string
): Promise<RecipeDetailResponse> => {
  try {
    const response: AxiosResponse<RecipeDetailResponse> = await axios.get(
      API_ENDPOINTS.getRecipeDetails(recipeKey)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const setRecipeFavoriteState = async (
  id: number | string,
  favorite: boolean
): Promise<AddRecipeFavoriteResponse> => {
  try {
    const endpoint = API_ENDPOINTS.getRecipeFavorite(id);
    const response: AxiosResponse<AddRecipeFavoriteResponse> = favorite
      ? await axios.post(endpoint)
      : await axios.delete(endpoint);
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const submitRecipeReview = async (
  id: number | string,
  payload: RecipeReviewPayload
): Promise<RecipeReviewResponse> => {
  try {
    const response: AxiosResponse<RecipeReviewResponse> = await axios.post(
      API_ENDPOINTS.submitRecipeReview(id),
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const searchRecipes = async (
  query: string
): Promise<RecipeListResponse> => {
  try {
    return await getRecipeList({ search: query });
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
