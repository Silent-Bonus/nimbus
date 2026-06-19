import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";

import { FALLBACK_SESSION_FEEDBACK_QUESTIONS } from "../data/mockQuestions";
import type {
  SessionFeedbackAnswersMap,
  SessionFeedbackAnswersPayload,
  SessionFeedbackLayout,
  SessionFeedbackOption,
  SessionFeedbackQuestion,
  SessionFeedbackQuestionsResponse,
  SubmitSessionFeedbackResponse,
} from "../types";

type RawFeedbackOption = {
  id?: string | number;
  label?: string;
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  icon?: string | null;
  icon_name?: string | null;
  iconName?: string | null;
};

type RawFeedbackQuestion = {
  id?: string | number;
  order?: number | string | null;
  step?: number | string | null;
  title?: string | null;
  prefix?: string | null;
  accent?: string | null;
  title_prefix?: string | null;
  titlePrefix?: string | null;
  title_accent?: string | null;
  titleAccent?: string | null;
  subtitle?: string | null;
  description?: string | null;
  selection_mode?: string | null;
  selectionMode?: string | null;
  layout?: string | null;
  type?: string | null;
  options?: RawFeedbackOption[] | null;
};

type RawFeedbackQuestionsResponse = {
  success?: boolean;
  message?: string;
  data?: RawFeedbackQuestion[];
  questions?: RawFeedbackQuestion[];
};

const toNumberOrNull = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const normalizeLayout = (value: unknown): SessionFeedbackLayout => {
  return String(value).toLowerCase() === "grid" ? "grid" : "list";
};

const normalizeSelectionMode = (value: unknown) =>
  String(value).toLowerCase() === "multiple" ? "multiple" : "single";

const parseHeadline = (
  raw: RawFeedbackQuestion,
  fallback: SessionFeedbackQuestion
) => {
  const prefixSource =
    raw.prefix ??
    raw.title_prefix ??
    raw.titlePrefix ??
    fallback.prefix;
  const accentSource =
    raw.accent ??
    raw.title_accent ??
    raw.titleAccent ??
    fallback.accent;

  if (prefixSource || accentSource) {
    return {
      prefix: String(prefixSource ?? fallback.prefix),
      accent: accentSource ? String(accentSource) : undefined,
    };
  }

  const title = String(raw.title ?? "");
  const [firstLine, ...rest] = title.split(/\n+/).map((part) => part.trim());

  if (firstLine && rest.length > 0) {
    return {
      prefix: firstLine,
      accent: rest.join(" "),
    };
  }

  return {
    prefix: title || fallback.prefix,
    accent: fallback.accent,
  };
};

const normalizeOption = (
  raw: RawFeedbackOption | undefined,
  fallback: SessionFeedbackOption,
  index: number
): SessionFeedbackOption => {
  if (!raw) return fallback;

  const iconCandidate = raw.icon ?? raw.icon_name ?? raw.iconName;

  return {
    id: String(raw.id ?? fallback.id ?? `option-${index + 1}`),
    label: String(raw.label ?? raw.title ?? fallback.label),
    subtitle: String(raw.subtitle ?? raw.description ?? fallback.subtitle ?? ""),
    icon: (iconCandidate as SessionFeedbackOption["icon"]) ?? fallback.icon,
  };
};

const normalizeQuestion = (
  raw: RawFeedbackQuestion,
  fallback: SessionFeedbackQuestion
): SessionFeedbackQuestion => {
  const headline = parseHeadline(raw, fallback);
  const rawOptions = Array.isArray(raw.options) ? raw.options : [];

  return {
    id: fallback.id,
    order: fallback.order,
    prefix: headline.prefix,
    accent: headline.accent,
    subtitle: String(raw.subtitle ?? raw.description ?? fallback.subtitle ?? ""),
    selectionMode: normalizeSelectionMode(
      raw.selection_mode ?? raw.selectionMode ?? raw.type ?? fallback.selectionMode
    ),
    layout: normalizeLayout(raw.layout ?? fallback.layout),
    options: fallback.options.map((option, index) =>
      normalizeOption(rawOptions[index], option, index)
    ),
  };
};

const isQuestionArray = (value: unknown): value is RawFeedbackQuestion[] =>
  Array.isArray(value);

const extractQuestionArray = (
  response: RawFeedbackQuestionsResponse
): RawFeedbackQuestion[] => {
  if (isQuestionArray(response.data)) return response.data;
  if (isQuestionArray(response.questions)) return response.questions;
  return [];
};

export function serializeSessionFeedbackAnswers(
  answers: SessionFeedbackAnswersMap
): SessionFeedbackAnswersPayload {
  const payload: SessionFeedbackAnswersPayload = {};

  Object.entries(answers).forEach(([questionId, value]) => {
    if (value == null) return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === "string" && !value.trim()) return;

    payload[String(questionId)] = value;
  });

  return payload;
}

export async function fetchSessionFeedbackQuestions(
  source: string
): Promise<SessionFeedbackQuestionsResponse> {
  const fallback = FALLBACK_SESSION_FEEDBACK_QUESTIONS.map((item) => ({
    ...item,
    options: item.options.map((option) => ({ ...option })),
  }));

  try {
    const response: AxiosResponse<RawFeedbackQuestionsResponse> =
      await axios.get(API_ENDPOINTS.sessionFeedbackQuestions(source));
    const payload = response.data ?? {};
    const rawQuestions = extractQuestionArray(payload);
    const merged = [...fallback];

    rawQuestions.slice(0, 5).forEach((rawQuestion, index) => {
      const rawOrder = toNumberOrNull(rawQuestion.order ?? rawQuestion.step);
      const rawId = toNumberOrNull(rawQuestion.id);
      const slot =
        rawOrder ??
        (rawId !== null && rawId >= 1 && rawId <= 5 ? rawId : index + 1);
      const fallbackQuestion =
        merged[Math.max(0, Math.min(slot - 1, merged.length - 1))] ??
        fallback[index] ??
        fallback[0];

      const normalized = normalizeQuestion(rawQuestion, fallbackQuestion);
      const targetIndex = Math.max(0, Math.min(slot - 1, merged.length - 1));
      merged[targetIndex] = {
        ...fallbackQuestion,
        ...normalized,
        id: rawId ?? fallbackQuestion.id,
        order: rawOrder ?? fallbackQuestion.order,
      };
    });

    return {
      success: payload.success ?? true,
      message: payload.message ?? "Session feedback loaded.",
      data: merged,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ??
        error?.message ??
        "Unable to load session feedback questions.",
      data: fallback,
    };
  }
}

export async function submitSessionFeedbackAnswers(
  source: string,
  payload: SessionFeedbackAnswersPayload
): Promise<SubmitSessionFeedbackResponse> {
  try {
    const response: AxiosResponse<SubmitSessionFeedbackResponse> =
      await axios.post(API_ENDPOINTS.sessionFeedbackAnswers(source), payload);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}
