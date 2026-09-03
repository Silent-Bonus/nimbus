import React, { useContext } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type ArticleDetailHeroProps = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  category: string;
  readingTime: string;
  authorName: string;
  authorRole: string;
};

const ArticleDetailHero: React.FC<ArticleDetailHeroProps> = ({
  image,
  title,
  subtitle,
  category,
  readingTime,
  authorName,
  authorRole,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} contentFit="cover" />
      <LinearGradient
        colors={["rgba(7, 9, 7, 0.2)", "rgba(7, 9, 7, 0.88)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />

      <View style={styles.overlay}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{category.toUpperCase()}</Text>
          <Text style={styles.readingTime}>{readingTime.toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={14}
              color={svaColors.brand.primary}
            />
          </View>
          <View style={styles.authorCopy}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.authorRole}>{authorRole}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    card: {
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      minHeight: 360,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.34,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    glow: {
      position: "absolute",
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: "rgba(163, 190, 140, 0.08)",
      right: -70,
      top: -60,
    },
    overlay: {
      flex: 1,
      justifyContent: "flex-start",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    category: {
      ...typography?.textStyle?.authTinyLabel,
      color: colors.brand.primary,
      fontSize: 10,
      letterSpacing: 2.1,
    },
    readingTime: {
      ...typography?.textStyle?.authTinyLabel,
      color: colors.text.secondary,
      fontSize: 9.5,
      letterSpacing: 2,
    },
    title: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.6,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontFamily: typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.secondary,
      maxWidth: "88%",
      marginBottom: spacing.lg,
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    authorCopy: {
      flex: 1,
    },
    authorName: {
      fontFamily: typography?.textStyle?.authBody?.fontFamily ?? "Outfit_500Medium",
      fontSize: 12,
      lineHeight: 16,
      color: colors.text.primary,
    },
    authorRole: {
      fontFamily: typography?.textStyle?.authTinyLabel?.fontFamily ?? "Outfit_400Regular",
      fontSize: 10,
      lineHeight: 13,
      color: colors.text.secondary,
      marginTop: 2,
    },
  });

export default ArticleDetailHero;
