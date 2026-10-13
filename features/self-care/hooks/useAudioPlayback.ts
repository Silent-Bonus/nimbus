import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
  type AudioStatus,
} from "expo-audio";

import { seekMillis } from "@/features/self-care/utils/meditationPlayback";

type UseAudioPlaybackOptions = {
  source: AudioSource | null;
  autoPlay?: boolean;
  progressUpdateIntervalMillis?: number;
};

const DEFAULT_AUDIO_MODE = {
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  interruptionMode: "doNotMix" as const,
};

export function useAudioPlayback({
  source,
  autoPlay = true,
  progressUpdateIntervalMillis = 500,
}: UseAudioPlaybackOptions) {
  const soundRef = useRef<AudioPlayer | null>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AudioStatus | null>(
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
        await setAudioModeAsync(DEFAULT_AUDIO_MODE);

        const player = createAudioPlayer(source, {
          updateInterval: progressUpdateIntervalMillis,
          keepAudioSessionActive: true,
        });
        const subscription = player.addListener(
          "playbackStatusUpdate",
          (status) => {
            if (active) {
              setPlaybackStatus(status);
              setIsLoading(!status.isLoaded);
            }
          }
        );

        subscriptionRef.current = subscription;

        if (!active) {
          subscription.remove();
          player.remove();
          return;
        }

        soundRef.current = player;
        setPlaybackStatus(player.currentStatus);
        setIsLoading(!player.isLoaded);

        if (autoPlay) {
          player.play();
        }
      } catch (error) {
        console.error("Unable to load audio playback", error);
        if (active) setIsLoading(false);
      }
    };

    void loadSound();

    return () => {
      active = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      const player = soundRef.current;
      soundRef.current = null;
      player?.remove();
    };
  }, [autoPlay, progressUpdateIntervalMillis, source]);

  const isPlaying = playbackStatus?.isLoaded ? playbackStatus.playing : false;
  const positionMillis = playbackStatus?.isLoaded
    ? playbackStatus.currentTime * 1000
    : 0;
  const durationMillis =
    playbackStatus?.isLoaded && playbackStatus.duration
      ? playbackStatus.duration * 1000
      : 1;

  const seekBy = useCallback(
    async (delta: number) => {
      const player = soundRef.current;
      if (!player || !playbackStatus?.isLoaded) return;

      const nextPosition = seekMillis(
        playbackStatus.currentTime * 1000,
        delta,
        playbackStatus.duration * 1000
      );

      await player.seekTo(nextPosition / 1000);
    },
    [playbackStatus]
  );

  const togglePlayPause = useCallback(async () => {
    const player = soundRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying]);

  const stop = useCallback(async () => {
    const player = soundRef.current;
    if (!player) return;
    player.pause();
    await player.seekTo(0);
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
