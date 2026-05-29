import type { ImageSourcePropType } from "react-native";

import type {
  WellnessContentBenefit,
  WellnessContentInstructor,
  WellnessContentScientificSynthesis,
} from "@/features/self-care/types/selfCareTypes";

const FALLBACK_IMAGE = require("../../../assets/images/mt.jpg");
const DEFAULT_MEDITATION_DESCRIPTION =
  "A quiet cadence for the body and the part of the mind that listens.";

const MEDITATION_TAG_PRIORITY = [
  "breath",
  "calm",
  "focus",
  "sleep",
  "release",
  "beginner",
] as const;

type RouteValue = string | string[] | undefined;

export type MeditationRouteParams = {
  meditationId?: RouteValue;
  meditationTitle?: RouteValue;
  meditationDescription?: RouteValue;
  meditationGuidance?: RouteValue;
  meditationDurationLabel?: RouteValue;
  meditationImage?: RouteValue;
  meditationTags?: RouteValue;
  meditationCategory?: RouteValue;
  meditationRating?: RouteValue;
  meditationReviews?: RouteValue;
  meditationLevel?: RouteValue;
  meditationDosha?: RouteValue;
  meditationSource?: RouteValue;
  meditationSessionRef?: RouteValue;
  meditationSessionLaunchKey?: RouteValue;
};

export type MeditationTemplate = {
  id: string;
  title: string;
  description: string;
  tag: string;
  tags: string[];
  durationLabel: string;
  image: ImageSourcePropType;
  source?: string | null;
  isLocked: boolean;
  category?: string;
  slug?: string;
  rating?: number;
  reviews?: number;
  level?: string;
  dosha?: string;
  modality?: string;
  longDescription?: string;
  guidance?: string;
  date?: string;
  instructor?: WellnessContentInstructor;
  benefits?: WellnessContentBenefit[];
  scientificSynthesis?: WellnessContentScientificSynthesis;
};

export type RawMeditationTemplate = {
  id?: number | string;
  slug?: string;
  title?: string;
  description?: string;
  longDescription?: string;
  guidance?: string;
  date?: string;
  image?: string | ImageSourcePropType | null;
  source?: string | null;
  audio?: string | null;
  category?: string;
  duration?: number | string;
  isLocked?: boolean;
  is_locked?: boolean;
  tags?: string[];
  rating?: number;
  reviews?: number;
  level?: string;
  dosha?: string;
  modality?: string;
  instructor?: WellnessContentInstructor;
  benefits?: WellnessContentBenefit[];
  scientificSynthesis?: WellnessContentScientificSynthesis;
};

const titleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const firstRouteValue = (value?: RouteValue) =>
  Array.isArray(value) ? value[0] : value;

const parseOptionalNumber = (value?: RouteValue) => {
  const rawValue = firstRouteValue(value)?.trim();
  if (!rawValue) return undefined;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isGenericMetaValue = (value?: string | null) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "all" || normalized === "all levels";
};

const normalizeTagSource = (value?: string | null) => {
  if (!value || isGenericMetaValue(value)) return null;
  return normalizeMeditationTag(value);
};

const formatDurationLabel = (duration: number | string | undefined) => {
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

export const normalizeMeditationTag = (value: string) =>
  value
    .replace(/^#+/, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const formatMeditationTagLabel = (value: string) =>
  titleCase(normalizeMeditationTag(value));

const tagMatchers: { pattern: RegExp; tag: string }[] = [
  { pattern: /\b(breath|breathwork|breathing|inhale|exhale)\b/i, tag: "breath" },
  { pattern: /\b(calm|ground|settle|stress|anxiety|soothe)\b/i, tag: "calm" },
  { pattern: /\b(focus|clarity|attention|steady)\b/i, tag: "focus" },
  { pattern: /\b(sleep|dream|rest|drift)\b/i, tag: "sleep" },
  { pattern: /\b(release|unwind|let go|soften)\b/i, tag: "release" },
  { pattern: /\b(beginner|starter|intro)\b/i, tag: "beginner" },
];

const resolveMeditationImageSource = (
  image?: string | ImageSourcePropType | null
): ImageSourcePropType => {
  if (!image) return FALLBACK_IMAGE;
  if (typeof image === "string") return { uri: image };
  return image;
};

const extractMeditationImageUri = (image?: ImageSourcePropType | string | null) => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    const first = image[0];
    return extractMeditationImageUri(first ?? null);
  }
  if (typeof image === "object") {
    const maybeImage = image as { uri?: unknown };
    if (typeof maybeImage.uri === "string" && maybeImage.uri.trim()) {
      return maybeImage.uri.trim();
    }
  }

  return undefined;
};

