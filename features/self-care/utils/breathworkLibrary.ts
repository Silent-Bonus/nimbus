import type { ImageSourcePropType } from "react-native";

import {
  BREATH_PATTERNS,
  formatBreathCadence,
  formatBreathToneLabel,
  getBreathPatternByTone,
  normalizeBreathworkCategoryValue,
} from "@/features/self-care/utils/breathworkUtils";
import type {
  BreathPhase,
  BreathPattern,
  BreathRecommendation,
  BreathRecommendationPalette,
  BreathWorkCategoryOption,
  BreathWorkDetail,
  BreathWorkMetadataStep,
  BreathWorkRouteParams,
  RawBreathWorkDetailItem,
  RawBreathWorkTemplate,
  RouteValue,
} from "@/features/self-care/types/breathworkTypes";
import type {
  WellnessContentBenefit,
} from "@/features/self-care/types/selfCareTypes";

const BREATH_WORK_HERO_IMAGE = require("../../../assets/images/mt.jpg");
const BREATH_WORK_DETAIL_CACHE = new Map<string, BreathWorkDetail>();

const BREATH_RECOMMENDATION_TITLES: Record<string, string> = {
  "box-breath": "4-4-4-4: Box Breath",
  "coherent-breath": "5-5: Coherent Flow",
  "release-breath": "4-6: Release Path",
  "sleep-breath": "4-2-6-2: Night Drift",
};

const BREATH_RECOMMENDATION_MANTRAS: Record<string, string> = {
  "box-breath": "Equal counts make the room feel steady again.",
  "coherent-breath": "A smooth rhythm gives the nervous system something simple to follow.",
  "release-breath": "Longer exhales loosen tension without asking for force.",
  "sleep-breath": "Let the count soften until the body can hand over the work.",
};

const BREATH_RECOMMENDATION_ICONS: Record<string, string> = {
  "box-breath": "square-rounded-outline",
  "coherent-breath": "waveform",
  "release-breath": "feather",
  "sleep-breath": "moon-waning-crescent",
};

const BREATH_RECOMMENDATION_PALETTES: BreathRecommendationPalette[] = [
  {
    colors: ["#1E231B", "#0F120E"],
    accent: "#C6D7A2",
    accentSoft: "rgba(198, 215, 162, 0.14)",
    text: "#E6E8D7",
    tagBg: "rgba(255, 255, 255, 0.06)",
    tagBorder: "rgba(255, 255, 255, 0.10)",
    tagText: "#D6E4B8",
  },
  {
    colors: ["#1D2627", "#101517"],
    accent: "#9CD4C8",
    accentSoft: "rgba(156, 212, 200, 0.16)",
    text: "#E5F2EE",
    tagBg: "rgba(255, 255, 255, 0.06)",
    tagBorder: "rgba(255, 255, 255, 0.10)",
    tagText: "#B6ECE2",
  },
  {
    colors: ["#241D18", "#120F0C"],
    accent: "#E8BF88",
    accentSoft: "rgba(232, 191, 136, 0.15)",
    text: "#F2E9DD",
    tagBg: "rgba(255, 255, 255, 0.06)",
    tagBorder: "rgba(255, 255, 255, 0.10)",
    tagText: "#F0D7B1",
  },
  {
    colors: ["#221E29", "#131118"],
    accent: "#C8B4F3",
    accentSoft: "rgba(200, 180, 243, 0.16)",
    text: "#ECE7FB",
    tagBg: "rgba(255, 255, 255, 0.06)",
    tagBorder: "rgba(255, 255, 255, 0.10)",
    tagText: "#DDD0FB",
  },
];

