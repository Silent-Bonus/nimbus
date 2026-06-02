import React, { useContext, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";

import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import PillFilters, {
  type PillFilterOption,
} from "@/components/ui/PillFilters";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/features/tools/components/common/EmptyState";
import ProtocolTemplateCard from "@/features/tools/components/common/ProtocolTemplateCard";
import { RoutineSkeletonGrid } from "@/features/tools/components/common/RoutineSkeletonGrid";
import { ROUTES } from "@/constants/routes";
import { getNewsletterList } from "@/features/tools/services/toolService";
import { type ArticleCardItem, buildArticleCardItem } from "@/features/tools/data/articleLibrary";
import type { Spacing, SvaColorSet } from "@/theme/types";

const FAVORITES_KEY = "favorites_v1";
const STATIC_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
] as const satisfies readonly PillFilterOption<string>[];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getFilterLabel = (
  value: string,
  options: readonly PillFilterOption<string>[]
) => options.find((option) => option.value === value)?.label ?? "Articles";

const getArticleCategoryText = (category: unknown) => {
  if (typeof category === "string") {
    return category.trim();
  }

  if (category && typeof category === "object") {
    const candidate = category as { name?: string; slug?: string };
    return (candidate.name || candidate.slug || "").trim();
  }

  return "";
};

const buildCategoryFilterOptions = (
  articles: ArticleCardItem[]
): PillFilterOption<string>[] => {
  const seen = new Set<string>();
  const options: PillFilterOption<string>[] = [];

  articles.forEach((item) => {
    const category = getArticleCategoryText(item.raw?.category);
    if (!category) {
      return;
    }

    const normalized = category.toLowerCase();
    if (seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    options.push({
      label: category,
      value: category,
      accessibilityLabel: `${category} articles`,
    });
  });

  return options
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const ArticleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);
  const searchInputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [articles, setArticles] = useState<ArticleCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categoryFilters = useMemo(
    () => buildCategoryFilterOptions(articles),
    [articles]
  );
  const filterOptions = useMemo(
    () => [...STATIC_FILTER_OPTIONS, ...categoryFilters],
    [categoryFilters]
  );

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const loadArticles = async () => {
        try {
          setIsLoading(true);

          const [favoritesRaw, result] = await Promise.all([
            AsyncStorage.getItem(FAVORITES_KEY),
            getNewsletterList(),
          ]);
          let favoriteIdsArray: unknown[] = [];

          try {
            const parsedFavorites = favoritesRaw
              ? JSON.parse(favoritesRaw)
              : [];
            favoriteIdsArray = Array.isArray(parsedFavorites)
              ? parsedFavorites
              : [];
          } catch (parseError) {
            console.warn("[ArticleList] favorite cache parse failed", parseError);
          }

          const favoriteIds = new Set(
            favoriteIdsArray.map((item) => String(item))
          );
          const data = result?.data || (Array.isArray(result) ? result : []);

          if (!active) return;

          if (Array.isArray(data)) {
            const mappedArticles = data.map((item: Record<string, any>) => {
              const card = buildArticleCardItem(item, "Article");
              return {
                ...card,
                favorite:
                  favoriteIds.has(card.id) ||
                  Boolean(item?.favorite ?? item?.is_favorite ?? false),
              };
            });

            setArticles(mappedArticles);
          } else {
            console.error("Article API did not return data array:", result);
            setArticles([]);
          }
        } catch (err) {
          console.log("Article API error", err);
          if (active) {
            setArticles([]);
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

      void loadArticles();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleFilterPress = (label: string) => {
    setSelectedFilter(label);
  };

  const handleItemClick = (item: ArticleCardItem) => {
    const params: { id: string; slug?: string } = { id: item.id };

    if (typeof item.raw?.slug === "string" && item.raw.slug.trim()) {
      params.slug = item.raw.slug;
    }

    router.push({
      pathname: ROUTES.AUTH.TOOLS_ARTICLE_DETAIL,
      params,
    });
  };

  const filteredArticles = useMemo(() => {
    const normalizedQuery = normalize(query);
    const categoryFilteredArticles =
      selectedFilter === "favorites"
        ? articles.filter((item) => item.favorite)
        : selectedFilter === "all"
        ? articles
        : articles.filter((item) =>
            normalize(getArticleCategoryText(item.raw?.category)) ===
            normalize(selectedFilter)
          );

    if (!normalizedQuery) return categoryFilteredArticles;

    return categoryFilteredArticles.filter((item) => {
      const searchBlob = normalize(
        [
          item.title,
          ...item.tags,
          getArticleCategoryText(item.raw?.category),
          item.raw?.excerpt,
          item.raw?.content,
          item.raw?.slug,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return searchBlob.includes(normalizedQuery);
    });
  }, [articles, query, selectedFilter]);

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <ScreenHeader
        title="Article Library"
        subtitle="Deep dives into healing, neuroscience, and mindful living."
        onBack={() => navigation.goBack()}
        rightActions={[
          {
            icon: "search-outline",
            accessibilityLabel: "Focus search",
            onPress: () => searchInputRef.current?.focus(),
          },
          {
            icon: "bookmark-outline",
            accessibilityLabel: "Saved articles",
            onPress: () => console.log("[ArticleList] bookmark pressed"),
          },
        ]}
        containerStyle={styles.headerContainer}
      />

      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color={svaColors.text.secondary}
        />
        <TextInput
          ref={searchInputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search articles, topics, tags"
          placeholderTextColor={svaColors.text.secondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {!!query && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={svaColors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <PillFilters
        options={filterOptions}
        selectedValue={selectedFilter}
        onChange={handleFilterPress}
        contentContainerStyle={styles.filtersRow}
      />
    </View>
  );

  const renderEmpty = () =>
    isLoading ? (
      <RoutineSkeletonGrid
        spacing={spacing}
        theme={{
          surfaceMuted: svaColors.surface.base,
          surface: svaColors.surface.base,
          divider: svaColors.border.default,
        }}
      />
    ) : (
      <EmptyState
        title={
          query.trim()
            ? `No articles found for "${query.trim()}".`
            : selectedFilter === "favorites"
            ? "No favorite articles found."
            : selectedFilter === "all"
            ? "No articles found."
            : `No ${getFilterLabel(
                selectedFilter,
                filterOptions
              ).toLowerCase()} articles found.`
        }
        subtitle="Try switching filters or checking back later for new reads."
        color={svaColors.text.secondary}
      />
    );

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={styles.listHeaderComponent}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <ProtocolTemplateCard
            item={item}
            style={styles.cardCell}
            onPress={() => handleItemClick(item)}
          />
        )}
      />
    </ScreenView>
  );
};

const styling = (colors: SvaColorSet, spacing: Spacing) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === "ios" ? 120 : 140,
    },
    listHeaderComponent: {
      marginBottom: spacing.md,
    },
    headerBlock: {},
    headerContainer: {
      marginBottom: spacing.md,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 18,
      height: 54,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text.primary,
      fontSize: 15,
      fontFamily: "Outfit_400Regular",
    },
    clearButton: {
      marginLeft: spacing.xs,
    },
    filtersRow: {
      paddingBottom: spacing.xs,
    },
    columnWrapper: {
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    cardCell: {
      width: "48%",
    },
  });

export default ArticleListScreen;
