import React, { useContext, useMemo } from "react";
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { MealCardSurface } from "./MealCardSurface";
import type {
  SvaColorSet,
  Spacing,
  Typography,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

const FALLBACK_MEAL_IMAGE = require("@/assets/images/mt.jpg");

export type MealPlanMealType = "breakfast" | "lunch" | "dinner";

export type MealPlanMealRow = {
  mealType: MealPlanMealType;
  recipeName: string;
  image?: string | ImageSourcePropType | null;
};

export type MealPlanDayCardProps = {
  title: string;
  statusLabel: string;
  statusColor: string;
  mealRows: readonly MealPlanMealRow[];
  isExpanded: boolean;
  isPast: boolean;
  onToggle: () => void;
  onEditMeal: (mealType: MealPlanMealType) => void;
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
  isPast,
  onToggle,
  onEditMeal,
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
  const formatMealType = (value: MealPlanMealType) =>
    value.charAt(0).toUpperCase() + value.slice(1);

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

        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={svaColors.text.secondary}
        />
      </Pressable>

      {isExpanded && <View style={styles.divider} />}

      {isExpanded && (
        <View style={styles.body}>
          <View style={styles.mealsList}>
            {mealRows.length > 0 ? (
              mealRows.map((meal) => (
                <View key={meal.mealType} style={styles.mealRow}>
                  <View style={styles.mealImageWrap}>
                    {renderMealImage(
                      meal.image,
                      styles,
                      svaColors.text.inverse
                    )}
                  </View>

                  <View style={styles.mealCopy}>
                    <Text style={styles.mealType} numberOfLines={1}>
                      {formatMealType(meal.mealType)}
                    </Text>
                    <Text style={styles.mealName} numberOfLines={2}>
                      {meal.recipeName}
                    </Text>
                  </View>

                  {!isPast && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Change ${formatMealType(
                        meal.mealType
                      )}`}
                      onPress={() => onEditMeal(meal.mealType)}
                      activeOpacity={0.7}
                      style={styles.editButton}
                    >
                      <Ionicons
                        name="pencil-outline"
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
              <Ionicons
                name="share-social-outline"
                size={18}
                color={svaColors.text.primary}
              />
              <Text style={styles.shareText}>Share Plan</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </MealCardSurface>
  );
}

function renderMealImage(
  image: string | ImageSourcePropType | null | undefined,
  styles: ReturnType<typeof styling>,
  fallbackIconColor: string
) {
  if (image) {
    return (
      <Image
        source={normalizeImageSource(image)}
        style={styles.mealImage}
        contentFit="cover"
        transition={120}
      />
    );
  }

  return (
    <View style={styles.mealImageFallback}>
      <Ionicons
        name="restaurant-outline"
        size={20}
        color={fallbackIconColor}
      />
    </View>
  );
}

const normalizeImageSource = (
  source: string | ImageSourcePropType
): ImageSourcePropType => {
  return typeof source === "string" ? { uri: source } : source;
};

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
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    headerPressed: {
      opacity: 0.96,
    },
    headerTextBlock: {
      flex: 1,
      gap: 6,
    },
    title: {
      ...(svaTypography?.textStyle.title ?? typography.bodyStrong),
      color: theme.text.primary,
      fontSize: 18,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.caption),
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: spacing.md,
    },
    body: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    mealsList: {
      gap: spacing.sm,
    },
    mealRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.xs,
      backgroundColor: theme.bg.subtle,
      borderRadius: tokens.radius.input,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    mealImageWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: theme.surface.raised,
      justifyContent: "center",
      alignItems: "center",
    },
    mealImage: {
      width: "100%",
      height: "100%",
    },
    mealImageFallback: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.brand.primary,
    },
    mealCopy: {
      flex: 1,
      gap: 2,
      paddingVertical: spacing.xs,
    },
    mealType: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.caption),
      color: theme.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    mealName: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
      fontSize: 15,
      lineHeight: 20,
    },
    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.interaction.pressed,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.xs,
    },
    emptyState: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    emptyText: {
      ...(svaTypography?.textStyle.subtitle ?? typography.caption),
      color: theme.text.secondary,
      flex: 1,
    },
    shareButton: {
      marginTop: spacing.md,
      minHeight: 44,
      borderRadius: tokens.radius.input,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      backgroundColor: theme.bg.subtle,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    shareText: {
      ...(svaTypography?.textStyle.authActionLabel ?? typography.button),
      color: theme.text.primary,
      fontSize: 13,
    },
  });
