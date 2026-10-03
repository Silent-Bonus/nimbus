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
import { getNewsletterList } from "@/features/tools/services/newsletterService";
import type { ArticleCardItem } from "@/features/tools/utils/articleList";
import { buildArticleCardItem } from "@/features/tools/utils/articleList";
import type { SvaColorSet, Spacing, TypographyTokens } from "@/theme/types";

export default function ArticleHighlightsRail() {
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const [articles, setArticles] = useState<ArticleCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useMemo(
    () => makeStyles(svaColors, svaTypography, spacing),
    [svaColors, svaTypography, spacing]
  );

  useEffect(() => {
    let active = true;

    const loadArticles = async () => {
      try {
        const response = await getNewsletterList();
        if (active) {
          setArticles(
            response.success && Array.isArray(response.data)
              ? response.data
                  .slice(0, 10)
                  .map((article) => buildArticleCardItem(article, "Article"))
              : []
          );
        }
      } catch (error) {
        console.warn("Unable to load featured articles:", error);
        if (active) setArticles([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadArticles();
    return () => {
      active = false;
    };
  }, []);

  const openArticle = (article: ArticleCardItem) => {
    const params: { id: string; slug?: string } = { id: article.id };
    if (typeof article.raw.slug === "string" && article.raw.slug.trim()) {
      params.slug = article.raw.slug;
    }
    router.push({ pathname: ROUTES.AUTH.TOOLS_ARTICLE_DETAIL, params });
  };

  if (!loading && articles.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>IDEAS FOR A CLEARER DAY</Text>
          <Text style={styles.heading}>Articles to explore</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all articles"
          onPress={() => router.push(ROUTES.AUTH.TOOLS_ARTICLE_LIST as never)}
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
        Thoughtful reads on wellbeing, healing, and mindful living.
      </Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={svaColors.brand.primary} />
          <Text style={styles.loadingText}>Gathering articles…</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {articles.map((article) => (
            <ProtocolTemplateCard
              key={article.id}
              item={article}
              style={styles.articleCard}
              titleNumberOfLines={2}
              onPress={() => openArticle(article)}
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
    articleCard: {
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
