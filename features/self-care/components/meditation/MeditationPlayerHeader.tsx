import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

type MeditationPlayerHeaderProps = {
  onBack: () => void;
};

export default function MeditationPlayerHeader({
  onBack,
}: MeditationPlayerHeaderProps) {
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
        <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
      </Pressable>

      <View style={styles.centerBlock}>
        <Text style={styles.centerLabel} numberOfLines={1}>
          Meditation
        </Text>
      </View>

      <View style={styles.rightSpacer} />
    </View>
  );
}

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.98 }],
    },
    centerBlock: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: spacing.sm,
    },
    centerLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 11,
      lineHeight: 14,
      color: theme.textPrimary,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    rightSpacer: {
      width: 42,
      height: 42,
    },
  });
