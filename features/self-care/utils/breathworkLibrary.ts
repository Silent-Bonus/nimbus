import type { ImageSourcePropType } from "react-native";

import {
  createFallbackBreathPattern,
  createFallbackBreathPhases,
  formatBreathStyleLabel,
  normalizeBreathworkCategoryValue,
} from "@/features/self-care/utils/breathworkUtils";
import type {
  BreathPhase,
  BreathPattern,
  BreathRecommendation,
  BreathRecommendationPalette,
  BreathWorkListItem,
  BreathWorkDetail,
  WellnessCategoryOption,
  WellnessContentBenefit,
  WellnessContentBreathworkStep,
  WellnessContentDetailItem,
  WellnessContentItem,
} from "@/features/self-care/types/wellnessContentTypes";
import type { BreathWorkRouteParams } from "@/features/self-care/utils/breathworkPlayback";

const BREATH_WORK_HERO_IMAGE = require("../../../assets/images/mt.jpg");
const BREATH_WORK_DETAIL_CACHE = new Map<string, BreathWorkDetail>();

const DEFAULT_BREATHWORK_ICON = "square-rounded-outline";

const BREATHWORK_COLOR_PALETTES: Record<string, BreathRecommendationPalette> = {
  "#60A5FA": {
    colors: ["#182437", "#0B1220"],
    accent: "#60A5FA",
    accentSoft: "rgba(96, 165, 250, 0.18)",
    text: "#EAF4FF",
    tagBg: "rgba(96, 165, 250, 0.12)",
    tagBorder: "rgba(96, 165, 250, 0.28)",
    tagText: "#CFE5FF",
  },
  "#34D399": {
    colors: ["#132B27", "#091613"],
    accent: "#34D399",
    accentSoft: "rgba(52, 211, 153, 0.18)",
    text: "#E8FFF7",
    tagBg: "rgba(52, 211, 153, 0.12)",
    tagBorder: "rgba(52, 211, 153, 0.28)",
    tagText: "#C4F8E4",
  },
  "#A78BFA": {
    colors: ["#241D38", "#120D1E"],
    accent: "#A78BFA",
    accentSoft: "rgba(167, 139, 250, 0.18)",
    text: "#F2EEFF",
    tagBg: "rgba(167, 139, 250, 0.12)",
    tagBorder: "rgba(167, 139, 250, 0.28)",
    tagText: "#DED3FF",
  },
  "#F59E0B": {
    colors: ["#32230E", "#181005"],
    accent: "#F59E0B",
    accentSoft: "rgba(245, 158, 11, 0.18)",
    text: "#FFF6E6",
    tagBg: "rgba(245, 158, 11, 0.12)",
    tagBorder: "rgba(245, 158, 11, 0.28)",
    tagText: "#FFE0A6",
  },
};
const DEFAULT_BREATHWORK_PALETTE = BREATHWORK_COLOR_PALETTES["#60A5FA"];

const BREATHWORK_SLUG_COLOR_MAP: Record<
  string,
  keyof typeof BREATHWORK_COLOR_PALETTES
> = {
  "box-breathing": "#60A5FA",
  "calm-reset": "#34D399",
  "coherence-flow": "#F59E0B",
  "night-drift": "#A78BFA",
};

const BREATHWORK_SLUG_ICON_MAP: Record<string, string> = {
  "box-breathing": "square-rounded-outline",
  "calm-reset": "feather",
  "coherence-flow": "waveform",
  "night-drift": "moon-waning-crescent",
};

type BreathworkPresentationSource = {
  slug?: string;
  id?: string | number;
};

const mapBreathworkPresentation = (item: BreathworkPresentationSource) => {
  const slug = (item.slug ?? String(item.id ?? "")).trim().toLowerCase();
  const mappedColor = slug ? BREATHWORK_SLUG_COLOR_MAP[slug] : undefined;
  const mappedIcon = slug ? BREATHWORK_SLUG_ICON_MAP[slug] : undefined;

  return {
    palette: mappedColor
      ? BREATHWORK_COLOR_PALETTES[mappedColor]
      : DEFAULT_BREATHWORK_PALETTE,
    icon: mappedIcon ?? DEFAULT_BREATHWORK_ICON,
  };
};

