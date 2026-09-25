import axios, { type AxiosResponse } from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import type {
  ProtocolTemplateDetailResponse,
  ProtocolTemplateListResponse,
} from "@/features/tools/types/protocolTemplateTypes";

export const getProtocolTemplates = async (): Promise<ProtocolTemplateListResponse> => {
  try {
    const response: AxiosResponse<ProtocolTemplateListResponse> = await axios.get(
      API_ENDPOINTS.protocolTemplates
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getProtocolTemplate = async (
  id: number | string
): Promise<ProtocolTemplateDetailResponse> => {
  try {
    const response: AxiosResponse<ProtocolTemplateDetailResponse> = await axios.get(
      API_ENDPOINTS.protocolTemplateDetails(id)
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const activateProtocolTemplate = async (
  id: number | string
): Promise<unknown> => {
  try {
    const response = await axios.post(API_ENDPOINTS.activateProtocolTemplate(id));
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