export const BREATH_RECOMMENDATIONS: BreathRecommendation[] = BREATH_PATTERNS.map(
  (pattern, index) => ({
    id: pattern.id,
    tone: pattern.tone,
    title: BREATH_RECOMMENDATION_TITLES[pattern.id] ?? pattern.title,
    subtitle: pattern.description,
    mantra: BREATH_RECOMMENDATION_MANTRAS[pattern.id] ?? pattern.benefit,
    tag: formatBreathToneLabel(pattern.tone),
    palette:
      BREATH_RECOMMENDATION_PALETTES[index % BREATH_RECOMMENDATION_PALETTES.length],
    icon:
      BREATH_RECOMMENDATION_ICONS[pattern.id] ??
      (pattern.tone === "sleep" ? "moon-waning-crescent" : "weather-windy"),
  })
);

export const BREATH_RECOMMENDATION_LOOKUP = Object.fromEntries(
  BREATH_RECOMMENDATIONS.map((item) => [item.id, item])
) as Record<string, BreathRecommendation>;

export const getBreathRecommendationById = (id: string) =>
  BREATH_RECOMMENDATION_LOOKUP[id] ?? BREATH_RECOMMENDATIONS[0];

export const getBreathRecommendationPaletteById = (id: string) =>
  getBreathRecommendationById(id).palette;

const BREATH_CONTEXT_COPY: Record<BreathPattern["tone"], string> = {
  grounding:
    "Use this when attention is scattered or the day feels too wide. The square count gives the body a clean edge to return to.",
  steady:
    "Use this when you want your pace to feel even before focus, writing, or a clear conversation.",
  release:
    "Use this when tension is parked in the jaw, chest, or shoulders and you want the exhale to carry more of the release.",
  sleep:
    "Use this in the evening when the room should soften and the nervous system can start handing the work back.",
};

const BREATH_STEPS_COPY: Record<string, string[]> = {
  "box-breath": [
    "Settle into a tall, comfortable seat and let both feet find the floor.",
    "Follow the 4-4-4-4 cadence: inhale, hold, exhale, and hold with equal count.",
    "Repeat for 4 to 6 rounds, keeping the rhythm even rather than forceful.",
    "Finish with one longer exhale and notice how the room feels more organized.",
  ],
  "coherent-breath": [
    "Sit upright with the ribs free so the breath can move without effort.",
    "Inhale for 5 and exhale for 5, letting both sides feel balanced.",
    "Continue for 5 to 8 rounds and keep the count quiet and smooth.",
    "Let the breath return to a natural pace and hold the steadier mood you created.",
  ],
  "release-breath": [
    "Unclench the jaw, soften the shoulders, and give the chest a little room.",
    "Inhale for 4 and exhale for 6, allowing the longer out-breath to do the heavy lifting.",
    "Repeat for 6 to 8 rounds and keep the exhale smooth rather than pushed.",
    "End with two easy breaths and notice where the body has already loosened.",
  ],
  "sleep-breath": [
    "Dim the lights or settle into a position that feels supported and safe.",
    "Inhale for 4, hold for 2, exhale for 6, and hold for 2 with a gentle count.",
    "Repeat for 6 to 8 rounds and let the rhythm get quieter as you continue.",
    "Let the final exhale fade and stay with the stillness for a moment.",
  ],
};

const makeBenefit = (
  id: number,
  title: string,
  text: string
): WellnessContentBenefit => ({
  id,
  title,
  text,
});

