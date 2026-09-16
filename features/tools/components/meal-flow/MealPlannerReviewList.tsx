import React, { useContext, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  MealPlannerWeeklyPlanStore,
  MealPlannerApiMealType,
} from "@/features/tools/types/mealPlannerTypes";
import { apiMealTypeToLabel } from "@/features/tools/utils/mealPlannerUtils";
import { toApiDate, toFriendlyDate } from "@/utils/date-time";
import type {
  Spacing,
  SvaColorSet,
  SvaTokens,
  TypographyTokens,
} from "@/theme/types";
import { MealCardSurface } from "./MealCardSurface";

const REVIEW_MEAL_TYPES: readonly MealPlannerApiMealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

export type MealPlannerReviewListProps = {
  weekDates: readonly Date[];
  weeklyPlan: MealPlannerWeeklyPlanStore;
};

/**
 * Final review surface for weekly planning before bulk sync.
 */
export function MealPlannerReviewList({
  weekDates,
  weeklyPlan,
}: MealPlannerReviewListProps) {
  const { svaColors, spacing, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, svaTypography, tokens),
    [svaColors, spacing, svaTypography, tokens]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.header}>Weekly Summary</Text>
      {weekDates.map((date) => {
        const dateKey = toApiDate(date);
        const dayPlan = weeklyPlan[dateKey] ?? {};

        return (
          <MealCardSurface
            key={dateKey}
            tone="surface"
            radius={24}
            style={styles.dayCard}
          >
            <View style={styles.dayHeader}>
              <Text style={styles.dayDate}>{toFriendlyDate(date)}</Text>
              <Text style={styles.dayStatus}>{Object.keys(dayPlan).length}/4 meals</Text>
            </View>

            {REVIEW_MEAL_TYPES.map((mealType) => (
              <View key={mealType} style={styles.mealRow}>
                <Text style={styles.mealType}>{apiMealTypeToLabel(mealType)}</Text>
                <Text
                  style={[
                    styles.mealFood,
                    !dayPlan[mealType] && styles.mealFoodMuted,
                  ]}
                >
                  {dayPlan[mealType]?.foodName || "Not planned"}
                </Text>
              </View>
            ))}
          </MealCardSurface>
        );
      })}
    </ScrollView>
  );
}

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens,
  tokens: SvaTokens
) =>
  StyleSheet.create({
    content: {
      paddingBottom: spacing.xl + spacing.sm,
    },
    header: {
      ...(svaTypography?.textStyle.title ?? svaTypography.textStyle.title),
      color: theme.text.primary,
      marginBottom: spacing.lg,
    },
    dayCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    dayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: tokens.border.hairline,
      borderBottomColor: theme.border.default,
      paddingBottom: spacing.sm,
      marginBottom: spacing.md,
    },
    dayDate: {
      ...(svaTypography?.textStyle.bodyMedium ?? svaTypography.textStyle.bodyMedium),
      color: theme.brand.primary,
    },
    dayStatus: {
      ...(svaTypography?.textStyle.caption ?? svaTypography.textStyle.caption),
      color: theme.text.secondary,
    },
    mealRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    mealType: {
      ...(svaTypography?.textStyle.caption ?? svaTypography.textStyle.caption),
      color: theme.text.secondary,
      width: 80,
    },
    mealFood: {
      ...(svaTypography?.textStyle.body ?? svaTypography.textStyle.body),
      color: theme.text.primary,
      flex: 1,
      textAlign: "right",
    },
    mealFoodMuted: {
      color: theme.text.secondary,
      fontStyle: "italic",
    },
  });
