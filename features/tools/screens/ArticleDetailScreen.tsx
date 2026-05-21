import React, { useContext, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { getArticleDetails } from "@/features/tools/services/toolService";
import {
  ArticleBodyCopy,
  ArticleContextCard,
  ArticleDetailHero,
  ArticleDetailSection,
  ArticlePullQuote,
  ArticleRecommendationCard,
  ArticleReflectionCard,
} from "@/features/tools/components/article-detail";
import {
  DEFAULT_ARTICLE_DETAIL,
  getArticleDetailById,
  type ArticleDetail,
} from "@/features/tools/data/articleDetails";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

const FAVORITES_KEY = "favorites_v1";

const getStringParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

const resolveImageSource = (image: unknown, fallback: ArticleDetail["heroImage"]) => {
  if (!image) return fallback;
  if (typeof image === "string") return { uri: image };
  if (typeof image === "object") {
    const candidate = image as { uri?: string; url?: string; path?: string };
    if (typeof candidate.uri === "string") return { uri: candidate.uri };
    if (typeof candidate.url === "string") return { uri: candidate.url };
    if (typeof candidate.path === "string") return { uri: candidate.path };
  }
  return fallback;
};

const normalizeArticleFromApi = (
  apiArticle: Record<string, any>,
  fallback: ArticleDetail
): ArticleDetail => {
  const sectionSource = apiArticle?.section_data;
  const content =
    Array.isArray(sectionSource) && sectionSource.length > 0
      ? sectionSource
          .map((section: any) => String(section?.content ?? section?.title ?? ""))
          .filter(Boolean)
      : Array.isArray(apiArticle?.content)
        ? apiArticle.content.map((item: any) => String(item))
        : fallback.content;

  const authorInfo = apiArticle?.author_info;

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
    readingTime:
      apiArticle?.meta_info?.time ||
      apiArticle?.read_time ||
      apiArticle?.time ||
      fallback.readingTime,
    authorName:
      authorInfo?.name ||
      authorInfo?.full_name ||
      apiArticle?.author_name ||
      fallback.authorName,
    authorRole:
      authorInfo?.title ||
      authorInfo?.designation ||
      apiArticle?.author_role ||
      fallback.authorRole,
    heroImage: resolveImageSource(
      apiArticle?.image || apiArticle?.imageUri,
      fallback.heroImage
    ),
    heroImageFit: apiArticle?.imageFit || fallback.heroImageFit,
    contextCard: {
      ...fallback.contextCard,
      description:
        apiArticle?.context ||
        apiArticle?.description ||
        fallback.contextCard.description,
    },
    content,
    pullQuote: apiArticle?.pullQuote || fallback.pullQuote,
    reflectionPrompt: {
      ...fallback.reflectionPrompt,
      prompt:
        apiArticle?.reflectionPrompt ||
        apiArticle?.question ||
        fallback.reflectionPrompt.prompt,
    },
    recommendationLabel:
      apiArticle?.recommendationLabel || fallback.recommendationLabel,
    recommendation: fallback.recommendation,
    tags: fallback.tags,
    favorite: Boolean(
      apiArticle?.favorite ?? apiArticle?.is_favorite ?? fallback.favorite
    ),
    saveLabel: apiArticle?.saveLabel || fallback.saveLabel,
  };
};

const ArticleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = getStringParam(params.id);

  const fallbackDetail = useMemo(
    () => getArticleDetailById(idParam) ?? DEFAULT_ARTICLE_DETAIL,
    [idParam]
  );

  const [detail, setDetail] = useState<ArticleDetail>(fallbackDetail);
  const [isSaved, setIsSaved] = useState(fallbackDetail.favorite);
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
        setIsSaved(mockDetail.favorite);
        setLoading(false);
        return;
      }

      if (!idParam) {
        if (!active) return;
        setDetail(mockDetail);
        setIsSaved(mockDetail.favorite);
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
            const normalized = normalizeArticleFromApi(apiArticle, mockDetail);
            if (!active) return;
            setDetail(normalized);
            setIsSaved(normalized.favorite);
            return;
          }
        }

        if (!active) return;
        setDetail(mockDetail);
        setIsSaved(mockDetail.favorite);
      } catch (error) {
        console.warn("[ArticleDetail] load failed", error);
        if (!active) return;
        setDetail(mockDetail);
        setIsSaved(mockDetail.favorite);
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

  useEffect(() => {
    let active = true;

    const checkIfSaved = async () => {
      if (!detail.id) return;
      try {
        const raw = await AsyncStorage.getItem(FAVORITES_KEY);
        const favs = raw ? JSON.parse(raw) : [];
        if (!active) return;
        setIsSaved(Array.isArray(favs) ? favs.map(String).includes(detail.id) : false);
      } catch (error) {
        console.warn("[ArticleDetail] favorite check failed", error);
      }
    };

    void checkIfSaved();

    return () => {
      active = false;
    };
  }, [detail.id]);

  const onToggleSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      let favs: string[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(favs)) favs = [];

      if (favs.includes(detail.id)) {
        favs = favs.filter((item) => item !== detail.id);
      } else {
        favs = [detail.id, ...favs];
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
      setIsSaved((current) => !current);
    } catch (error) {
      console.warn("[ArticleDetail] save toggle failed", error);
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

  const onRecommendationPress = () => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_ARTICLE_DETAIL,
      params: { id: detail.recommendation.id },
    });
  };

  const onReflectionAction = () => {
    Alert.alert(
      detail.reflectionPrompt.title,
      detail.reflectionPrompt.helper
    );
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
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
                eyebrow={detail.contextCard.eyebrow}
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

            <ArticleReflectionCard
              eyebrow={detail.reflectionPrompt.eyebrow}
              title={detail.reflectionPrompt.title}
              prompt={detail.reflectionPrompt.prompt}
              helper={detail.reflectionPrompt.helper}
              actionLabel={detail.reflectionPrompt.actionLabel}
              onActionPress={onReflectionAction}
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

            <NimbusButton
              label={isSaved ? "Saved" : detail.saveLabel}
              onPress={onToggleSave}
              variant="outline"
              leftIcon={
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={svaColors.brand.primary}
                />
              }
              style={styles.saveButton}
            />
          </>
        )}
      </ScrollView>
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
      paddingHorizontal: spacing.lg,
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
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
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
    saveButton: {
      alignSelf: "center",
      minWidth: 152,
    },
  });

export default ArticleDetailScreen;
