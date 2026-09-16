import axios from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";

export interface TodayResonanceResponse {
  success: boolean;
  message?: string;
  data?: {
    score?: number | string | null;
    resonance_score?: number | string | null;
    percentage?: number | string | null;
    value?: number | string | null;
    [key: string]: unknown;
  } | number | string | null;
}

function toScore(value: unknown): number | null {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, score));
}

export async function getTodayResonance(): Promise<number | null> {
  const response = await axios.get<TodayResonanceResponse>(
    API_ENDPOINTS.todayResonance
  );
  const data = response.data?.data;

  if (typeof data === "number" || typeof data === "string") {
    return toScore(data);
  }

  if (data && typeof data === "object") {
    return toScore(
      data.score ?? data.resonance_score ?? data.percentage ?? data.value
    );
  }

  return null;
}
