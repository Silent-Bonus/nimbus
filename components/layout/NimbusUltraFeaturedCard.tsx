// src/components/common/NimbusUltraFeaturedCard.tsx

import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
  useWindowDimensions,
} from "react-native";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens, SvaColorSet } from "@/theme/types";

export interface NimbusUltraFeaturedCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image: ImageSourcePropType;
  onPress: () => void;

  tint?: string;
  accent?: string;
  badge?: string;
  width?: number;
}

type FeaturedCardPalette = {
  base: string;
  border: string;
  tint: string;
  accent: string;
  text: string;
  sub: string;
  surfaceText: string;
};

type FeaturedCardTheme = {
  newTheme: ColorSet;
  svaColors?: SvaColorSet;
  spacing: Spacing;
  svaTypography: TypographyTokens;
};

const NimbusUltraFeaturedCard: React.FC<NimbusUltraFeaturedCardProps> = ({
  title,
  subtitle,
  description,
  image,
  onPress,
  tint,
  accent,
  badge,
  width,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const { newTheme, svaColors, spacing, svaTypography } =
    useContext(ThemeContext) as FeaturedCardTheme;

  const cardWidth = width ?? Math.min(440, Math.max(280, windowWidth * 0.86));

  const colors = useMemo(() => {
    return {
      base: newTheme.cardRaised ?? newTheme.surface ?? "rgba(255,255,255,0.06)",
      border:
        svaColors?.border.muted ??
        newTheme.borderMuted ??
        "rgba(255,255,255,0.10)",
      tint: tint ?? "rgba(163,190,140,0.10)",
      accent: accent ?? svaColors?.brand.primary ?? newTheme.accent,
      text: svaColors?.text.primary ?? newTheme.textPrimary,
      sub: svaColors?.text.secondary ?? newTheme.textSecondary,
      surfaceText: newTheme.buttonPrimaryText ?? "#10120E",
    };
  }, [accent, newTheme, svaColors?.border.muted, svaColors?.brand.primary, svaColors?.text.primary, svaColors?.text.secondary, tint]);

  const styles = styling(spacing, svaTypography, colors, cardWidth);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      accessibilityHint="Opens the featured item"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.tintLayer} pointerEvents="none" />

      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.imageWrap}>
            <Image source={image} style={styles.image} />
            <View style={styles.imageSheen} />
          </View>

          <View style={styles.textWrap}>
            <View style={styles.labelRow}>
              {badge ? (
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText} numberOfLines={1}>
                    {badge}
                  </Text>
                </View>
              ) : null}

              <View style={styles.chevronPill}>
                <Text style={styles.chevronText}>Open</Text>
                <View style={styles.chevronIcon}>
                  <Text style={styles.chevronGlyph}>↗</Text>
                </View>
              </View>
            </View>

            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {title}
            </Text>

            {subtitle ? (
              <View style={styles.subtitlePill}>
                <Text
                  style={styles.subtitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {subtitle}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {description ? (
          <View style={styles.footer}>
            <View style={styles.footerAccent} />
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styling = (
  spacing: Spacing,
  svaTypography: TypographyTokens,
  c: FeaturedCardPalette,
  cardWidth: number
) =>
  StyleSheet.create({
    card: {
      width: cardWidth,
      minHeight: 164,
      marginRight: spacing.md,
      marginVertical: spacing.md,
      borderRadius: 28,
      backgroundColor: c.base,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      shadowColor: "rgba(0,0,0,0.45)",
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
    cardPressed: {
      transform: [{ scale: 0.985 }],
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    tintLayer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.tint,
      opacity: 0.88,
    },
    inner: {
      flex: 1,
      justifyContent: "space-between",
      padding: spacing.lg,
      gap: spacing.md,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    imageWrap: {
      width: 78,
      height: 78,
      borderRadius: 24,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      overflow: "hidden",
      flexShrink: 0,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    imageSheen: {
      position: "absolute",
      top: -18,
      left: -16,
      width: 130,
      height: 70,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.10)",
      transform: [{ rotate: "-10deg" }],
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
      gap: 8,
      paddingTop: 2,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    badge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 99,
      backgroundColor: c.accent,
      opacity: 0.95,
    },
    badgeText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: c.sub,
      letterSpacing: 0.9,
    },
    title: {
      ...svaTypography.textStyle.title,
      fontSize: 19,
      lineHeight: 24,
      color: c.text,
      letterSpacing: -0.2,
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: c.sub,
      letterSpacing: 0.1,
    },
    subtitlePill: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    footer: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(255,255,255,0.09)",
    },
    footerAccent: {
      width: 3,
      height: 42,
      borderRadius: 99,
      backgroundColor: c.accent,
      opacity: 0.78,
    },
    description: {
      ...svaTypography.textStyle.body,
      color: c.text,
      opacity: 0.88,
      lineHeight: 20,
      flex: 1,
    },
    chevronPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      flexShrink: 0,
    },
    chevronText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: c.sub,
      letterSpacing: 0.9,
    },
    chevronIcon: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.accent,
    },
    chevronGlyph: {
      color: c.surfaceText,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
      includeFontPadding: false,
      textAlign: "center",
    },
  });

export default NimbusUltraFeaturedCard;
