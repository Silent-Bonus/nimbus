import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  type ReflectionSessionAbandonResponse,
  type ReflectionCategoryListResponse,
  type ReflectionSessionCompleteResponse,
  type ReflectionSessionDetailResponse,
  type ReflectionSessionListResponse,
  type ReflectionDetailResponse,
  type ReflectionEntryItem,
  type ReflectionEntryListResponse,
  type ReflectionListResponse,
  type ReflectionStepSaveRequest,
  type ReflectionStepSaveResponse,
  type ReflectionSessionStartRequest,
  type ReflectionSessionStartResponse,
  type ReflectionSubmitRequest,
  type ReflectionSubmitResponse,
} from "@/features/self-care/types/reflectionTypes";
import type {
  WellnessContentDetailResponse,
  WellnessContentModality,
  WellnessContentResponse,
} from "@/features/self-care/types/wellnessContentTypes";
import type {
  CreateMoveRoutineRequest,
  CreateMoveRoutineResponse,
  MoveExerciseListResponse,
  MoveExerciseCategoriesResponse,
  MovePlanListResponse,
  MovePlanDetailResponse,
  StartMovePlanResponse,
  MoveExerciseDetailResponse,
  MoveSessionActionResponse,
  StartMoveExerciseRequest,
  StartMoveExerciseResponse,
  WorkoutVideoListResponse,
} from "@/features/self-care/types/workoutTypes";

// Reflection API

