import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import ProtocolTemplateCard from "@/components/common/ProtocolTemplateCard";
import { getRecipeList } from "@/features/tools/services/recipeService";
import type { RecipeCardItem } from "@/features/tools/types/recipeTypes";
import type { SvaColorSet, Spacing, TypographyTokens } from "@/theme/types";
import {
  buildRecipeCardItem,
  buildRecipePreviewData,
} from "@/features/tools/utils/recipeList";

export default function RecipeHighlightsRail() {
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const [recipes, setRecipes] = useState<RecipeCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useMemo(
    () => makeStyles(svaColors, svaTypography, spacing),
    [svaColors, svaTypography, spacing]
  );

  useEffect(() => {
    let active = true;

    const loadRecipes = async () => {
      try {
        const response = await getRecipeList();
        if (active) {
          const items = response.success && Array.isArray(response.data)
            ? response.data.slice(0, 10).map((recipe) =>
                buildRecipeCardItem(recipe, "Recipe")
              )
            : [];
          setRecipes(items);
        }
      } catch (error) {
        console.error("Unable to load featured recipes:", error);
        if (active) setRecipes([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadRecipes();
    return () => {
      active = false;
    };
  }, []);

  const openRecipe = (item: RecipeCardItem) => {
    const raw = item.raw as { slug?: string | null };
    router.push({
      pathname: ROUTES.AUTH.TOOLS_RECIPE_DETAIL,
      params: {
        id: item.id,
        slug: raw.slug ?? undefined,
        recipeData: buildRecipePreviewData(item),
      },
    });
  };

  if (!loading && recipes.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>NOURISH YOUR DAY</Text>
          <Text style={styles.heading}>Recipes to explore</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all recipes"
          onPress={() => router.push(ROUTES.AUTH.TOOLS_RECIPE as never)}
          style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons
            name="arrow-forward"
            size={15}
            color={svaColors.brand.primary}
          />
        </Pressable>
      </View>

      <Text style={styles.description}>
        Fresh ideas for meals that feel good and fit your rhythm.
      </Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={svaColors.brand.primary} />
          <Text style={styles.loadingText}>Gathering recipes…</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {recipes.map((recipe) => (
            <ProtocolTemplateCard
              key={recipe.id}
              item={recipe}
              style={styles.recipeCard}
              titleNumberOfLines={2}
              onPress={() => openRecipe(recipe)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (
  colors: SvaColorSet,
  typography: TypographyTokens,
  spacing: Spacing
) =>
  StyleSheet.create({
    section: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    headingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    headingCopy: {
      flex: 1,
    },
    eyebrow: {
      ...(typography?.textStyle.authTinyLabel ?? {}),
      color: colors.brand.primary,
      letterSpacing: 1.8,
      fontSize: 9,
    },
    heading: {
      ...(typography?.textStyle.authTitle ?? {}),
      color: colors.text.primary,
      fontSize: 25,
      lineHeight: 30,
      marginTop: 3,
    },
    seeAll: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 8,
      paddingLeft: 8,
    },
    pressed: {
      opacity: 0.65,
    },
    seeAllText: {
      ...(typography?.textStyle.button ?? {}),
      color: colors.brand.primary,
      fontSize: 12,
    },
    description: {
      ...(typography?.textStyle.caption ?? {}),
      color: colors.text.secondary,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      fontSize: 12,
      lineHeight: 17,
    },
    rail: {
      paddingRight: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    recipeCard: {
      width: 190,
      height: 318,
      marginRight: 0,
    },
    loading: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      borderRadius: 24,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    loadingText: {
      ...(typography?.textStyle.caption ?? {}),
      color: colors.text.secondary,
    },
  });
