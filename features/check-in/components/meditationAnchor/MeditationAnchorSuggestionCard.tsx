import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

type MeditationAnchorSuggestionCardProps = {
  title: string;
  description: string;
  meta: string;
  actionLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  accent: string;
  onPress: () => void;
};

const getDisplayFont = (svaTypography: any) =>
  svaTypography?.textStyle.authTitle?.fontFamily ??
  svaTypography?.textStyle.displayMedium?.fontFamily ??
  undefined;

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) => {
  const displayFont = getDisplayFont(svaTypography) ?? svaTypography.textStyle.title.fontFamily;

  return StyleSheet.create({
    card: {
      borderRadius: 26,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 8,
    },
    cardPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    metaChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    metaChipText: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    title: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      fontFamily: displayFont,
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.25,
    },
    description: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      lineHeight: 22,
      marginTop: 8,
    },
    footer: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.06)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    action: {
      ...svaTypography.textStyle.button,
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 0.7,
    },
  });
};

export const MeditationAnchorSuggestionCard = ({
  title,
  description,
  meta,
  actionLabel,
  icon,
  tint,
  accent,
  onPress,
}: MeditationAnchorSuggestionCardProps) => {
  const { newTheme: theme, spacing, svaTypography } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", tint]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            { borderColor: accent, backgroundColor: "rgba(255,255,255,0.04)" },
          ]}
        >
          <Ionicons name={icon} size={18} color={accent} />
        </View>

        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>{meta}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.footer}>
        <Text style={[styles.action, { color: accent }]}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={16} color={accent} />
      </View>
    </Pressable>
  );
};
