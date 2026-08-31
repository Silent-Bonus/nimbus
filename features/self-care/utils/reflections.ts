import { format } from "date-fns";
import { formatReminderTime, toFriendlyDate } from "@/utils/date-time";

import type {
  ReflectionSessionState,
  ReflectionTemplateItem,
  ReflectionTemplateQuestion,
} from "@/features/self-care/types/reflectionTypes";

export type ReflectionEntryAnswer = {
  answer?: string;
  prompt_text?: string;
  text?: string;
};

export type RawReflectionEntry = {
  id?: number | string;
  template_title?: string;
  title?: string;
  description?: string;
  content?: string;
  created_at?: string;
  date?: string;
  category?: string;
  answers?: ReflectionEntryAnswer[];
  tags?: string[];
};

export type ReflectionCard = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  dateLabel: string;
  tags: string[];
  status?: string;
  statusLabel?: string;
  sessionId?: string;
  isResumable?: boolean;
  createdAt?: string;
  currentStep?: number;
  questionCount?: number;
  templateId?: string;
  category?: string;
  benefits?: string[];
  questions?: ReflectionTemplateQuestion[];
  estimatedMinutes?: number;
  totalSteps?: number;
  icon?: string;
};

export type ReflectionRouteParams = {
  journalId?: string | string[];
  journalSlug?: string | string[];
  journalSessionId?: string | string[];
  journalTitle?: string | string[];
  journalDescription?: string | string[];
  journalTags?: string | string[];
  journalDateLabel?: string | string[];
  journalBenefits?: string | string[];
  journalQuestions?: string | string[];
  journalEstimatedMinutes?: string | string[];
  journalTotalSteps?: string | string[];
  journalCategory?: string | string[];
};

export const normalizeTag = (value: string) =>
  value
    .replace(/^#+/, "")
    .trim()
    .toLowerCase();

export const formatTagLabel = (value: string) =>
  normalizeTag(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const parseReflectionRouteParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseReflectionJsonParam = <T>(value?: string | string[]) => {
  const raw = parseReflectionRouteParam(value);
  if (!raw) {
    return null;
  }

  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // Ignore decode failures and fall back to the raw route param.
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Keep trying alternative candidates.
    }
  }

  return null;
};

export const parseReflectionTagList = (value?: string | string[]) => {
  const raw = parseReflectionRouteParam(value);
  if (!raw) return [];

  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map(normalizeTag);
};

export const parseReflectionBenefits = (value?: string | string[]) => {
  const parsed = parseReflectionJsonParam<unknown>(value);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

export const parseReflectionQuestions = (value?: string | string[]) => {
  const parsed = parseReflectionJsonParam<unknown>(value);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Partial<ReflectionTemplateQuestion>;
      if (
        typeof candidate.id !== "number" ||
        typeof candidate.step_number !== "number" ||
        typeof candidate.text !== "string"
      ) {
        return null;
      }

      return {
        id: candidate.id,
        step_number: candidate.step_number,
        text: candidate.text,
        type: typeof candidate.type === "string" ? candidate.type : "text",
      };
    })
    .filter((item): item is ReflectionTemplateQuestion => Boolean(item));
};

export const extractHashtags = (text: string) => {
  const matches = text.match(/#([A-Za-z0-9_]+)/g) || [];
  return matches.map(normalizeTag);
};

export const formatDateLabel = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return format(parsed, "MMM dd").toUpperCase();
};

export const deriveDescription = (item: RawReflectionEntry) => {
  const answers = Array.isArray(item.answers) ? item.answers : [];
  const answerText = answers
    .map((answer) => answer.answer ?? answer.text ?? "")
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    item.description?.trim() ||
    item.content?.trim() ||
    answerText ||
    "A quiet note waiting for the rest of its breath."
  );
};

export const deriveTags = (
  item: RawReflectionEntry,
  title: string,
  description: string
) => {
  const explicitTags = Array.isArray(item.tags) ? item.tags : [];
  const answerFragments = Array.isArray(item.answers)
    ? item.answers
        .map(
          (answer) =>
            `${answer.prompt_text ?? ""} ${answer.answer ?? answer.text ?? ""}`
        )
        .join(" ")
    : "";

  const textSource = [title, description, item.category ?? "", answerFragments].join(
    " "
  );
  const extracted = extractHashtags(textSource);
  const normalizedExplicit = explicitTags.map(normalizeTag);
  const fallback = item.category ? [normalizeTag(item.category)] : [];

  const unique = Array.from(
    new Set([...extracted, ...normalizedExplicit, ...fallback].filter(Boolean))
  );

  return unique.length ? unique : ["reflection"];
};

