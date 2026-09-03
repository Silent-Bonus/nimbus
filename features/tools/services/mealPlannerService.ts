/**
 * Meal planner API service layer.
 *
 * Keep HTTP calls in this file and import shared request/response
 * contracts from the central meal planner types module.
 */

import axios, { type AxiosResponse } from "axios";
import * as FileSystem from "expo-file-system";

import { API_ENDPOINTS } from "@/config/apiConfig";
import { toApiDate } from "@/utils/date-time";
import type {
  AddMealRequest,
  BulkMealUpdatePayload,
  DayPlan,
  MealDashboardResponse,
  MealItemResponse,
  MealPlannerExportErrorPayload,
  MealPlanResponse,
  RawDayPlan,
  UpdateMealItemRequest,
} from "@/features/tools/types/mealPlannerTypes";
import {
  getMealPlanExportErrorMessage,
  getMealPlanPdfFileName,
} from "@/features/tools/utils/mealPlannerUtils";
import { getFreshAuthTokenOrClearSession } from "@/services/authSessionService";

const normalizeDayPlan = (plan: RawDayPlan): DayPlan => ({
  ...plan,
  meals: {
    breakfast: plan.meals?.breakfast ?? null,
    lunch: plan.meals?.lunch ?? null,
    dinner: plan.meals?.dinner ?? null,
    snack: plan.meals?.snack ?? plan.meals?.snacks ?? null,
  },
});

const normalizeMealPlanResponse = <T extends RawDayPlan | RawDayPlan[]>(
  response: MealPlanResponse<T>
): MealPlanResponse<T extends RawDayPlan[] ? DayPlan[] : DayPlan> => {
  const normalizedData = Array.isArray(response.data)
    ? response.data.map(normalizeDayPlan)
    : normalizeDayPlan(response.data);

  return {
    ...response,
    data: normalizedData as T extends RawDayPlan[] ? DayPlan[] : DayPlan,
  };
};

const readMealPlanExportErrorPayload = async (
  fileUri: string
): Promise<MealPlannerExportErrorPayload | null> => {
  try {
    const contents = await FileSystem.readAsStringAsync(fileUri);
    const parsed = JSON.parse(contents);
    return parsed && typeof parsed === "object"
      ? (parsed as MealPlannerExportErrorPayload)
      : null;
  } catch {
    return null;
  }
};

/**
 * Fetch the week-level meal planner response for a given starting day.
 */
export const getWeeklyMealPlan = async (
  startDate: Date
): Promise<MealPlanResponse<DayPlan[]>> => {
  try {
    const formattedDate = toApiDate(startDate);
    const response: AxiosResponse<MealPlanResponse<RawDayPlan[]>> = await axios.get(
      API_ENDPOINTS.getWeeklyMealPlan(formattedDate)
    );
    return normalizeMealPlanResponse(response.data);
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Fetch the planner for a single date or the backend "today" endpoint when omitted.
 */
export const getDailyMealPlan = async (
  date?: Date
): Promise<MealPlanResponse<DayPlan | DayPlan[]>> => {
  try {
    const formattedDate = date ? toApiDate(date) : undefined;
    const response: AxiosResponse<MealPlanResponse<RawDayPlan | RawDayPlan[]>> =
      await axios.get(API_ENDPOINTS.getDailyMealPlan(formattedDate));
    return normalizeMealPlanResponse(response.data);
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Fetch a planner range for Nourish Horizon weekly views.
 */
export const getMealPlanRange = async (
  startDate: Date,
  endDate: Date
): Promise<MealPlanResponse<DayPlan[]>> => {
  try {
    const start = toApiDate(startDate);
    const end = toApiDate(endDate);
    const response: AxiosResponse<MealPlanResponse<RawDayPlan[]>> = await axios.get(
      API_ENDPOINTS.getMealPlanRange(start, end)
    );
    return normalizeMealPlanResponse(response.data);
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Fetch meal dashboard analytics for the requested rolling-day window.
 */
export const getMealDashboard = async (
  days: number = 30
): Promise<MealDashboardResponse> => {
  try {
    const response: AxiosResponse<MealDashboardResponse> = await axios.get(
      API_ENDPOINTS.getMealDashboard(days)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Create a single meal item through the item endpoint.
 */
export const addMealItem = async (
  data: AddMealRequest
): Promise<MealItemResponse> => {
  try {
    const payload = {
      ...data,
      date: toApiDate(data.date),
    };
    const response: AxiosResponse<MealItemResponse> = await axios.post(
      API_ENDPOINTS.addMealItem,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Patch a meal item, currently used for consumed-state updates.
 */
export const updateMealItem = async (
  id: number | string,
  data: UpdateMealItemRequest
): Promise<MealItemResponse> => {
  try {
    const response: AxiosResponse<MealItemResponse> = await axios.patch(
      API_ENDPOINTS.updateMealItem(id),
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Save one-day or multi-day planner changes with the bulk update endpoint.
 */
export const bulkUpdateMealPlan = async (
  data: BulkMealUpdatePayload
): Promise<any> => {
  try {
    const response = await axios.post(API_ENDPOINTS.bulkUpdateMealPlan, data);
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Build the export endpoint used for weekly and daily PDF sharing.
 */
export const getMealPlanPdfUrl = (startDate: string, endDate: string): string => {
  return API_ENDPOINTS.getMealPlanPdf(startDate, endDate);
};

/**
 * Download an authenticated meal-plan PDF into local cache and return its URI.
 *
 * Screens should call this helper instead of constructing auth headers or
 * dealing with export error payload parsing directly.
 */
export const downloadMealPlanPdf = async (
  startDate: string,
  endDate: string
): Promise<string> => {
  const token = await getFreshAuthTokenOrClearSession();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again to export this plan.");
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error("Unable to access local storage for PDF export.");
  }

  const fileUri = `${FileSystem.cacheDirectory}${getMealPlanPdfFileName(
    startDate,
    endDate
  )}`;
  const downloadRes = await FileSystem.downloadAsync(
    getMealPlanPdfUrl(startDate, endDate),
    fileUri,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (downloadRes.status !== 200) {
    const errorPayload = await readMealPlanExportErrorPayload(downloadRes.uri);
    throw new Error(getMealPlanExportErrorMessage(errorPayload));
  }

  return downloadRes.uri;
};
