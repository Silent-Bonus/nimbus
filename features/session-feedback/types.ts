import { Ionicons } from "@expo/vector-icons";

export type SessionFeedbackSelectionMode = "single" | "multiple";

export type SessionFeedbackLayout = "list" | "grid";

export type SessionFeedbackOption = {
  id: string;
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type SessionFeedbackQuestion = {
  id: number;
  order: number;
  prefix: string;
  accent?: string;
  subtitle?: string;
  selectionMode: SessionFeedbackSelectionMode;
  layout: SessionFeedbackLayout;
  options: SessionFeedbackOption[];
};

export type SessionFeedbackAnswerValue = string | string[] | null | undefined;

export type SessionFeedbackAnswersMap = Record<number, SessionFeedbackAnswerValue>;

export type SessionFeedbackAnswersPayload = Record<string, string | string[]>;

export type SessionFeedbackQuestionsResponse = {
  success: boolean;
  message: string;
  data: SessionFeedbackQuestion[];
};

export type SubmitSessionFeedbackResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

