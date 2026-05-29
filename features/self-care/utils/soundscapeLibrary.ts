import type { ImageSourcePropType } from "react-native";

import type { TrackType } from "@/constants/data/soundtrack";

const FALLBACK_IMAGE = require("../../../assets/images/mt.jpg");
const FALLBACK_SOURCE = require("../../../assets/dump/lightRain.mp3");

export type SoundscapeRawTrack = {
  id?: string | string[];
  slug?: string;
  title?: string;
  name?: string;
  duration?: unknown;
  description?: string;
  longDescription?: string;
  guidance?: string;
  date?: string;
  image?: unknown;
  source?: unknown;
  audio?: unknown;
  category?: string;
  rating?: number;
  reviews?: number;
  level?: string;
  dosha?: string;
  modality?: string;
  isLocked?: boolean;
  is_locked?: boolean;
  tags?: unknown;
};

export type SoundscapeTrack = TrackType & {
  durationLabel: string;
  tags: string[];
  filterTags: string[];
  frequencyHz: number | null;
};

const SOUNDSCAPE_CACHE = new Map<string, SoundscapeTrack>();

export const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

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
    return `${duration} min`;
  }

  if (typeof duration === "string") {
    const trimmed = duration.trim();
    if (!trimmed) return "3 min";
    if (/\d/.test(trimmed)) return trimmed;
    return `${trimmed} min`;
  }

  return "3 min";
};

const detectMoodTag = (title: string, description: string, category: string) => {
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
  if (/(binaural|frequency|hz|resonance|pulse|alpha|beta|theta|delta|gamma)/.test(blob)) {
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

export const toSoundscapeTrack = (
  item: SoundscapeRawTrack | unknown,
  index: number
): SoundscapeTrack => {
  const record =
    item && typeof item === "object" ? (item as SoundscapeRawTrack) : {};
  const title = String(record.title ?? `Soundscape ${index + 1}`);
  const description = String(record.description ?? "");
  const category = formatTagLabel(String(record.category ?? "Curated"));
  const durationLabel = formatDurationLabel(record.duration);
  const moodTag = detectMoodTag(title, description, category);
  const sourceTags = Array.isArray(record.tags)
    ? record.tags
        .map((tag) => formatTagLabel(String(tag)))
        .filter(Boolean)
    : [];
  const tags = uniqueStrings([category, moodTag, ...sourceTags]);
  const idValue = Array.isArray(record.id) ? record.id[0] : record.id;
  const resolvedId = idValue ?? record.slug ?? `${normalizeKey(title)}-${index}`;

  return {
    ...(record ?? {}),
    id: String(resolvedId),
    title,
    name: record.name ?? title,
    duration: durationLabel,
    durationLabel,
    description,
    image: resolveImageSource(record.image),
    source: resolveAudioSource(record.source ?? record.audio),
    category,
    isLocked: Boolean(record.isLocked ?? record.is_locked),
    tags,
    filterTags: tags,
    frequencyHz: extractFrequencyHz(title),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const extractSoundscapeRawTracks = (
  result: unknown
): SoundscapeRawTrack[] | null => {
  if (!isRecord(result)) {
    return Array.isArray(result) ? (result as SoundscapeRawTrack[]) : null;
  }

  if (Array.isArray(result.data)) {
    return result.data as SoundscapeRawTrack[];
  }

  if (Array.isArray(result.items)) {
    return result.items as SoundscapeRawTrack[];
  }

  if (Array.isArray(result.results)) {
    return result.results as SoundscapeRawTrack[];
  }

  return null;
};

export const resolveSoundscapeTracks = (result: unknown): SoundscapeTrack[] => {
  const rawTracks = extractSoundscapeRawTracks(result);
  if (!rawTracks || rawTracks.length === 0) {
    return [];
  }

  return rawTracks.map((item, index) => toSoundscapeTrack(item, index));
};

type CacheableSoundscapeTrack = {
  id: string;
  name?: string | null;
};

export const cacheSoundscapeTracks = (
  tracks: CacheableSoundscapeTrack[]
) => {
  tracks.forEach((track) => {
    const keys = [track.id, track.name]
      .map((key) => key?.trim())
      .filter((key): key is string => Boolean(key));

    keys.forEach((key) => {
      SOUNDSCAPE_CACHE.set(key, track as SoundscapeTrack);
    });
  });
};

export const getSoundscapeById = (soundscapeId?: string | null) =>
  (soundscapeId ? SOUNDSCAPE_CACHE.get(soundscapeId) : undefined);

export const buildSoundscapeSubtitle = (soundscape: SoundscapeTrack) =>
  `${soundscape.durationLabel} · ${soundscape.category}`;

export const buildSoundscapeBenefits = (soundscape: SoundscapeTrack) => {
  const blob = `${soundscape.title} ${soundscape.description} ${soundscape.category}`.toLowerCase();

  if (/(sleep|dream|night|rest|nap|lullaby)/.test(blob)) {
    return [
      "Lower the pace before the night settles in.",
      "Let the room feel softer without asking for effort.",
      "Move the body toward a slower, quieter reset.",
    ];
  }

  if (/(rain|storm|wave|ocean|river|stream|brook|water|sea)/.test(blob)) {
    return [
      "Wrap the session in an organic, grounded texture.",
      "Keep attention anchored in a calm natural rhythm.",
      "Build a quiet background for restoration.",
    ];
  }

  if (/(focus|study|work|clarity|concentr|productiv|brain)/.test(blob)) {
    return [
      "Clear a small corridor for concentration.",
      "Give the mind one steady cadence to return to.",
      "Reduce friction before deep work or study.",
    ];
  }

  if (/(release|soften|relax|calm|breath|meditat)/.test(blob)) {
    return [
      "Let tension soften without needing to be solved.",
      "Create a slower internal tempo for the body.",
      "Support a more spacious exhale through the session.",
    ];
  }

  return [
    "Keep the session simple and premium.",
    "Support a steadier internal rhythm.",
    "Create a quiet backdrop for presence.",
  ];
};

export const formatSoundscapeTagLabel = (value: string) => formatTagLabel(value);

export const buildSoundscapeResonanceLabel = (soundscape: SoundscapeTrack) =>
  soundscape.frequencyHz
    ? `RESONATING AT ${soundscape.frequencyHz.toFixed(2)} HZ`
    : `RESONATING IN ${soundscape.category.toUpperCase()}`;

export const resolveSoundscapePlaybackSource = (soundscapeId?: string | null) =>
  getSoundscapeById(soundscapeId)?.source ?? FALLBACK_SOURCE;