type ResolvedBreathworkContent = {
  title: string;
  style: BreathPattern["style"];
  tags: string[];
  description: string;
  pattern: BreathPattern;
  presentation: ReturnType<typeof mapBreathworkPresentation>;
};

// Backend breathwork steps store duration in one of three phase-specific fields.
// The player and sequence chips need one normalized `seconds` value per step.
const resolveBreathworkStepSeconds = (
  step: WellnessContentBreathworkStep,
  fallbackSeconds: number
) => {
  const seconds = [
    step.inhale_seconds ?? 0,
    step.hold_seconds ?? 0,
    step.exhale_seconds ?? 0,
  ].find((value) => value > 0);

  return typeof seconds === "number" && Number.isFinite(seconds)
    ? seconds
    : fallbackSeconds;
};

const resolveBreathworkStepLabel = (
  step: WellnessContentBreathworkStep,
  index: number
) => step.name?.trim() || step.sanskrit?.trim() || `Phase ${index + 1}`;

// Session playback consumes these normalized phases for timing, motion, and chips.
const mapBreathworkStepsToPhases = (
  steps: WellnessContentBreathworkStep[] | undefined,
  fallbackPhases: BreathPhase[]
): BreathPhase[] => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return fallbackPhases;
  }

  return steps.map((step, index) => {
    const fallbackPhase =
      fallbackPhases[index % fallbackPhases.length] ?? fallbackPhases[0];
    const seconds = resolveBreathworkStepSeconds(
      step,
      fallbackPhase?.seconds ?? 4
    );

    return {
      label: resolveBreathworkStepLabel(step, index),
      seconds,
      color: typeof step.color === "string" ? step.color.trim() : undefined,
      sanskrit: step.sanskrit?.trim() || undefined,
      frequency:
        typeof step.frequency === "number" && Number.isFinite(step.frequency)
          ? step.frequency
          : undefined,
      inhaleSeconds:
        typeof step.inhale_seconds === "number" &&
        Number.isFinite(step.inhale_seconds)
          ? step.inhale_seconds
          : undefined,
      holdSeconds:
        typeof step.hold_seconds === "number" &&
        Number.isFinite(step.hold_seconds)
          ? step.hold_seconds
          : undefined,
      exhaleSeconds:
        typeof step.exhale_seconds === "number" &&
        Number.isFinite(step.exhale_seconds)
          ? step.exhale_seconds
          : undefined,
    };
  });
};

// Detail screens show a richer label than the session player, including optional
// Sanskrit and the resolved step duration when the backend provides it.
const mapBreathworkStepsToLabels = (
  steps: WellnessContentBreathworkStep[] | undefined
) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [];
  }

  return steps.map((step, index) => {
    const label = resolveBreathworkStepLabel(step, index);
    const seconds = resolveBreathworkStepSeconds(step, 4);
    const metadataParts = [
      step.sanskrit?.trim(),
      seconds > 0 ? `${seconds}s` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return metadataParts ? `${label} (${metadataParts})` : label;
  });
};

const formatBreathDurationLabel = (pattern: BreathPattern) => {
  const totalSeconds = pattern.phases.reduce(
    (total, phase) => total + phase.seconds,
    0
  );

  return totalSeconds >= 60
    ? `${(totalSeconds / 60).toFixed(1)} min`
    : `${totalSeconds} sec`;
};

export const cacheBreathWorkDetail = (detail: BreathWorkDetail) => {
  const cacheKeys = [detail.id, detail.slug]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));

  cacheKeys.forEach((key) => {
    BREATH_WORK_DETAIL_CACHE.set(key, detail);
  });
};

export const getCachedBreathWorkDetail = (id: string) => {
  const key = id.trim();
  if (!key) {
    return undefined;
  }

  return BREATH_WORK_DETAIL_CACHE.get(key);
};