const BREATH_BENEFITS_COPY: Record<string, WellnessContentBenefit[]> = {
  "box-breath": [
    makeBenefit(
      1,
      "Recenter Attention",
      "Reorients attention when the mind feels pulled in too many directions."
    ),
    makeBenefit(
      2,
      "Clean Reset",
      "Creates a clean reset you can repeat quickly before the next task."
    ),
    makeBenefit(
      3,
      "Organized Feeling",
      "Helps the body feel organized without needing extra effort."
    ),
  ],
  "coherent-breath": [
    makeBenefit(
      1,
      "Steady Tempo",
      "Builds a measured internal tempo that feels calm and deliberate."
    ),
    makeBenefit(
      2,
      "Focus Support",
      "Supports focus for work, reading, or planning sessions."
    ),
    makeBenefit(3, "Simple Beat", "Gives the nervous system a simple beat to follow."),
  ],
  "release-breath": [
    makeBenefit(
      1,
      "Soften Tension",
      "Softens held tension in the chest, jaw, and shoulders."
    ),
    makeBenefit(
      2,
      "Longer Exhale",
      "Lets the exhale carry more of the calming work."
    ),
    makeBenefit(
      3,
      "Gentle Downshift",
      "Creates a cleaner downshift after a demanding stretch of the day."
    ),
  ],
  "sleep-breath": [
    makeBenefit(
      1,
      "Evening Slowdown",
      "Slows the evening without asking for a full meditation practice."
    ),
    makeBenefit(
      2,
      "Let Go Cue",
      "Signals that the day can start letting go."
    ),
    makeBenefit(
      3,
      "Rest Transition",
      "Supports a quieter transition toward rest."
    ),
  ],
};

const BREATH_TIPS_COPY: Record<string, string[]> = {
  "box-breath": [
    "Keep the gaze soft so the count stays steady.",
    "If a hold feels tense, shorten it before forcing the cadence.",
    "Practice with your back supported if you want more physical stability.",
  ],
  "coherent-breath": [
    "Count silently if the room is noisy or distracting.",
    "Relax the forehead so the rhythm stays light.",
    "Return to the same pace after every interruption.",
  ],
  "release-breath": [
    "Let the air leave naturally instead of pushing it out.",
    "Pair the practice with a shoulder roll between rounds.",
    "If the exhale feels shaky, ease the pace before increasing the count.",
  ],
  "sleep-breath": [
    "Only hold the breath if it feels comfortable in the body.",
    "Practice lying down or sitting on the bed when you want a softer landing.",
    "Let the count get quieter as the practice comes to an end.",
  ],
};

const toPhaseSeconds = (step: BreathWorkMetadataStep, fallbackSeconds: number) => {
  const seconds = [
    step.inhale_seconds ?? 0,
    step.hold_seconds ?? 0,
    step.exhale_seconds ?? 0,
  ].find((value) => value > 0);

  return typeof seconds === "number" && Number.isFinite(seconds)
    ? seconds
    : fallbackSeconds;
};

const normalizeBreathworkStepLabel = (step: BreathWorkMetadataStep, index: number) =>
  step.name?.trim() ||
  step.sanskrit?.trim() ||
  `Phase ${index + 1}`;

const buildBreathworkMetadataSteps = (
  steps: BreathWorkMetadataStep[] | undefined,
  fallbackPhases: BreathPhase[]
): BreathPhase[] => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return fallbackPhases;
  }

  return steps.map((step, index) => {
    const fallbackPhase = fallbackPhases[index % fallbackPhases.length] ?? fallbackPhases[0];
    const seconds = toPhaseSeconds(step, fallbackPhase?.seconds ?? 4);

    return {
      label: normalizeBreathworkStepLabel(step, index),
      seconds,
      color: typeof step.color === "string" ? step.color.trim() : undefined,
      sanskrit: step.sanskrit?.trim() || undefined,
      frequency:
        typeof step.frequency === "number" && Number.isFinite(step.frequency)
          ? step.frequency
          : undefined,
      inhaleSeconds:
        typeof step.inhale_seconds === "number" && Number.isFinite(step.inhale_seconds)
          ? step.inhale_seconds
          : undefined,
      holdSeconds:
        typeof step.hold_seconds === "number" && Number.isFinite(step.hold_seconds)
          ? step.hold_seconds
          : undefined,
      exhaleSeconds:
        typeof step.exhale_seconds === "number" && Number.isFinite(step.exhale_seconds)
          ? step.exhale_seconds
          : undefined,
    };
  });
};

