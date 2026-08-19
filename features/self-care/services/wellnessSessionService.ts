import axios, { AxiosResponse } from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import type {
  WellnessMoodLogRequest,
  WellnessMoodLogResponse,
  WellnessMoodLogStatsResponse,
  WellnessSessionCompleteRequest,
  WellnessSessionCompleteResponse,
  WellnessSessionCreateResponse,
  WellnessSessionDetailResponse,
  WellnessSessionFeedbackRequest,
  WellnessSessionFeedbackResponse,
  WellnessSessionListResponse,
  WellnessSessionPauseResumeResponse,
  WellnessSessionRequest,
  WellnessSummaryResponse,
} from "@/features/self-care/types/wellnessSessionTypes";

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

export const getWellnessSessionList = async (): Promise<WellnessSessionListResponse> => {
  try {
    const response: AxiosResponse<WellnessSessionListResponse> = await axios.get(
      API_ENDPOINTS.getWellnessSessionList
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getWellnessSessionByRef = async (
  sessionRef: string
): Promise<WellnessSessionDetailResponse> => {
  try {
    const response: AxiosResponse<WellnessSessionDetailResponse> =
      await axios.get(API_ENDPOINTS.getWellnessSessionByRef(sessionRef));
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const pauseWellnessSession = async (
  sessionRef: string
): Promise<WellnessSessionPauseResumeResponse> => {
  try {
    const response: AxiosResponse<WellnessSessionPauseResumeResponse> =
      await axios.post(API_ENDPOINTS.pauseWellnessSession(sessionRef));
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const resumeWellnessSession = async (
  sessionRef: string
): Promise<WellnessSessionPauseResumeResponse> => {
  try {
    const response: AxiosResponse<WellnessSessionPauseResumeResponse> =
      await axios.post(API_ENDPOINTS.resumeWellnessSession(sessionRef));
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const submitWellnessSessionFeedback = async (
  sessionRef: string,
  data: WellnessSessionFeedbackRequest
): Promise<WellnessSessionFeedbackResponse> => {
  try {
    const response: AxiosResponse<WellnessSessionFeedbackResponse> =
      await axios.post(
        API_ENDPOINTS.submitWellnessSessionFeedback(sessionRef),
        data
      );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const createMoodLog = async (
  data: WellnessMoodLogRequest
): Promise<WellnessMoodLogResponse> => {
  try {
    const response: AxiosResponse<WellnessMoodLogResponse> = await axios.post(
      API_ENDPOINTS.createMoodLog,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getMoodLogStats = async (): Promise<WellnessMoodLogStatsResponse> => {
  try {
    const response: AxiosResponse<WellnessMoodLogStatsResponse> = await axios.get(
      API_ENDPOINTS.getMoodLogStats
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getWellnessSummary = async (): Promise<WellnessSummaryResponse> => {
  try {
    const response: AxiosResponse<WellnessSummaryResponse> = await axios.get(
      API_ENDPOINTS.getWellnessSummary
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
