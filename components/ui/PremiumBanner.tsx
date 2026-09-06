import React, { useContext, useMemo } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, Typography, TypographyTokens } from "@/theme/types";

type PremiumBannerVariant = "info" | "warning" | "success";
type PremiumBannerLayout = "default" | "compact";

type PremiumBannerProps = {
  visible?: boolean;
  eyebrow?: string;
  title?: string;
  message?: string | null;
  meta?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: PremiumBannerVariant;
  layout?: PremiumBannerLayout;
  ctaLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleNumberOfLines?: number;
  messageNumberOfLines?: number;
};

type VariantPalette = {
  border: string;
  accent: string;
  iconTint: string;
  chipBackground: string;
  glowColors: [string, string, string];
  washColors: [string, string];
};

function getVariantPalette(
  variant: PremiumBannerVariant,
  theme: ColorSet
): VariantPalette {
  if (variant === "warning") {
    return {
      border: "rgba(235, 203, 139, 0.34)",
      accent: theme.warning,
      iconTint: "rgba(235, 203, 139, 0.14)",
      chipBackground: "rgba(235, 203, 139, 0.12)",
      glowColors: ["rgba(235, 203, 139, 0.32)", "rgba(191, 97, 106, 0.16)", "rgba(0,0,0,0)"],
      washColors: ["rgba(255,255,255,0.04)", "rgba(235, 203, 139, 0.03)"],
    };
  }

  if (variant === "success") {
    return {
      border: "rgba(163, 190, 140, 0.34)",
      accent: theme.success,
      iconTint: "rgba(163, 190, 140, 0.14)",
      chipBackground: "rgba(163, 190, 140, 0.12)",
      glowColors: ["rgba(163, 190, 140, 0.28)", "rgba(94, 129, 172, 0.14)", "rgba(0,0,0,0)"],
      washColors: ["rgba(255,255,255,0.04)", "rgba(163, 190, 140, 0.03)"],
    };
  }

  return {
    border: "rgba(94, 129, 172, 0.34)",
    accent: theme.chart2 ?? theme.info,
    iconTint: "rgba(94, 129, 172, 0.14)",
    chipBackground: "rgba(94, 129, 172, 0.12)",
    glowColors: ["rgba(94, 129, 172, 0.28)", "rgba(163, 190, 140, 0.12)", "rgba(0,0,0,0)"],
    washColors: ["rgba(255,255,255,0.04)", "rgba(94, 129, 172, 0.03)"],
  };
}

