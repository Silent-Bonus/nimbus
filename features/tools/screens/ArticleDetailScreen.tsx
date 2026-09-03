import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/components/layout/AppHeader";
import ProcessingModal from "@/components/ui/modal/ProcessingModal";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import {
  addNewsletterFavorite,
  getNewsletterDetails,
} from "@/features/tools/services/newsletterService";
import {
  ArticleBodyCopy,
  ArticleContextCard,
  ArticleDetailHero,
  ArticleDetailSection,
  ArticlePullQuote,
  ArticleRecommendationCard,
  ArticleReflectionCard,
  ArticleReviewModal,
  ArticleReviewPanel,
} from "@/features/tools/components/article-detail";
import { type ArticleDetail } from "@/features/tools/data/articleDetails";
import type { NewsletterReviewCreateResponse } from "@/features/tools/types/newsletterTypes";
import {
  type ArticleReviewSummaryState,
  buildArticleActionErrorMessage,
  buildArticleReviewSummaryState,
  createEmptyArticleDetail,
  getArticleRouteParam,
  normalizeArticleFromApi,
  pickArticleText,
} from "@/features/tools/utils/articleDetail";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type FavoriteModalStatus = "loading" | "success" | "error";

type FavoriteModalState = {
  visible: boolean;
  status: FavoriteModalStatus;
  title: string;
  subtitle?: string;
  message: string;
  actionLabel?: string;
};

const ArticleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  // The route can carry both id and slug, but the newsletter detail endpoint
  // resolves by slug on the backend.
  const params = useLocalSearchParams<{
    id?: string | string[];
    slug?: string | string[];
  }>();
  const idParam = getArticleRouteParam(params.id);
  const slugParam = getArticleRouteParam(params.slug);
  const detailLookupKey = slugParam ?? idParam;

  const fallbackDetail = useMemo(
    () =>
      createEmptyArticleDetail(detailLookupKey ?? slugParam ?? idParam ?? ""),
    [detailLookupKey, idParam, slugParam]
  );

  // Keep the screen renderable even before the API resolves by seeding the UI
  // with a safe fallback article model.
  const [detail, setDetail] = useState<ArticleDetail>(fallbackDetail);
  const [isSaved, setIsSaved] = useState(fallbackDetail.favorite);
  const [loading, setLoading] = useState(true);
  const [favoriteModal, setFavoriteModal] = useState<FavoriteModalState>({
    visible: false,
    status: "loading",
    title: "",
    message: "",
  });
  const [reviewSlug, setReviewSlug] = useState<string | null>(slugParam);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ArticleReviewSummaryState>(
    {
      avgRating: null,
      avgClarityScore: null,
      avgHelpfulnessScore: null,
      reviewsCount: 0,
      recommendationCount: 0,
      recommendationRate: null,
    }
  );
  const favoriteRequestInFlight = useRef(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const fallbackArticle = fallbackDetail;

      // If navigation params are missing, render the fallback state instead of
      // leaving the screen in a loading loop.
      if (!detailLookupKey) {
        if (!active) return;
        setDetail(fallbackArticle);
        setIsSaved(fallbackArticle.favorite);
        setReviewSlug(null);
        setReviewSummary(buildArticleReviewSummaryState());
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await getNewsletterDetails(detailLookupKey);
        const apiArticle: any =
          res && typeof res === "object" && "data" in res ? res.data : res;

        if (apiArticle && typeof apiArticle === "object") {
          // Normalize the API payload once so the rest of the screen can render
          // against a stable local detail shape.
          const normalized = normalizeArticleFromApi(
            apiArticle,
            fallbackArticle
          );
          if (!active) return;
          setDetail(normalized);
          setIsSaved(normalized.favorite);
          // Review and favorite endpoints also key off slug, so prefer the
          // canonical slug returned by the detail response.
          setReviewSlug(pickArticleText(apiArticle?.slug, slugParam) || null);
          setReviewSummary(
            buildArticleReviewSummaryState(
              apiArticle?.review_summary,
              apiArticle
            )
          );
          return;
        }

        console.warn("[ArticleDetail] newsletter response was empty", res);

        if (!active) return;
        setDetail(fallbackArticle);
        setIsSaved(fallbackArticle.favorite);
        setReviewSlug(slugParam ?? null);
        setReviewSummary(buildArticleReviewSummaryState());
      } catch (error) {
        console.warn("[ArticleDetail] load failed", error);
        if (!active) return;
        setDetail(fallbackArticle);
        setIsSaved(fallbackArticle.favorite);
        setReviewSlug(slugParam ?? null);
        setReviewSummary(buildArticleReviewSummaryState());
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
  }, [detailLookupKey, fallbackDetail, slugParam]);

  const closeFavoriteModal = () => {
    setFavoriteModal((current) => ({ ...current, visible: false }));
  };

  const onToggleSave = async () => {
    // Prevent duplicate favorite requests and avoid firing actions until the
    // backend slug is known.
    if (
      !reviewSlug ||
      favoriteModal.visible ||
      favoriteRequestInFlight.current
    ) {
      return;
    }

    const loadingTitle = isSaved
      ? "Refreshing favorites"
      : "Adding to favorites";
    const loadingMessage = isSaved
      ? "Checking your favorite status for this newsletter..."
      : "Saving this newsletter to your favorites...";

    setFavoriteModal({
      visible: true,
      status: "loading",
      title: loadingTitle,
      subtitle: "Please wait while we sync your favorites.",
      message: loadingMessage,
    });
    favoriteRequestInFlight.current = true;

    try {
      const response = await addNewsletterFavorite(reviewSlug);
      const resolvedFavorite = Boolean(response?.data?.is_favorited ?? true);
      const successMessage =
        response?.message?.trim() ||
        "Newsletter added to favorites successfully.";

      setIsSaved(resolvedFavorite);
      setFavoriteModal({
        visible: true,
        status: "success",
        title: resolvedFavorite ? "Added to favorites" : "Favorites updated",
        subtitle: "Your favorites list has been updated.",
        message: successMessage,
        actionLabel: "Done",
      });
    } catch (error) {
      console.warn("[ArticleDetail] favorite update failed", error);
      setFavoriteModal({
        visible: true,
        status: "error",
        title: "Unable to update favorite",
        subtitle: "Please try again.",
        message: buildArticleActionErrorMessage(error),
        actionLabel: "Close",
      });
    } finally {
      favoriteRequestInFlight.current = false;
    }
  };

  const onShare = async () => {
    try {
      await Share.share({
        title: detail.title,
        message: `${detail.title}\n\n${detail.subtitle}\n\nNimbus article detail`,
      });
    } catch (error) {
      console.warn("[ArticleDetail] share failed", error);
    }
  };

  const onOpenReview = () => {
    if (!reviewSlug) {
      Alert.alert(
        "Review unavailable",
        "Please wait for the newsletter details to finish loading."
      );
      return;
    }

    setIsReviewModalVisible(true);
  };

  const onReviewSubmitSuccess = (response: NewsletterReviewCreateResponse) => {
    const createdReview = response?.data;

    if (!createdReview) {
      return;
    }

    setReviewSummary((current) => {
      // Update aggregate review stats locally so the screen reflects the new
      // submission immediately without a follow-up fetch.
      const nextCount = current.reviewsCount + 1;
      const currentAverage = current.avgRating ?? 0;
      const currentClarity = current.avgClarityScore ?? 0;
      const currentHelpfulness = current.avgHelpfulnessScore ?? 0;
      const currentRecommendationCount = current.recommendationCount;
      const nextAverage =
        current.reviewsCount > 0 && Number.isFinite(currentAverage)
          ? (currentAverage * current.reviewsCount + createdReview.rating) /
            nextCount
          : createdReview.rating;
      const nextClarity =
        current.reviewsCount > 0 && Number.isFinite(currentClarity)
          ? (currentClarity * current.reviewsCount +
              createdReview.clarity_score) /
            nextCount
          : createdReview.clarity_score;
      const nextHelpfulness =
        current.reviewsCount > 0 && Number.isFinite(currentHelpfulness)
          ? (currentHelpfulness * current.reviewsCount +
              createdReview.helpfulness_score) /
            nextCount
          : createdReview.helpfulness_score;
      const nextRecommendationCount =
        currentRecommendationCount + (createdReview.would_recommend ? 1 : 0);
      const nextRecommendationRate =
        nextCount > 0 ? nextRecommendationCount / nextCount : 0;

      return {
        avgRating: nextAverage,
        avgClarityScore: nextClarity,
        avgHelpfulnessScore: nextHelpfulness,
        reviewsCount: nextCount,
        recommendationCount: nextRecommendationCount,
        recommendationRate: nextRecommendationRate,
      };
    });
  };

  const favoriteModalMessage = useMemo(() => {
    if (favoriteModal.status !== "success") {
      return favoriteModal.message;
    }

    return (
      <View style={styles.favoriteResultWrap}>
        <Text style={styles.favoriteResultMessage}>
          {favoriteModal.message}
        </Text>
        <View style={styles.favoriteResultPill}>
          <Text style={styles.favoriteResultPillText}>
            {isSaved ? "Saved in favorites" : "Favorite updated"}
          </Text>
        </View>
      </View>
    );
  }, [favoriteModal.message, favoriteModal.status, isSaved, styles]);

  const onRecommendationPress = () => {
    if (!detail.recommendation.id) {
      router.push({
        pathname: ROUTES.AUTH.TOOLS_ARTICLE_LIST,
      });
      return;
    }

    router.push({
      pathname: ROUTES.AUTH.TOOLS_ARTICLE_DETAIL,
      params: { id: detail.recommendation.id },
    });
  };

  const onCallToActionPress = () => {
    if (detail.callToAction.actionUrl) {
      // Some newsletters include a real CTA destination. Only fall back to
      // informational copy when the API does not provide a URL.
      void Linking.openURL(detail.callToAction.actionUrl).catch((error) => {
        console.warn("[ArticleDetail] CTA open failed", error);
        Alert.alert(
          "Unable to open link",
          detail.callToAction.helper || "Please try again in a moment."
        );
      });
      return;
    }

    Alert.alert(detail.callToAction.title, detail.callToAction.helper);
  };

  const shouldShowReflectionPrompt =
    // The fallback article always includes placeholder reflection text. Render
    // the section only when the API replaced that placeholder with real copy.
    detail.reflectionPrompt.title !== fallbackDetail.reflectionPrompt.title ||
    detail.reflectionPrompt.prompt !== fallbackDetail.reflectionPrompt.prompt ||
    detail.reflectionPrompt.helper !== fallbackDetail.reflectionPrompt.helper;

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xl * 2.5 },
          ]}
        >
          <AppHeader
            title=""
            subtitle=""
            onBack={() => router.back()}
            rightActions={[
              {
                icon: isSaved ? "bookmark" : "bookmark-outline",
                accessibilityLabel: "Toggle save",
                onPress: onToggleSave,
              },
              {
                icon: reviewSummary.reviewsCount > 0 ? "star" : "star-outline",
                accessibilityLabel: "Open review form",
                onPress: onOpenReview,
              },
              {
                icon: "share-outline",
                accessibilityLabel: "Share article",
                onPress: onShare,
              },
            ]}
            containerStyle={styles.header}
            titleStyle={styles.hiddenHeaderText}
            subtitleStyle={styles.hiddenHeaderText}
          />

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={svaColors.brand.primary} />
            </View>
          ) : (
            <>
              {/* Render the article in content order: hero, context, body, social proof, then actions. */}
              <ArticleDetailHero
                image={detail.heroImage}
                title={detail.title}
                subtitle={detail.subtitle}
                category={detail.category}
                readingTime={detail.readingTime}
                authorName={detail.authorName}
                authorRole={detail.authorRole}
              />

              <ArticleDetailSection eyebrow="Context">
                <ArticleContextCard
                  primaryLabel={detail.contextCard.primaryLabel}
                  primaryValue={detail.contextCard.primaryValue}
                  secondaryLabel={detail.contextCard.secondaryLabel}
                  secondaryValue={detail.contextCard.secondaryValue}
                  description={detail.contextCard.description}
                />
              </ArticleDetailSection>

              <ArticleDetailSection eyebrow="Content">
                <ArticleBodyCopy paragraphs={detail.content} />
              </ArticleDetailSection>

              <ArticlePullQuote quote={detail.pullQuote} />

              <ArticleDetailSection eyebrow="Reviews">
                <ArticleReviewPanel
                  summary={{
                    avg_rating: reviewSummary.avgRating ?? 0,
                    avg_clarity_score: reviewSummary.avgClarityScore ?? 0,
                    avg_helpfulness_score:
                      reviewSummary.avgHelpfulnessScore ?? 0,
                    reviews_count: reviewSummary.reviewsCount,
                    recommendation_count: reviewSummary.recommendationCount,
                    recommendation_rate: reviewSummary.recommendationRate ?? 0,
                  }}
                />
              </ArticleDetailSection>

              {shouldShowReflectionPrompt ? (
                <ArticleReflectionCard
                  eyebrow={detail.reflectionPrompt.eyebrow}
                  title={detail.reflectionPrompt.title}
                  prompt={detail.reflectionPrompt.prompt}
                  helper={detail.reflectionPrompt.helper}
                  actionLabel={detail.reflectionPrompt.actionLabel}
                  onActionPress={() =>
                    Alert.alert(
                      detail.reflectionPrompt.title,
                      detail.reflectionPrompt.helper
                    )
                  }
                />
              ) : null}

              <ArticleReflectionCard
                eyebrow={detail.callToAction.eyebrow}
                title={detail.callToAction.title}
                prompt={detail.callToAction.prompt}
                helper={detail.callToAction.helper}
                actionLabel={detail.callToAction.actionLabel}
                onActionPress={onCallToActionPress}
              />

              <ArticleDetailSection eyebrow={detail.recommendationLabel}>
                <ArticleRecommendationCard
                  title={detail.recommendation.title}
                  subtitle={detail.recommendation.subtitle}
                  tag={detail.recommendation.tag}
                  image={detail.recommendation.image}
                  imageFit={detail.recommendation.imageFit}
                  onPress={onRecommendationPress}
                />
              </ArticleDetailSection>

              <View style={styles.footerBadge}>
                <Text style={styles.footerBadgeText}>
                  {detail.category.toUpperCase()} · HUMAN OS
                </Text>
              </View>
            </>
          )}
        </ScrollView>
        <ArticleReviewModal
          visible={isReviewModalVisible}
          newsletterSlug={reviewSlug}
          articleTitle={detail.title}
          onSubmitSuccess={onReviewSubmitSuccess}
          onClose={() => setIsReviewModalVisible(false)}
        />
        <ProcessingModal
          visible={favoriteModal.visible}
          status={favoriteModal.status}
          title={favoriteModal.title}
          subtitle={favoriteModal.subtitle}
          message={favoriteModalMessage}
          actionLabel={favoriteModal.actionLabel}
          onActionPress={closeFavoriteModal}
          onRequestClose={closeFavoriteModal}
        />
      </>
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
    content: {
      paddingHorizontal: spacing.md,
      gap: spacing.xl,
    },
    header: {
      marginBottom: spacing.sm,
    },
    hiddenHeaderText: {
      fontSize: 0,
      lineHeight: 0,
      opacity: 0,
      margin: 0,
      padding: 0,
    },
    loadingWrap: {
      minHeight: 460,
      alignItems: "center",
      justifyContent: "center",
    },
    footerBadge: {
      alignSelf: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.muted,
      backgroundColor: colors.surface.raised,
    },
    footerBadgeText: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_600SemiBold",
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 2.2,
      color: colors.brand.primary,
      textTransform: "uppercase",
    },
    favoriteResultWrap: {
      alignItems: "center",
      gap: spacing.md,
    },
    favoriteResultMessage: {
      color: colors.text.primary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      fontFamily:
        typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
    },
    favoriteResultPill: {
      borderRadius: 999,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border.muted,
      backgroundColor: colors.surface.raised,
    },
    favoriteResultPillText: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_600SemiBold",
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      color: colors.brand.primary,
      textTransform: "uppercase",
    },
  });

export default ArticleDetailScreen;