export const clearBreathWorkDetailCache = () => {
  BREATH_WORK_DETAIL_CACHE.clear();
};

const isGenericMetaValue = (value?: string | null) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "all" || normalized === "all levels";
};

const normalizeBreathTag = (value: string) =>
  value
    .replace(/^#+/, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDisplayLabel = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

const resolveBreathWorkImageSource = (
  image?: string | ImageSourcePropType | null
): ImageSourcePropType => {
  if (!image) return BREATH_WORK_HERO_IMAGE;
  if (typeof image === "string") return { uri: image };
  return image;
};

// Style is derived from the backend category first so presentation stays stable
// and aligned with the server taxonomy. Text matching is only a fallback.
const BREATHWORK_STYLE_MATCHERS: Array<{
  pattern: RegExp;
  style: BreathPattern["style"];
}> = [
  {
    pattern: /\b(sleep|rest|dream|night|drift|evening)\b/i,
    style: "sleep",
  },
  {
    pattern: /\b(release|unwind|let go|soften|exhale|stress relief|heal)\b/i,
    style: "release",
  },
  {
    pattern: /\b(steady|focus|balance|coherent|clarity|work|morning)\b/i,
    style: "steady",
  },
  {
    pattern:
      /\b(calm|ground|relax|relaxation|soothe|anxiety|overwhelm|reset)\b/i,
    style: "grounding",
  },
];

const mapBreathworkTextToStyle = (
  sourceText: string
): BreathPattern["style"] => {
  for (const matcher of BREATHWORK_STYLE_MATCHERS) {
    if (matcher.pattern.test(sourceText)) {
      return matcher.style;
    }
  }

  return "grounding";
};

const mapBreathworkCategoryToStyle = (
  item: Partial<WellnessContentItem>,
  title: string,
  description: string
): BreathPattern["style"] => {
  const category = item.category?.trim();
  if (category) {
    return mapBreathworkTextToStyle(category.toLowerCase());
  }

  return mapBreathworkTextToStyle(
    [
      title,
      description,
      item.level ?? "",
      item.dosha ?? "",
      ...(Array.isArray(item.tags) ? item.tags : []),
    ]
      .join(" ")
      .toLowerCase()
  );
};

const buildBreathworkDescription = (
  item: Partial<WellnessContentItem>,
  title: string,
  fallbackPattern: BreathPattern,
  tags: string[]
) => {
  if (typeof item.description === "string" && item.description.trim()) {
    return item.description.trim();
  }

  const descriptors = [
    item.category?.trim() && !isGenericMetaValue(item.category)
      ? formatDisplayLabel(item.category.trim())
      : null,
    item.level?.trim() && !isGenericMetaValue(item.level)
      ? formatDisplayLabel(item.level.trim())
      : null,
    item.dosha?.trim() && !isGenericMetaValue(item.dosha)
      ? formatDisplayLabel(item.dosha.trim())
      : null,
  ].filter(Boolean) as string[];

  if (descriptors.length > 0) {
    return `A quiet practice shaped for ${descriptors.join(", ")}.`;
  }

  const primaryTag = tags[0];
  if (primaryTag) {
    return `A quiet practice centered on ${formatDisplayLabel(primaryTag)}.`;
  }

  return (
    fallbackPattern.description ||
    `A quiet breath practice centered on ${title}.`
  );
};

const buildBreathworkTags = (
  item: Partial<WellnessContentItem>,
  style: BreathPattern["style"]
): string[] => {
  const sourceTags = Array.isArray(item.tags) ? item.tags : [];
  const metadataTags = [item.category, item.level, item.dosha]
    .map((tag) =>
      typeof tag === "string" && !isGenericMetaValue(tag)
        ? normalizeBreathTag(tag)
        : null
    )
    .filter((tag): tag is string => Boolean(tag));

  return Array.from(
    new Set(
      [
        ...sourceTags
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .filter((tag) => !isGenericMetaValue(tag))
          .map(normalizeBreathTag),
        ...metadataTags,
        style,
      ].filter(Boolean)
    )
  );
};

const buildBreathworkDurationLabel = (
  duration: number | string | undefined,
  fallbackPattern: BreathPattern
) => {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    return `${duration} min`;
  }

  if (typeof duration === "string") {
    const trimmed = duration.trim();
    if (!trimmed) {
      return formatBreathDurationLabel(fallbackPattern);
    }
    return trimmed.includes("min") ? trimmed : `${trimmed} min`;
  }

  return formatBreathDurationLabel(fallbackPattern);
};

