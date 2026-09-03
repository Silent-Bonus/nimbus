import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  MealPlannerApiMealType,
  MealPlannerDayDraft,
  MealPlannerUiMealType,
} from "@/features/tools/types/mealPlannerTypes";
import { toFriendlyDate } from "@/utils/date-time";
import type {
  Spacing,
  SvaColorSet,
  SvaTokens,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import { MealCardSurface } from "./MealCardSurface";

const DAY_PREVIEW_SLOTS: readonly [
  MealPlannerApiMealType,
  MealPlannerUiMealType,
][] = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["dinner", "Dinner"],
  ["snack", "Snack"],
];

export type MealPlannerDayPreviewCardProps = {
  date: Date;
  draft: MealPlannerDayDraft;
  activeMealType: MealPlannerUiMealType;
  onSelectMealType: (mealType: MealPlannerUiMealType) => void;
  onRemoveSlot: (mealType: MealPlannerApiMealType) => void;
};

/**
 * Read-only day snapshot for the planner draft with per-slot quick actions.
 */
export function MealPlannerDayPreviewCard({
  date,
  draft,
  activeMealType,
  onSelectMealType,
  onRemoveSlot,
}: MealPlannerDayPreviewCardProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  const plannedCount = Object.values(draft).filter((entry) => entry?.foodName).length;

  return (
    <MealCardSurface tone="surface" radius={24} style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>{toFriendlyDate(date)}</Text>
        <Text style={styles.status}>{plannedCount}/4 slots ready</Text>
      </View>

      {DAY_PREVIEW_SLOTS.map(([slotKey, label]) => {
        const entry = draft[slotKey];
        const isActive = activeMealType === label;

        return (
          <TouchableOpacity
            key={slotKey}
            activeOpacity={0.85}
            onPress={() => onSelectMealType(label)}
            style={[styles.row, isActive && styles.rowActive]}
          >
            <View style={styles.copy}>
              <Text style={styles.mealType}>{label}</Text>
              <Text
                style={[
                  styles.mealName,
                  !entry?.foodName && styles.mealNameMuted,
                ]}
              >
                {entry?.foodName || "Not planned yet"}
              </Text>
            </View>

            {entry?.foodName ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Remove ${label.toLowerCase()} from day plan`}
                onPress={() => onRemoveSlot(slotKey)}
                style={styles.removeButton}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={svaColors.text.secondary}
                />
              </TouchableOpacity>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={svaColors.text.secondary}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </MealCardSurface>
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
    panel: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    },
    title: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
    },
    status: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
    },
    row: {
      minHeight: 60,
      borderRadius: tokens.radius.card,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      backgroundColor: theme.bg.subtle,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    rowActive: {
      borderColor: theme.brand.primary,
      backgroundColor: `${theme.brand.primary}10`,
    },
    copy: {
      flex: 1,
      gap: spacing.xs - 2,
    },
    mealType: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.caption),
      color: theme.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    mealName: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.primary,
    },
    mealNameMuted: {
      color: theme.text.secondary,
      fontStyle: "italic",
    },
    removeButton: {
      width: 28,
      height: 28,
      borderRadius: tokens.radius.button,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
  });
