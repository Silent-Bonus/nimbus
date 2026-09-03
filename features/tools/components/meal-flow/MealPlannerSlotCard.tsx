import React, { useContext, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  Meal,
  MealPlannerScreenMealSlotKey,
} from "@/features/tools/types/mealPlannerTypes";
import { getMealName } from "@/features/tools/utils/mealPlannerUtils";
import type {
  Spacing,
  SvaColorSet,
  SvaTokens,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import { MealCardSurface } from "./MealCardSurface";

const MEAL_SLOT_META: Record<
  MealPlannerScreenMealSlotKey,
  {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  breakfast: {
    label: "Breakfast",
    icon: "coffee",
  },
  lunch: {
    label: "Lunch",
    icon: "white-balance-sunny",
  },
  dinner: {
    label: "Dinner",
    icon: "moon-waning-crescent",
  },
  snack: {
    label: "Snack",
    icon: "apple",
  },
};

export type MealPlannerSlotCardProps = {
  mealType: MealPlannerScreenMealSlotKey;
  mealData: Meal | Meal[] | null | undefined;
  isConsuming?: boolean;
  onAddMeal: (mealType: MealPlannerScreenMealSlotKey) => void;
  onOpenRecipeSearch: (mealData: Meal | Meal[] | null | undefined) => void;
  onMarkConsumed: (
    mealType: MealPlannerScreenMealSlotKey,
    mealData: Meal | Meal[] | null | undefined
  ) => Promise<void> | void;
};

const getMealItems = (meal: Meal | Meal[] | null | undefined): Meal[] => {
  if (!meal) {
    return [];
  }

  return Array.isArray(meal) ? meal.filter(Boolean) : [meal];
};

/**
 * Renders one timeline slot in the planner and delegates navigation/mutations
 * back to the screen so this component stays presentational.
 */
export function MealPlannerSlotCard({
  mealType,
  mealData,
  isConsuming = false,
  onAddMeal,
  onOpenRecipeSearch,
  onMarkConsumed,
}: MealPlannerSlotCardProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  const slotMeta = MEAL_SLOT_META[mealType];
  const mealItems = getMealItems(mealData);
  const hasMeal = mealItems.length > 0;
  const allConsumed = hasMeal && mealItems.every((meal) => meal.is_consumed);
  const mealCalories = Array.isArray(mealData)
    ? mealData[0]?.calories ?? 0
    : mealData?.calories ?? 0;

  if (!mealData) {
    return (
      <TouchableOpacity
        style={styles.ghostCard}
        activeOpacity={0.7}
        onPress={() => onAddMeal(mealType)}
      >
        <View style={styles.timelinePoint}>
          <MaterialCommunityIcons
            name={slotMeta.icon}
            size={20}
            color={svaColors.text.secondary}
          />
        </View>
        <MealCardSurface tone="dashed" radius={24} style={styles.ghostCardBody}>
          <Text style={styles.ghostText}>
            Plan your {slotMeta.label.toLowerCase()}
          </Text>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={svaColors.brand.primary}
          />
        </MealCardSurface>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.mealCardContainer}>
      <View style={styles.timelinePointActive}>
        <MaterialCommunityIcons
          name={slotMeta.icon}
          size={20}
          color={svaColors.bg.base}
        />
      </View>
      <MealCardSurface tone="surface" radius={24} style={styles.mealCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Browse recipes for ${getMealName(mealData)}`}
          onPress={() => onOpenRecipeSearch(mealData)}
          style={({ pressed }) => [
            styles.mealPressable,
            pressed && styles.mealPressablePressed,
          ]}
        >
          <View style={styles.mealInfo}>
            <Text style={styles.mealType}>{slotMeta.label.toUpperCase()}</Text>
            <Text style={styles.mealTitle}>{getMealName(mealData)}</Text>
            <Text style={styles.mealMeta}>{mealCalories} kcal</Text>
          </View>
        </Pressable>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            allConsumed
              ? `${mealType} already consumed`
              : `Mark ${mealType} as consumed`
          }
          accessibilityState={{ disabled: allConsumed || isConsuming }}
          activeOpacity={0.8}
          disabled={allConsumed || isConsuming}
          onPress={() => {
            void onMarkConsumed(mealType, mealData);
          }}
          style={[
            styles.doneButton,
            allConsumed && styles.doneButtonComplete,
            isConsuming && styles.doneButtonPending,
          ]}
        >
          {isConsuming ? (
            <ActivityIndicator
              size={16}
              color={allConsumed ? svaColors.bg.base : svaColors.brand.primary}
            />
          ) : (
            <Ionicons
              name="checkmark"
              size={18}
              color={allConsumed ? svaColors.bg.base : svaColors.brand.primary}
            />
          )}
        </TouchableOpacity>
      </MealCardSurface>
    </View>
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
    mealCardContainer: {
      marginBottom: spacing.xl,
      flexDirection: "row",
      alignItems: "center",
    },
    timelinePointActive: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.button,
      backgroundColor: theme.chart.blue,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      marginRight: spacing.md,
    },
    mealCard: {
      flex: 1,
      padding: spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.md,
    },
    mealPressable: {
      flex: 1,
      borderRadius: tokens.radius.card,
      paddingVertical: spacing.xs - 2,
    },
    mealPressablePressed: {
      opacity: 0.78,
    },
    mealInfo: {
      flex: 1,
    },
    mealType: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.caption),
      color: theme.chart.blue,
      fontWeight: "700",
      letterSpacing: 1,
      marginBottom: 4,
    },
    mealTitle: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
    },
    mealMeta: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
      marginTop: 2,
    },
    doneButton: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.button,
      backgroundColor: theme.surface.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      justifyContent: "center",
      alignItems: "center",
    },
    doneButtonComplete: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },
    doneButtonPending: {
      opacity: 0.7,
    },
    ghostCard: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    timelinePoint: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.button,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      marginRight: spacing.md,
    },
    ghostCardBody: {
      flex: 1,
      minHeight: 80,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    ghostText: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.secondary,
      fontStyle: "italic",
    },
  });
