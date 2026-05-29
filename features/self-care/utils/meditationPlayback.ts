import type { MeditationTemplate } from "./meditationLibrary";

const DEFAULT_MEDITATION_AUDIO = require("../../../assets/audio/deep_sleep_guided_meditation_3_min_af_bella.mp3");
const DEFAULT_MEDITATION_COVER = require("../../../assets/images/mt.jpg");

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
  meditation?: MeditationTemplate | null
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

export const formatPlaybackRemaining = (positionMillis: number, durationMillis: number) => {
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
