import axios from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";

export interface JourneyPlan {
  id: number;
  status: string;
  plan_version?: string;
  generation_source?: string;
  start_date?: string;
  end_date?: string;
  phases?: unknown[];
  current_phase?: Record<string, unknown>;
  resonance_summary?: string | null;
}

export interface CurrentJourneyPlanResponse {
  success: boolean;
  message: string;
  data: JourneyPlan | Record<string, never>;
}

export interface ActivateJourneyResponse {
  success: boolean;
  message: string;
  data: JourneyPlan | Record<string, unknown>;
}

export async function getCurrentJourneyPlan(): Promise<CurrentJourneyPlanResponse> {
  const response = await axios.get<CurrentJourneyPlanResponse>(
    API_ENDPOINTS.currentJourneyPlan
  );
  return response.data;
}

export async function activateJourneyPlan(
  planId: number,
  startDate: string
): Promise<ActivateJourneyResponse> {
  const response = await axios.post<ActivateJourneyResponse>(
    API_ENDPOINTS.activateJourneyPlan(planId),
    { start_date: startDate }
  );
  return response.data;
}
