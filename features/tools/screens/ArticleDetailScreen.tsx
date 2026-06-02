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
import { getNewsletterDetails } from "@/features/tools/services/toolService";
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
  type ArticleDetail,
  type ArticleReflectionPrompt,
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

const formatPublishedDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const pickText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
};

const isCallToActionHeading = (value: string) =>
  /^(the\s+)?call\s+to\s+action(?:\s*\(cta\))?$/i.test(value);

const stripBracketedText = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^\[(.*)\]$/);
  return match ? match[1].trim() : trimmed;
};

const normalizeCallToActionPrompt = (
  source: unknown,
  fallback: ArticleReflectionPrompt
): ArticleReflectionPrompt => {
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const block = source as Record<string, unknown>;
    return {
      eyebrow: pickText(block.eyebrow, fallback.eyebrow, "Next Step"),
      title: pickText(block.title, fallback.title, "Ready to take action?"),
      prompt: pickText(block.prompt, block.description, fallback.prompt),
      helper: pickText(block.helper, block.body, fallback.helper),
      actionLabel: pickText(
        block.actionLabel,
        block.action_label,
        fallback.actionLabel
      ),
    };
  }

  if (typeof source !== "string") {
    return fallback;
  }

  const raw = source.trim();
  if (!raw) {
    return fallback;
  }

  const blocks = raw
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return fallback;
  }

  let actionLabel = fallback.actionLabel;
  const lastBlock = blocks[blocks.length - 1];
  if (/^\[.*\]$/.test(lastBlock)) {
    actionLabel = stripBracketedText(lastBlock);
    blocks.pop();
  }

  const firstBlockLines = blocks[0]
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  while (firstBlockLines.length > 0 && isCallToActionHeading(firstBlockLines[0])) {
    firstBlockLines.shift();
  }

  const title = firstBlockLines.shift() || fallback.title;
  const prompt = firstBlockLines.join(" ") || fallback.prompt;
  const helper = blocks
    .slice(1)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");

  return {
    eyebrow: pickText(fallback.eyebrow, "Next Step"),
    title: pickText(title, fallback.title, "Ready to take action?"),
    prompt: pickText(prompt, fallback.prompt),
    helper: pickText(helper, fallback.helper),
    actionLabel: pickText(actionLabel, fallback.actionLabel),
  };
};

const normalizeReflectionPromptQuote = (
  source: unknown,
  fallback: string
) => {
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const block = source as Record<string, unknown>;
    return pickText(
      block.prompt,
      block.description,
      block.helper,
      fallback
    );
  }

  if (typeof source !== "string") {
    return fallback;
  }

  const lines = source.split(/\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex < 0) {
    return fallback;
  }

  const body = lines.slice(firstContentIndex + 1).join("\n").trim();
  return body || lines[firstContentIndex].trim() || fallback;
};

const createEmptyArticleDetail = (id = ""): ArticleDetail => ({
  id,
  title: "Newsletter details unavailable",
  subtitle: "Open a newsletter to load the article.",
  category: "Newsletter",
  readingTime: "—",
  authorName: "Nimbus Editorial",
  authorRole: "Newsletter",
  heroImage: require("@/assets/images/mt.jpg"),
  heroImageFit: "cover",
  contextCard: {
    primaryLabel: "Category",
    primaryValue: "Newsletter",
    secondaryLabel: "Published",
    secondaryValue: "—",
    description: "The excerpt will appear here once the newsletter loads.",
  },
  content: [
    "We could not load the full article content yet.",
  ],
  pullQuote: "Read the full article once the content is available.",
  reflectionPrompt: {
    eyebrow: "Reflection Prompt",
    title: "Reload the article",
    prompt: "Open the newsletter again to see its reflection prompt.",
    helper: "The API will populate this section when the article loads.",
    actionLabel: "Continue",
  },
  callToAction: {
    eyebrow: "Next Step",
    title: "Ready to take action?",
    prompt: "Open the newsletter again to see its call to action.",
    helper: "The API will populate this section when the article loads.",
    actionLabel: "Continue",
  },
  recommendationLabel: "Continue Exploration",
  recommendation: {
    id: "",
    title: "Browse the newsletter library",
    subtitle: "Find another article to explore.",
    tag: "Newsletter",
    image: require("@/assets/images/mt.jpg"),
    imageFit: "cover",
  },
  tags: [],
  favorite: false,
  saveLabel: "Save",
});

const splitArticleContent = (value: unknown, title?: string) => {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  const chunks = value
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.flatMap((chunk, index) => {
    const lines = chunk
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (index === 0 && title) {
      const normalizedTitle = title.trim().toLowerCase();
      if (lines[0]?.toLowerCase() === normalizedTitle) {
        lines.shift();
      }
    }

    const paragraph = lines.join(" ");
    return paragraph ? [paragraph] : [];
  });
};

