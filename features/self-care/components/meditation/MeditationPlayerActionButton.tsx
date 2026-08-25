import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Typography } from "@/theme/types";

type MeditationPlayerActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function MeditationPlayerActionButton({
  icon,
  label,
  active,
  onPress,
}: MeditationPlayerActionButtonProps) {
  const { newTheme: theme, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, typography),
    [theme, typography]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        active && styles.buttonActive,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? theme.buttonPrimaryText : theme.textSecondary}
      />
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styling = (theme: ColorSet, typography: Typography) =>
  StyleSheet.create({
    button: {
      flex: 1,
      minHeight: 64,
      borderRadius: 18,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 10,
    },
    buttonActive: {
      backgroundColor: "rgba(163,190,140,0.14)",
      borderColor: "rgba(163,190,140,0.22)",
    },
    buttonPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.92,
    },
    label: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.1,
    },
    labelActive: {
      color: theme.textPrimary,
    },
  });
