import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";

export type DoshaScoreWeight = {
  vata: number;
  pitta: number;
  kapha: number;
};

export interface DoshaOption {
  id: string;
  label: string;
  score_weight?: DoshaScoreWeight | null;
  scoreWeight?: DoshaScoreWeight | null;
  icon?: string | null;
}

export interface DoshaQuestion {
  id: number;
  category?: string | null;
  question: string;
  options: DoshaOption[];
}

export interface DoshaQuestionsResponse {
  success: boolean;
  message: string;
  data: DoshaQuestion[];
  error_code?: string;
}

export interface DoshaResponseItem {
  question_id: number;
  selected_option: string;
  score_weight: DoshaScoreWeight;
}

export interface DoshaSubmissionPayload {
  dosha_responses: DoshaResponseItem[];
}

export interface DoshaSubmissionResponse {
  success: boolean;
  message: string;
  data: any;
  error_code?: string;
}

const EMPTY_SCORE_WEIGHT: DoshaScoreWeight = {
  vata: 0,
  pitta: 0,
  kapha: 0,
};

const DEFAULT_WEIGHT_BY_OPTION: Record<string, DoshaScoreWeight> = {
  A: { vata: 1, pitta: 0, kapha: 0 },
  B: { vata: 0, pitta: 1, kapha: 0 },
  C: { vata: 0, pitta: 0, kapha: 1 },
};

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeScoreWeight(raw: any): DoshaScoreWeight {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_SCORE_WEIGHT };
  }

  return {
    vata: toNumber(raw.vata ?? raw.VATA),
    pitta: toNumber(raw.pitta ?? raw.PITTA),
    kapha: toNumber(raw.kapha ?? raw.KAPHA),
  };
}

function hasScoreWeight(raw: any): boolean {
  return (
    !!raw &&
    typeof raw === "object" &&
    (raw.vata != null || raw.pitta != null || raw.kapha != null)
  );
}

function normalizeOption(raw: any): DoshaOption | null {
  if (!raw || typeof raw !== "object") return null;

  const id = String(raw.id ?? raw.value ?? raw.key ?? "").trim();
  const label = String(raw.label ?? raw.text ?? raw.title ?? "").trim();

  if (!id || !label) return null;

  const scoreWeightSource = raw.score_weight ?? raw.scoreWeight;

  return {
    id: id.toUpperCase(),
    label,
    score_weight: hasScoreWeight(scoreWeightSource)
      ? normalizeScoreWeight(scoreWeightSource)
      : undefined,
  };
}

function normalizeQuestion(raw: any): DoshaQuestion | null {
  if (!raw || typeof raw !== "object") return null;

  const id = Number(raw.id ?? raw.question_id ?? raw.pk);
  const question = String(raw.question ?? raw.title ?? "").trim();
  const category =
    typeof raw.category === "string" ? raw.category.trim() : null;

  if (!Number.isFinite(id) || !question) return null;

  const optionsSource = Array.isArray(raw.options)
    ? raw.options
    : Array.isArray(raw.choices)
      ? raw.choices
      : [];

  const options = optionsSource
    .map(normalizeOption)
    .filter(Boolean) as DoshaOption[];

  if (!options.length) return null;

  return {
    id,
    category,
    question,
    options,
  };
}

function normalizeQuestionList(raw: any): DoshaQuestion[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.questions)
      ? raw.questions
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.questions)
          ? raw.data.questions
          : Array.isArray(raw?.data?.data)
            ? raw.data.data
        : [];

  return list.map(normalizeQuestion).filter(Boolean) as DoshaQuestion[];
}

function getDefaultScoreWeight(optionId: string): DoshaScoreWeight {
  const normalized = String(optionId).trim().toUpperCase();
  return DEFAULT_WEIGHT_BY_OPTION[normalized] ?? { ...EMPTY_SCORE_WEIGHT };
}

export function buildDoshaResponseItem(
  question: DoshaQuestion,
  option: DoshaOption
): DoshaResponseItem {
  const scoreWeightSource = option.score_weight ?? option.scoreWeight;

  return {
    question_id: question.id,
    selected_option: String(option.id).trim().toUpperCase(),
    score_weight: hasScoreWeight(scoreWeightSource)
      ? normalizeScoreWeight(scoreWeightSource)
      : getDefaultScoreWeight(option.id),
  };
}

export function buildDoshaSubmissionPayload(
  responses: DoshaResponseItem[]
): DoshaSubmissionPayload {
  return {
    dosha_responses: [...responses].sort(
      (left, right) => left.question_id - right.question_id
    ),
  };
}

export async function fetchPersonaQuestions(): Promise<DoshaQuestionsResponse> {
  const res: AxiosResponse<any> = await axios.get(API_ENDPOINTS.personaQuestion);
  const data = normalizeQuestionList(res.data);
  const rawMessage =
    typeof res.data?.message === "string" ? res.data.message : undefined;

  return {
    success: res.data?.success ?? data.length > 0,
    message: rawMessage ?? (data.length > 0 ? "Questions loaded." : "No questions found."),
    data,
    error_code: res.data?.error_code,
  };
}

export async function submitPersonaAnswers(
  payload: DoshaSubmissionPayload
): Promise<DoshaSubmissionResponse> {
  const res: AxiosResponse<DoshaSubmissionResponse> = await axios.post(
    API_ENDPOINTS.submitPersonaAnswers,
    payload
  );
  return res.data;
}
