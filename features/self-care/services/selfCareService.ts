import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  JournalEntryListResponse,
  JournalListResponse,
  JournalSubmitRequest,
  JournalSubmitResponse,
  WellnessContentModality,
  WellnessContentDetailResponse,
  WellnessContentResponse,
  WorkoutVideoListResponse,
} from "@/features/self-care/types/selfCareTypes";

// Jounaling API

export const getJournalList = async (): Promise<JournalListResponse> => {
  try {
    const response: AxiosResponse<JournalListResponse> = await axios.get(
      API_ENDPOINTS.getJournalList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const submitJournalEntry = async (
  data: JournalSubmitRequest
): Promise<JournalSubmitResponse> => {
  try {
    const response: AxiosResponse<JournalSubmitResponse> = await axios.post(
      API_ENDPOINTS.submitJournal,
      data
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getJournalEntry = async (): Promise<JournalEntryListResponse> => {
  try {
    const response: AxiosResponse<JournalEntryListResponse> = await axios.get(
      API_ENDPOINTS.getJournalEntry
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// Workout FLow Api

export const getWorkoutVideo = async (): Promise<WorkoutVideoListResponse> => {
  try {
    const response: AxiosResponse<WorkoutVideoListResponse> = await axios.get(
      API_ENDPOINTS.getWorkoutVideoList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getWorkouts = async (params?: {
  category?: string;
  search?: string;
  ordering?: string;
}): Promise<any> => {
  try {
    const response = await axios.get(API_ENDPOINTS.getWorkouts, { params });
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getWorkoutDetails = async (id: number | string): Promise<any> => {
  try {
    const response = await axios.get(API_ENDPOINTS.getWorkoutDetails(id));
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// Wellness Content API

export const getSoundscapeContentList = async (params?: {
  category?: string;
}): Promise<WellnessContentResponse> => {
  try {
    const response: AxiosResponse<WellnessContentResponse> = await axios.get(
      API_ENDPOINTS.getWellnessContent,
      {
        params: {
          ...(params ?? {}),
          modality: "soundscape",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getWellnessContentList = async (params?: {
  modality?: WellnessContentModality;
  category?: string;
}): Promise<WellnessContentResponse> => {
  try {
    const response: AxiosResponse<WellnessContentResponse> = await axios.get(
      API_ENDPOINTS.getWellnessContent,
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// todo meditaion with slug
export const getWellnessContentDetail = async (
  id: number | string
): Promise<WellnessContentDetailResponse> => {
  try {
    const response: AxiosResponse<WellnessContentDetailResponse> =
      await axios.get(API_ENDPOINTS.getWellnessContentDetail(id));
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
