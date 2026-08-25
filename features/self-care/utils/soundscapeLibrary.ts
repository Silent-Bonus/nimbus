import type { ImageSourcePropType } from "react-native";

import type {
  SoundscapeContentItem,
  SoundscapeListInput,
  SoundscapeTrack,
} from "@/features/self-care/types/soundscapeTypes";
import type { WellnessContentBenefit } from "@/features/self-care/types/wellnessContentTypes";

const FALLBACK_IMAGE = require("../../../assets/images/mt.jpg");
const FALLBACK_SOURCE = require("../../../assets/dump/lightRain.mp3");
const DEFAULT_SOUNDSCAPE_RATING = 4;
const DEFAULT_SOUNDSCAPE_MOOD = "Test mood";

const SOUNDSCAPE_CACHE = new Map<string, SoundscapeTrack>();

export const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed || undefined;
};

const normalizeIdentifier = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return normalizeText(value);
};

const normalizeNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const formatTagLabel = (value?: string | null) => {
  if (!value) return "Curated";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) =>
      part && part === part.toUpperCase()
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(" ");
};

const formatDurationLabel = (duration: unknown) => {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    if (duration <= 0) return "3 min";
    return `${duration} min`;
  }

  if (typeof duration === "string") {
    const trimmed = duration.trim();
    if (!trimmed) return "3 min";

    const numericValue = Number.parseFloat(trimmed);
    if (Number.isFinite(numericValue) && numericValue <= 0) {
      return "3 min";
    }

    if (/\d/.test(trimmed)) return trimmed;
    return `${trimmed} min`;
  }

  return "3 min";
};

const detectMoodTag = (
  title: string,
  description: string,
  category: string
) => {
  const blob = `${title} ${description} ${category}`.toLowerCase();

  if (/(rain|storm|wave|ocean|river|stream|brook|water|sea)/.test(blob)) {
    return "Nature";
  }
  if (/(sleep|dream|night|rest|nap|lullaby)/.test(blob)) {
    return "Sleep";
  }
  if (/(focus|study|work|clarity|concentr|productiv|brain)/.test(blob)) {
    return "Focus";
  }
  if (
    /(binaural|frequency|hz|resonance|pulse|alpha|beta|theta|delta|gamma)/.test(
      blob
    )
  ) {
    return "Frequency";
  }
  if (/(breath|breathing|meditat|calm|relax|soothe)/.test(blob)) {
    return "Calm";
  }

  return "Curated";
};

export const uniqueStrings = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean)));

const extractFrequencyHz = (title: string) => {
  const match = title.match(/(\d+(?:\.\d+)?)\s*hz/i);
  return match ? Number(match[1]) : null;
};

const resolveImageSource = (image: unknown): ImageSourcePropType => {
  if (!image) return FALLBACK_IMAGE;
  if (typeof image === "string") return { uri: image };
  if (typeof image === "number") return image;
  if (typeof image === "object") {
    const maybeImage = image as { uri?: unknown; url?: unknown };
    if (typeof maybeImage.uri === "string") return { uri: maybeImage.uri };
    if (typeof maybeImage.url === "string") return { uri: maybeImage.url };
    return image as ImageSourcePropType;
  }

  return FALLBACK_IMAGE;
};

const resolveAudioSource = (source: unknown) => {
  if (!source) return FALLBACK_SOURCE;
  if (typeof source === "string") return { uri: source };
  return source;
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
        Number.isFinite(benefit.id) ||
        Boolean(benefit.title) ||
        Boolean(benefit.text)
    );

  return normalized.length > 0 ? normalized : undefined;
};

