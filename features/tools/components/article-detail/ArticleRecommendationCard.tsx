import React, { useContext } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type ArticleRecommendationCardProps = {
  title: string;
  subtitle: string;
  tag: string;
  image: ImageSourcePropType;
  imageFit?: "cover" | "contain";
  onPress: () => void;
};

const ArticleRecommendationCard: React.FC<ArticleRecommendationCardProps> = ({
  title,
  subtitle,
  tag,
  image,
  imageFit = "cover",
  onPress,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={image}
          style={styles.image}
          contentFit={imageFit}
          transition={250}
        />
      </View>

      <View style={styles.copy}>
        <Text style={styles.label}>NEXT UP</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={styles.tag} numberOfLines={1}>
          {tag.toUpperCase()}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={svaColors.text.secondary}
      />
    </Pressable>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      padding: spacing.sm,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    cardPressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.96,
    },
    imageWrap: {
      width: 74,
      height: 74,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.bg.subtle,
      marginRight: spacing.md,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    copy: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    label: {
      ...typography?.textStyle?.authTinyLabel,
      color: colors.brand.primary,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 1.6,
      marginBottom: 4,
    },
    title: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 20,
      lineHeight: 22,
      color: colors.text.primary,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontFamily:
        typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
      fontSize: 12.5,
      lineHeight: 17,
      color: colors.text.secondary,
      marginTop: 4,
    },
    tag: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_600SemiBold",
      fontSize: 9,
      lineHeight: 11,
      letterSpacing: 1.5,
      color: colors.brand.primary,
      marginTop: 8,
    },
  });

export default ArticleRecommendationCard;
