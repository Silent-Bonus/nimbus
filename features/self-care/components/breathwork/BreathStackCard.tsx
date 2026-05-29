import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { BreathPattern } from "@/features/self-care/types/breathworkTypes";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import type { BreathRecommendation } from "@/features/self-care/types/breathworkTypes";

type BreathStackCardProps = {
  item: BreathPattern;
  selected?: boolean;
  onPress: (item: BreathPattern) => void;
  onPlay: (item: BreathPattern) => void;
  recommendation: BreathRecommendation;
};

const BreathStackCard = ({
  item,
  selected = false,
  onPress,
  onPlay,
  recommendation,
}: BreathStackCardProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, svaTypography),
    [newTheme, spacing, typography, svaTypography]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open rhythm ${recommendation.title}`}
      accessibilityState={{ selected }}
      accessibilityHint="Highlights this rhythm in the stack"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: recommendation.palette.colors[0],
          borderColor: recommendation.palette.accent,
        },
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.leadingBlock}>
          <View
            style={[
              styles.thumbnail,
              {
                backgroundColor: recommendation.palette.tagBg,
                borderColor: recommendation.palette.tagBorder,
              },
            ]}
          >
            <View
              style={[
                styles.thumbnailHalo,
                { backgroundColor: recommendation.palette.accentSoft },
              ]}
            />
            <MaterialCommunityIcons
              name={recommendation.icon as any}
              size={18}
              color={recommendation.palette.accent}
            />
          </View>

          <View style={styles.copyBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: recommendation.palette.text }]} numberOfLines={2}>
                {recommendation.title}
              </Text>
            </View>

            <Text
              style={[styles.subtitle, { color: recommendation.palette.text }]}
              numberOfLines={2}
            >
              {recommendation.subtitle}
            </Text>

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: recommendation.palette.tagBg,
                    borderColor: recommendation.palette.tagBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={12}
                  color={recommendation.palette.tagText}
                />
                <Text style={[styles.tagText, { color: recommendation.palette.tagText }]}>
                  {recommendation.tag.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play stack ${recommendation.title}`}
            accessibilityHint="Starts this breathwork immediately"
            onPress={(event) => {
              event.stopPropagation();
              onPlay(item);
            }}
            style={({ pressed }) => [
              styles.playButton,
              {
                backgroundColor: recommendation.palette.tagBg,
                borderColor: recommendation.palette.tagBorder,
              },
              pressed && styles.playButtonPressed,
            ]}
          >
            <MaterialCommunityIcons
              name="play"
              size={14}
              color={recommendation.palette.accent}
            />
            <Text style={[styles.playButtonText, { color: recommendation.palette.accent }]}>
              Play
            </Text>
          </Pressable>
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
      minHeight: 126,
      marginBottom: spacing.md,
      borderRadius: 26,
      overflow: "hidden",
      borderWidth: 1,
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    cardSelected: {
      borderWidth: 2,
      shadowOpacity: 0.26,
      transform: [{ scale: 1.004 }],
    },
    cardPressed: {
      transform: [{ scale: 0.99 }],
    },
    inner: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      padding: spacing.md,
    },
    leadingBlock: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minWidth: 0,
    },
    playButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 0,
      alignSelf: "center",
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
      width: 68,
      height: 68,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    thumbnailHalo: {
      position: "absolute",
      width: 44,
      height: 44,
      borderRadius: 14,
      opacity: 0.88,
    },
    copyBlock: {
      flex: 1,
      minWidth: 0,
      gap: 6,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    title: {
      flex: 1,
      minWidth: 0,
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.25,
    },
    subtitle: {
      ...typography.caption,
      color: theme.textSecondary,
      opacity: 0.9,
    },
    metaRow: {
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
      letterSpacing: 1.15,
      textTransform: "uppercase",
      fontWeight: "700",
    },
  });

export default BreathStackCard;
