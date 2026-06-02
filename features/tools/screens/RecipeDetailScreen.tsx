import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  getRecipeDetails,
  setRecipeFavoriteState,
} from "@/features/tools/services/toolService";
import {
  RecipeDetailHero,
  RecipeDetailSection,
  RecipeIngredientList,
  RecipeMealPlanButton,
  RecipeProcessList,
  RecipeReviewModal,
  RecipeTipCards,
  RecipeWisdomCard,
  type RecipeNutritionStat,
} from "@/features/tools/components/recipe-detail";
import {
  type RecipePlanStep,
  type RecipePlanDetail,
} from "@/features/tools/data/recipePlans";
import ProcessingModal from "@/components/ui/modal/ProcessingModal";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

const getStringParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

const parseJsonParam = (value: unknown): Record<string, any> | null => {
  const raw = getStringParam(value);
  if (!raw) return null;

  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // Ignore decode failures and fall back to the raw string.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, any>;
      }
    } catch (error) {
      console.warn("[RecipeDetail] failed to parse recipe preview", error);
    }
  }

  return null;
};

type FavoriteModalStatus = "loading" | "success" | "error";

type FavoriteModalState = {
  visible: boolean;
  status: FavoriteModalStatus;
  title: string;
  subtitle?: string;
  message: string;
  actionLabel?: string;
};

const buildErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      detail?: unknown;
      error?: unknown;
      non_field_errors?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.detail === "string" && candidate.detail.trim()) {
      return candidate.detail;
    }

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }

    if (Array.isArray(candidate.non_field_errors)) {
      const firstMessage = candidate.non_field_errors.find(
        (item) => typeof item === "string" && item.trim()
      );

      if (typeof firstMessage === "string") {
        return firstMessage;
      }
    }
  }

  return "Unable to update favorite right now.";
};

const getCategoryText = (category: unknown): string | undefined => {
  if (!category) return undefined;
  if (typeof category === "string") return category;
  if (typeof category === "object") {
    const candidate = category as { name?: string; slug?: string };
    return candidate.name || candidate.slug || undefined;
  }
  return undefined;
};

