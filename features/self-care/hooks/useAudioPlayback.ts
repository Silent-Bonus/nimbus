import { useCallback, useEffect, useRef, useState } from "react";
import { Audio, type AVPlaybackStatus } from "expo-av";

import { seekMillis } from "@/features/self-care/utils/meditationPlayback";

type UseAudioPlaybackOptions = {
  source: Parameters<typeof Audio.Sound.createAsync>[0];
  autoPlay?: boolean;
  progressUpdateIntervalMillis?: number;
  onDidFinish?: () => void;
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
  onDidFinish,
}: UseAudioPlaybackOptions) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const didNotifyFinishRef = useRef(false);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    didNotifyFinishRef.current = false;
  }, [source]);

  useEffect(() => {
    let active = true;

    const loadSound = async () => {
      setIsLoading(true);

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
              if (
                status.isLoaded &&
                status.didJustFinish &&
                !didNotifyFinishRef.current
              ) {
                didNotifyFinishRef.current = true;
                onDidFinish?.();
              }
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
  }, [autoPlay, onDidFinish, progressUpdateIntervalMillis, source]);

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
      if (
        playbackStatus?.isLoaded &&
        (playbackStatus.didJustFinish ||
          playbackStatus.positionMillis >=
            Math.max((playbackStatus.durationMillis ?? 0) - 1000, 0))
      ) {
        didNotifyFinishRef.current = false;
      }
      await sound.playAsync();
    }
  }, [isPlaying, playbackStatus]);

  const stop = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    didNotifyFinishRef.current = false;
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