// This is the single place where raw API content becomes the shared breathwork
// view model used by both list and detail mapping.
const resolveBreathworkContent = (
  item: Partial<WellnessContentItem>,
  index: number
): ResolvedBreathworkContent => {
  const title = item.title?.trim() || `Breathwork ${index + 1}`;
  const style = mapBreathworkCategoryToStyle(
    item,
    title,
    item.description?.trim() || ""
  );
  const basePattern = createFallbackBreathPattern(style, {
    id: item.slug?.trim() || String(item.id ?? `${style}-${index}`),
    title,
  });
  const tags = buildBreathworkTags(item, style);
  const description = buildBreathworkDescription(
    item,
    title,
    basePattern,
    tags
  );
  const phases = mapBreathworkStepsToPhases(
    item.metadata?.steps,
    basePattern.phases
  );
  const pattern = createFallbackBreathPattern(style, {
    id: basePattern.id,
    title,
    description,
    phases,
  });

  return {
    title,
    style,
    tags,
    description,
    pattern,
    presentation: mapBreathworkPresentation(item),
  };
};

const createBreathworkListItem = (
  item: Partial<WellnessContentItem>,
  index: number,
  resolved: ResolvedBreathworkContent
): BreathWorkListItem => ({
  id: String(item.id ?? item.slug ?? `${resolved.title}-${index}`),
  title: resolved.title,
  description: resolved.description,
  image: resolveBreathWorkImageSource(item.image),
  style: resolved.pattern.style,
  styleLabel: formatBreathStyleLabel(resolved.pattern.style),
  palette: resolved.presentation.palette,
  durationLabel: buildBreathworkDurationLabel(item.duration, resolved.pattern),
  category: item.category?.trim() || resolved.pattern.style,
  slug: item.slug?.trim() || undefined,
  rating: typeof item.rating === "number" ? item.rating : undefined,
  reviews: typeof item.reviews === "number" ? item.reviews : undefined,
  level: item.level?.trim() || undefined,
  dosha: item.dosha?.trim() || undefined,
  tags: resolved.tags,
  modality: item.modality?.trim() || undefined,
});

const mapBreathworkBenefits = (
  benefits: WellnessContentBenefit[] | undefined
) => {
  if (!Array.isArray(benefits) || benefits.length === 0) {
    return [];
  }

  return benefits
    .map((benefit, index) => {
      const title = benefit.title?.trim() || `Benefit ${index + 1}`;
      const text = benefit.text?.trim() || benefit.title?.trim() || "";

      return {
        id: Number.isFinite(benefit.id) ? benefit.id : index + 1,
        title,
        text,
      };
    })
    .filter((benefit) => Boolean(benefit.title) || Boolean(benefit.text));
};

const mapBreathworkTips = (tips: string[] | undefined) => {
  if (!Array.isArray(tips) || tips.length === 0) {
    return [];
  }

  return tips.map((tip) => tip.trim()).filter((tip) => tip.length > 0);
};

const buildBreathworkPhases = (
  metadataSteps: WellnessContentBreathworkStep[] | undefined,
  fallbackPattern: BreathPattern
) => mapBreathworkStepsToPhases(metadataSteps, fallbackPattern.phases);

const buildBreathworkStepLabels = (
  metadataSteps: WellnessContentBreathworkStep[] | undefined
) => mapBreathworkStepsToLabels(metadataSteps);