const formatLabel = (value?: string | null) => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const normalizeFilterKey = (
  category: unknown,
  fallback: RecipePlanDetail["filterKey"],
  mealSlot?: unknown
): RecipePlanDetail["filterKey"] => {
  const normalizedCandidates = [mealSlot, category]
    .map((value) => getCategoryText(value) ?? "")
    .map((value) => value.toLowerCase().replace(/[^a-z]+/g, ""));

  if (normalizedCandidates.some((value) => value === "breakfast")) {
    return "Breakfast";
  }
  if (normalizedCandidates.some((value) => value === "lunch")) {
    return "Lunch";
  }
  if (normalizedCandidates.some((value) => value === "dinner")) {
    return "Dinner";
  }
  if (
    normalizedCandidates.some(
      (value) => value === "beverages" || value === "drink"
    )
  ) {
    return "Beverages";
  }
  if (
    normalizedCandidates.some(
      (value) => value === "snacks" || value === "snack"
    )
  ) {
    return "Snacks";
  }
  if (normalizedCandidates.some((value) => value === "soup")) {
    return "Soup";
  }
  if (normalizedCandidates.some((value) => value === "dessert")) {
    return "Dessert";
  }
  if (normalizedCandidates.some((value) => value === "sauce")) {
    return "Sauce";
  }
  if (normalizedCandidates.some((value) => value === "nonveg")) {
    return "NonVeg";
  }

  return fallback;
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

const formatMinutes = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Number(value)} min`;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      if (item && typeof item === "object") {
        const candidate = item as {
          title?: string;
          description?: string;
          instruction?: string;
          step?: number;
        };

        const heading = candidate.title || candidate.instruction;
        const body = candidate.description || "";

        if (heading && body) {
          return `${heading}: ${body}`;
        }

        return heading || body || "";
      }

      return "";
    })
    .filter(Boolean);
};

const normalizeRecipeSteps = (value: unknown): RecipePlanStep[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as {
        step?: number;
        title?: string;
        description?: string;
        instruction?: string;
      };

      const title =
        candidate.title || candidate.instruction || `Step ${index + 1}`;
      const description = candidate.description || candidate.instruction || "";

      if (!title && !description) {
        return null;
      }

      return {
        step: Number(candidate.step ?? index + 1),
        title,
        description,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
};

const buildRecipeTips = (
  apiArticle: Record<string, any>,
  fallback: RecipePlanDetail
) => {
  const tips = [
    apiArticle?.pro_tip
      ? {
          key: "pro_tip",
          title: "Pro Tip",
          description: String(apiArticle.pro_tip),
          icon: "sparkles-outline",
        }
      : null,
    apiArticle?.fast_track
      ? {
          key: "fast_track",
          title: "Fast Track",
          description: String(apiArticle.fast_track),
          icon: "flash-outline",
        }
      : null,
    apiArticle?.bio_hacker
      ? {
          key: "bio_hacker",
          title: "Bio Hacker",
          description: String(apiArticle.bio_hacker),
          icon: "pulse-outline",
        }
      : null,
  ].filter(Boolean) as RecipePlanDetail["tips"];

  if (tips.length > 0) {
    return tips;
  }

  return fallback.tips;
};

const createEmptyRecipePlan = (id = ""): RecipePlanDetail => ({
  id,
  title: "Recipe details unavailable",
  subtitle: "Open a recipe from the list to load it.",
  category: "",
  mealSlot: "Recipe",
  filterKey: "Lunch",
  image: require("@/assets/images/mt.jpg"),
  imageFit: "cover",
  prepTime: "—",
  calories: 0,
  favorite: false,
  nutrition: {
    calories: "0",
    protein: "0g",
    carbs: "0g",
    fats: "0g",
  },
  description: "We could not load this recipe yet.",
  ingredients: [],
  process: [],
  tips: [],
  wisdomTitle: "Nutritional Wisdom",
  wisdom: "The full recipe will appear once the API responds.",
  ctaLabel: "Add to Meal Plan",
});

const normalizeNutrition = (
  value: unknown,
  fallback: RecipePlanDetail["nutrition"]
): RecipePlanDetail["nutrition"] => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const candidate = value as {
      calories?: string | number;
      protein?: string | number;
      carbs?: string | number;
      fats?: string | number;
    };

    return {
      calories: String(candidate.calories ?? fallback.calories),
      protein: String(candidate.protein ?? fallback.protein),
      carbs: String(candidate.carbs ?? fallback.carbs),
      fats: String(candidate.fats ?? fallback.fats),
    };
  }

  return fallback;
};

const normalizeRecipeFromApi = (
  apiArticle: Record<string, any>,
  fallback: RecipePlanDetail
): RecipePlanDetail => {
  const categoryText = getCategoryText(apiArticle?.category);
  const mealSlotText = getCategoryText(apiArticle?.meal_slot);
  const difficultyLevel = String(apiArticle?.difficulty_level ?? "").trim();
  const ingredients = toStringArray(apiArticle?.ingredients_json);
  const steps = normalizeRecipeSteps(apiArticle?.steps_json);
  const tips = buildRecipeTips(apiArticle, fallback);
  const context = String(apiArticle?.context ?? "").trim();
  const prepTimeMinutes = Number(apiArticle?.prep_time_minutes ?? NaN);
  const activeTimeMinutes = Number(apiArticle?.active_time_minutes ?? NaN);
  const shortDescription =
    apiArticle?.short_description ||
    apiArticle?.description ||
    fallback.description;
  const totalTimeMinutes = Number(apiArticle?.total_time_minutes ?? NaN);

  return {
    ...fallback,
    id: String(apiArticle?.id ?? fallback.id),
    title: apiArticle?.title || apiArticle?.name || fallback.title,
    subtitle:
      [categoryText || formatLabel(mealSlotText), difficultyLevel]
        .filter(Boolean)
        .join(" • ") || fallback.subtitle,
    category: categoryText || fallback.category,
    mealSlot: formatLabel(mealSlotText) || fallback.mealSlot,
    filterKey: normalizeFilterKey(
      apiArticle?.category,
      fallback.filterKey,
      apiArticle?.meal_slot
    ),
    image: resolveImageSource(
      apiArticle?.image || apiArticle?.imageUri,
      fallback.image
    ),
    imageFit: apiArticle?.imageFit || fallback.imageFit,
    prepTime:
      !Number.isNaN(prepTimeMinutes) && prepTimeMinutes >= 0
        ? formatMinutes(prepTimeMinutes)
        : apiArticle?.prep_time || apiArticle?.prepTime || fallback.prepTime,
    prepTimeMinutes: Number.isNaN(prepTimeMinutes)
      ? fallback.prepTimeMinutes
      : prepTimeMinutes,
    activeTimeMinutes: Number.isNaN(activeTimeMinutes)
      ? fallback.activeTimeMinutes
      : activeTimeMinutes,
    totalTimeMinutes: Number.isNaN(totalTimeMinutes)
      ? fallback.totalTimeMinutes
      : totalTimeMinutes,
    calories: Number(apiArticle?.calories ?? fallback.calories),
    favorite: Boolean(
      apiArticle?.favorite ??
        apiArticle?.is_favorite ??
        apiArticle?.is_favorited ??
        fallback.favorite
    ),
    avgRating: String(apiArticle?.avg_rating ?? fallback.avgRating ?? "0.00"),
    reviewsCount: Number(
      apiArticle?.reviews_count ?? fallback.reviewsCount ?? 0
    ),
    favoritesCount: Number(
      apiArticle?.favorites_count ?? fallback.favoritesCount ?? 0
    ),
    viewsCount: Number(apiArticle?.views_count ?? fallback.viewsCount ?? 0),
    nutrition: normalizeNutrition(
      apiArticle?.nutrition_json,
      fallback.nutrition
    ),
    description: shortDescription || fallback.description,
    context: context || fallback.context,
    ingredients: ingredients.length > 0 ? ingredients : fallback.ingredients,
    ingredientsJson: ingredients,
    process:
      steps.length > 0
        ? steps.map((step) =>
            step.description ? `${step.title}: ${step.description}` : step.title
          )
        : fallback.process,
    stepsJson: steps,
    tips,
    wisdomTitle: context ? "Context" : fallback.wisdomTitle,
    wisdom: context || fallback.wisdom,
    ctaLabel:
      apiArticle?.ctaLabel || apiArticle?.action_button || fallback.ctaLabel,
    tagsJson: toStringArray(apiArticle?.tags_json),
  };
};

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  const params = useLocalSearchParams<{
    id?: string | string[];
    recipeData?: string | string[];
  }>();
  const idParam = getStringParam(params.id);
  const recipePreview = useMemo(
    () => parseJsonParam(params.recipeData),
    [params.recipeData]
  );

  const fallbackDetail = useMemo(
    () => {
      const emptyRecipePlan = createEmptyRecipePlan(idParam ?? "");

      return recipePreview
        ? normalizeRecipeFromApi(recipePreview, emptyRecipePlan)
        : emptyRecipePlan;
    },
    [idParam, recipePreview]
  );

  const [detail, setDetail] = useState<RecipePlanDetail>(fallbackDetail);
  const [isFavorite, setIsFavorite] = useState(fallbackDetail.favorite);
  const [loading, setLoading] = useState(!__DEV__);
  const [favoriteModal, setFavoriteModal] = useState<FavoriteModalState>({
    visible: false,
    status: "loading",
    title: "",
    message: "",
  });
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const favoriteRequestInFlight = useRef(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const fallbackRecipe = fallbackDetail;

      if (!idParam) {
        if (!active) return;
        setDetail(fallbackRecipe);
        setIsFavorite(fallbackRecipe.favorite);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await getRecipeDetails(idParam);
        const apiArticle: any =
          res && typeof res === "object" && "data" in res ? res.data : res;

        if (apiArticle && typeof apiArticle === "object") {
          const normalized = normalizeRecipeFromApi(apiArticle, fallbackRecipe);
          if (!active) return;
          setDetail(normalized);
          setIsFavorite(normalized.favorite);
          return;
        }

        console.warn("[RecipeDetail] recipe detail response was empty", res);

        if (!active) return;
        setDetail(fallbackRecipe);
        setIsFavorite(fallbackRecipe.favorite);
      } catch (error) {
        console.warn("[RecipeDetail] load failed", error);
        if (!active) return;
        setDetail(fallbackRecipe);
        setIsFavorite(fallbackRecipe.favorite);
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
    () =>
      detail.prepTimeMinutes != null ||
      detail.activeTimeMinutes != null ||
      detail.totalTimeMinutes != null ||
      Boolean(detail.mealSlot)
        ? [
            {
              label: "Meal",
              value: detail.mealSlot || detail.category || "Recipe",
            },
            {
              label: "Prep",
              value: formatMinutes(detail.prepTimeMinutes),
            },
            {
              label: "Active",
              value: formatMinutes(detail.activeTimeMinutes),
            },
            {
              label: "Total",
              value: formatMinutes(detail.totalTimeMinutes),
            },
          ]
        : [
            { label: "Calories", value: detail.nutrition.calories },
            { label: "Protein", value: detail.nutrition.protein },
            { label: "Carbs", value: detail.nutrition.carbs },
            { label: "Fats", value: detail.nutrition.fats },
          ],
    [detail]
  );
  const reviewRecipeId = idParam ?? detail.id;

  const onShare = async () => {
    if (!detail.id) {
      return;
    }

    try {
      await Share.share({
        title: detail.title,
        message: `${detail.title}\n\n${detail.subtitle}\n\nNimbus recipe plan`,
      });
    } catch (error) {
      console.warn("[RecipeDetail] share failed", error);
    }
  };

  const closeFavoriteModal = () => {
    setFavoriteModal((current) => ({ ...current, visible: false }));
  };

  const onToggleFavorite = async () => {
    if (!idParam || favoriteModal.visible || favoriteRequestInFlight.current) {
      return;
    }

    const nextFavorite = !isFavorite;
    const loadingTitle = nextFavorite
      ? "Adding to favorites"
      : "Removing from favorites";
    const loadingMessage = nextFavorite
      ? "Saving this recipe to your favorite list..."
      : "Removing this recipe from your favorite list...";

    setFavoriteModal({
      visible: true,
      status: "loading",
      title: loadingTitle,
      subtitle: "Please wait while we sync your favorites.",
      message: loadingMessage,
    });
    favoriteRequestInFlight.current = true;

    try {
      const response = await setRecipeFavoriteState(idParam, nextFavorite);
      const successTitle = nextFavorite
        ? "Added to favorites"
        : "Removed from favorites";
      const successMessage =
        response?.message?.trim() ||
        (nextFavorite
          ? "This recipe has been added to your favorite recipes."
          : "This recipe has been removed from your favorite recipes.");

      setIsFavorite(nextFavorite);
      setDetail((current) => ({
        ...current,
        favorite: nextFavorite,
      }));

      setFavoriteModal({
        visible: true,
        status: "success",
        title: successTitle,
        subtitle: "Your favorites list has been updated.",
        message: successMessage,
        actionLabel: "Done",
      });
    } catch (error) {
      console.warn("[RecipeDetail] favorite update failed", error);
      setFavoriteModal({
        visible: true,
        status: "error",
        title: "Unable to update favorite",
        subtitle: "Please try again.",
        message: buildErrorMessage(error),
        actionLabel: "Close",
      });
    } finally {
      favoriteRequestInFlight.current = false;
    }
  };

  const onOpenReview = () => {
    if (!reviewRecipeId) {
      return;
    }

    setIsReviewModalVisible(true);
  };

  const onAddToMealPlan = () => {
    if (!detail.id) {
      return;
    }

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
                  icon: "star-outline",
                  accessibilityLabel: "Open review form",
                  onPress: onOpenReview,
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
                { paddingBottom: insets.bottom + spacing.xl * 3 },
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

              {detail.id ? (
                <RecipeMealPlanButton
                  label={detail.ctaLabel}
                  onPress={onAddToMealPlan}
                />
              ) : null}
            </ScrollView>
          </>
        )}
        <ProcessingModal
          visible={favoriteModal.visible}
          status={favoriteModal.status}
          title={favoriteModal.title}
          subtitle={favoriteModal.subtitle}
          message={favoriteModal.message}
          actionLabel={favoriteModal.actionLabel}
          onActionPress={closeFavoriteModal}
          onRequestClose={closeFavoriteModal}
        />
        <RecipeReviewModal
          visible={isReviewModalVisible}
          recipeId={reviewRecipeId}
          recipeTitle={detail.title}
          onClose={() => setIsReviewModalVisible(false)}
        />
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
      // flex: 1,
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
      // paddingHorizontal: spacing.lg,
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
