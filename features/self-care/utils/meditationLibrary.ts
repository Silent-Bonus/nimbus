import type {
  MeditationListItem,
  MeditationItemDetail,
  WellnessCategoryOption,
  WellnessContentDetailItem,
  WellnessContentItem,
} from "@/features/self-care/types/wellnessContentTypes";
import type { MeditationRouteParams } from "@/features/self-care/utils/meditationPlayback";

const titleCase = (value: string): string =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDurationLabel = (duration: number | string | undefined): string => {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    return `${duration} min`;
  }

  if (typeof duration === "string") {
    const trimmed = duration.trim();
    if (!trimmed) return "5 min";
    return trimmed.includes("min") ? trimmed : `${trimmed} min`;
  }

  return "5 min";
};

export const normalizeMeditationTag = (value: string): string =>
  value
    .replace(/^#+/, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const formatMeditationTagLabel = (value: string): string =>
  titleCase(normalizeMeditationTag(value));

const normalizeMeditationCategory = (
  value?: string | null
): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const normalized = normalizeMeditationTag(trimmed);

  if (normalized === "relaxtion" || normalized === "relaxing") {
    return "Relaxation";
  }

  return titleCase(normalized);
};

const getFallbackMeditationDescription = (
  title: string,
  category?: string
): string => {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedCategory =
    normalizeMeditationCategory(category)?.toLowerCase();

  if (normalizedTitle.includes("sleep") || normalizedCategory === "sleep") {
    return "A quiet sleep meditation to help your body settle and your mind soften before rest.";
  }

  if (normalizedCategory === "focus") {
    return "A steady meditation to help you clear distractions and return to focused attention.";
  }

  if (normalizedCategory === "relaxation") {
    return "A calming meditation designed to soften tension and create a steadier state.";
  }

  return "A gentle meditation to help you slow down, reset, and return to a calmer state.";
};

const buildMeditationDescription = (item: {
  description?: string;
  category?: string;
  title?: string;
}): string => {
  if (typeof item.description === "string" && item.description.trim()) {
    return item.description.trim();
  }

  return getFallbackMeditationDescription(
    item.title ?? "Meditation",
    item.category
  );
};

const buildMeditationList = (
  item: WellnessContentItem,
  fallbackTitle: string
): MeditationListItem => {
  const title = item.title?.trim() || fallbackTitle;
  const tags = normalizeMeditationTags(item.tags);
  const description = buildMeditationDescription({
    title,
    category: item.category,
    description: item.description,
  });
  const durationValue = formatDurationLabel(item.duration);
  const normalizedRating =
    typeof item.rating === "number" && item.rating > 0 ? item.rating : 4.2;
  const source = item.source?.trim() || null;

  return {
    id: String(item.id),
    slug: item.slug?.trim() || undefined,
    durationLabel: durationValue,
    title,
    description,
    tags,
    image: item.image?.trim() || require("../../../assets/images/mt.jpg"),
    source,
    isLocked: Boolean(item.isLocked ?? item.is_locked),
    category: normalizeMeditationCategory(item.category) || undefined,
    rating: normalizedRating,
    reviews: typeof item.reviews === "number" ? item.reviews : undefined,
    level: item.level?.trim() || undefined,
    dosha: item.dosha?.trim() || undefined,
    modality: item.modality?.trim() || undefined,
  };
};

export const mapMeditationListItemTemplate = (
  item: WellnessContentItem,
  index: number
): MeditationListItem => buildMeditationList(item, `Meditation ${index + 1}`);

export const mapMeditationList = mapMeditationListItemTemplate;

const normalizeInstructor = (
  instructor?: MeditationItemDetail["instructor"]
): MeditationItemDetail["instructor"] => {
  if (!instructor) return undefined;

  const name = instructor.name.trim();
  const role = instructor.role.trim();
  const bio = instructor.bio.trim();
  const image = instructor.image.trim();

  if (!name && !role && !bio && !image) {
    return undefined;
  }

  return {
    name: name || "Instructor",
    role,
    bio,
    image,
  };
};

