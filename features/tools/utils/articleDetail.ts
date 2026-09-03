import type {
  ArticleDetail,
  ArticleReflectionPrompt,
} from "@/features/tools/data/articleDetails";
import type { NewsletterReviewSummary } from "@/features/tools/types/newsletterTypes";

export type ArticleReviewSummaryState = {
  avgRating: number | null;
  avgClarityScore: number | null;
  avgHelpfulnessScore: number | null;
  reviewsCount: number;
  recommendationCount: number;
  recommendationRate: number | null;
};

export const getArticleRouteParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

export const pickArticleText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
};

export const buildArticleActionErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    if (/<!doctype html>|<html/i.test(error)) {
      return "Unable to complete this request right now.";
    }

    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      detail?: unknown;
      error?: unknown;
      non_field_errors?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.detail === "string" && candidate.detail.trim()) {
      return candidate.detail;
    }

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }

    if (Array.isArray(candidate.non_field_errors)) {
      const firstMessage = candidate.non_field_errors.find(
        (item) => typeof item === "string" && item.trim()
      );

      if (typeof firstMessage === "string") {
        return firstMessage;
      }
    }
  }

  return "Unable to complete this request right now.";
};

const resolveArticleImageSource = (
  image: unknown,
  fallback: ArticleDetail["heroImage"]
) => {
  if (!image) return fallback;
  if (typeof image === "string") return { uri: image };
  if (typeof image === "object") {
    const candidate = image as { uri?: string; url?: string; path?: string };
    if (typeof candidate.uri === "string") return { uri: candidate.uri };
    if (typeof candidate.url === "string") return { uri: candidate.url };
    if (typeof candidate.path === "string") return { uri: candidate.path };
  }
  return fallback;
};

const formatArticlePublishedDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const toFiniteNumber = (value: unknown): number | null => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
};

export const buildArticleReviewSummaryState = (
  reviewSummary?: NewsletterReviewSummary | null,
  apiArticle?: Record<string, any> | null
): ArticleReviewSummaryState => ({
  avgRating:
    toFiniteNumber(reviewSummary?.avg_rating) ??
    toFiniteNumber(apiArticle?.avg_rating),
  avgClarityScore: toFiniteNumber(reviewSummary?.avg_clarity_score),
  avgHelpfulnessScore: toFiniteNumber(reviewSummary?.avg_helpfulness_score),
  reviewsCount: Number(
    reviewSummary?.reviews_count ?? apiArticle?.reviews_count ?? 0
  ),
  recommendationCount: Number(reviewSummary?.recommendation_count ?? 0),
  recommendationRate: toFiniteNumber(reviewSummary?.recommendation_rate),
});

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const htmlToPlainText = (value: string) =>
  decodeHtmlEntities(value)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "- ")
    .replace(/<\/\s*(p|div|section|article|ul|ol|li|h[1-6])\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const isCallToActionHeading = (value: string) =>
  /^(the\s+)?call\s+to\s+action(?:\s*\(cta\))?$/i.test(value);

const stripBracketedText = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^\[(.*)\]$/);
  return match ? match[1].trim() : trimmed;
};

const normalizeCallToActionPrompt = (
  source: unknown,
  fallback: ArticleReflectionPrompt
): ArticleReflectionPrompt => {
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const block = source as Record<string, unknown>;
    return {
      eyebrow: pickArticleText(block.eyebrow, fallback.eyebrow, "Next Step"),
      title: pickArticleText(
        block.title,
        fallback.title,
        "Ready to take action?"
      ),
      prompt: pickArticleText(block.prompt, block.description, fallback.prompt),
      helper: pickArticleText(block.helper, block.body, fallback.helper),
      actionLabel: pickArticleText(
        block.actionLabel,
        block.action_label,
        fallback.actionLabel
      ),
      actionUrl: pickArticleText(block.actionUrl, block.action_url, fallback.actionUrl),
    };
  }

  if (typeof source !== "string") {
    return fallback;
  }

  const raw = source.trim();
  if (!raw) {
    return fallback;
  }

  const blocks = raw
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return fallback;
  }

  let actionLabel = fallback.actionLabel;
  const lastBlock = blocks[blocks.length - 1];
  if (/^\[.*\]$/.test(lastBlock)) {
    actionLabel = stripBracketedText(lastBlock);
    blocks.pop();
  }

  const firstBlockLines = blocks[0]
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  while (
    firstBlockLines.length > 0 &&
    isCallToActionHeading(firstBlockLines[0])
  ) {
    firstBlockLines.shift();
  }

  const title = firstBlockLines.shift() || fallback.title;
  const prompt = firstBlockLines.join(" ") || fallback.prompt;
  const helper = blocks
    .slice(1)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");

  return {
    eyebrow: pickArticleText(fallback.eyebrow, "Next Step"),
    title: pickArticleText(title, fallback.title, "Ready to take action?"),
    prompt: pickArticleText(prompt, fallback.prompt),
    helper: pickArticleText(helper, fallback.helper),
    actionLabel: pickArticleText(actionLabel, fallback.actionLabel),
    actionUrl: fallback.actionUrl,
  };
};

