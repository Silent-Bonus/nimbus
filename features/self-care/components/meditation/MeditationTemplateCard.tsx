import React, { useContext, useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { MeditationTemplateCardItem } from "@/features/self-care/types/wellnessContentTypes";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type MeditationTemplateCardProps = {
  item: MeditationTemplateCardItem;
  onPress: () => void;
};

export default function MeditationTemplateCard({
  item,
  onPress,
}: MeditationTemplateCardProps) {
  const {
    newTheme: theme,
    svaTypography,
    spacing,
    typography,
  } = useContext(ThemeContext);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      accessibilityState={{ disabled: item.isLocked }}
      disabled={item.isLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        item.isLocked && styles.cardLocked,
        pressed && !item.isLocked && styles.cardPressed,
      ]}
    >
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <View style={styles.imageOverlay} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.copyBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          <View style={styles.metaColumn}>
            {typeof item.rating === "number" ? (
              <View style={styles.ratingPill}>
                <Ionicons
                  name="star"
                  size={12}
                  color={theme.chart2 ?? theme.accent}
                />
                <Text style={styles.ratingText} numberOfLines={1}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}

            <View style={styles.durationPill}>
              <Text style={styles.durationText} numberOfLines={1}>
                {item.durationLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.tagsRow}>
            {item.tags.map((tag, index) => (
              <View
                key={`${item.id}-${tag}-${index}`}
                style={index === 0 ? styles.tagChip : styles.tagChipMuted}
              >
                <Text
                  style={index === 0 ? styles.tagText : styles.tagTextMuted}
                  numberOfLines={1}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.openPill}>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={
                item.isLocked ? theme.textSecondary : theme.buttonPrimaryText
              }
            />
            <Text style={styles.openPillText} numberOfLines={1}>
              {item.isLocked ? "Locked" : "Open"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styling = (
  theme: ColorSet,
  svaTypography: TypographyTokens | undefined,
  spacing: Spacing,
  typography: Typography
) =>
  StyleSheet.create({
    card: {
      position: "relative",
      minHeight: 132,
      borderRadius: 24,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      marginBottom: spacing.lg,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    cardLocked: {
      opacity: 0.8,
    },
    cardPressed: {
      transform: [{ scale: 0.99 }],
      backgroundColor: theme.surfaceMuted,
    },
    image: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.12,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(7, 9, 7, 0.25)",
    },
    badge: {
      position: "absolute",
      top: 14,
      right: 14,
      width: 28,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      zIndex: 2,
    },
    content: {
      paddingHorizontal: 18,
      paddingVertical: 18,
      zIndex: 1,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    metaColumn: {
      alignItems: "flex-end",
      gap: 8,
      marginTop: 2,
    },
    copyBlock: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 26,
      lineHeight: 28,
      color: theme.textPrimary,
      letterSpacing: -0.4,
    },
    description: {
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 15,
      lineHeight: 23,
      color: theme.textSecondary,
      marginTop: 6,
    },
    ratingPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    ratingText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 0.4,
    },
    durationPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      marginTop: 2,
    },
    durationText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 0.8,
    },
    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    tagsRow: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      minWidth: 0,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.16)",
    },
    tagChipMuted: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    tagText: {
      ...typography.smallCaption,
      color: theme.chart2 ?? theme.accent,
      letterSpacing: 1.1,
    },
    tagTextMuted: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.1,
    },
    openPill: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.buttonPrimary,
      borderWidth: 1,
      borderColor: theme.buttonPrimary,
      flexShrink: 0,
    },
    openPillText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 11,
      lineHeight: 13,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      color: theme.buttonPrimaryText,
    },
  });
