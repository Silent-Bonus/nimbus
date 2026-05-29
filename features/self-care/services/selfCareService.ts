import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  JournalEntryListResponse,
  JournalListResponse,
  JournalSubmitRequest,
  JournalSubmitResponse,
  WellnessSessionCompleteRequest,
  WellnessSessionCompleteResponse,
  WellnessSessionCreateResponse,
  WellnessContentDetailResponse,
  MeditationVideoListResponse,
  WellnessContentResponse,
  WorkoutVideoListResponse,
  WellnessSessionRequest,
} from "@/features/self-care/types/selfCareTypes";

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

// TODO ADD API FOR DETAILS, SUBMIT, RESULT
// export const getMentalTestList = async (): Promise<MentalTestListResponse> => {
//   try {
//     const response: AxiosResponse<MentalTestListResponse> = await axios.get(
//       API_ENDPOINTS.getMentalTestList
//     );
//     console.log(response, "medical test");
//     return response; // Return the list data
//   } catch (error: any) {
//     throw error.response ? error.response.data : error.message;
//   }
// };

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

// filteration not working
// card Color
export const getMeditationAudioList =
  async (): Promise<MeditationVideoListResponse> => {
    try {
      const response: AxiosResponse<MeditationVideoListResponse> =
        await axios.get(API_ENDPOINTS.getMeditationList);
      return response.data; // Return the list data
    } catch (error: any) {
      throw error.response ? error.response.data : error.message;
    }
  };

export const getWellnessContentList = async (params?: {
  modality?: string;
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

export const createWellnessSession = async (
  data: WellnessSessionRequest
): Promise<WellnessSessionCreateResponse> => {
  try {
    const response: AxiosResponse<WellnessSessionCreateResponse> =
      await axios.post(API_ENDPOINTS.createWellnessSession, data);
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const completeWellnessSession = async (
  sessionRef: string,
  data: WellnessSessionCompleteRequest
): Promise<WellnessSessionCompleteResponse> => {
  try {
    const response: AxiosResponse<WellnessSessionCompleteResponse> =
      await axios.post(API_ENDPOINTS.completeWellnessSession(sessionRef), data);
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