const normalizeInstructor = (
  instructor?: WellnessContentInstructor
): WellnessContentInstructor | undefined => {
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
  benefits?: WellnessContentBenefit[]
): WellnessContentBenefit[] | undefined => {
  if (!Array.isArray(benefits)) return undefined;

  const normalized = benefits
    .map((benefit) => ({
      id: benefit.id,
      title: benefit.title.trim(),
      text: benefit.text.trim(),
    }))
    .filter(
      (benefit) =>
        Boolean(benefit.title) || Boolean(benefit.text) || Number.isFinite(benefit.id)
    );

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeScientificSynthesis = (
  scientificSynthesis?: WellnessContentScientificSynthesis
):
  | WellnessContentScientificSynthesis
  | undefined => {
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

const buildMeditationDescription = (
  item: RawMeditationTemplate,
  title: string,
  tags: string[]
) => {
  if (typeof item.description === "string" && item.description.trim()) {
    return item.description.trim();
  }

  const descriptors = [
    item.category?.trim() ? formatMeditationTagLabel(item.category.trim()) : null,
    item.level?.trim() && !isGenericMetaValue(item.level)
      ? formatMeditationTagLabel(item.level.trim())
      : null,
    item.dosha?.trim() && !isGenericMetaValue(item.dosha)
      ? formatMeditationTagLabel(item.dosha.trim())
      : null,
  ].filter(Boolean) as string[];

  if (descriptors.length > 0) {
    return `A quiet session shaped for ${descriptors.join(", ")}.`;
  }

  const primaryTag = tags[0];
  if (primaryTag) {
    return `A quiet session centered on ${formatMeditationTagLabel(primaryTag)}.`;
  }

  return title ? `A quiet session centered on ${title}.` : DEFAULT_MEDITATION_DESCRIPTION;
};

export const deriveMeditationTags = (
  item: RawMeditationTemplate,
  title: string,
  description: string
) => {
  const sourceTags = Array.isArray(item.tags) ? item.tags : [];
  const sourceText = [
    title,
    description,
    item.category ?? "",
    item.level ?? "",
    item.dosha ?? "",
    ...sourceTags,
  ]
    .join(" ")
    .toLowerCase();

  const derived = tagMatchers
    .filter(({ pattern }) => pattern.test(sourceText))
    .map(({ tag }) => tag);

  const metadataTags = [item.category, item.level, item.dosha]
    .map(normalizeTagSource)
    .filter((tag): tag is string => Boolean(tag));

  const combined = [
    ...sourceTags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .filter((tag) => !isGenericMetaValue(tag))
      .map(normalizeMeditationTag),
    ...metadataTags,
    ...derived,
  ];

  return Array.from(new Set(combined.filter(Boolean)));
};

export const sortMeditationTags = (tags: string[]) => {
  const unique = Array.from(new Set(tags.map(normalizeMeditationTag))).filter(Boolean);

  return unique.sort((a, b) => {
    const aIndex = MEDITATION_TAG_PRIORITY.indexOf(a as any);
    const bIndex = MEDITATION_TAG_PRIORITY.indexOf(b as any);

    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    }
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
};

export const mapMeditationTemplate = (
  item: RawMeditationTemplate,
  index: number
): MeditationTemplate => {
  const title = item.title?.trim() || `Meditation ${index + 1}`;
  const tags = sortMeditationTags(
    deriveMeditationTags(item, title, item.description?.trim() || "")
  );
  const description =
    item.description?.trim() ||
    item.longDescription?.trim() ||
    buildMeditationDescription(item, title, tags);
  const longDescription = item.longDescription?.trim() || undefined;
  const durationValue = formatDurationLabel(item.duration);
  const idValue = item.id ?? item.slug;
  const source = item.audio?.trim() || item.source?.trim() || null;

  return {
    id: String(idValue ?? `${title}-${index}`),
    slug: item.slug?.trim() || undefined,
    title,
    description,
    tag: tags[0] ?? "calm",
    tags,
    durationLabel: durationValue,
    image: resolveMeditationImageSource(item.image),
    source,
    isLocked: Boolean(item.isLocked ?? item.is_locked),
    category: item.category?.trim() || tags[0] || "calm",
    rating: typeof item.rating === "number" ? item.rating : undefined,
    reviews: typeof item.reviews === "number" ? item.reviews : undefined,
    level: item.level?.trim() || undefined,
    dosha: item.dosha?.trim() || undefined,
    modality: item.modality?.trim() || undefined,
    longDescription,
    guidance: item.guidance?.trim() || undefined,
    date: item.date?.trim() || undefined,
    instructor: normalizeInstructor(item.instructor),
    benefits: normalizeBenefits(item.benefits),
    scientificSynthesis: normalizeScientificSynthesis(item.scientificSynthesis),
  };
};

export const buildMeditationFilterOptions = (templates: MeditationTemplate[]) => {
  const tags = sortMeditationTags(templates.flatMap((template) => template.tags));

  return [
    { label: "All Modes", value: "all" as const },
    ...tags.map((tag) => ({
      label: formatMeditationTagLabel(tag),
      value: tag,
    })),
  ];
};

export const filterMeditationTemplates = (
  templates: MeditationTemplate[],
  selectedTag: string
) => {
  if (selectedTag === "all") return templates;
  return templates.filter((template) => template.tags.includes(selectedTag));
};

export const buildMeditationRouteParams = (
  template: MeditationTemplate
): MeditationRouteParams & { meditationId: string } => ({
  meditationId: template.id,
  meditationTitle: template.title,
  meditationDescription: template.description,
  meditationGuidance: template.guidance ?? undefined,
  meditationDurationLabel: template.durationLabel,
  meditationImage: extractMeditationImageUri(template.image),
  meditationTags: template.tags.length > 0 ? template.tags.join("|") : undefined,
  meditationCategory: template.category ?? undefined,
  meditationRating:
    typeof template.rating === "number" ? String(template.rating) : undefined,
  meditationReviews:
    typeof template.reviews === "number" ? String(template.reviews) : undefined,
  meditationLevel: template.level ?? undefined,
  meditationDosha: template.dosha ?? undefined,
  meditationSource: template.source ?? undefined,
});

export const hydrateMeditationTemplate = (
  params: MeditationRouteParams,
  fallback?: MeditationTemplate | null
): MeditationTemplate => {
  const fallbackTemplate = fallback ?? fallbackMeditationTemplates[0];
  const title = firstRouteValue(params.meditationTitle)?.trim() ||
    fallbackTemplate.title;
  const routeTags = firstRouteValue(params.meditationTags)
    ?.split("|")
    .map((tag) => tag.trim())
    .filter(Boolean) ?? [];
  const fallbackTags = fallbackTemplate.tags ?? [];
  const tags = sortMeditationTags(
    routeTags.length > 0 ? routeTags : fallbackTags
  );
  const hasExplicitMetadata = Boolean(
    firstRouteValue(params.meditationTitle) ||
      firstRouteValue(params.meditationDescription) ||
      firstRouteValue(params.meditationGuidance) ||
      firstRouteValue(params.meditationTags) ||
      firstRouteValue(params.meditationCategory) ||
      firstRouteValue(params.meditationLevel) ||
      firstRouteValue(params.meditationDosha) ||
      firstRouteValue(params.meditationDurationLabel) ||
      firstRouteValue(params.meditationImage) ||
      firstRouteValue(params.meditationSource) ||
      firstRouteValue(params.meditationRating) ||
      firstRouteValue(params.meditationReviews)
  );
  const description =
    firstRouteValue(params.meditationDescription)?.trim() ||
    (hasExplicitMetadata
      ? buildMeditationDescription(
          {
            category: firstRouteValue(params.meditationCategory)?.trim(),
            level: firstRouteValue(params.meditationLevel)?.trim(),
            dosha: firstRouteValue(params.meditationDosha)?.trim(),
          },
          title,
          tags
        )
      : fallbackTemplate.description);
  const guidance =
    firstRouteValue(params.meditationGuidance)?.trim() ||
    fallbackTemplate.guidance;
  const durationLabel =
    firstRouteValue(params.meditationDurationLabel)?.trim() ||
    fallbackTemplate.durationLabel;

  return {
    ...fallbackTemplate,
    id: firstRouteValue(params.meditationId)?.trim() || fallbackTemplate.id,
    slug: firstRouteValue(params.meditationId)?.trim() || fallbackTemplate.slug,
    title,
    description,
    tag: tags[0] ?? fallbackTemplate.tag ?? "calm",
    tags: tags.length > 0 ? tags : fallbackTags,
    durationLabel,
    image: resolveMeditationImageSource(
      firstRouteValue(params.meditationImage) || fallbackTemplate.image
    ),
    source: firstRouteValue(params.meditationSource) ?? fallbackTemplate.source ?? null,
    guidance,
    category:
      firstRouteValue(params.meditationCategory)?.trim() ||
      fallbackTemplate.category ||
      tags[0] ||
      "calm",
    rating: parseOptionalNumber(params.meditationRating) ?? fallbackTemplate.rating,
    reviews: parseOptionalNumber(params.meditationReviews) ?? fallbackTemplate.reviews,
    level:
      firstRouteValue(params.meditationLevel)?.trim() ||
      fallbackTemplate.level,
    dosha:
      firstRouteValue(params.meditationDosha)?.trim() ||
      fallbackTemplate.dosha,
    modality: fallbackTemplate.modality ?? "meditation",
  };
};

export const fallbackMeditationTemplates: MeditationTemplate[] = [
  mapMeditationTemplate(
    {
      id: "stillness-anchor",
      title: "Stillness Anchor",
      description:
        "Use the breath to slow the edges of the day and settle the room.",
      category: "breath",
      duration: 5,
      source: "",
    },
    0
  ),
  mapMeditationTemplate(
    {
      id: "moonlit-reset",
      title: "Moonlit Reset",
      description:
        "A calm reset for the nervous system when the day has been too loud.",
      category: "calm",
      duration: 7,
      source: "",
    },
    1
  ),
  mapMeditationTemplate(
    {
      id: "focus-lantern",
      title: "Focus Lantern",
      description:
        "Return to one bright point at a time and let the edges soften.",
      category: "focus",
      duration: 6,
      source: "",
    },
    2
  ),
  mapMeditationTemplate(
    {
      id: "sleep-drift",
      title: "Sleep Drift",
      description:
        "Let the body grow heavier while the breath becomes quieter.",
      category: "sleep",
      duration: 8,
      source: "",
    },
    3
  ),
  mapMeditationTemplate(
    {
      id: "soft-release",
      title: "Soft Release",
      description:
        "Unwind tension and leave the shoulders somewhere gentler than before.",
      category: "release",
      duration: 4,
      source: "",
    },
    4
  ),
];

export const mockMeditationRecommendations = fallbackMeditationTemplates;