const normalizeReflectionPromptQuote = (source: unknown, fallback: string) => {
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const block = source as Record<string, unknown>;
    return pickArticleText(
      block.prompt,
      block.description,
      block.helper,
      fallback
    );
  }

  if (typeof source !== "string") {
    return fallback;
  }

  const lines = source.split(/\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex < 0) {
    return fallback;
  }

  const body = lines.slice(firstContentIndex + 1).join("\n").trim();
  return body || lines[firstContentIndex].trim() || fallback;
};

export const createEmptyArticleDetail = (id = ""): ArticleDetail => ({
  id,
  title: "Newsletter details unavailable",
  subtitle: "Open a newsletter to load the article.",
  category: "Newsletter",
  readingTime: "—",
  authorName: "Nimbus Editorial",
  authorRole: "Newsletter",
  heroImage: require("@/assets/images/mt.jpg"),
  heroImageFit: "cover",
  contextCard: {
    primaryLabel: "Category",
    primaryValue: "Newsletter",
    secondaryLabel: "Published",
    secondaryValue: "—",
    description: "The excerpt will appear here once the newsletter loads.",
  },
  content: ["We could not load the full article content yet."],
  pullQuote: "Read the full article once the content is available.",
  reflectionPrompt: {
    eyebrow: "Reflection Prompt",
    title: "Reload the article",
    prompt: "Open the newsletter again to see its reflection prompt.",
    helper: "The API will populate this section when the article loads.",
    actionLabel: "Continue",
  },
  callToAction: {
    eyebrow: "Next Step",
    title: "Ready to take action?",
    prompt: "Open the newsletter again to see its call to action.",
    helper: "The API will populate this section when the article loads.",
    actionLabel: "Continue",
    actionUrl: undefined,
  },
  recommendationLabel: "Continue Exploration",
  recommendation: {
    id: "",
    title: "Browse the newsletter library",
    subtitle: "Find another article to explore.",
    tag: "Newsletter",
    image: require("@/assets/images/mt.jpg"),
    imageFit: "cover",
  },
  tags: [],
  favorite: false,
  saveLabel: "Save",
});

const splitArticleContent = (value: unknown, title?: string) => {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  // Some articles arrive as HTML emails while others are already plain text; normalize both into paragraph blocks.
  const normalizedValue = /<[^>]+>/.test(value) ? htmlToPlainText(value) : value;
  const chunks = normalizedValue
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.flatMap((chunk, index) => {
    const lines = chunk
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (index === 0 && title) {
      const normalizedTitle = title.trim().toLowerCase();
      if (lines[0]?.toLowerCase() === normalizedTitle) {
        lines.shift();
      }
    }

    const paragraph = lines.join(" ");
    return paragraph ? [paragraph] : [];
  });
};

