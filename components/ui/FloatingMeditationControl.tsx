import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { useMeditationSession } from "@/contexts/MeditationSessionContext";
import { capSessionSeconds, formatSessionSeconds } from "@/utils/sessionTime";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

const getModeIcon = (mode: string) => {
  switch (mode) {
    case "soundscape":
      return "musical-notes";
    case "anchor":
      return "magnet";
    case "meditation":
    default:
      return "leaf";
  }
};

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: TypographyTokens) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.md,
      zIndex: 50,
      elevation: 20,
    },
    control: {
      minHeight: 64,
      borderRadius: 24,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      shadowColor: theme.shadow,
      shadowOpacity: 0.28,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 12,
    },
    iconBubble: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    copy: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "800",
    },
    meta: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      marginTop: 2,
      letterSpacing: 0.7,
      textTransform: "uppercase",
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    actionButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
    },
    stopButton: {
      backgroundColor: "rgba(232,94,82,0.16)",
    },
    pressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.9,
    },
  });

export function FloatingMeditationControl() {
  const insets = useSafeAreaInsets();
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const {
    activeSession,
    status,
    pauseSession,
    resumeSession,
    stopSession,
  } = useMeditationSession();
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  if (!activeSession) {
    return null;
  }

  const isRunning = status === "running";
  const displayedElapsedSeconds = capSessionSeconds(
    activeSession.elapsedSeconds,
    activeSession.goalSeconds
  );
  const progressLabel = activeSession.goalSeconds
    ? `${formatSessionSeconds(displayedElapsedSeconds)} / ${formatSessionSeconds(
        activeSession.goalSeconds
      )}`
    : formatSessionSeconds(displayedElapsedSeconds);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + spacing.md }]}
    >
      <View style={styles.control}>
        <View style={styles.iconBubble}>
          <Ionicons
            name={getModeIcon(activeSession.mode)}
            size={20}
            color={theme.background}
          />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {activeSession.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {isRunning ? "Running" : "Paused"} · {progressLabel}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause session" : "Resume session"}
            onPress={() => void (isRunning ? pauseSession() : resumeSession())}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={isRunning ? "pause" : "play"}
              size={19}
              color={theme.textPrimary}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Stop session"
            onPress={() => void stopSession()}
            style={({ pressed }) => [
              styles.actionButton,
              styles.stopButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="stop"
              size={18}
              color={theme.error}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
