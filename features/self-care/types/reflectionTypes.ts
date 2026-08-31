// Reflection API types.

export interface ReflectionTemplateQuestion {
  id: number;
  step_number: number;
  text: string;
  type: string;
}

export interface ReflectionTemplateItem {
  template_id: string;
  template_slug?: string;
  title: string;
  category: string;
  description: string;
  benefits: string[];
  icon: string;
  estimated_minutes: number;
  total_steps: number;
  questions: ReflectionTemplateQuestion[];
}

export interface ReflectionListResponse {
  success: boolean;
  message: string;
  data: ReflectionTemplateItem[];
}

export interface ReflectionCategoryItem {
  value: string;
  label: string;
}

export interface ReflectionCategoryListResponse {
  success: boolean;
  message: string;
  data: ReflectionCategoryItem[];
}

export interface ReflectionDetailResponse {
  success: boolean;
  message: string;
  data: ReflectionTemplateItem;
}

export type ReflectionTriggerSource = "manual" | "notification" | "wearable";

export interface ReflectionSessionResponseItem {
  step_number: number;
  question_text_snapshot: string;
  answer: string;
  saved_at: string;
}

export interface ReflectionSessionState {
  id: number;
  status: string;
  current_step: number;
  total_steps: number;
  template_slug: string;
  template_title: string;
  category: string;
  trigger_source: ReflectionTriggerSource;
  trigger_metadata: Record<string, unknown>;
  summary_status: string;
  summary_text: string;
  intensity_score: number | null;
  safety_flags: string[];
  started_at: string;
  last_saved_at: string | null;
  completed_at: string | null;
  summary_generated_at: string | null;
  responses: ReflectionSessionResponseItem[];
  current_question: ReflectionTemplateQuestion | null;
}

export interface ReflectionSessionStartRequest {
  template_slug: string;
  trigger_source?: ReflectionTriggerSource;
  trigger_metadata?: Record<string, unknown>;
}

export interface ReflectionSessionStartResponse {
  success?: boolean;
  status?: string;
  message: string;
  data?: ReflectionSessionState | null;
}

export interface ReflectionStepSaveRequest {
  answer: string;
}

export interface ReflectionStepSaveResponse {
  success?: boolean;
  status?: string;
  message: string;
  data?: ReflectionSessionState | null;
}

export interface ReflectionSessionCompleteResponse {
  success?: boolean;
  status?: string;
  message: string;
  data?: ReflectionSessionState | null;
}

export type ReflectionSessionAbandonResponse = ReflectionSessionCompleteResponse;

export interface ReflectionSessionDetailResponse {
  success?: boolean;
  status?: string;
  message: string;
  data?: ReflectionSessionState | null;
}

export interface ReflectionSessionListResponse {
  success?: boolean;
  status?: string;
  message: string;
  data: ReflectionSessionState[];
}

export interface ReflectionSubmitAnswer {
  id: number;
  answer: string;
}

export interface ReflectionSubmitRequest {
  template_id: string;
  answers: ReflectionSubmitAnswer[];
}

export interface ReflectionSubmitResponse {
  success?: boolean;
  status?: string;
  message: string;
}

export type ReflectionAnswer = {
  prompt_text: string;
  answer: string;
};

export interface ReflectionEntryItem {
  id: number;
  template_title: string;
  created_at: string;
  answers: ReflectionAnswer[];
}

export interface ReflectionEntryListResponse {
  success?: boolean;
  message?: string;
  data: ReflectionEntryItem[];
}

export type MentalTestItem = {
  id: string;
  title: string;
  image: string;
};

export interface MentalTestListResponse {
  data: MentalTestItem[];
  success: boolean;
}
