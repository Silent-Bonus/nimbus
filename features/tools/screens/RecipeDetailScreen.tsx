import React, { useContext, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/components/layout/AppHeader";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { getArticleDetails } from "@/features/tools/services/toolService";
import {
  RecipeDetailHero,
  RecipeDetailSection,
  RecipeIngredientList,
  RecipeMealPlanButton,
  RecipeProcessList,
  RecipeTipCards,
  RecipeWisdomCard,
  type RecipeNutritionStat,
} from "@/features/tools/components/recipe-detail";
import {
  DEFAULT_RECIPE_PLAN,
  type RecipePlanDetail,
  getRecipePlanById,
} from "@/features/tools/data/recipePlans";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

const getStringParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

const normalizeFilterKey = (
  category: string | undefined,
  fallback: RecipePlanDetail["filterKey"]
): RecipePlanDetail["filterKey"] => {
  const normalized = (category ?? "").toLowerCase().replace(/[^a-z]+/g, "");

  switch (normalized) {
    case "breakfast":
      return "Breakfast";
    case "lunch":
      return "Lunch";
    case "dinner":
      return "Dinner";
    case "beverages":
    case "drink":
      return "Beverages";
    case "snacks":
    case "snack":
      return "Snacks";
    case "soup":
      return "Soup";
    case "dessert":
      return "Dessert";
    case "sauce":
      return "Sauce";
    case "nonveg":
      return "NonVeg";
    default:
      return fallback;
  }
};

const resolveImageSource = (
  image: unknown,
  fallback: RecipePlanDetail["image"]
) => {
  if (!image) return fallback;
  if (typeof image === "string") {
    return { uri: image };
  }
  if (typeof image === "object") {
    const candidate = image as { uri?: string; url?: string; path?: string };
    if (typeof candidate.uri === "string") return { uri: candidate.uri };
    if (typeof candidate.url === "string") return { uri: candidate.url };
    if (typeof candidate.path === "string") return { uri: candidate.path };
  }
  return fallback;
};

const normalizeRecipeFromApi = (
  apiArticle: Record<string, any>,
  fallback: RecipePlanDetail
): RecipePlanDetail => {
  const nutrition = apiArticle?.nutrition;
  const ingredientSource = apiArticle?.ingredients;
  const instructionSource = apiArticle?.instructions;
  const tipsSource = apiArticle?.tips;

  return {
    ...fallback,
    id: String(apiArticle?.id ?? fallback.id),
    title: apiArticle?.title || apiArticle?.name || fallback.title,
    subtitle:
      apiArticle?.subtitle ||
      apiArticle?.tagline ||
      apiArticle?.category ||
      fallback.subtitle,
    category: apiArticle?.category || fallback.category,
    filterKey: normalizeFilterKey(apiArticle?.category, fallback.filterKey),
    image: resolveImageSource(
      apiArticle?.image || apiArticle?.imageUri,
      fallback.image
    ),
    imageFit: apiArticle?.imageFit || fallback.imageFit,
    prepTime:
      apiArticle?.prep_time || apiArticle?.prepTime || fallback.prepTime,
    calories: Number(apiArticle?.calories ?? fallback.calories),
    favorite: Boolean(
      apiArticle?.favorite ?? apiArticle?.is_favorite ?? fallback.favorite
    ),
    nutrition:
      nutrition && typeof nutrition === "object"
        ? {
            calories: String(nutrition.calories ?? fallback.nutrition.calories),
            protein: String(nutrition.protein ?? fallback.nutrition.protein),
            carbs: String(nutrition.carbs ?? fallback.nutrition.carbs),
            fats: String(nutrition.fats ?? fallback.nutrition.fats),
          }
        : fallback.nutrition,
    description:
      apiArticle?.description || apiArticle?.context || fallback.description,
    ingredients: Array.isArray(ingredientSource)
      ? ingredientSource.map((item: any) => String(item))
      : fallback.ingredients,
    process: Array.isArray(instructionSource)
      ? instructionSource.map((item: any) =>
          String(item?.instruction ?? item?.step ?? item)
        )
      : fallback.process,
    tips: Array.isArray(tipsSource)
      ? tipsSource.map((item: any, index: number) => ({
          key: String(item?.key ?? item?.title ?? index),
          title: String(item?.title ?? item?.label ?? "Tip"),
          description: String(item?.description ?? item?.body ?? ""),
          icon: String(item?.icon ?? "leaf-outline"),
        }))
      : fallback.tips,
    wisdomTitle: apiArticle?.wisdomTitle || fallback.wisdomTitle,
    wisdom:
      apiArticle?.wisdom || apiArticle?.nutrition_wisdom || fallback.wisdom,
    ctaLabel:
      apiArticle?.ctaLabel || apiArticle?.action_button || fallback.ctaLabel,
  };
};

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = getStringParam(params.id);

  const fallbackDetail = useMemo(
    () => getRecipePlanById(idParam) ?? DEFAULT_RECIPE_PLAN,
    [idParam]
  );

  const [detail, setDetail] = useState<RecipePlanDetail>(fallbackDetail);
  const [isFavorite, setIsFavorite] = useState(fallbackDetail.favorite);
  const [loading, setLoading] = useState(!__DEV__);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const mockDetail = fallbackDetail;

      if (__DEV__) {
        if (!active) return;
        setDetail(mockDetail);
        setIsFavorite(mockDetail.favorite);
        setLoading(false);
        return;
      }

      if (!idParam) {
        if (!active) return;
        setDetail(mockDetail);
        setIsFavorite(mockDetail.favorite);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const numericId = Number(idParam);
        if (!Number.isNaN(numericId)) {
          const res = await getArticleDetails(numericId);
          const apiArticle: any =
            res && typeof res === "object" && "data" in res ? res.data : res;

          if (apiArticle && typeof apiArticle === "object") {
            const normalized = normalizeRecipeFromApi(apiArticle, mockDetail);
            if (!active) return;
            setDetail(normalized);
            setIsFavorite(normalized.favorite);
            return;
          }
        }

        if (!active) return;
        setDetail(mockDetail);
        setIsFavorite(mockDetail.favorite);
      } catch (error) {
        console.warn("[RecipeDetail] load failed", error);
        if (!active) return;
        setDetail(mockDetail);
        setIsFavorite(mockDetail.favorite);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [fallbackDetail, idParam]);

  const stats = useMemo<RecipeNutritionStat[]>(
    () => [
      { label: "Calories", value: detail.nutrition.calories },
      { label: "Protein", value: detail.nutrition.protein },
      { label: "Carbs", value: detail.nutrition.carbs },
      { label: "Fats", value: detail.nutrition.fats },
    ],
    [detail]
  );

  const onShare = async () => {
    try {
      await Share.share({
        title: detail.title,
        message: `${detail.title}\n\n${detail.subtitle}\n\nNimbus recipe plan`,
      });
    } catch (error) {
      console.warn("[RecipeDetail] share failed", error);
    }
  };

  const onToggleFavorite = () => {
    setIsFavorite((current) => !current);
  };

  const onAddToMealPlan = () => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_MEAL_CREATION,
      params: {
        recipeId: detail.id,
        recipeTitle: detail.title,
      },
    });
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} style={styles.screen}>
      <View style={styles.root}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={svaColors.brand.primary} />
          </View>
        ) : (
          <>
            <AppHeader
              title={detail.title}
              subtitle={detail.subtitle}
              onBack={() => router.back()}
              rightActions={[
                {
                  icon: isFavorite ? "heart" : "heart-outline",
                  accessibilityLabel: "Toggle favorite",
                  onPress: onToggleFavorite,
                },
                {
                  icon: "share-outline",
                  accessibilityLabel: "Share recipe",
                  onPress: onShare,
                },
              ]}
              titleStyle={styles.headerTitle}
              subtitleStyle={styles.headerSubtitle}
              containerStyle={styles.header}
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.content,
                { paddingBottom: insets.bottom + spacing.xl * 2 },
              ]}
            >
              <RecipeDetailHero image={detail.image} stats={stats} />

              <RecipeDetailSection eyebrow="The Alchemy">
                <Text style={styles.description}>{detail.description}</Text>
              </RecipeDetailSection>

              <RecipeDetailSection eyebrow="Elements">
                <RecipeIngredientList items={detail.ingredients} />
              </RecipeDetailSection>

              <RecipeDetailSection eyebrow="The Process">
                <RecipeProcessList steps={detail.process} />
              </RecipeDetailSection>

              <RecipeDetailSection eyebrow="Tips">
                <RecipeTipCards tips={detail.tips} />
              </RecipeDetailSection>

              <RecipeWisdomCard
                title={detail.wisdomTitle}
                body={detail.wisdom}
              />

              <RecipeMealPlanButton
                label={detail.ctaLabel}
                onPress={onAddToMealPlan}
              />
            </ScrollView>
          </>
        )}
      </View>
    </ScreenView>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
    },
    root: {
      flex: 1,
    },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      marginBottom: spacing.lg,
    },
    headerTitle: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.4,
    },
    headerSubtitle: {
      color: colors.brand.primary,
      textTransform: "uppercase",
      letterSpacing: 2,
      fontSize: 10.5,
      lineHeight: 12,
      fontWeight: "700",
    },
    content: {
      paddingHorizontal: spacing.lg,
      gap: spacing.xl,
    },
    description: {
      color: colors.text.secondary,
      fontSize: 15,
      lineHeight: 24,
      fontFamily:
        typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
    },
  });

export default RecipeDetailScreen;
