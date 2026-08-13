import type {
  AffirmationApiCreateRequest,
  AffirmationApiCreateResponse,
  AffirmationApiDetailResponse,
  AffirmationApiItem,
  AffirmationApiListResponse,
} from "@/features/self-care/types/affirmation";

const MOCK_LIST_MESSAGE = "Affirmations retrieved successfully.";
const MOCK_DETAIL_MESSAGE = "Affirmation fetched successfully.";
const MOCK_CREATE_MESSAGE = "Affirmation created successfully.";

const MOCK_AFFIRMATION_LIST_ITEMS: AffirmationApiItem[] = [
  {
    id: "quiet-power-ii",
    tone: "confidence",
    quotes: {
      quote_title: "Quiet Power ii",
      tags: ["focus", "study"],
      quote_content: ["Steady energy is stronger than rushed effort."],
    },
    quote_detail: "A cleaner rhythm for focus, study, and follow-through.",
  },
  {
    id: "quiet-power",
    tone: "confidence",
    quotes: {
      quote_title: "Quiet Power",
      tags: ["focus", "study"],
      quote_content: ["Steady energy is stronger than rushed effort."],
    },
    quote_detail: "A cleaner rhythm for focus, study, and follow-through.",
  },
];

const MOCK_PAGINATION = {
  count: MOCK_AFFIRMATION_LIST_ITEMS.length,
  next: null,
  previous: null,
  page: 1,
  page_size: 100,
  total_pages: 1,
  results_count: MOCK_AFFIRMATION_LIST_ITEMS.length,
};

export const MOCK_AFFIRMATION_LIST_RESPONSE: AffirmationApiListResponse = {
  success: true,
  message: MOCK_LIST_MESSAGE,
  data: MOCK_AFFIRMATION_LIST_ITEMS,
  pagination: MOCK_PAGINATION,
};

export const MOCK_AFFIRMATION_DETAIL_RESPONSES: Record<
  string,
  AffirmationApiDetailResponse
> = {
  "quiet-power-ii": {
    success: true,
    message: MOCK_DETAIL_MESSAGE,
    data: MOCK_AFFIRMATION_LIST_ITEMS[0],
  },
  "quiet-power": {
    success: true,
    message: MOCK_DETAIL_MESSAGE,
    data: MOCK_AFFIRMATION_LIST_ITEMS[1],
  },
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getUniqueMockAffirmationId(baseId: string) {
  const normalizedBase = baseId || "custom-affirmation";

  if (normalizedBase === "quiet-power") {
    return "quiet-power-ii";
  }

  if (normalizedBase === "quiet-power-ii") {
    return normalizedBase;
  }

  const knownIds = new Set([
    ...MOCK_AFFIRMATION_LIST_ITEMS.map((item) => item.id ?? ""),
    ...Object.keys(MOCK_AFFIRMATION_DETAIL_RESPONSES),
  ]);

  if (!knownIds.has(normalizedBase)) {
    return normalizedBase;
  }

  const suffixedId = `${normalizedBase}-ii`;
  return knownIds.has(suffixedId) ? `${normalizedBase}-iii` : suffixedId;
}

function buildMockAffirmationItem(
  payload: AffirmationApiCreateRequest
): AffirmationApiItem {
  const title = payload.title.trim() || "Quiet Power";
  const baseId = slugify(title);
  const id = getUniqueMockAffirmationId(baseId);

  return {
    id,
    tone: payload.tone,
    quotes: {
      quote_title: title,
      tags: payload.tags,
      quote_content: payload.statements,
    },
    quote_detail: payload.quote_detail.trim() || payload.statements[0] || "",
  };
}

export const getMockAffirmationListResponse = (): AffirmationApiListResponse =>
  MOCK_AFFIRMATION_LIST_RESPONSE;

export const getMockAffirmationDetailResponse = (
  slug: string
): AffirmationApiDetailResponse =>
  MOCK_AFFIRMATION_DETAIL_RESPONSES[slug] ?? {
    success: true,
    message: MOCK_DETAIL_MESSAGE,
    data: {
      id: slug,
      tone: "confidence",
      quotes: {
        quote_title: "Quiet Power",
        tags: ["focus", "study"],
        quote_content: ["Steady energy is stronger than rushed effort."],
      },
      quote_detail: "A cleaner rhythm for focus, study, and follow-through.",
    },
  };

export const getMockAffirmationCreateResponse = (
  payload: AffirmationApiCreateRequest
): AffirmationApiCreateResponse => ({
  success: true,
  message: MOCK_CREATE_MESSAGE,
  data: buildMockAffirmationItem(payload),
});
