import { useCallback, useEffect, useRef, useState } from "react";
import { Audio, type AVPlaybackStatus } from "expo-av";

import { seekMillis } from "@/features/self-care/utils/meditationPlayback";

type UseAudioPlaybackOptions = {
  source: Parameters<typeof Audio.Sound.createAsync>[0] | null;
  autoPlay?: boolean;
  progressUpdateIntervalMillis?: number;
};

const DEFAULT_AUDIO_MODE = {
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
};

export function useAudioPlayback({
  source,
  autoPlay = true,
  progressUpdateIntervalMillis = 500,
}: UseAudioPlaybackOptions) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSound = async () => {
      setIsLoading(true);

      if (!source) {
        setPlaybackStatus(null);
        setIsLoading(false);
        return;
      }

      try {
        await Audio.setAudioModeAsync(DEFAULT_AUDIO_MODE);

        const { sound } = await Audio.Sound.createAsync(
          source,
          {
            shouldPlay: autoPlay,
            progressUpdateIntervalMillis,
          },
          (status) => {
            if (active) {
              setPlaybackStatus(status);
            }
          }
        );

        if (!active) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
      } catch (error) {
        console.error("Unable to load audio playback", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadSound();

    return () => {
      active = false;
      const sound = soundRef.current;
      soundRef.current = null;
      void sound?.unloadAsync();
    };
  }, [autoPlay, progressUpdateIntervalMillis, source]);

  const isPlaying = playbackStatus?.isLoaded ? playbackStatus.isPlaying : false;
  const positionMillis = playbackStatus?.isLoaded
    ? playbackStatus.positionMillis
    : 0;
  const durationMillis =
    playbackStatus?.isLoaded && playbackStatus.durationMillis
      ? playbackStatus.durationMillis
      : 1;

  const seekBy = useCallback(
    async (delta: number) => {
      const sound = soundRef.current;
      if (!sound || !playbackStatus?.isLoaded) return;

      const nextPosition = seekMillis(
        playbackStatus.positionMillis,
        delta,
        playbackStatus.durationMillis ?? 0
      );

      await sound.setPositionAsync(nextPosition);
    },
    [playbackStatus]
  );

  const togglePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  }, [isPlaying]);

  const stop = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    await sound.stopAsync();
  }, []);

  return {
    soundRef,
    playbackStatus,
    isLoading,
    isPlaying,
    positionMillis,
    durationMillis,
    seekBy,
    togglePlayPause,
    stop,
  };
}