export const mapReflectionTemplateToCard = (
  template: ReflectionTemplateItem
): ReflectionCard => {
  const sortedQuestions = [...(template.questions ?? [])].sort(
    (a, b) => a.step_number - b.step_number
  );
  const title = template.title?.trim() || "Guided Reflection";
  const description =
    template.description?.trim() ||
    "A guided reflection to help you slow down and hear yourself clearly.";
  const categoryTag = normalizeTag(template.category || "reflection");
  const estimatedMinutes = Number(template.estimated_minutes ?? 0);
  const totalSteps =
    Number(template.total_steps ?? 0) || sortedQuestions.length || 0;

  return {
    id: template.template_id,
    slug: template.template_slug ?? template.template_id,
    templateId: template.template_id,
    title,
    description,
    dateLabel: estimatedMinutes > 0 ? `${estimatedMinutes} MIN` : "",
    tags: [categoryTag],
    questionCount: totalSteps,
    category: categoryTag,
    benefits: Array.isArray(template.benefits)
      ? template.benefits.filter(
          (benefit): benefit is string =>
            typeof benefit === "string" && benefit.trim().length > 0
        )
      : [],
    questions: sortedQuestions,
    estimatedMinutes,
    totalSteps,
    icon: template.icon,
  };
};

export const normalizeReflectionSessionStatus = (status?: string | null) => {
  const normalized = status?.trim().toLowerCase();

  if (normalized === "completed") {
    return "completed";
  }

  if (normalized === "draft" || normalized === "in_progress") {
    return "in_progress";
  }

  return normalized || "in_progress";
};

export const buildReflectionSessionStatusLabel = (status?: string | null) => {
  const normalized = normalizeReflectionSessionStatus(status);

  if (normalized === "completed") {
    return "Completed";
  }

  if (normalized === "in_progress") {
    return "In Progress";
  }

  return normalized
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const buildReflectionLastSavedLabel = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const dateLabel = toFriendlyDate(value);
  const timeLabel = formatReminderTime(value, "");

  if (dateLabel && timeLabel) {
    return `${dateLabel} · ${timeLabel}`.toUpperCase();
  }

  return (dateLabel || timeLabel).toUpperCase();
};

export const mapReflectionSessionToCard = (
  session: ReflectionSessionState
): ReflectionCard => {
  return {
    id: String(session.id),
    slug: session.template_slug,
    templateId: session.template_slug,
    sessionId: String(session.id),
    title: session.template_title?.trim() || "Untitled Reflection",
    description: "",
    dateLabel: buildReflectionLastSavedLabel(
      session.last_saved_at ?? session.started_at
    ),
    tags: [],
    status: normalizeReflectionSessionStatus(session.status),
    statusLabel: buildReflectionSessionStatusLabel(session.status),
    createdAt: session.last_saved_at ?? session.started_at,
    currentStep: session.current_step,
    questionCount: session.total_steps,
    category: session.category,
    isResumable: normalizeReflectionSessionStatus(session.status) === "in_progress",
  };
};

export const mapReflectionEntry = (
  item: RawReflectionEntry,
  index: number
): ReflectionCard => {
  const title =
    item.template_title?.trim() || item.title?.trim() || "Untitled Entry";
  const description = deriveDescription(item);
  const tags = deriveTags(item, title, description);
  const dateLabel = formatDateLabel(item.created_at ?? item.date);
  const createdAt = item.created_at ?? item.date ?? "";
  const questionCount = Array.isArray(item.answers) ? item.answers.length : 0;

  return {
    id: String(item.id ?? `${title}-${index}`),
    title,
    description,
    dateLabel,
    tags,
    createdAt,
    questionCount,
  };
};

export const buildReflectionTemplateRouteParams = (item: ReflectionCard) => ({
  journalSlug: item.slug ?? item.templateId ?? item.id,
  ...(item.sessionId ? { journalSessionId: item.sessionId } : {}),
});
