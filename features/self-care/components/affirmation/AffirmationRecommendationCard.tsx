import React, { useContext, useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import type { AffirmationRecommendation } from "@/features/self-care/utils/affirmationPresentation";

type AffirmationRecommendationCardProps = {
  item: AffirmationRecommendation;
  selected?: boolean;
  onPress: (item: AffirmationRecommendation) => void;
  width?: number;
};

export const getAffirmationRecommendationCardWidth = (windowWidth: number) =>
  Math.min(342, Math.max(266, Math.round(windowWidth * 0.74)));

const AffirmationRecommendationCard = ({
  item,
  selected = false,
  onPress,
  width,
}: AffirmationRecommendationCardProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = width ?? getAffirmationRecommendationCardWidth(screenWidth);

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, svaTypography, cardWidth),
    [newTheme, spacing, typography, svaTypography, cardWidth]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose recommendation ${item.title}`}
      accessibilityState={{ selected }}
      accessibilityHint="Highlights this affirmation card"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <LinearGradient
        colors={item.palette.colors}
        start={{ x: 0.08, y: 0.05 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        pointerEvents="none"
        style={[styles.accentOrb, { backgroundColor: item.palette.accentSoft }]}
      />
      <View pointerEvents="none" style={styles.secondaryOrb} />

      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: item.palette.tagBg,
                borderColor: item.palette.tagBorder,
              },
            ]}
          >
            <Text style={[styles.tagText, { color: item.palette.tagText }]}>
              {item.tone}
            </Text>
          </View>

          {selected ? (
            <View
              style={[
                styles.selectedPill,
                {
                  backgroundColor: item.palette.tagBg,
                  borderColor: item.palette.tagBorder,
                },
              ]}
            >
              <Text
                style={[styles.selectedText, { color: item.palette.text }]}
                numberOfLines={1}
              >
                Selected
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: item.palette.accentSoft },
              ]}
            >
              <MaterialCommunityIcons
                name="cards-heart-outline"
                size={18}
                color={item.palette.accent}
              />
            </View>
          )}
        </View>

        <View style={styles.copyBlock}>
          <Text
            style={[styles.title, { color: item.palette.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text
            style={[styles.affirmation, { color: item.palette.text }]}
            numberOfLines={3}
          >
            {item.affirmation}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: item.palette.text }]}>
            {selected ? "Selected" : "Open story"}
          </Text>
          <View
            style={[
              styles.chevronBubble,
              { backgroundColor: item.palette.tagBg },
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={item.palette.text}
            />
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
  svaTypography: TypographyTokens | undefined,
  cardWidth: number
) =>
  StyleSheet.create({
    card: {
      width: cardWidth,
      minHeight: 232,
      marginRight: spacing.md,
      marginVertical: spacing.sm,
      borderRadius: 30,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    cardSelected: {
      borderColor: theme.accent,
      shadowOpacity: 0.28,
      transform: [{ scale: 1.01 }],
    },
    cardPressed: {
      transform: [{ scale: 0.985 }],
    },
    accentOrb: {
      position: "absolute",
      top: -24,
      right: -20,
      width: 104,
      height: 104,
      borderRadius: 999,
      opacity: 0.9,
    },
    secondaryOrb: {
      position: "absolute",
      bottom: -30,
      left: -20,
      width: 128,
      height: 128,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.16)",
      opacity: 0.5,
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
    tagPill: {
      alignSelf: "flex-start",
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    tagText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
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
      gap: 10,
      paddingTop: 2,
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.3,
    },
    affirmation: {
      ...typography.body,
      fontSize: 15,
      lineHeight: 22,
      opacity: 0.94,
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

export default AffirmationRecommendationCard;
