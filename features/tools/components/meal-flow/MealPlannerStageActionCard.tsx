import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  Spacing,
  SvaColorSet,
  SvaTokens,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import { MealCardSurface } from "./MealCardSurface";

export type MealPlannerStageActionCardProps = {
  title: string;
  message: string;
  onPress: () => void;
};

/**
 * Shared staging CTA used when a planner draft is ready to be added or updated.
 */
export function MealPlannerStageActionCard({
  title,
  message,
  onPress,
}: MealPlannerStageActionCardProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.touchable}>
      <MealCardSurface
        tone="raised"
        radius={24}
        borderColor={`${svaColors.brand.primary}40`}
        style={styles.card}
      >
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="add" size={22} color={svaColors.text.inverse} />
        </View>
      </MealCardSurface>
    </TouchableOpacity>
  );
}

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  tokens: SvaTokens
) =>
  StyleSheet.create({
    touchable: {
      marginTop: spacing.md,
    },
    card: {
      padding: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    copy: {
      flex: 1,
      gap: spacing.xs - 2,
    },
    title: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
    },
    message: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.button,
      backgroundColor: theme.brand.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  });
