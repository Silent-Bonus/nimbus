import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
} from "@/features/tools/services/recipeService";
import {
  RecipeDetailHero,
  RecipeDetailLoadingSections,
  RecipeDetailSection,
  RecipeIngredientList,
  RecipeMealPlanButton,
  RecipeProcessList,
  RecipeReviewModal,
  RecipeTipCards,
  RecipeWisdomCard,
  type RecipeNutritionStat,
} from "@/features/tools/components/recipe-detail";
import ProcessingModal from "@/components/ui/modal/ProcessingModal";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";
import type {
  RecipeDetailItem,
  RecipeDetailRouteParams,
  RecipeDetail,
  RecipeReviewResponse,
} from "@/features/tools/types/recipeTypes";
import {
  buildRecipeActionErrorMessage,
  createEmptyRecipeDetail,
  getRecipeFavoriteStateFromResponse,
  getRecipeFavoritesCountFromResponse,
  formatRecipeMinutes,
  getRecipeReviewCountFromResponse,
  normalizeRecipeFromApi,
  parseRecipePreviewData,
  resolveRecipeDetailLookupKey,
} from "@/features/tools/utils/recipeDetail";

type FavoriteModalStatus = "loading" | "success" | "error";

type FavoriteModalState = {
  visible: boolean;
  status: FavoriteModalStatus;
  title: string;
  subtitle?: string;
  message: string;
  actionLabel?: string;
};

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  const params = useLocalSearchParams<RecipeDetailRouteParams>();
  const { id: idParam, lookupKey } = useMemo(
    () => resolveRecipeDetailLookupKey(params),
    [params]
  );
  const recipePreview = useMemo(
    () => parseRecipePreviewData(params.recipeData),
    [params.recipeData]
  );

  const fallbackDetail = useMemo(() => {
    const emptyRecipeDetail = createEmptyRecipeDetail(idParam ?? "");

    // Use the serialized list payload as an instant placeholder while the
    // detail endpoint loads, then replace it with the full API response.
    return recipePreview
      ? normalizeRecipeFromApi(recipePreview, emptyRecipeDetail)
      : emptyRecipeDetail;
  }, [idParam, recipePreview]);
  const hasPreview = Boolean(recipePreview);

  const [detail, setDetail] = useState<RecipeDetail>(fallbackDetail);
  const [isFavorite, setIsFavorite] = useState(fallbackDetail.favorite);
  const [loading, setLoading] = useState(Boolean(lookupKey));
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

      if (!lookupKey) {
        if (!active) return;
        setDetail(fallbackRecipe);
        setIsFavorite(fallbackRecipe.favorite);
        setLoading(false);
        return;
      }

      // Reset the shell immediately so the user sees the tapped recipe preview
      // while the full detail payload hydrates in the background.
      if (active) {
        setDetail(fallbackRecipe);
        setIsFavorite(fallbackRecipe.favorite);
      }
      setLoading(true);
      try {
        // Reads can hydrate from slug or id, depending on what the route received.
        const res = await getRecipeDetails(lookupKey);
        const apiRecipe: RecipeDetailItem | null =
          res && typeof res === "object" && "data" in res ? res.data : null;

        if (apiRecipe) {
          const normalized = normalizeRecipeFromApi(apiRecipe, fallbackRecipe);
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
  }, [fallbackDetail, lookupKey]);
  const showPreviewSkeletons = loading && hasPreview;
  const showBlockingLoader = loading && !hasPreview;

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
              value: formatRecipeMinutes(detail.prepTimeMinutes),
            },
            {
              label: "Active",
              value: formatRecipeMinutes(detail.activeTimeMinutes),
            },
            {
              label: "Total",
              value: formatRecipeMinutes(detail.totalTimeMinutes),
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
    // Favorite/review mutations still require the numeric recipe id even when
    // the detail page itself was opened from a slug-based route.
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
      const resolvedFavorite = getRecipeFavoriteStateFromResponse(
        response,
        nextFavorite
      );
      const resolvedFavoritesCount = getRecipeFavoritesCountFromResponse(
        response,
        detail.favoritesCount
      );
      const successTitle = nextFavorite
        ? "Added to favorites"
        : "Removed from favorites";
      const successMessage =
        response?.message?.trim() ||
        (nextFavorite
          ? "This recipe has been added to your favorite recipes."
          : "This recipe has been removed from your favorite recipes.");

      setIsFavorite(resolvedFavorite);
      setDetail((current) => ({
        ...current,
        favorite: resolvedFavorite,
        favoritesCount: resolvedFavoritesCount,
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
        message: buildRecipeActionErrorMessage(error),
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

  const onReviewSubmitSuccess = (response: RecipeReviewResponse) => {
    setDetail((current) => ({
      ...current,
      reviewsCount: getRecipeReviewCountFromResponse(
        response,
        current.reviewsCount
      ),
    }));
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} style={styles.screen}>
      <View style={styles.root}>
        {showBlockingLoader ? (
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
                  icon:
                    detail.reviewsCount && Number(detail.reviewsCount) > 0
                      ? "star"
                      : "star-outline",
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

              {showPreviewSkeletons ? (
                <RecipeDetailLoadingSections />
              ) : (
                <>
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
                </>
              )}

              {detail.id && !showPreviewSkeletons ? (
                <View style={styles.ctaWrap}>
                  <RecipeMealPlanButton
                    label={detail.ctaLabel}
                    onPress={onAddToMealPlan}
                  />
                </View>
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
          onSubmitSuccess={onReviewSubmitSuccess}
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
      paddingBottom: spacing.xl,
      gap: spacing.xl,
    },
    ctaWrap: {
      paddingBottom: spacing.xxl,
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
