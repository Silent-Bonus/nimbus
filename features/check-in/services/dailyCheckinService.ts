import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  DailyCheckInDetailResponse,
  DailyCheckInListResponse,
  NormalizedHabitDetailResponse,
} from "@/features/check-in/types/dailyCheckin";
import { transformHabitDetailResponse } from "@/features/check-in/utils/dailyCheckin";
import {
  transformHabitListResponse,
  type NormalizedHabitListResponse,
} from "@/features/habit/utils/habitList";
import axios, { AxiosResponse } from "axios";

/**
 * Fetch daily check-ins. If `date` is provided, adds the date + is_daily_checkin query.
 * @param date - "YYYY-MM-DD" (optional)
 * @param isDailyCheckIn - filter to only daily check-ins (defaults to true)
 */
export const getCheckinList = async (
  date: string,
  isDailyCheckIn: boolean = true
): Promise<NormalizedHabitListResponse> => {
  try {
    const endpoint = API_ENDPOINTS.getDailyCheckInByDate(date, isDailyCheckIn);
    const { data }: AxiosResponse<DailyCheckInListResponse> = await axios.get(
      endpoint
    );
    return transformHabitListResponse(data);
  } catch (err: any) {
    // Bubble up a useful error message
    throw err?.response?.data ?? err?.message ?? err;
  }
};

export const getHabitDetailsByDate = async (
  habitId: number,
  date: string
): Promise<NormalizedHabitDetailResponse> => {
  try {
    const endpoint = API_ENDPOINTS.getHabitDetailsByDate(habitId, date);
    const { data }: AxiosResponse<
      DailyCheckInDetailResponse | NormalizedHabitDetailResponse
    > = await axios.get(
      endpoint
    );
    return transformHabitDetailResponse(data);
  } catch (err: any) {
    throw err?.response?.data ?? err?.message ?? err;
  }
};

export const incrementHabitProgress = async (
  habitId: number,
  date: string,
  incrementBy: number
) => {
  try {
    const endpoint = API_ENDPOINTS.incrementHabitProgress(habitId);
    const { data } = await axios.post(endpoint, {
      date,
      increment_by: incrementBy,
    });
    return data;
  } catch (err: any) {
    throw err?.response?.data ?? err?.message ?? err;
  }
};

export const updateHabitReminderFrequency = async (
  habitId: number,
  reminderFrequency: number
) => {
  try {
    const endpoint = `${API_ENDPOINTS.habitPatch}${habitId}/`;
    const { data } = await axios.patch(endpoint, {
      reminder_frequency: reminderFrequency,
    });
    return data;
  } catch (err: any) {
    throw err?.response?.data ?? err?.message ?? err;
  }
};