function makeStyles(
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  palette: VariantPalette,
  pressable: boolean,
  compact: boolean
) {
  const titleStyle = svaTypography?.textStyle.displayMedium ?? typography.h3;
  const eyebrowStyle = svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption;
  const messageStyle = svaTypography?.textStyle.body ?? typography.body;
  const metaStyle = svaTypography?.textStyle.caption ?? typography.caption;
  const ctaStyle = svaTypography?.textStyle.authActionLabel ?? typography.button;

  return StyleSheet.create({
    pressable: {
      borderRadius: compact ? 18 : 24,
    },
    shell: {
      borderRadius: compact ? 18 : 24,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
      backgroundColor: theme.surfaceElevated ?? theme.surface,
      shadowColor: theme.shadow,
      shadowOpacity: compact ? 0.16 : 0.2,
      shadowRadius: compact ? 16 : 24,
      shadowOffset: { width: 0, height: compact ? 8 : 14 },
      elevation: compact ? 4 : 6,
    },
    shellPressed: pressable
      ? {
          transform: [{ scale: 0.995 }],
          opacity: 0.97,
        }
      : {},
    outerGlow: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.95,
    },
    wash: {
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      paddingHorizontal: compact ? spacing.md : spacing.md,
      paddingVertical: compact ? spacing.sm + 2 : spacing.md,
      gap: compact ? spacing.xs : spacing.sm,
    },
    topRow: {
      flexDirection: "row",
      alignItems: compact ? "center" : "flex-start",
      gap: compact ? spacing.sm - 2 : spacing.sm,
    },
    iconOrb: {
      width: compact ? 38 : 46,
      height: compact ? 38 : 46,
      borderRadius: compact ? 12 : 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.iconTint,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    body: {
      flex: 1,
      gap: compact ? 2 : spacing.xs,
    },
    eyebrowChip: {
      alignSelf: "flex-start",
      paddingHorizontal: compact ? spacing.xs + 2 : spacing.sm,
      paddingVertical: compact ? 4 : 5,
      borderRadius: 999,
      backgroundColor: palette.chipBackground,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    eyebrow: {
      ...eyebrowStyle,
      color: palette.accent,
      fontWeight: "700",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    title: {
      ...titleStyle,
      color: theme.textPrimary,
      fontSize: compact
        ? Math.max(titleStyle.fontSize - 6, 16)
        : Math.max(titleStyle.fontSize - 2, 20),
      lineHeight: compact
        ? titleStyle.lineHeight
          ? Math.max(titleStyle.lineHeight - 8, 20)
          : 20
        : titleStyle.lineHeight
          ? Math.max(titleStyle.lineHeight - 2, 24)
          : 26,
      letterSpacing: compact ? 0 : 0.1,
    },
    message: {
      ...messageStyle,
      color: theme.textPrimary,
      opacity: compact ? 0.78 : 0.92,
      fontSize: compact
        ? Math.max(messageStyle.fontSize - 1, 13)
        : messageStyle.fontSize,
      lineHeight: compact
        ? messageStyle.lineHeight
          ? Math.max(messageStyle.lineHeight - 4, 18)
          : 18
        : messageStyle.lineHeight,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginTop: compact ? 0 : 2,
    },
    meta: {
      ...metaStyle,
      color: theme.textSecondary,
      flex: 1,
      letterSpacing: compact ? 0.15 : 0.25,
      fontSize: compact ? Math.max(metaStyle.fontSize - 1, 11) : metaStyle.fontSize,
    },
    ctaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: compact ? spacing.xs + 2 : spacing.sm,
      paddingVertical: compact ? 6 : 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    ctaText: {
      ...ctaStyle,
      color: theme.textPrimary,
      fontSize: Math.max(ctaStyle.fontSize - 2, 12),
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    ctaIcon: {
      color: palette.accent,
    },
  });
}

export default function PremiumBanner({
  visible = true,
  eyebrow,
  title,
  message,
  meta,
  icon = "sparkles-outline",
  variant = "info",
  layout = "default",
  ctaLabel,
  onPress,
  style,
  titleNumberOfLines,
  messageNumberOfLines,
}: PremiumBannerProps) {
  const { newTheme, spacing, typography, svaTypography } = useContext(ThemeContext);
  const compact = layout === "compact";

  const palette = useMemo(
    () => getVariantPalette(variant, newTheme),
    [newTheme, variant]
  );
  const styles = useMemo(
    () =>
      makeStyles(
        newTheme,
        spacing,
        typography,
        svaTypography,
        palette,
        Boolean(onPress),
        compact
      ),
    [compact, newTheme, spacing, typography, svaTypography, palette, onPress]
  );

  if (!visible || !message) {
    return null;
  }

  const content = (
    <View style={[styles.shell, style]}>
      <LinearGradient
        colors={palette.glowColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={styles.outerGlow}
      />
      <LinearGradient
        colors={palette.washColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={styles.wash}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.iconOrb}>
            <Ionicons name={icon} size={compact ? 18 : 21} color={palette.accent} />
          </View>

          <View style={styles.body}>
            {eyebrow ? (
              <View style={styles.eyebrowChip}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
              </View>
            ) : null}

            {title ? (
              <Text
                style={styles.title}
                numberOfLines={titleNumberOfLines ?? (compact ? 1 : 2)}
              >
                {title}
              </Text>
            ) : null}
            <Text
              style={styles.message}
              numberOfLines={messageNumberOfLines ?? (compact ? 2 : undefined)}
            >
              {message}
            </Text>
          </View>
        </View>

        {(meta || (ctaLabel && onPress)) ? (
          <View style={styles.footerRow}>
            {meta ? <Text style={styles.meta}>{meta}</Text> : <View />}

            {ctaLabel && onPress ? (
              <View style={styles.ctaPill}>
                <Text style={styles.ctaText}>{ctaLabel}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  style={styles.ctaIcon}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.shellPressed]}
    >
      {content}
    </Pressable>
  );
}