const buildBreathworkMetadataStepLabels = (
  steps: BreathWorkMetadataStep[] | undefined,
  fallbackSteps: string[]
) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return fallbackSteps;
  }

  return steps.map((step, index) => {
    const label = normalizeBreathworkStepLabel(step, index);
    const metadataParts = [step.sanskrit?.trim(), step.frequency ? `${step.frequency.toFixed(2)} Hz` : null]
      .filter(Boolean)
      .join(" · ");

    return metadataParts ? `${label} (${metadataParts})` : label;
  });
};

const buildBreathSteps = (pattern: BreathPattern) =>
  BREATH_STEPS_COPY[pattern.id] ?? [
    "Settle into a comfortable seat and let the body land before you begin.",
    `Follow the ${formatBreathCadence(pattern)} cadence with a smooth count.`,
    "Repeat for several rounds and keep the transitions calm and unforced.",
    "Finish with a quiet breath and notice the shift in pace.",
  ];

const buildBreathBenefits = (pattern: BreathPattern) =>
  BREATH_BENEFITS_COPY[pattern.id]
    ? BREATH_BENEFITS_COPY[pattern.id]
    : [
        makeBenefit(1, "Repeatable Reset", pattern.benefit),
        makeBenefit(
          2,
          "Return Easily",
          "Creates a repeatable reset that is easy to return to later."
        ),
        makeBenefit(
          3,
          "Steadier Pace",
          "Helps the body remember a steadier pace."
        ),
      ];

const buildBreathTips = (pattern: BreathPattern) =>
  BREATH_TIPS_COPY[pattern.id] ?? [
    "Keep the count gentle and consistent.",
    "Return to the breath if your attention drifts.",
    "Stop if any part of the practice feels strained.",
  ];

const formatBreathDurationLabel = (pattern: BreathPattern) => {
  const totalSeconds = pattern.phases.reduce(
    (total, phase) => total + phase.seconds,
    0
  );

  return totalSeconds >= 60
    ? `${(totalSeconds / 60).toFixed(1)} min`
    : `${totalSeconds} sec`;
};

export const BREATH_WORK_DETAILS: BreathWorkDetail[] = BREATH_PATTERNS.map(
  (pattern, index) => {
    const recommendation = BREATH_RECOMMENDATIONS[index] ?? getBreathRecommendationById(pattern.id);
    const durationLabel = formatBreathDurationLabel(pattern);

    return {
      id: pattern.id,
      title: recommendation.title,
      subtitle: recommendation.subtitle,
      description: pattern.description,
      context: BREATH_CONTEXT_COPY[pattern.tone],
      steps: buildBreathSteps(pattern),
      benefits: buildBreathBenefits(pattern),
      tips: buildBreathTips(pattern),
      image: BREATH_WORK_HERO_IMAGE,
      tone: pattern.tone,
      toneLabel: formatBreathToneLabel(pattern.tone),
      tag: recommendation.tag,
      mantra: recommendation.mantra,
      palette: recommendation.palette,
      icon: recommendation.icon,
      durationLabel,
      category: pattern.tone,
      slug: pattern.id,
      rating: undefined,
      reviews: undefined,
      level: undefined,
      dosha: undefined,
      tags: [pattern.tone],
      modality: "breathwork",
      source: null,
      phases: pattern.phases,
    };
  }
);

export const BREATH_WORK_DETAIL_LOOKUP = Object.fromEntries(
  BREATH_WORK_DETAILS.map((item) => [item.id, item])
) as Record<string, BreathWorkDetail>;

export const getBreathWorkDetailById = (id: string) =>
  BREATH_WORK_DETAIL_LOOKUP[id] ?? BREATH_WORK_DETAILS[0];

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

const extractBreathWorkImageUri = (
  image?: ImageSourcePropType | string | null
): string | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    return extractBreathWorkImageUri(image[0] ?? null);
  }

  if (typeof image === "object") {
    const maybeImage = image as { uri?: unknown };
    if (typeof maybeImage.uri === "string" && maybeImage.uri.trim()) {
      return maybeImage.uri.trim();
    }
  }

  return undefined;
};

