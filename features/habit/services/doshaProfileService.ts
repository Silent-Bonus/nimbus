import axios, { type AxiosResponse } from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";

export type DoshaKey = "vata" | "pitta" | "kapha";

export type DoshaProfile = {
  assessment?: {
    id: number;
    status: string;
    version?: string;
    completed_at?: string;
  } | null;
  result?: {
    assessment?: number;
    result_payload?: {
      normalized_scores?: Partial<Record<DoshaKey, number>>;
      dominant_dosha?: DoshaKey | string;
      secondary_dosha?: DoshaKey | string | null;
      dosha_combination?: string;
      result_summary?: string;
    };
    result_summary?: string;
    analysis_version?: string;
    generated_at?: string;
  } | null;
};

export type DoshaProfileResponse = {
  success: boolean;
  message: string;
  data: DoshaProfile;
};

export async function getDoshaProfile(): Promise<DoshaProfileResponse> {
  const response: AxiosResponse<DoshaProfileResponse> = await axios.get(
    API_ENDPOINTS.doshaProfile
  );
  return response.data;
}
