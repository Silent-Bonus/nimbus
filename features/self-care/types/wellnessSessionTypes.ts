import type {
  WellnessContentModality,
  WellnessContentPagination,
} from "@/features/self-care/types/wellnessContentTypes";

// Wellness session and mood tracking API types.

export type WellnessSessionActivityType = WellnessContentModality;

export type WellnessSessionSource =
  | "manual"
  | "recommendation"
  | "notification";

export type WellnessMoodLabel =
  | "calm"
  | "happy"
  | "anxious"
  | "tired"
  | "motivated"
  | "sad"
  | "neutral"
  | "stressed";

export type WellnessScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type WellnessSessionFeedbackSource =
  | "choice"
  | "manual"
  | "reminder"
  | "post_session"
  | "widget";

export type WellnessSessionContentType =
  | "recipe"
  | "workout"
  | "wellness_content"
  | "wellness_content.wellnesscontent";

export interface WellnessSessionMetadata extends Record<string, unknown> {
  entry_surface: string;
  test_mode?: boolean;
}

export interface WellnessSessionRequest {
  activity_type: WellnessSessionActivityType;
  content_type: WellnessSessionContentType;
  content_object_id: number;
  content_object_type_id?: number;
  source: WellnessSessionSource;
  metadata: WellnessSessionMetadata;
}

export interface WellnessSessionFeedbackRequest {
  mood_label_before: WellnessMoodLabel;
  mood_label_after: WellnessMoodLabel;
  mood_score_before: WellnessScore;
  mood_score_after: WellnessScore;
  calmness_before: WellnessScore;
  calmness_after: WellnessScore;
  stress_before: WellnessScore;
  stress_after: WellnessScore;
  relaxment_before: WellnessScore;
  relaxment_after: WellnessScore;
  energy_before: WellnessScore;
  energy_after: WellnessScore;
  felt_better: boolean;
  notes: string;
  source: WellnessSessionFeedbackSource;
}

export interface WellnessMoodLogRequest {
  mood_label: string;
  mood_score: number;
  calmness_score?: number;
  stress_score?: number;
  relaxment_score?: number;
  energy_score?: number;
  notes?: string;
  source?: string;
}

export interface WellnessSessionItem {
  session_ref: string;
  id: number;
  activity_type: string;
  activity_type_display: string;
  content_type?: string | null;
  object_id?: number | null;
  content_label?: string | null;
  source: string;
  source_display: string;
  status: string;
  status_display: string;
  started_at: string;
  paused_at: string | null;
  resumed_at: string | null;
  completed_at: string | null;
  duration_seconds: number;
  metadata: Record<string, unknown>;
  has_feedback: boolean;
  created_at: string;
  updated_at: string;
}

export interface WellnessSessionListResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem[];
  pagination?: WellnessContentPagination;
}

export interface WellnessSessionCreateResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem;
}

export type WellnessSessionDetailResponse = WellnessSessionCreateResponse;
export type WellnessSessionPauseResumeResponse = WellnessSessionCreateResponse;
export type WellnessSessionFeedbackResponse = WellnessSessionCreateResponse;

export interface WellnessSessionCompleteRequest {
  duration_seconds: number;
}

export interface WellnessSessionCompleteResponse {
  success: boolean;
  message: string;
  data: WellnessSessionItem;
}

export interface WellnessMoodLogItem {
  id: number;
  mood_label: string;
  mood_score: number;
  calmness_score?: number | null;
  stress_score?: number | null;
  relaxment_score?: number | null;
  energy_score?: number | null;
  notes?: string | null;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WellnessMoodLogResponse {
  success: boolean;
  message: string;
  data: WellnessMoodLogItem;
}

export interface WellnessMoodLogStatsResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export interface WellnessSummaryResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}
