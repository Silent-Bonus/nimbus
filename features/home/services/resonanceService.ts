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
    eligible?: boolean;
    state?: string | null;
    percent?: number | null;
    summary?: string | null;
    active_days_count?: number | null;
    required_active_days?: number | null;
    [key: string]: unknown;
  } | number | string | null;
}

export interface TodayResonance {
  score: number | null;
  eligible?: boolean;
  state?: string | null;
  percent?: number | null;
  summary?: string | null;
  active_days_count?: number | null;
  required_active_days?: number | null;
}

function toScore(value: unknown): number | null {
  if (value == null || (typeof value === "string" && !value.trim())) return null;
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, score));
}

export async function getTodayResonance(): Promise<TodayResonance | null> {
  const response = await axios.get<TodayResonanceResponse>(
    API_ENDPOINTS.todayResonance
  );
  const data = response.data?.data;

  if (typeof data === "number" || typeof data === "string") {
    return { score: toScore(data) };
  }

  if (data && typeof data === "object") {
    return {
      score: toScore(
        data.score ?? data.resonance_score ?? data.percentage ?? data.value
      ),
      eligible: data.eligible,
      state: data.state,
      percent: data.percent,
      summary: data.summary,
      active_days_count: data.active_days_count,
      required_active_days: data.required_active_days,
    };
  }

  return null;
}
