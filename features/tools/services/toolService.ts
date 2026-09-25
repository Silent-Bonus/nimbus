import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  SoundscapeListResponse,
  bodyShapeCalculatorRequest,
  bodyShapeCalculatorResponse,
  calorieCalculatorRequest,
  calorieCalculatorResponse,
  proteinIntakeCalculatorRequest,
  proteinIntakeCalculatorResponse,
} from "@/features/tools/types/toolsTypes";

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