export const normalizeArticleFromApi = (
  apiArticle: Record<string, any>,
  fallback: ArticleDetail
): ArticleDetail => {
  const sectionSource = apiArticle?.section_data;
  const contentFromString = splitArticleContent(
    apiArticle?.content || apiArticle?.body || apiArticle?.email_content,
    apiArticle?.title
  );
  const promoSource =
    apiArticle?.promo && typeof apiArticle.promo === "object"
      ? apiArticle.promo
      : null;
  const content =
    // Prefer structured section data when present, then fall back to body/email content parsing.
    Array.isArray(sectionSource) && sectionSource.length > 0
      ? sectionSource
          .map((section: any) => String(section?.content ?? section?.title ?? ""))
          .filter(Boolean)
      : contentFromString.length > 0
        ? contentFromString
        : Array.isArray(apiArticle?.content)
          ? apiArticle.content.map((item: any) => String(item))
          : fallback.content;

  const authorInfo = apiArticle?.author_info;
  const readingLabel =
    formatArticlePublishedDate(apiArticle?.published_at) || fallback.readingTime;
  const categoryText = pickArticleText(apiArticle?.category, fallback.category);
  const subtitleText = pickArticleText(
    apiArticle?.email_subject,
    apiArticle?.subtitle,
    apiArticle?.tagline,
    categoryText,
    fallback.subtitle
  );
  const excerptText = pickArticleText(
    apiArticle?.excerpt,
    apiArticle?.description,
    contentFromString[0],
    fallback.contextCard.description
  );
  const reflectionSource =
    (apiArticle?.reflectionPrompt &&
    typeof apiArticle.reflectionPrompt === "object"
      ? apiArticle.reflectionPrompt
      : null) ||
    (apiArticle?.reflection_prompt &&
    typeof apiArticle.reflection_prompt === "object"
      ? apiArticle.reflection_prompt
      : null);
  const reflectionPrompt = pickArticleText(
    reflectionSource?.prompt,
    typeof apiArticle?.reflectionPrompt === "string"
      ? apiArticle.reflectionPrompt
      : null,
    typeof apiArticle?.reflection_prompt === "string"
      ? apiArticle.reflection_prompt
      : null,
    apiArticle?.question,
    fallback.reflectionPrompt.prompt
  );
  const callToAction = normalizeCallToActionPrompt(
    promoSource
      ? {
          title: promoSource.title,
          description: promoSource.body,
          helper: promoSource.body,
          action_label: promoSource.cta_label,
          action_url: promoSource.cta_url,
        }
      : apiArticle?.callToAction ?? apiArticle?.call_to_action,
    {
      ...fallback.callToAction,
    }
  );
  const pullQuoteText = normalizeReflectionPromptQuote(
    apiArticle?.reflectionPrompt ?? apiArticle?.reflection_prompt,
    fallback.pullQuote
  );

  return {
    ...fallback,
    id: String(apiArticle?.id ?? fallback.id),
    title: apiArticle?.title || apiArticle?.name || fallback.title,
    subtitle: subtitleText,
    category: categoryText,
    readingTime: readingLabel,
    authorName:
      authorInfo?.name ||
      authorInfo?.full_name ||
      apiArticle?.author_name ||
      "Nimbus Editorial",
    authorRole:
      authorInfo?.title ||
      authorInfo?.designation ||
      apiArticle?.author_role ||
      "Newsletter",
    heroImage: resolveArticleImageSource(
      apiArticle?.image || apiArticle?.imageUri,
      fallback.heroImage
    ),
    heroImageFit: apiArticle?.imageFit || fallback.heroImageFit,
    contextCard: {
      primaryLabel: "Category",
      primaryValue: categoryText || "Newsletter",
      secondaryLabel: "Published",
      secondaryValue: readingLabel,
      description: excerptText,
    },
    content,
    pullQuote: pullQuoteText,
    reflectionPrompt: {
      ...fallback.reflectionPrompt,
      eyebrow: pickArticleText(
        reflectionSource?.eyebrow,
        apiArticle?.reflectionPromptEyebrow,
        apiArticle?.reflection_prompt_eyebrow,
        fallback.reflectionPrompt.eyebrow
      ),
      title: pickArticleText(
        reflectionSource?.title,
        apiArticle?.reflectionPromptTitle,
        apiArticle?.reflection_prompt_title,
        fallback.reflectionPrompt.title
      ),
      prompt: reflectionPrompt,
      helper: pickArticleText(
        reflectionSource?.helper,
        apiArticle?.reflectionPromptHelper,
        apiArticle?.reflection_prompt_helper,
        fallback.reflectionPrompt.helper
      ),
      actionLabel: pickArticleText(
        reflectionSource?.actionLabel,
        reflectionSource?.action_label,
        fallback.reflectionPrompt.actionLabel
      ),
    },
    callToAction,
    recommendationLabel:
      apiArticle?.recommendationLabel || fallback.recommendationLabel,
    recommendation: fallback.recommendation,
    tags: fallback.tags,
    favorite: Boolean(
      apiArticle?.favorite ??
        apiArticle?.is_favorite ??
        apiArticle?.is_favorited ??
        fallback.favorite
    ),
    saveLabel: apiArticle?.saveLabel || fallback.saveLabel,
  };
};
