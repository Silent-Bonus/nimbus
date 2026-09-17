import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import RecipeCard from "@/features/tools/components/common/RecipeCard";
import { getRecipeList } from "@/features/tools/services/recipeService";
import type { MealPlannerUiMealType } from "@/features/tools/types/mealPlannerTypes";
import type { RecipeItem } from "@/features/tools/types/recipeTypes";
import { buildRecipeCardItem } from "@/features/tools/utils/recipeList";
import type {
  Spacing,
  SvaColorSet,
  TypographyTokens,
} from "@/theme/types";

export type MealTypeRecipeRailProps = {
  mealType: MealPlannerUiMealType;
  searchQuery?: string;
  onSelectRecipe: (recipe: RecipeItem) => void;
};

const normalizeMealSlot = (value?: string | null) =>
  value?.toLowerCase().replace(/\s+/g, "").replace(/s$/, "");

export function MealTypeRecipeRail({
  mealType,
  searchQuery = "",
  onSelectRecipe,
}: MealTypeRecipeRailProps) {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, svaTypography),
    [svaColors, spacing, svaTypography]
  );
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const trimmedQuery = searchQuery.trim();
    const query = trimmedQuery.length >= 3 ? trimmedQuery : undefined;

    const loadRecipes = async () => {
      setLoading(true);
      try {
        const mealSlot = normalizeMealSlot(mealType);
        const response = await getRecipeList(
          query ? { search: query } : { meal_slot: mealSlot }
        );
        const matchingRecipes = (response.success ? response.data : []).filter(
          (recipe) =>
            normalizeMealSlot(
              recipe.meal_slot || recipe.meal_type || recipe.mealType
            ) === mealSlot
        );

        if (active) {
          setRecipes(matchingRecipes.slice(0, 10));
        }
      } catch (error) {
        console.error("Unable to load meal type recipes:", error);
        if (active) {
          setRecipes([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadRecipes();
    }, query ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mealType, searchQuery]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={svaColors.brand.primary} />
      </View>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{mealType} recipes</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {recipes.map((recipe) => {
          const card = buildRecipeCardItem(recipe, mealType);

          return (
            <View key={card.id} style={styles.cardWrap}>
              <RecipeCard
                title={card.title}
                image={card.image}
                tag={mealType}
                time={
                  recipe.total_time_minutes
                    ? `${recipe.total_time_minutes} min`
                    : undefined
                }
                height={340}
                imageHeight={220}
                titleNumberOfLines={2}
                favorite={card.favorite}
                onPress={() => onSelectRecipe(recipe)}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: TypographyTokens
) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heading: {
      ...(typography?.textStyle.bodyMedium ?? typography.textStyle.bodyMedium),
      color: theme.text.primary,
      marginBottom: spacing.sm,
    },
    content: {
      paddingRight: spacing.md,
    },
    cardWrap: {
      width: 180,
      marginRight: spacing.sm,
    },
    loading: {
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
  });