const inferBreathTone = (
  item: Partial<RawBreathWorkTemplate>,
  title: string,
  description: string
): BreathPattern["tone"] => {
  const sourceText = [
    title,
    description,
    item.category ?? "",
    item.level ?? "",
    item.dosha ?? "",
    ...(Array.isArray(item.tags) ? item.tags : []),
  ]
    .join(" ")
    .toLowerCase();

  const toneMatchers: { pattern: RegExp; tone: BreathPattern["tone"] }[] = [
    {
      pattern: /\b(sleep|rest|dream|night|drift|evening)\b/i,
      tone: "sleep",
    },
    {
      pattern: /\b(release|unwind|let go|soften|exhale|stress relief)\b/i,
      tone: "release",
    },
    {
      pattern: /\b(steady|focus|balance|coherent|clarity|work|morning)\b/i,
      tone: "steady",
    },
    {
      pattern: /\b(calm|ground|relax|relaxation|soothe|anxiety|overwhelm|reset)\b/i,
      tone: "grounding",
    },
  ];

  for (const matcher of toneMatchers) {
    if (matcher.pattern.test(sourceText)) {
      return matcher.tone;
    }
  }

  return "grounding";
};

const buildBreathworkSubtitle = (
  item: Partial<RawBreathWorkTemplate>,
  title: string,
  tone: BreathPattern["tone"]
) => {
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
    return `A quiet session shaped for ${descriptors.join(", ")}.`;
  }

  const tagLabel = formatBreathToneLabel(tone);
  return title
    ? `A quiet session centered on ${tagLabel.toLowerCase()} and ${title}.`
    : `A quiet session centered on ${tagLabel.toLowerCase()}.`;
};

const buildBreathworkDescription = (
  item: Partial<RawBreathWorkTemplate>,
  title: string,
  tone: BreathPattern["tone"],
  tags: string[]
) => {
  if (typeof item.description === "string" && item.description.trim()) {
    return item.description.trim();
  }

  const pattern = getBreathPatternByTone(tone);
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

  return pattern.description || `A quiet breath practice centered on ${title}.`;
};

