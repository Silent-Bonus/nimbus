// 3 case start, strat and end or all day
type HabitDuration = {
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
};

// TODO dayofweek dateofMonths
type HabitFrequency = {
  frequency_type: string;
  interval: number;
  start_date: string;

  days_of_week?: string[];
  days_of_month?: string[];
  end_date?: string;
};

export type ReminderAt = {
  time?: string | undefined;
  ten_min_before?: boolean;
  thirty_min_before?: boolean;
};

type HabitMetric = {
  unit: string | number;
  count: number;
};

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export type HabitType = {
  id: number;
  name: string;
  description: string;
  is_global: boolean;
};

export type HabitTag = {
  id: number;
  name?: string;
};

export interface HabitItem {
  id: string;
  name: string;
  icon: string;
  tags: string[];
  habit_type: number;
  description: string;
  color: string;
  current_streak: 0;
  longest_streak: 0;
  frequency: string;
  reminder_time: string;
  start_time: string;
  end_time: string;
  all_day: boolean;

  goal: string;
  start_date: string;
  end_date: string;

  duration: string;
  metric_count: number;
  metric_unit: string;
  habit_type_tracking?: "boolean" | "incremental" | string;
  last_completed: string;
  time?: string;
  completed: boolean;
  // TODO Add other fields that are returned in your list items
}

// Habit Create Request and Response
export interface HabitCreateRequest {
  name: string;
  description?: string;
  icon?: string;
  habit_type_id: number;
  color: string;
  tags?: string[];
  habit_metric: HabitMetric;
  habit_duration: AtLeastOne<HabitDuration>;
  habit_frequency: HabitFrequency;
  remind_at?: AtLeastOne<ReminderAt>;
  subtasks?: string[];
}

export interface HabitCreateResponse {
  success: string;
  message: string;
  data: HabitItem;
  error_code?: string;
}

// Habit List Response
export interface HabitListResponse {
  success: string;
  message: string;
  data: HabitItem[];
  error_code?: string;
}

// Habit Type Request and Response Types
export interface HabitTypeRequest {}

export interface HabitTypeResponse {
  success: string;
  message: string;
  data: HabitType[];
  error_code?: string;
  error?: any;
}

export interface HabitUnit {
  id: number;
  name: string;
}

export interface HabitUnitesponse {
  success: string;
  message: string;
  data: HabitUnit[];
  error_code?: string;
}

// Habit Tag Request and Response Types
export interface HabitTagRequest {}

export interface HabitTagResponse {
  success: string;
  message: string;
  data: HabitTag[];
  error_code?: string;
}

// Habit Delete Request and Response
export interface HabitDeleteResponse {
  success: boolean;
  message: string;
  data: HabitItem | null;
}

export interface HabitDeleteRequest {
  id: number;
}

// Habit completed Request and Response
export interface HabitDoneResponse {
  success: string;
  message: string;
  data: HabitItem[];
}

export interface HabitDoneRequest {
  // completed: boolean;
  date: string;
}

// Habit details type
export interface HabitDetail {
  id: number;
  tags: string[];
  frequency: string;
  name: string;
  description: string;
  color: string;
  reminder_time: string;
  success_rate: number;
  // API need to send proper format either calculate and send or send startime and endtime
  duration: string;
  current_streak: number;
  longest_streak: number;
  last_completed: null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  total_completed_habits: number;
  // API: need to send habit type name
  habit_type: number;
  // API: need to send proper format
  metric: number;
  goal: null;
  metric_count: number;
  metric_unit: string;
}

// Get Habit BY Id
export interface HabitDetailResponse {
  success: string;
  message: string;
  data: HabitDetail;
}

export interface HabitDetailRequest {
  id: string;
}

// UI data types

export type MetricFormat = {
  count: string;
  // unitId?: number; // TODO need to check
  unit: number;
  label?: string;
};

export type Duration = {
  all_day?: boolean;
  start_time?: Date;
  end_time?: Date;
};

export type HabitDateType = {
  start_date: Date;
  end_date?: Date;
  frequency_type?: string;
  interval?: number;

  days_of_week?: string[];
  days_of_month?: number[];
};

export type FrequencyObj = {
  frequency_type: string;
  interval: number;

  days_of_week?: string[];
  days_of_month?: number[];
};