export const mapBreathworkContent = (
  item: WellnessContentItem,
  index: number
): BreathWorkListItem => {
  const resolved = resolveBreathworkContent(item, index);
  return createBreathworkListItem(item, index, resolved);
};

export const mapBreathworkDetail = (
  item: WellnessContentDetailItem,
  index: number
): BreathWorkDetail => {
  const resolved = resolveBreathworkContent(item, index);
  const listItem = createBreathworkListItem(item, index, resolved);
  const metadataSteps = item.metadata?.steps;
  const guidance = item.guidance?.trim() || undefined;
  const longDescription = item.longDescription?.trim() || undefined;
  const description =
    item.description?.trim() || longDescription || listItem.description;
  const steps = buildBreathworkStepLabels(metadataSteps);
  const phases = buildBreathworkPhases(metadataSteps, resolved.pattern);
  const benefits = mapBreathworkBenefits(item.benefits);
  const tips = mapBreathworkTips(item.tips);

  return {
    ...listItem,
    id: String(item.id ?? listItem.id),
    slug: item.slug?.trim() || listItem.slug,
    title: item.title?.trim() || listItem.title,
    description,
    steps,
    benefits,
    tips,
    image: resolveBreathWorkImageSource(item.image ?? listItem.image),
    durationLabel: listItem.durationLabel,
    category: item.category?.trim() || listItem.category,
    rating: typeof item.rating === "number" ? item.rating : listItem.rating,
    reviews: typeof item.reviews === "number" ? item.reviews : listItem.reviews,
    level: item.level?.trim() || listItem.level,
    dosha: item.dosha?.trim() || listItem.dosha,
    tags: listItem.tags,
    modality: item.modality?.trim() || listItem.modality,
    source: item.audio?.trim() || item.source?.trim() || null,
    phases,
    longDescription,
    guidance,
    date: item.date?.trim() || undefined,
    metadata: item.metadata ?? undefined,
    instructor: item.instructor ?? undefined,
    scientificSynthesis: item.scientificSynthesis ?? undefined,
  };
};

export const buildBreathWorkPattern = (
  item: BreathWorkListItem | BreathWorkDetail
): BreathPattern => {
  const fallbackPattern = createFallbackBreathPattern(item.style, {
    id: item.slug ?? item.id,
    title: item.title,
    description: item.description,
  });

  return {
    id: item.id,
    style: item.style,
    title: item.title,
    description: item.description,
    benefit:
      "benefits" in item && item.benefits[0]?.text
        ? item.benefits[0].text
        : fallbackPattern.benefit,
    phases:
      "phases" in item && item.phases.length > 0
        ? item.phases
        : createFallbackBreathPhases(item.style),
  };
};

export const buildBreathWorkRecommendation = (
  item: BreathWorkListItem | BreathWorkDetail
): BreathRecommendation => {
  const presentation = mapBreathworkPresentation(item);

  return {
    id: item.id,
    style: item.style,
    title: item.title,
    subtitle: item.description,
    tag: item.category || item.styleLabel,
    palette: item.palette ?? presentation.palette,
    icon: presentation.icon,
  };
};

export const buildBreathWorkCategoryOptions = (
  items: Array<BreathWorkListItem | BreathWorkDetail>
): WellnessCategoryOption[] => {
  const seen = new Set<string>();
  const options: WellnessCategoryOption[] = [{ label: "All", value: "all" }];

  items.forEach((item) => {
    const label = item.category?.trim() || item.styleLabel;
    const value = normalizeBreathworkCategoryValue(label);

    if (!value || seen.has(value)) {
      return;
    }

    seen.add(value);
    options.push({
      label,
      value,
    });
  });

  return options;
};

export const buildBreathWorkRouteParams = (
  detail: BreathWorkListItem | BreathWorkDetail
): BreathWorkRouteParams & { breathworkId: string } => ({
  breathworkId: detail.id,
  breathworkSlug: detail.slug ?? undefined,
});
