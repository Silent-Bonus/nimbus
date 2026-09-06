import axios, { AxiosResponse } from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import type {
  BodyVitalsTrendMetric,
  BodyVitalsTrendRange,
  BodyVitalsTrendResponse,
} from "@/features/self-care/types/bodyVitals";

// Reads persisted vitals snapshots from the backend for the trends screen.
export async function getBodyVitalsTrends(
  range: BodyVitalsTrendRange = "30d",
  metric: BodyVitalsTrendMetric = "all"
): Promise<BodyVitalsTrendResponse> {
  const response: AxiosResponse<BodyVitalsTrendResponse> = await axios.get(
    API_ENDPOINTS.vitalsTrends(range, metric)
  );

  return response.data;
}
