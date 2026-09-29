import axios, { AxiosResponse } from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import type {
  BodyVitalsTrendMetric,
  BodyVitalsTrendRange,
  BodyVitalsTrendApiResponse,
  BodyVitalsTrendResponse,
} from "@/features/self-care/types/bodyVitals";

// Reads persisted vitals snapshots from the backend for the trends screen.
export async function getBodyVitalsTrends(
  range: BodyVitalsTrendRange = "30d",
  metric: BodyVitalsTrendMetric = "all"
): Promise<BodyVitalsTrendResponse> {
  const response: AxiosResponse<BodyVitalsTrendApiResponse> = await axios.get(
    API_ENDPOINTS.vitalsTrends(range, metric)
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Unable to load vitals trends.");
  }
  return response.data.data;
}
