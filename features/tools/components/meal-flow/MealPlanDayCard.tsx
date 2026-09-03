import React, { useContext, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { apiMealTypeToLabel } from "@/features/tools/utils/mealPlannerUtils";
import type { MealPlanMealRow } from "@/features/tools/types/mealPlannerTypes";
import { MealCardSurface } from "./MealCardSurface";
import type {
  SvaColorSet,
  Spacing,
  Typography,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

export type {
  MealPlanMealRow,
  MealPlanMealType,
} from "@/features/tools/types/mealPlannerTypes";

export type MealPlanDayCardProps = {
  title: string;
  statusLabel: string;
  statusColor: string;
  mealRows: readonly MealPlanMealRow[];
  isExpanded: boolean;
  onToggle: () => void;
  onOpenRecipe?: (meal: MealPlanMealRow) => void;
  onSharePlan?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  testID?: string;
};

export function MealPlanDayCard({
  title,
  statusLabel,
  statusColor,
  mealRows,
  isExpanded,
  onToggle,
  onOpenRecipe,
  onSharePlan,
  style,
  titleStyle,
  testID,
}: MealPlanDayCardProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  return (
    <MealCardSurface
      tone={isExpanded ? "raised" : "surface"}
      radius={24}
      borderColor={isExpanded ? svaColors.brand.primary : undefined}
      style={[styles.card, style]}
    >
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={styles.headerTextBlock}>
          <Text style={[styles.title, titleStyle]} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.headerChevronWrap}>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={svaColors.text.secondary}
          />
        </View>
      </Pressable>

      {isExpanded && <View style={styles.divider} />}

      {isExpanded && (
        <View style={styles.body}>
          <View style={styles.mealsList}>
            {mealRows.length > 0 ? (
              mealRows.map((meal) => (
                <View key={meal.mealType} style={styles.mealRow}>
                  <View style={styles.mealCopy}>
                    <Text style={styles.mealType} numberOfLines={1}>
                      {apiMealTypeToLabel(meal.mealType)}
                    </Text>
                    <Text style={styles.mealName} numberOfLines={2}>
                      {meal.recipeName}
                    </Text>
                  </View>

                  {onOpenRecipe && (meal.recipeId || meal.recipeSlug) && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${apiMealTypeToLabel(
                        meal.mealType
                      )} recipe`}
                      onPress={() => onOpenRecipe(meal)}
                      activeOpacity={0.7}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={svaColors.text.secondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="restaurant-outline"
                  size={18}
                  color={svaColors.text.secondary}
                />
                <Text style={styles.emptyText}>
                  No meals planned for this day.
                </Text>
              </View>
            )}
          </View>

          {onSharePlan ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSharePlan}
              style={styles.shareButton}
            >
              <View style={styles.shareContent}>
                <View style={styles.shareIconWrap}>
                  <Ionicons
                    name="share-social-outline"
                    size={16}
                    color={svaColors.text.primary}
                  />
                </View>
                <Text style={styles.shareText}>Share Plan</Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={svaColors.text.secondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
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
    card: {
      marginBottom: spacing.md,
      overflow: "hidden",
      shadowColor: theme.bg.base,
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    headerPressed: {
      opacity: 0.94,
    },
    headerTextBlock: {
      flex: 1,
      gap: spacing.sm,
    },
    title: {
      ...(svaTypography?.textStyle.heading2 ?? typography.h3),
      color: theme.text.primary,
    },
    statusRow: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs + 2,
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: spacing.xs + 3,
      borderRadius: tokens.radius.chip,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 99,
    },
    statusText: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.caption),
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    headerChevronWrap: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.button,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
    },
    divider: {
      height: tokens.border.hairline,
      backgroundColor: theme.divider,
      marginHorizontal: spacing.lg,
      opacity: 0.5,
    },
    body: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    mealsList: {
      gap: spacing.md,
    },
    mealRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: theme.bg.subtle,
      borderRadius: tokens.radius.card,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    mealCopy: {
      flex: 1,
      gap: spacing.xs + 2,
      paddingRight: spacing.sm,
    },
    mealType: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.caption),
      color: theme.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 1.6,
    },
    mealName: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.button,
      backgroundColor: theme.surface.raised,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyState: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: theme.bg.subtle,
      borderRadius: tokens.radius.card,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    emptyText: {
      ...(svaTypography?.textStyle.subtitle ?? typography.caption),
      color: theme.text.secondary,
      flex: 1,
    },
    shareButton: {
      marginTop: spacing.md,
      minHeight: 56,
      borderRadius: tokens.radius.card,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.raised,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    shareContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    shareIconWrap: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.button,
      backgroundColor: theme.bg.subtle,
      justifyContent: "center",
      alignItems: "center",
    },
    shareText: {
      ...(svaTypography?.textStyle.authActionLabel ?? typography.button),
      color: theme.text.primary,
      letterSpacing: 0.2,
    },
  });