export const getReflectionList = async (): Promise<ReflectionListResponse> => {
  try {
    const response: AxiosResponse<ReflectionListResponse> = await axios.get(
      API_ENDPOINTS.getReflectionList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getReflectionCategories = async (): Promise<
  ReflectionCategoryListResponse
> => {
  try {
    const response: AxiosResponse<ReflectionCategoryListResponse> =
      await axios.get(API_ENDPOINTS.getReflectionCategories);
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getReflectionDetail = async (
  templateId: string
): Promise<ReflectionDetailResponse> => {
  try {
    const response: AxiosResponse<ReflectionDetailResponse> = await axios.get(
      API_ENDPOINTS.getReflectionDetail(templateId)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const startReflectionSession = async (
  data: ReflectionSessionStartRequest
): Promise<ReflectionSessionStartResponse> => {
  try {
    const response: AxiosResponse<ReflectionSessionStartResponse> = await axios.post(
      API_ENDPOINTS.startReflectionSession,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getReflectionSession = async (
  sessionId: number | string
): Promise<ReflectionSessionDetailResponse> => {
  try {
    const response: AxiosResponse<ReflectionSessionDetailResponse> = await axios.get(
      API_ENDPOINTS.getReflectionSession(sessionId)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getReflectionSessionList = async (params?: {
  status?: string | string[];
}): Promise<
  ReflectionSessionListResponse
> => {
  try {
    const queryParams = new URLSearchParams();

    if (Array.isArray(params?.status)) {
      params.status.forEach((status) => {
        if (status) {
          queryParams.append("status", status);
        }
      });
    } else if (params?.status) {
      queryParams.append("status", params.status);
    }

    const response: AxiosResponse<ReflectionSessionListResponse> = await axios.get(
      queryParams.toString()
        ? `${API_ENDPOINTS.getReflectionSessionList}?${queryParams.toString()}`
        : API_ENDPOINTS.getReflectionSessionList
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const saveReflectionSessionStep = async (
  sessionId: number | string,
  stepNumber: number,
  data: ReflectionStepSaveRequest
): Promise<ReflectionStepSaveResponse> => {
  try {
    const response: AxiosResponse<ReflectionStepSaveResponse> = await axios.post(
      API_ENDPOINTS.saveReflectionSessionStep(sessionId, stepNumber),
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const completeReflectionSession = async (
  sessionId: number | string
): Promise<ReflectionSessionCompleteResponse> => {
  try {
    const response: AxiosResponse<ReflectionSessionCompleteResponse> =
      await axios.post(API_ENDPOINTS.completeReflectionSession(sessionId), {});
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const abandonReflectionSession = async (
  sessionId: number | string
): Promise<ReflectionSessionAbandonResponse> => {
  try {
    const response: AxiosResponse<ReflectionSessionAbandonResponse> =
      await axios.post(API_ENDPOINTS.abandonReflectionSession(sessionId), {});
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const submitReflectionEntry = async (
  data: ReflectionSubmitRequest
): Promise<ReflectionSubmitResponse> => {
  try {
    const response: AxiosResponse<ReflectionSubmitResponse> = await axios.post(
      API_ENDPOINTS.submitReflection,
      data
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getReflectionEntries = async (): Promise<
  ReflectionEntryItem[] | ReflectionEntryListResponse
> => {
  try {
    const response: AxiosResponse<ReflectionEntryItem[] | ReflectionEntryListResponse> =
      await axios.get(API_ENDPOINTS.getReflectionEntries);
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

export const getMoveExercises = async (filters?: { category?: string; difficulty?: string }): Promise<MoveExerciseListResponse> => {
  try {
    const response: AxiosResponse<MoveExerciseListResponse> = await axios.get(
      API_ENDPOINTS.getMoveExercises,
      { params: filters }
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getMoveExerciseCategories = async (): Promise<MoveExerciseCategoriesResponse> => {
  try {
    const response: AxiosResponse<MoveExerciseCategoriesResponse> = await axios.get(
      API_ENDPOINTS.getMoveExerciseCategories
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const startMoveExercise = async (
  exerciseId: number | string,
  payload: StartMoveExerciseRequest
): Promise<StartMoveExerciseResponse> => {
  try {
    const response: AxiosResponse<StartMoveExerciseResponse> = await axios.post(
      API_ENDPOINTS.startMoveExercise(exerciseId),
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const pauseMoveSession = async (
  sessionRef: string
): Promise<MoveSessionActionResponse> => {
  try {
    const response: AxiosResponse<MoveSessionActionResponse> = await axios.post(
      API_ENDPOINTS.pauseMoveSession(sessionRef)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const resumeMoveSession = async (
  sessionRef: string
): Promise<MoveSessionActionResponse> => {
  try {
    const response: AxiosResponse<MoveSessionActionResponse> = await axios.post(
      API_ENDPOINTS.resumeMoveSession(sessionRef)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const completeMoveSession = async (
  sessionRef: string
): Promise<MoveSessionActionResponse> => {
  try {
    const response: AxiosResponse<MoveSessionActionResponse> = await axios.post(
      API_ENDPOINTS.completeMoveSession(sessionRef)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getMoveExerciseDetails = async (
  id: number | string
): Promise<MoveExerciseDetailResponse> => {
  try {
    const response: AxiosResponse<MoveExerciseDetailResponse> = await axios.get(
      API_ENDPOINTS.getMoveExerciseDetails(id)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const createMoveRoutine = async (
  payload: CreateMoveRoutineRequest
): Promise<CreateMoveRoutineResponse> => {
  try {
    const response: AxiosResponse<CreateMoveRoutineResponse> = await axios.post(
      API_ENDPOINTS.createMovePlan,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getMovePlans = async (): Promise<MovePlanListResponse> => {
  try {
    const response: AxiosResponse<MovePlanListResponse> = await axios.get(
      API_ENDPOINTS.getMovePlans
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getMovePlanDetails = async (
  id: number | string
): Promise<MovePlanDetailResponse> => {
  try {
    const response: AxiosResponse<MovePlanDetailResponse> = await axios.get(
      API_ENDPOINTS.getMovePlanDetails(id)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const startMovePlan = async (
  id: number | string
): Promise<StartMovePlanResponse> => {
  try {
    const response: AxiosResponse<StartMovePlanResponse> = await axios.post(
      API_ENDPOINTS.startMovePlan(id)
    );
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