const normalizeArticleFromApi = (
  apiArticle: Record<string, any>,
  fallback: ArticleDetail
): ArticleDetail => {
  const sectionSource = apiArticle?.section_data;
  const contentFromString = splitArticleContent(
    apiArticle?.content || apiArticle?.body || apiArticle?.email_content,
    apiArticle?.title
  );
  const content =
    Array.isArray(sectionSource) && sectionSource.length > 0
      ? sectionSource
          .map((section: any) => String(section?.content ?? section?.title ?? ""))
          .filter(Boolean)
      : contentFromString.length > 0
        ? contentFromString
        : Array.isArray(apiArticle?.content)
        ? apiArticle.content.map((item: any) => String(item))
        : fallback.content;

  const authorInfo = apiArticle?.author_info;
  const readingLabel =
    formatPublishedDate(apiArticle?.published_at) || fallback.readingTime;
  const categoryText = pickText(apiArticle?.category, fallback.category);
  const subtitleText = pickText(
    apiArticle?.email_subject,
    apiArticle?.subtitle,
    apiArticle?.tagline,
    categoryText,
    fallback.subtitle
  );
  const excerptText = pickText(
    apiArticle?.excerpt,
    apiArticle?.description,
    contentFromString[0],
    fallback.contextCard.description
  );
  const reflectionSource =
    (apiArticle?.reflectionPrompt &&
    typeof apiArticle.reflectionPrompt === "object"
      ? apiArticle.reflectionPrompt
      : null) ||
    (apiArticle?.reflection_prompt &&
    typeof apiArticle.reflection_prompt === "object"
      ? apiArticle.reflection_prompt
      : null);
  const reflectionPrompt = pickText(
    reflectionSource?.prompt,
    typeof apiArticle?.reflectionPrompt === "string"
      ? apiArticle.reflectionPrompt
      : null,
    typeof apiArticle?.reflection_prompt === "string"
      ? apiArticle.reflection_prompt
      : null,
    apiArticle?.question,
    fallback.reflectionPrompt.prompt
  );
  const callToAction = normalizeCallToActionPrompt(
    apiArticle?.callToAction ?? apiArticle?.call_to_action,
    {
      ...fallback.callToAction,
    }
  );
  const pullQuoteText = normalizeReflectionPromptQuote(
    apiArticle?.reflectionPrompt ?? apiArticle?.reflection_prompt,
    fallback.pullQuote
  );

  return {
    ...fallback,
    id: String(apiArticle?.id ?? fallback.id),
    title: apiArticle?.title || apiArticle?.name || fallback.title,
    subtitle: subtitleText,
    category: categoryText,
    readingTime: readingLabel,
    authorName:
      authorInfo?.name ||
      authorInfo?.full_name ||
      apiArticle?.author_name ||
      "Nimbus Editorial",
    authorRole:
      authorInfo?.title ||
      authorInfo?.designation ||
      apiArticle?.author_role ||
      "Newsletter",
    heroImage: resolveImageSource(
      apiArticle?.image || apiArticle?.imageUri,
      fallback.heroImage
    ),
    heroImageFit: apiArticle?.imageFit || fallback.heroImageFit,
    contextCard: {
      primaryLabel: "Category",
      primaryValue: categoryText || "Newsletter",
      secondaryLabel: "Published",
      secondaryValue: readingLabel,
      description: excerptText,
    },
    content,
    pullQuote: pullQuoteText,
    reflectionPrompt: {
      ...fallback.reflectionPrompt,
      eyebrow: pickText(
        reflectionSource?.eyebrow,
        apiArticle?.reflectionPromptEyebrow,
        apiArticle?.reflection_prompt_eyebrow,
        fallback.reflectionPrompt.eyebrow
      ),
      title: pickText(
        reflectionSource?.title,
        apiArticle?.reflectionPromptTitle,
        apiArticle?.reflection_prompt_title,
        fallback.reflectionPrompt.title
      ),
      prompt: reflectionPrompt,
      helper: pickText(
        reflectionSource?.helper,
        apiArticle?.reflectionPromptHelper,
        apiArticle?.reflection_prompt_helper,
        fallback.reflectionPrompt.helper
      ),
      actionLabel: pickText(
        reflectionSource?.actionLabel,
        reflectionSource?.action_label,
        fallback.reflectionPrompt.actionLabel
      ),
    },
    callToAction,
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

  const params = useLocalSearchParams<{
    id?: string | string[];
    slug?: string | string[];
  }>();
  const idParam = getStringParam(params.id);
  const slugParam = getStringParam(params.slug);
  const detailLookupKey = slugParam ?? idParam;

  const fallbackDetail = useMemo(
    () => createEmptyArticleDetail(detailLookupKey ?? idParam ?? ""),
    [detailLookupKey, idParam]
  );

  const [detail, setDetail] = useState<ArticleDetail>(fallbackDetail);
  const [isSaved, setIsSaved] = useState(fallbackDetail.favorite);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const fallbackArticle = fallbackDetail;

      if (!detailLookupKey) {
        if (!active) return;
        setDetail(fallbackArticle);
        setIsSaved(fallbackArticle.favorite);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await getNewsletterDetails(detailLookupKey);
        const apiArticle: any =
          res && typeof res === "object" && "data" in res ? res.data : res;

        if (apiArticle && typeof apiArticle === "object") {
          const normalized = normalizeArticleFromApi(apiArticle, fallbackArticle);
          if (!active) return;
          setDetail(normalized);
          setIsSaved(normalized.favorite);
          return;
        }

        console.warn("[ArticleDetail] newsletter response was empty", res);

        if (!active) return;
        setDetail(fallbackArticle);
        setIsSaved(fallbackArticle.favorite);
      } catch (error) {
        console.warn("[ArticleDetail] load failed", error);
        if (!active) return;
        setDetail(fallbackArticle);
        setIsSaved(fallbackArticle.favorite);
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
  }, [detailLookupKey, fallbackDetail]);

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
    if (!detail.id) {
      return;
    }

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
    Alert.alert(detail.callToAction.title, detail.callToAction.helper);
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
