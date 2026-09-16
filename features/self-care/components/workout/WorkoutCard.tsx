import React, { FC, useContext, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";
import type { WorkoutCardModel } from "@/features/self-care/utils/workoutLibrary";

interface WorkoutCardProps {
  item: WorkoutCardModel;
  onPress: () => void;
  testID?: string;
}

const WorkoutCard: FC<WorkoutCardProps> = ({ item, onPress, testID }) => {
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );

  return (
    <Pressable
      testID={testID ?? `workout-card-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Open session for ${item.title}`}
      accessibilityHint="Opens the workout session screen"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <Image
        source={normalizeImageSource(item.image)}
        style={styles.thumbnail}
        contentFit="cover"
        transition={160}
      />

      <View style={styles.content}>
        <View style={styles.copyBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>

        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>Start Session</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textPrimary} />
        </View>
      </View>
    </Pressable>
  );
};

const normalizeImageSource = (
  source: string | ImageSourcePropType
): ImageSourcePropType => {
  return typeof source === "string" ? { uri: source } : source;
};

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing,

) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: theme.cardRaised,
      borderRadius: 24,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    cardPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    thumbnail: {
      width: 92,
      height: 92,
      borderRadius: 18,
      backgroundColor: theme.surfaceMuted,
    },
    content: {
      flex: 1,
      minHeight: 92,
      marginLeft: spacing.md,
      justifyContent: "space-between",
    },
    copyBlock: {
      gap: 4,
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ?? svaTypography.textStyle.authLabel.fontFamily,
      color: theme.textPrimary,
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 1.7,
      textTransform: "uppercase",
    },
    ctaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: spacing.sm,
    },
    ctaText: {
      ...svaTypography.textStyle.button,
      color: theme.textPrimary,
      fontSize: 14,
      letterSpacing: 0.8,
    },
  });

export default WorkoutCard;
