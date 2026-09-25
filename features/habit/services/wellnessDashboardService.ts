import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";

export type WellnessDashboardTimelinePoint = {
  date: string;
  active: boolean;
  session_count: number;
  completed_session_count: number;
  completed_minutes: number;
  meditation_minutes: number;
  workout_minutes: number;
  soundscape_minutes: number;
  checkins_completed: number;
  mood_checkins: number;
};

export type WellnessDashboard = {
  period: {
    range: string;
    start_date: string;
    end_date: string;
  };
  ritual_consistency: {
    percentage: number;
    active_days: number;
    timeline: WellnessDashboardTimelinePoint[];
  };
  core_vitals: {
    zen_minutes: number;
    completed_minutes: number;
    sleep_consistency: {
      percentage: number;
      tracked_days: number;
      available: boolean;
    };
    workout_sessions: number;
    daily_checkins_completed: number;
  };
  monthly_pulse: {
    active_days: number;
    session_count: number;
    mood_checkins_completed: number;
    daily_checkins_completed: number;
  };
  ritual_balance: {
    basis: string;
    percentages: {
      mind: number;
      body: number;
      soul: number;
    };
    minutes: {
      mind: number;
      body: number;
      soul: number;
    };
  };
};

type WellnessDashboardResponse = {
  success: boolean;
  message?: string;
  data?: WellnessDashboard;
};

export async function getWellnessDashboard(
  range = "7d"
): Promise<WellnessDashboard | null> {
  try {
    const response = await axios.get<WellnessDashboardResponse>(
      API_ENDPOINTS.getWellnessDashboard(range)
    );

    return response.data.success && response.data.data
      ? response.data.data
      : null;
  } catch (error: any) {
    if (error?.response?.status !== 404) {
      console.warn("wellness dashboard fetch failed", error);
    }
    return null;
  }
}
