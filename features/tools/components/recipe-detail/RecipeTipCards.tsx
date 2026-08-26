import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { RecipeTip } from "@/features/tools/types/recipeTypes";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type RecipeTipCardsProps = {
  tips: RecipeTip[];
};

const RecipeTipCards: React.FC<RecipeTipCardsProps> = ({ tips }) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.wrap}>
      {tips.map((tip) => (
        <View key={tip.key} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <Ionicons name={tip.icon as any} size={16} color={svaColors.brand.primary} />
            </View>
            <Text style={styles.cardTitle}>{tip.title.toUpperCase()}</Text>
          </View>
          <Text style={styles.cardBody}>{tip.description}</Text>
        </View>
      ))}
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    wrap: {
      gap: spacing.sm,
    },
    card: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
      padding: spacing.md,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
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
    cardTitle: {
      ...typography?.textStyle?.authTinyLabel,
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
    },
    cardBody: {
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 21,
      fontFamily: typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
    },
  });

export default RecipeTipCards;
