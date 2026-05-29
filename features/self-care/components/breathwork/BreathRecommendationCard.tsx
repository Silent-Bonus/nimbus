import React, { useContext, useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import type { BreathRecommendation } from "@/features/self-care/types/breathworkTypes";

type BreathRecommendationCardProps = {
  item: BreathRecommendation;
  selected?: boolean;
  onPress: (item: BreathRecommendation) => void;
  onPlay: (item: BreathRecommendation) => void;
  width?: number;
};

export const getBreathRecommendationCardWidth = (windowWidth: number) =>
  Math.min(332, Math.max(266, Math.round(windowWidth * 0.78)));

const BreathRecommendationCard = ({
  item,
  selected = false,
  onPress,
  onPlay,
  width,
}: BreathRecommendationCardProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = width ?? getBreathRecommendationCardWidth(screenWidth);

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, svaTypography, cardWidth),
    [newTheme, spacing, typography, svaTypography, cardWidth]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose rhythm ${item.title}`}
      accessibilityState={{ selected }}
      accessibilityHint="Highlights this rhythm"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: item.palette.colors[0],
          borderColor: item.palette.accent,
        },
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.thumbnail,
              {
                backgroundColor: item.palette.tagBg,
                borderColor: item.palette.tagBorder,
              },
            ]}
          >
            <View
              style={[
                styles.thumbnailCore,
                { backgroundColor: item.palette.accentSoft },
              ]}
              />
            <MaterialCommunityIcons
              name={item.icon as any}
              size={20}
              color={item.palette.accent}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play recommendation ${item.title}`}
            accessibilityHint="Starts this breathwork immediately"
            onPress={(event) => {
              event.stopPropagation();
              onPlay(item);
            }}
            style={({ pressed }) => [
              styles.playButton,
              {
                backgroundColor: item.palette.tagBg,
                borderColor: item.palette.tagBorder,
              },
              pressed && styles.playButtonPressed,
            ]}
          >
            <MaterialCommunityIcons
              name="play"
              size={14}
              color={item.palette.accent}
            />
            <Text style={[styles.playButtonText, { color: item.palette.accent }]}>
              Play
            </Text>
          </Pressable>
        </View>

        <View style={styles.copyBlock}>
          <Text style={[styles.title, { color: item.palette.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            style={[styles.subtitle, { color: item.palette.text }]}
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: item.palette.tagBg,
                borderColor: item.palette.tagBorder,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="weather-windy"
              size={12}
              color={item.palette.tagText}
            />
            <Text style={[styles.tagText, { color: item.palette.tagText }]}>
              {item.tag.toUpperCase()}
            </Text>
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
      minHeight: 198,
      marginRight: spacing.md,
      marginVertical: spacing.sm,
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 1,
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    cardSelected: {
      borderWidth: 2,
      shadowOpacity: 0.3,
      transform: [{ scale: 1.008 }],
    },
    cardPressed: {
      transform: [{ scale: 0.985 }],
    },
    inner: {
      flex: 1,
      justifyContent: "space-between",
      padding: spacing.lg,
      gap: spacing.md,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    playButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
    },
    playButtonPressed: {
      transform: [{ scale: 0.98 }],
    },
    playButtonText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    thumbnail: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      overflow: "hidden",
    },
    thumbnailCore: {
      position: "absolute",
      width: 42,
      height: 42,
      borderRadius: 14,
      opacity: 0.88,
    },
    copyBlock: {
      flex: 1,
      gap: 6,
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    subtitle: {
      ...typography.caption,
      color: theme.textSecondary,
      opacity: 0.92,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: spacing.sm,
    },
    tagPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    tagText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontWeight: "700",
    },
  });

export default BreathRecommendationCard;