export const toSoundscapeTrack = (
  item: SoundscapeContentItem,
  index: number
): SoundscapeTrack => {
  // Shared mapper for soundscape wellness content.
  // Consumed by:
  // - resolveSoundscapeTracks(...) for the soundscape library screen
  // - SoundscapeDetailScreen when the detail API returns one item
  // - cached/test setup that needs the normalized player/detail shape
  const record = item;
  const title =
    normalizeText(record.title) ?? `Soundscape ${index + 1}`;
  const category = formatTagLabel(normalizeText(record.category) ?? "Curated");
  const durationLabel = formatDurationLabel(record.duration);
  const sourceTags = Array.isArray(record.tags)
    ? record.tags
        .map((tag) => formatTagLabel(normalizeText(tag) ?? String(tag)))
        .filter(Boolean)
    : [];
  const tags = uniqueStrings(sourceTags);
  const baseDescription =
    normalizeText(record.description) ??
    normalizeText(record.longDescription) ??
    normalizeText(record.guidance);
  const supportingTags = tags.filter(
    (tag) => normalizeKey(tag) !== normalizeKey(category)
  );
  const tagSummary =
    supportingTags.length > 0 ? supportingTags.slice(0, 2).join(" and ") : null;
  const dosha = normalizeText(record.dosha);
  const description =
    baseDescription ??
    (tagSummary && dosha
      ? `${title} is a ${category.toLowerCase()} soundscape created for ${tagSummary.toLowerCase()} with ${dosha.toLowerCase()} support.`
      : tagSummary
        ? `${title} is a ${category.toLowerCase()} soundscape created for ${tagSummary.toLowerCase()} and gentle reset.`
        : dosha
          ? `${title} is a ${category.toLowerCase()} soundscape with ${dosha.toLowerCase()} support and a restorative ambient layer.`
          : `${title} is a ${category.toLowerCase()} soundscape designed to slow the room down and support a steadier reset.`);
  const moodTag = detectMoodTag(title, description, category);
  const filterTags = uniqueStrings([category, moodTag]);
  const normalizedRating = normalizeNumber(record.rating);
  const idValue = Array.isArray(record.id) ? record.id[0] : record.id;
  const resolvedId =
    normalizeIdentifier(idValue) ??
    normalizeText(record.slug) ??
    `${normalizeKey(title)}-${index}`;

  return {
    ...(record ?? {}),
    id: String(resolvedId),
    title,
    duration: durationLabel,
    durationLabel,
    description,
    longDescription: normalizeText(record.longDescription),
    image: resolveImageSource(record.image),
    source: resolveAudioSource(record.source ?? record.audio),
    category,
    isLocked: Boolean(record.isLocked ?? record.is_locked),
    tags,
    filterTags,
    frequencyHz: extractFrequencyHz(title),
    rating:
      typeof normalizedRating === "number" && normalizedRating > 0
        ? normalizedRating
        : DEFAULT_SOUNDSCAPE_RATING,
    moodLabel: DEFAULT_SOUNDSCAPE_MOOD,
    benefits: normalizeBenefits(record.benefits),
  };
};

export const resolveSoundscapeTracks = (
  result: SoundscapeListInput
): SoundscapeTrack[] => {
  // Library responses arrive as WellnessContentResponse, but tests may still
  // pass a direct array. Both are normalized through the same mapper above.
  const items = Array.isArray(result) ? result : result?.data ?? [];
  return items.map((item, index) => toSoundscapeTrack(item, index));
};

type CacheableSoundscapeTrack = {
  id: string;
};

export const cacheSoundscapeTracks = (tracks: CacheableSoundscapeTrack[]) => {
  tracks.forEach((track) => {
    const key = track.id.trim();
    if (!key) return;
    SOUNDSCAPE_CACHE.set(key, track as SoundscapeTrack);
  });
};

export const getSoundscapeById = (soundscapeId?: string | null) =>
  soundscapeId ? SOUNDSCAPE_CACHE.get(soundscapeId) : undefined;

export const formatSoundscapeTagLabel = (value: string) =>
  formatTagLabel(value);

export const buildSoundscapeResonanceLabel = (soundscape: SoundscapeTrack) =>
  soundscape.frequencyHz
    ? `RESONATING AT ${soundscape.frequencyHz.toFixed(2)} HZ`
    : `RESONATING IN ${soundscape.category.toUpperCase()}`;

export const resolveSoundscapePlaybackSource = (soundscapeId?: string | null) =>
  getSoundscapeById(soundscapeId)?.source ?? FALLBACK_SOURCE;
