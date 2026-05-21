import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type RecipeWisdomCardProps = {
  title: string;
  body: string;
};

const RecipeWisdomCard: React.FC<RecipeWisdomCardProps> = ({ title, body }) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles-outline" size={16} color={svaColors.brand.primary} />
        </View>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
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
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
      padding: spacing.md,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: "rgba(163, 190, 140, 0.12)",
    },
    title: {
      ...typography?.textStyle?.authTinyLabel,
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
    },
    body: {
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 22,
      fontStyle: "italic",
    },
  });

export default RecipeWisdomCard;
