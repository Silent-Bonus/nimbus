import type {
  MeditationItemDetail,
  MeditationListItem,
} from "@/features/self-care/types/wellnessContentTypes";

type RouteValue = string | string[] | undefined;

export type MeditationRouteParams = {
  meditationId?: RouteValue;
  meditationSlug?: RouteValue;
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
};

export type ParsedMeditationRouteParams = {
  meditationId: string;
  meditationSlug?: string;
  meditationTitle?: string;
  meditationDescription?: string;
  meditationGuidance?: string;
  meditationDurationLabel?: string;
  meditationImage?: string;
  meditationTags: string[];
  meditationCategory?: string;
  meditationRating?: string;
  meditationReviews?: string;
  meditationLevel?: string;
  meditationDosha?: string;
  meditationSource?: string;
};

const DEFAULT_MEDITATION_AUDIO = require("../../../assets/audio/deep_sleep_guided_meditation_3_min_af_bella.mp3");
const DEFAULT_MEDITATION_COVER = require("../../../assets/images/mt.jpg");
const DEFAULT_MEDITATION_DESCRIPTION =
  "A gentle meditation to help you slow down, reset, and return to a calmer state.";

const parseMeditationRouteNumber = (
  value?: string
): number | undefined => {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseMeditationRouteValue = (value?: RouteValue): string | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = rawValue?.trim();

  return trimmedValue || undefined;
};

const parseMeditationRouteTags = (value?: RouteValue): string[] => {
  const rawValue = parseMeditationRouteValue(value);

  return rawValue
    ? rawValue
        .split("|")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
};

export const parseMeditationRouteParams = (
  params: MeditationRouteParams
): ParsedMeditationRouteParams => ({
  meditationId: parseMeditationRouteValue(params.meditationId) ?? "",
  meditationSlug: parseMeditationRouteValue(params.meditationSlug),
  meditationTitle: parseMeditationRouteValue(params.meditationTitle),
  meditationDescription: parseMeditationRouteValue(
    params.meditationDescription
  ),
  meditationGuidance: parseMeditationRouteValue(params.meditationGuidance),
  meditationDurationLabel: parseMeditationRouteValue(
    params.meditationDurationLabel
  ),
  meditationImage: parseMeditationRouteValue(params.meditationImage),
  meditationTags: parseMeditationRouteTags(params.meditationTags),
  meditationCategory: parseMeditationRouteValue(params.meditationCategory),
  meditationRating: parseMeditationRouteValue(params.meditationRating),
  meditationReviews: parseMeditationRouteValue(params.meditationReviews),
  meditationLevel: parseMeditationRouteValue(params.meditationLevel),
  meditationDosha: parseMeditationRouteValue(params.meditationDosha),
  meditationSource: parseMeditationRouteValue(params.meditationSource),
});

export const buildMeditationPlaybackTemplate = (
  params: MeditationRouteParams
): MeditationItemDetail => {
  const parsedParams = parseMeditationRouteParams(params);

  return {
    id: parsedParams.meditationId,
    slug: parsedParams.meditationSlug,
    title: parsedParams.meditationTitle || "Meditation",
    description:
      parsedParams.meditationDescription || DEFAULT_MEDITATION_DESCRIPTION,
    guidance: parsedParams.meditationGuidance,
    tags: parsedParams.meditationTags,
    durationLabel: parsedParams.meditationDurationLabel || "5 min",
    image: parsedParams.meditationImage || DEFAULT_MEDITATION_COVER,
    source: parsedParams.meditationSource || null,
    isLocked: false,
    category: parsedParams.meditationCategory || "calm",
    rating: parseMeditationRouteNumber(parsedParams.meditationRating),
    reviews: parseMeditationRouteNumber(parsedParams.meditationReviews),
    level: parsedParams.meditationLevel,
    dosha: parsedParams.meditationDosha,
    modality: "meditation",
  };
};

export const resolveMeditationPlaybackSource = (
  meditationId?: string | null,
  meditationSource?: string | null
) => {
  if (meditationSource) {
    return { uri: meditationSource };
  }

  switch (meditationId) {
    default:
      return DEFAULT_MEDITATION_AUDIO;
  }
};

export const resolveMeditationPlaybackCover = (
  meditation?: MeditationListItem | null
) => meditation?.image ?? DEFAULT_MEDITATION_COVER;

export const formatPlaybackTime = (millis: number) => {
  const safeMillis = Number.isFinite(millis) ? Math.max(0, millis) : 0;
  const totalSeconds = Math.floor(safeMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const formatPlaybackRemaining = (
  positionMillis: number,
  durationMillis: number
) => {
  const remaining = Math.max(durationMillis - positionMillis, 0);
  return `-${formatPlaybackTime(remaining)}`;
};

export const seekMillis = (
  currentPosition: number,
  delta: number,
  durationMillis: number
) => {
  const nextPosition = currentPosition + delta;
  return Math.max(0, Math.min(nextPosition, Math.max(durationMillis - 500, 0)));
};
