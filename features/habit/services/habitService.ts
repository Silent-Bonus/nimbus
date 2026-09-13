import axios, { AxiosResponse, AxiosError } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  HabitCreateRequest,
  HabitCreateResponse,
  HabitListResponse,
  HabitDeleteRequest,
  HabitDeleteResponse,
  HabitDoneRequest,
  HabitDoneResponse,
  HabitDetailRequest,
  HabitDetailResponse,
  HabitTypeResponse,
  HabitTagResponse,
  HabitUnitesponse,
} from "@/features/habit/types/habitTypes";
import {
  transformHabitListResponse,
  type NormalizedHabitListResponse,
} from "@/features/habit/utils/habitList";

// Type definitions for login, signup, and list responses

// create habit API request
export const createHabit = async (
  data: HabitCreateRequest
): Promise<HabitCreateResponse> => {
  try {
    const response: AxiosResponse<HabitCreateResponse> = await axios.post(
      API_ENDPOINTS.createHabit,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Something went wrong. Please try again.";

    throw error.response ? error.response.data : error.message;
  }
};

// create bulk habit API request
export const createBulkHabit = async (
  id: number | string,
  data: HabitCreateRequest[]
): Promise<HabitCreateResponse[]> => {
  try {
    const response: AxiosResponse<HabitCreateResponse[]> = await axios.post(
      API_ENDPOINTS.activateHabitTemplate(id),
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// get habit list
export const getHabitList = async (
  data?: string
): Promise<NormalizedHabitListResponse> => {
  const endpoint = data
    ? `${API_ENDPOINTS.createHabit}?date=${data}`
    : API_ENDPOINTS.createHabit;
  try {
    const response: AxiosResponse<HabitListResponse | NormalizedHabitListResponse> = await axios.get(
      endpoint
    );
    return transformHabitListResponse(response.data);
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// get habit type
export const getHabitType = async (): Promise<HabitTypeResponse> => {
  try {
    const response: AxiosResponse<HabitTypeResponse> = await axios.get(
      API_ENDPOINTS.habitTypeList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// get habit tag
export const getHabitTag = async (): Promise<HabitTagResponse> => {
  try {
    const response: AxiosResponse<HabitTagResponse> = await axios.get(
      API_ENDPOINTS.habitTagList
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// get habit tag
export const getHabitUnitData = async (): Promise<HabitUnitesponse> => {
  try {
    const response: AxiosResponse<HabitUnitesponse> = await axios.get(
      API_ENDPOINTS.habitUnit
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// get habit details by id
export const getHabitDetailsById = async (
  id: string,
  date?: string
): Promise<HabitDetailResponse> => {
  try {
    const response: AxiosResponse<HabitDetailResponse> = await axios.get(
      `${API_ENDPOINTS.habitDetailsById}${id}/?date=${date}&is_daily_checkin=false`
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// delete habit request
export const deleteHabit = async (
  id: number,
  date?: string
): Promise<HabitDeleteResponse> => {
  try {
    const response: AxiosResponse<HabitDeleteResponse> = await axios.delete(
      `${API_ENDPOINTS.habitDetailsById}${id}/?date=${date}`
    );
    let obj = { success: false, message: "", data: null };
    if (response.status == 204) {
      obj = { success: true, message: "Deleted", data: null };
    } else {
      obj = { success: false, message: "Something went wrong", data: null };
    }
    return obj; // Return the data containing the token
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

// mark habit as done
export const markHabitDone = async (
  data: HabitDoneRequest,
  id: any
): Promise<HabitDoneResponse> => {
  try {
    const endpoint = `${API_ENDPOINTS.markHabitDone(id)}`;
    const response: AxiosResponse<HabitDoneResponse> = await axios.post(
      endpoint,
      data
    );
    if (response.status === 204) {
      // A successful mark-complete request may intentionally have no body.
      // Normalize it so the caller can still show success and refresh the UI.
      return {
        success: "true",
        message: "Habit marked as done",
        data: [],
      };
    }
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
