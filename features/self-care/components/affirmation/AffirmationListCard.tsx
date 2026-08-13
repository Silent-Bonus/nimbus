import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import {
  getAffirmationRecommendationPalette,
  type AffirmationRecommendationPalette,
} from "@/features/self-care/utils/affirmationPresentation";
import type { AffirmationCard } from "@/features/self-care/types/affirmation";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type AffirmationListCardProps = {
  item: AffirmationCard;
  onPress: (item: AffirmationCard) => void;
  selected?: boolean;
};

const AffirmationListCard = ({
  item,
  onPress,
  selected = false,
}: AffirmationListCardProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);

  const palette = useMemo<AffirmationRecommendationPalette>(
    () => getAffirmationRecommendationPalette(item.toneCategory),
    [item.toneCategory]
  );

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, svaTypography),
    [newTheme, spacing, typography, svaTypography]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose affirmation ${item.title}`}
      accessibilityState={{ selected }}
      accessibilityHint="Highlights this affirmation in the library"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <LinearGradient
        colors={palette.colors}
        start={{ x: 0.08, y: 0.05 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        pointerEvents="none"
        style={[styles.accentOrb, { backgroundColor: palette.accentSoft }]}
      />
      <View pointerEvents="none" style={styles.secondaryOrb} />

      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.tonePill,
              {
                backgroundColor: palette.tagBg,
                borderColor: palette.tagBorder,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="cards-heart-outline"
              size={12}
              color={palette.tagText}
            />
            <Text style={[styles.toneText, { color: palette.tagText }]}>
              {item.tone}
            </Text>
          </View>

          {selected ? (
            <View
              style={[
                styles.selectedPill,
                {
                  backgroundColor: palette.tagBg,
                  borderColor: palette.tagBorder,
                },
              ]}
            >
              <Text style={[styles.selectedText, { color: palette.text }]}>
                Selected
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: palette.accentSoft },
              ]}
            >
              <MaterialCommunityIcons
                name="thought-bubble-outline"
                size={18}
                color={palette.accent}
              />
            </View>
          )}
        </View>

        <View style={styles.copyBlock}>
          <Text
            style={[styles.quote, { color: palette.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text
            style={[styles.detail, { color: palette.text }]}
            numberOfLines={2}
          >
            {item.detail}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: palette.text }]}>
            {selected ? "Selected" : "Open story"}
          </Text>
          <View
            style={[styles.chevronBubble, { backgroundColor: palette.tagBg }]}
          >
            <Ionicons name="chevron-forward" size={16} color={palette.text} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined
) =>
  StyleSheet.create({
    card: {
      position: "relative",
      minHeight: 168,
      marginBottom: spacing.md,
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    cardSelected: {
      borderColor: theme.accent,
      shadowOpacity: 0.26,
      transform: [{ scale: 1.005 }],
    },
    cardPressed: {
      transform: [{ scale: 0.99 }],
    },
    accentOrb: {
      position: "absolute",
      top: -18,
      right: -18,
      width: 88,
      height: 88,
      borderRadius: 999,
      opacity: 0.88,
    },
    secondaryOrb: {
      position: "absolute",
      bottom: -24,
      left: -14,
      width: 110,
      height: 110,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.16)",
      opacity: 0.45,
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
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    tonePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    toneText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    selectedPill: {
      alignSelf: "flex-start",
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    selectedText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    iconBubble: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },
    copyBlock: {
      flex: 1,
      justifyContent: "center",
      gap: 8,
      paddingTop: 2,
    },
    quote: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 23,
      lineHeight: 27,
      letterSpacing: -0.25,
    },
    detail: {
      ...typography.body,
      fontSize: 15,
      lineHeight: 21,
      opacity: 0.93,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    footerText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      textTransform: "uppercase",
      fontWeight: "700",
      opacity: 0.8,
    },
    chevronBubble: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
    },
  });

export default AffirmationListCard;
