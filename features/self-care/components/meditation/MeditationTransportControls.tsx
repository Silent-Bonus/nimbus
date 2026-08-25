import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing } from "@/theme/types";

type MeditationTransportControlsProps = {
  isPlaying: boolean;
  disabled?: boolean;
  playDisabled?: boolean;
  onSeekBackward: () => void;
  onTogglePlayPause: () => void;
  onSeekForward: () => void;
};

export default function MeditationTransportControls({
  isPlaying,
  disabled,
  playDisabled,
  onSeekBackward,
  onTogglePlayPause,
  onSeekForward,
}: MeditationTransportControlsProps) {
  const { newTheme: theme, spacing } =
    useContext(ThemeContext);

  const styles = useMemo(
    () => styling(theme, spacing),
    [theme, spacing]
  );

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Seek backward 15 seconds"
        disabled={disabled}
        onPress={onSeekBackward}
        style={({ pressed }) => [
          styles.sideButton,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Ionicons name="play-back" size={18} color={theme.textPrimary} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause meditation" : "Play meditation"}
        disabled={playDisabled}
        onPress={onTogglePlayPause}
        style={({ pressed }) => [
          styles.playButton,
          pressed && !playDisabled && styles.playPressed,
          playDisabled && styles.disabled,
        ]}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={30}
          color={theme.buttonPrimaryText}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Seek forward 15 seconds"
        disabled={disabled}
        onPress={onSeekForward}
        style={({ pressed }) => [
          styles.sideButton,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Ionicons name="play-forward" size={18} color={theme.textPrimary} />
      </Pressable>
    </View>
  );
}

const styling = (theme: ColorSet, spacing: Spacing) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.lg,
      marginTop: spacing.lg,
    },
    sideButton: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    playButton: {
      width: 92,
      height: 92,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.buttonPrimary,
      borderWidth: 1,
      borderColor: theme.buttonPrimary,
      shadowColor: theme.shadow,
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    playPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.95,
    },
    pressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    },
    disabled: {
      opacity: 0.55,
    },
  });