const buildBreathworkTags = (
  item: Partial<RawBreathWorkTemplate>,
  tone: BreathPattern["tone"]
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
        tone,
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

const buildBreathworkSteps = (pattern: BreathPattern) =>
  BREATH_STEPS_COPY[pattern.id] ?? [
    "Settle into a comfortable seat and let the body land before you begin.",
    `Follow the ${formatBreathCadence(pattern)} cadence with a smooth count.`,
    "Repeat for several rounds and keep the transitions calm and unforced.",
    "Finish with a quiet breath and notice the shift in pace.",
  ];

const buildBreathworkBenefits = (pattern: BreathPattern) =>
  BREATH_BENEFITS_COPY[pattern.id]
    ? BREATH_BENEFITS_COPY[pattern.id]
    : [
        makeBenefit(1, "Repeatable Reset", pattern.benefit),
        makeBenefit(
          2,
          "Return Easily",
          "Creates a repeatable reset that is easy to return to later."
        ),
        makeBenefit(
          3,
          "Steadier Pace",
          "Helps the body remember a steadier pace."
        ),
      ];

const buildBreathworkTips = (pattern: BreathPattern) =>
  BREATH_TIPS_COPY[pattern.id] ?? [
    "Keep the count gentle and consistent.",
    "Return to the breath if your attention drifts.",
    "Stop if any part of the practice feels strained.",
  ];

export const mapBreathworkContent = (
  item: RawBreathWorkTemplate,
  index: number
): BreathWorkDetail => {
  const title = item.title?.trim() || `Breathwork ${index + 1}`;
  const descriptionSource = item.description?.trim() || "";
  const tone = inferBreathTone(item, title, descriptionSource);
  const pattern = getBreathPatternByTone(tone);
  const tags = buildBreathworkTags(item, tone);
  const subtitle = buildBreathworkSubtitle(item, title, tone);
  const description = buildBreathworkDescription(item, title, tone, tags);
  const recommendation = getBreathRecommendationById(pattern.id);

  return {
    id: String(item.id ?? item.slug ?? `${title}-${index}`),
    title,
    subtitle,
    description,
    context: BREATH_CONTEXT_COPY[pattern.tone],
    steps: buildBreathworkSteps(pattern),
    benefits: buildBreathworkBenefits(pattern),
    tips: buildBreathworkTips(pattern),
    image: resolveBreathWorkImageSource(item.image),
    tone: pattern.tone,
    toneLabel: formatBreathToneLabel(pattern.tone),
    tag: formatBreathToneLabel(pattern.tone),
    mantra: recommendation.mantra,
    palette: recommendation.palette,
    icon: recommendation.icon,
    durationLabel: buildBreathworkDurationLabel(item.duration, pattern),
    category: item.category?.trim() || pattern.tone,
    slug: item.slug?.trim() || undefined,
    rating: typeof item.rating === "number" ? item.rating : undefined,
    reviews: typeof item.reviews === "number" ? item.reviews : undefined,
    level: item.level?.trim() || undefined,
    dosha: item.dosha?.trim() || undefined,
    tags,
    modality: item.modality?.trim() || undefined,
    source: null,
    phases: pattern.phases,
  };
};

export const mapBreathworkDetail = (
  item: RawBreathWorkDetailItem,
  index: number,
  fallback?: BreathWorkDetail | null
): BreathWorkDetail => {
  const baseDetail = mapBreathworkContent(item, index);
  const fallbackDetail = fallback ?? baseDetail;
  const metadataSteps = item.metadata?.steps;
  const phases = buildBreathworkMetadataSteps(metadataSteps, baseDetail.phases);
  const displaySteps = buildBreathworkMetadataStepLabels(metadataSteps, baseDetail.steps);
  const guidance = item.guidance?.trim() || fallbackDetail.guidance;
  const longDescription =
    item.longDescription?.trim() || fallbackDetail.longDescription;
  const description = item.description?.trim() || longDescription || baseDetail.description;
  const benefitItems = item.benefits?.length
    ? item.benefits
        .map((benefit, index) => {
          const title = benefit.title?.trim() || `Benefit ${index + 1}`;
          const text = benefit.text?.trim() || benefit.title?.trim() || "";

          return {
            id: Number.isFinite(benefit.id) ? benefit.id : index + 1,
            title,
            text,
          };
        })
        .filter((benefit) => Boolean(benefit.title) || Boolean(benefit.text))
    : fallbackDetail.benefits;
  const benefits = benefitItems.length > 0 ? benefitItems : fallbackDetail.benefits;
  const tipStrings = item.tips?.length
    ? item.tips.map((tip) => tip.trim()).filter((tip) => tip.length > 0)
    : fallbackDetail.tips;

  return {
    ...baseDetail,
    id: String(item.id ?? fallbackDetail.id),
    slug: item.slug?.trim() || fallbackDetail.slug,
    title: item.title?.trim() || fallbackDetail.title,
    description,
    context: guidance || baseDetail.context,
    steps: displaySteps,
    benefits,
    tips: tipStrings,
    image: resolveBreathWorkImageSource(item.image ?? fallbackDetail.image),
    durationLabel: baseDetail.durationLabel,
    category: item.category?.trim() || fallbackDetail.category || baseDetail.category,
    rating: typeof item.rating === "number" ? item.rating : fallbackDetail.rating,
    reviews: typeof item.reviews === "number" ? item.reviews : fallbackDetail.reviews,
    level: item.level?.trim() || fallbackDetail.level,
    dosha: item.dosha?.trim() || fallbackDetail.dosha,
    tags: baseDetail.tags.length > 0 ? baseDetail.tags : fallbackDetail.tags,
    modality: item.modality?.trim() || fallbackDetail.modality,
    source: item.audio?.trim() || fallbackDetail.source || null,
    phases,
    longDescription,
    guidance,
    date: item.date?.trim() || fallbackDetail.date,
    metadata: item.metadata,
    instructor: item.instructor ?? fallbackDetail.instructor,
    scientificSynthesis: item.scientificSynthesis ?? fallbackDetail.scientificSynthesis,
  };
};

export const buildBreathWorkPattern = (
  detail: BreathWorkDetail
): BreathPattern => ({
  id: detail.id,
  tone: detail.tone,
  title: detail.title,
  description: detail.description,
  benefit: detail.benefits[0]?.text ?? detail.description,
  phases: detail.phases,
});

export const buildBreathWorkRecommendation = (
  detail: BreathWorkDetail
): BreathRecommendation => ({
  id: detail.id,
  tone: detail.tone,
  title: detail.title,
  subtitle: detail.subtitle,
  mantra: detail.mantra,
  tag: detail.category ?? detail.tag,
  palette: detail.palette,
  icon: detail.icon,
});

export const buildBreathWorkCategoryOptions = (
  items: BreathWorkDetail[]
): BreathWorkCategoryOption[] => {
  const seen = new Set<string>();
  const options: BreathWorkCategoryOption[] = [{ label: "All", value: "all" }];

  items.forEach((item) => {
    const label = item.category?.trim() || item.tag?.trim() || item.toneLabel;
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

export const filterBreathWorkDetails = (
  items: BreathWorkDetail[],
  selectedTone: BreathPattern["tone"] | "all"
) => {
  if (selectedTone === "all") {
    return items;
  }

  return items.filter((item) => item.tone === selectedTone);
};

export const buildBreathWorkRouteParams = (
  detail: BreathWorkDetail
): BreathWorkRouteParams & { breathworkId: string } => ({
  breathworkId: detail.id,
  breathworkTitle: detail.title,
  breathworkDescription: detail.description,
  breathworkDurationLabel: detail.durationLabel,
  breathworkImage: extractBreathWorkImageUri(detail.image),
  breathworkTags: detail.tags.length > 0 ? detail.tags.join("|") : undefined,
  breathworkCategory: detail.category ?? undefined,
  breathworkRating:
    typeof detail.rating === "number" ? String(detail.rating) : undefined,
  breathworkReviews:
    typeof detail.reviews === "number" ? String(detail.reviews) : undefined,
  breathworkLevel: detail.level ?? undefined,
  breathworkDosha: detail.dosha ?? undefined,
  breathworkTone: detail.tone,
  breathworkSource: detail.source ?? undefined,
});

export const hydrateBreathWorkDetail = (
  params: BreathWorkRouteParams,
  fallback?: BreathWorkDetail | null
): BreathWorkDetail => {
  const fallbackDetail =
    fallback ??
    getBreathWorkDetailById(firstRouteValue(params.breathworkId) ?? "");
  const hasExplicitMetadata = Boolean(
    firstRouteValue(params.breathworkTitle) ||
      firstRouteValue(params.breathworkDescription) ||
      firstRouteValue(params.breathworkDurationLabel) ||
      firstRouteValue(params.breathworkImage) ||
      firstRouteValue(params.breathworkTags) ||
      firstRouteValue(params.breathworkCategory) ||
      firstRouteValue(params.breathworkRating) ||
      firstRouteValue(params.breathworkReviews) ||
      firstRouteValue(params.breathworkLevel) ||
      firstRouteValue(params.breathworkDosha) ||
      firstRouteValue(params.breathworkTone) ||
      firstRouteValue(params.breathworkSource)
  );

  if (!hasExplicitMetadata) {
    return fallbackDetail;
  }

  const title =
    firstRouteValue(params.breathworkTitle)?.trim() || fallbackDetail.title;
  const routeTags =
    (firstRouteValue(params.breathworkTags)?.split("|") ?? [])
      .map((tag: string) => tag.trim())
      .filter((tag): tag is string => Boolean(tag));
  const fallbackTags = fallbackDetail.tags ?? [];
  const tags =
    routeTags.length > 0
      ? Array.from(new Set(routeTags.map(normalizeBreathTag)))
      : fallbackTags;
  const tone =
    (firstRouteValue(params.breathworkTone)?.trim() as BreathPattern["tone"] | undefined) ||
    inferBreathTone(
      {
        category: firstRouteValue(params.breathworkCategory)?.trim(),
        level: firstRouteValue(params.breathworkLevel)?.trim(),
        dosha: firstRouteValue(params.breathworkDosha)?.trim(),
        tags,
      },
      title,
      firstRouteValue(params.breathworkDescription)?.trim() || ""
    );
  const pattern = getBreathPatternByTone(tone);
  const subtitle =
    firstRouteValue(params.breathworkTitle) ||
    firstRouteValue(params.breathworkDescription)
      ? buildBreathworkSubtitle(
          {
            category: firstRouteValue(params.breathworkCategory)?.trim(),
            level: firstRouteValue(params.breathworkLevel)?.trim(),
            dosha: firstRouteValue(params.breathworkDosha)?.trim(),
          },
          title,
          tone
        )
      : fallbackDetail.subtitle;
  const description =
    firstRouteValue(params.breathworkDescription)?.trim() ||
    buildBreathworkDescription(
      {
        category: firstRouteValue(params.breathworkCategory)?.trim(),
        level: firstRouteValue(params.breathworkLevel)?.trim(),
        dosha: firstRouteValue(params.breathworkDosha)?.trim(),
        tags,
      },
      title,
      tone,
      tags
    );
  const recommendation = getBreathRecommendationById(pattern.id);
  const durationLabel =
    firstRouteValue(params.breathworkDurationLabel)?.trim() ||
    fallbackDetail.durationLabel;

  return {
    ...fallbackDetail,
    id: firstRouteValue(params.breathworkId)?.trim() || fallbackDetail.id,
    slug: firstRouteValue(params.breathworkId)?.trim() || fallbackDetail.slug,
    title,
    subtitle,
    description,
    context: BREATH_CONTEXT_COPY[pattern.tone],
    steps: buildBreathworkSteps(pattern),
    benefits: buildBreathworkBenefits(pattern),
    tips: buildBreathworkTips(pattern),
    image: resolveBreathWorkImageSource(
      firstRouteValue(params.breathworkImage) || fallbackDetail.image
    ),
    tone: pattern.tone,
    toneLabel: formatBreathToneLabel(pattern.tone),
    tag: formatBreathToneLabel(pattern.tone),
    mantra: recommendation.mantra,
    palette: recommendation.palette,
    icon: recommendation.icon,
    durationLabel,
    category:
      firstRouteValue(params.breathworkCategory)?.trim() ||
      fallbackDetail.category ||
      pattern.tone,
    rating: parseOptionalNumber(params.breathworkRating) ?? fallbackDetail.rating,
    reviews: parseOptionalNumber(params.breathworkReviews) ?? fallbackDetail.reviews,
    level:
      firstRouteValue(params.breathworkLevel)?.trim() || fallbackDetail.level,
    dosha:
      firstRouteValue(params.breathworkDosha)?.trim() || fallbackDetail.dosha,
    tags: tags.length > 0 ? tags : fallbackTags,
    modality: fallbackDetail.modality ?? "breathwork",
    source:
      firstRouteValue(params.breathworkSource) ?? fallbackDetail.source ?? null,
    phases: pattern.phases,
  };
};
