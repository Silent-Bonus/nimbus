export type Unit = "glass" | "hours" | "min" | "unit";

// Individual day progress inside last_7_days_completion
export interface WeeklySummary {
  day: string; // e.g., "Mon"
  percent: number; // e.g., 25.0
}

// Main Habit object
export interface DailyCheckInDetail {
  id: number;
  tags: string[];
  frequency: string; // e.g., "Every day"
  name: string; // e.g., "Water Intake"
  description: string;
  color: string; // e.g., "#2a9d8f"
  reminder_time: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  current_streak: number;
  longest_streak: number;
  last_completed: string | null;
  deleted_at: string | null;
  start_time: string | null; // "HH:mm" or null
  end_time: string | null; // "HH:mm" or null
  all_day: boolean;
  user: number;
  habit_type_name: string; // e.g., "Quantifiable"
  metric_unit: string | null; // sometimes string like "19"
  metric_count: number | null;
  goal: number | null;
  completed: boolean;
  start_date: string; // "YYYY-MM-DD"
  end_date: string | null;
  source: string; // e.g., "system_created"
  target_unit: number | null;
  completed_unit: number | null;
  is_daily_checkin: boolean;
  habit_type_tracking: "incremental" | "boolean" | string;
  last_7_days_completion: WeeklySummary[] | null;
}

// Full API response
export interface DailyCheckInDetailResponse {
  success: boolean;
  message: string;
  data: DailyCheckInDetail;
}

export interface NormalizedHabitDetailResponse {
  success: boolean;
  message: string;
  data: {
    habit: {
      id: number;
      name: string;
      description: string;
      color: string;
      icon: string | null;
      frequency: string;
      start_time: string | null;
      end_time: string | null;
      last_completed: string | null;
      completed: boolean;
      habit_type_tracking: string;
    };
    protocol_details: {
      template_name: string;
      template_type: string;
      source: string;
      frequency_type: string;
      start_date: string | null;
      end_date: string | null;
      all_day: boolean;
      reminder_time: string | null;
    };
    goal_details: {
      goal: number | null;
      metric_details: {
        unit: string;
        target: number;
        completed: number;
        remaining: number;
        completion_percentage: number;
      };
      description: string;
    };
    progress: {
      last_7_days_completion: Array<WeeklySummary & { date?: string }>;
      completed_days_in_month: number[];
      success_rate: number;
      total_completed_habits: number;
      tips: string[];
      interesting_text: string | null;
    };
    trends: unknown | null;
    streak: {
      current_streak: number;
      longest_streak: number;
    };
    daily_checkin: {
      tips: string[];
      interesting_text: string;
    };
  };
}

export type DailyCheckIn = {
  id: number;
  tags: string[];
  frequency: string;
  name: string;
  description: string;
  color: string;
  reminder_time: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  current_streak: number;
  longest_streak: number;
  last_completed: string | null; // ISO timestamp or null
  deleted_at: string | null;
  start_time: string | null; // e.g., "08:00" or null
  end_time: string | null; // e.g., "22:00" or null
  all_day: boolean;
  user: number;
  habit_type_name: string; // e.g. "Quantifiable"
  metric_unit: string | null; // sometimes may come as string like "19"
  metric_count: number | null;
  goal: number | null;
  completed: boolean;
  start_date: string; // "YYYY-MM-DD"
  end_date: string | null;
  source: string; // e.g. "system_created"
  target_unit: number | null;
  completed_unit: number | null;
  is_daily_checkin: boolean;
  habit_type_tracking: "incremental" | "boolean" | string;
  last_7_days_completion: number[] | null;
};

export interface DailyCheckInListResponse {
  success: boolean;
  message: string;
  data: DailyCheckIn[];
}