const normalizeBenefits = (
  benefits?: MeditationItemDetail["benefits"]
): MeditationItemDetail["benefits"] => {
  if (!Array.isArray(benefits)) return undefined;

  const normalized = benefits
    .map((benefit) => ({
      id: benefit.id,
      title: benefit.title.trim(),
      text: benefit.text.trim(),
    }))
    .filter(
      (benefit) =>
        Boolean(benefit.title) ||
        Boolean(benefit.text) ||
        Number.isFinite(benefit.id)
    );

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeScientificSynthesis = (
  scientificSynthesis?: MeditationItemDetail["scientificSynthesis"]
): MeditationItemDetail["scientificSynthesis"] => {
  if (!scientificSynthesis) return undefined;

  const title = scientificSynthesis.title.trim();
  const text = scientificSynthesis.text.trim();
  const source = scientificSynthesis.source.trim();

  if (!title && !text && !source) {
    return undefined;
  }

  return {
    title: title || "Scientific synthesis",
    text,
    source,
  };
};

const normalizeMeditationTags = (tags?: string[]): string[] =>
  Array.isArray(tags)
    ? Array.from(new Set(tags.map((tag) => String(tag).trim()).filter(Boolean)))
    : [];

const toMeditationRouteText = (value?: string | null): string | undefined => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

const toMeditationRouteNumber = (
  value?: number | null
): string | undefined =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : undefined;

const toMeditationRouteImage = (
  image: MeditationListItem["image"] | MeditationItemDetail["image"]
): string | undefined => (typeof image === "string" ? toMeditationRouteText(image) : undefined);

const toMeditationRouteTags = (tags: string[]): string | undefined => {
  const normalizedTags = normalizeMeditationTags(tags);
  return normalizedTags.length > 0 ? normalizedTags.join("|") : undefined;
};

const getMeditationRouteGuidance = (
  template: MeditationListItem | MeditationItemDetail
): string | undefined =>
  "guidance" in template ? toMeditationRouteText(template.guidance) : undefined;

export const mapMeditationDetailItemTemplate = (
  item: WellnessContentDetailItem
): MeditationItemDetail => {
  const listTemplate = buildMeditationList(item, "Meditation");

  return {
    ...listTemplate,
    source: item.audio?.trim() || listTemplate.source || null,
    longDescription: item.longDescription?.trim() || undefined,
    guidance: item.guidance?.trim() || undefined,
    date: item.date?.trim() || undefined,
    instructor: normalizeInstructor(item.instructor),
    benefits: normalizeBenefits(item.benefits),
    scientificSynthesis: normalizeScientificSynthesis(item.scientificSynthesis),
  };
};

export const buildMeditationFilterOptions = (
  templates: MeditationListItem[]
): WellnessCategoryOption[] => {
  const categories = Array.from(
    new Set(
      templates
        .map((template) => template.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  ).sort((a, b) => a.localeCompare(b));

  return [
    { label: "All Modes", value: "all" as const },
    ...categories.map((category) => ({
      label: category,
      value: normalizeMeditationTag(category),
    })),
  ];
};

export const buildMeditationRouteParams = (
  template: MeditationListItem | MeditationItemDetail
): MeditationRouteParams & { meditationId: string } => ({
  meditationId: String(template.id),
  meditationSlug: toMeditationRouteText(template.slug),
  meditationTitle: toMeditationRouteText(template.title),
  meditationDescription: toMeditationRouteText(template.description),
  meditationGuidance: getMeditationRouteGuidance(template),
  meditationDurationLabel: toMeditationRouteText(template.durationLabel),
  meditationImage: toMeditationRouteImage(template.image),
  meditationTags: toMeditationRouteTags(template.tags),
  meditationCategory: toMeditationRouteText(template.category),
  meditationRating: toMeditationRouteNumber(template.rating),
  meditationReviews: toMeditationRouteNumber(template.reviews),
  meditationLevel: toMeditationRouteText(template.level),
  meditationDosha: toMeditationRouteText(template.dosha),
  meditationSource: toMeditationRouteText(template.source),
});
