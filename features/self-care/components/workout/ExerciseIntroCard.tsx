import React, { useContext, useMemo } from "react";
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

interface ExerciseIntroCardProps {
  imageUri: string | ImageSourcePropType;
  reps: number;
  description: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const ExerciseIntroCard: React.FC<ExerciseIntroCardProps> = ({
  imageUri,
  reps,
  description,
  title,
  subtitle,
  onPress,
}) => {
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );

  const content = (
    <>
      <View style={styles.imageWrapper}>
        <Image
          source={normalizeImageSource(imageUri)}
          style={styles.image}
          contentFit="cover"
          transition={180}
        />
        {onPress && (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={22} color={theme.textPrimary} />
          </View>
        )}
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow} numberOfLines={1}>
          {subtitle ?? "EXERCISE GUIDE"}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.repsRow}>
          <Ionicons name="repeat" size={16} color={theme.buttonPrimary} />
          <Text style={styles.repsText}>
            {reps} {reps === 1 ? "repetition" : "repetitions"}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>

        {onPress && (
          <View style={styles.ctaRow}>
            <Text style={styles.ctaText}>Open Guide</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.textPrimary}
            />
          </View>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open guide for ${title}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
};

const normalizeImageSource = (
  source: string | ImageSourcePropType
): ImageSourcePropType => (typeof source === "string" ? { uri: source } : source);

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing,

) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: theme.cardRaised,
      borderRadius: 24,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    cardPressed: {
      opacity: 0.95,
      transform: [{ scale: 0.99 }],
    },
    imageWrapper: {
      width: 120,
      height: 120,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: theme.surfaceMuted,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    playOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(8, 10, 8, 0.18)",
    },
    copy: {
      flex: 1,
      marginLeft: spacing.md,
      justifyContent: "space-between",
    },
    eyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.textSecondary,
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        svaTypography.textStyle.authLabel.fontFamily,
      color: theme.textPrimary,
      fontSize: 18,
      lineHeight: 22,
      marginTop: 4,
      letterSpacing: -0.3,
    },
    repsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: spacing.sm,
    },
    repsText: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    description: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      lineHeight: 19,
      marginTop: spacing.xs,
    },
    ctaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      backgroundColor: theme.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      marginTop: spacing.sm,
    },
    ctaText: {
      ...svaTypography.textStyle.button,
      color: theme.textPrimary,
    },
  });

export default ExerciseIntroCard;
