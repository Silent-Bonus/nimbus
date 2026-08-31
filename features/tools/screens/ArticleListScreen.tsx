import React, {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { Image as ExpoImage } from "expo-image";

import ProtocolTemplateCard from "@/components/common/ProtocolTemplateCard";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import PillFilters, {
  type PillFilterOption,
} from "@/components/ui/PillFilters";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/features/tools/components/common/EmptyState";
import { RoutineSkeletonGrid } from "@/features/tools/components/common/RoutineSkeletonGrid";
import { ROUTES } from "@/constants/routes";
import {
  getFavoriteNewsletterList,
  getNewsletterCategories,
  getNewsletterList,
} from "@/features/tools/services/toolService";
import {
  type ArticleCardItem,
  buildArticleCardItem,
  getRemoteArticleImageUri,
} from "@/features/tools/data/articleLibrary";
import type { NewsletterCategory } from "@/features/tools/types/toolsTypes";
import type { Spacing, SvaColorSet } from "@/theme/types";

const STATIC_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
] as const satisfies readonly PillFilterOption<string>[];
const SEARCH_MIN_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 350;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getFilterLabel = (
  value: string,
  options: readonly PillFilterOption<string>[]
) => options.find((option) => option.value === value)?.label ?? "Articles";

const isNewsletterCategoryFilter = (value: string) =>
  value !== "all" && value !== "favorites";

const getErrorMessage = (error: unknown) => {
  const normalizeErrorString = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (/<!doctype html>|<html|<body|<title>/i.test(trimmed)) {
      return "The newsletter service returned a 404 page. Verify the API route and try again.";
    }

    return trimmed;
  };

  if (typeof error === "string" && error.trim()) {
    return normalizeErrorString(error);
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      detail?: unknown;
      error?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return normalizeErrorString(candidate.message);
    }

    if (typeof candidate.detail === "string" && candidate.detail.trim()) {
      return normalizeErrorString(candidate.detail);
    }

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return normalizeErrorString(candidate.error);
    }
  }

  return "Try again after checking the newsletter service response.";
};

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

const getNewsletterCategoryLabel = (category: NewsletterCategory) => {
  if (typeof category.label === "string" && category.label.trim()) {
    return category.label.trim();
  }

  if (typeof category.value === "string" && category.value.trim()) {
    return category.value.trim();
  }

  return "";
};

const buildCategoryFilterOptionsFromCategories = (
  categories: NewsletterCategory[]
): PillFilterOption<string>[] => {
  const uniqueCategories = categories.reduce<NewsletterCategory[]>(
    (acc, category) => {
      const label = getNewsletterCategoryLabel(category);
      if (!label) {
        return acc;
      }

      const normalizedLabel = normalize(label);
      if (acc.some((item) => normalize(getNewsletterCategoryLabel(item)) === normalizedLabel)) {
        return acc;
      }

      acc.push(category);
      return acc;
    },
    []
  );

  return uniqueCategories
    .sort((a, b) => {
      return getNewsletterCategoryLabel(a).localeCompare(
        getNewsletterCategoryLabel(b)
      );
    })
    .map((category) => {
      const label = getNewsletterCategoryLabel(category);

      return {
        label,
        value: label,
        accessibilityLabel: `${label} articles`,
      };
    });
};

const buildCategoryFilterOptionsFromArticles = (
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

const filterArticlesByQuery = (items: ArticleCardItem[], query: string) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
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
};

export const ArticleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);
  const searchInputRef = useRef<TextInput>(null);
  const baseRequestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);
  const [refreshTick, setRefreshTick] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [baseArticles, setBaseArticles] = useState<ArticleCardItem[]>([]);
  const [searchArticles, setSearchArticles] = useState<ArticleCardItem[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<
    PillFilterOption<string>[]
  >([]);
  const [baseLoading, setBaseLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(
    null
  );
  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = deferredQuery.replace(/\s+/g, " ").trim();
  const searchActive = trimmedQuery.length >= SEARCH_MIN_LENGTH;
  const visibleArticles = searchActive ? searchArticles : baseArticles;
  const isLoading = searchActive ? searchLoading : baseLoading;
  const activeErrorMessage = searchActive ? searchErrorMessage : errorMessage;
  const fallbackCategoryFilters = useMemo(
    () => buildCategoryFilterOptionsFromArticles(baseArticles),
    [baseArticles]
  );
  const filterOptions = useMemo(
    () => [
      ...STATIC_FILTER_OPTIONS,
      ...(categoryFilters.length > 0
        ? categoryFilters
        : fallbackCategoryFilters),
    ],
    [categoryFilters, fallbackCategoryFilters]
  );

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setRefreshTick((current) => current + 1);
    }, [])
  );

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const result = await getNewsletterCategories();
        const data = result?.data || (Array.isArray(result) ? result : []);

        if (!active) return;

        if (Array.isArray(data)) {
          setCategoryFilters(buildCategoryFilterOptionsFromCategories(data));
        } else {
          console.error(
            "Newsletter category API did not return data array:",
            result
          );
          setCategoryFilters([]);
        }
      } catch (err) {
        console.log("Newsletter category API error", err);
        if (active) {
          setCategoryFilters([]);
        }
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const requestId = baseRequestIdRef.current + 1;
    baseRequestIdRef.current = requestId;

    const loadBaseArticles = async () => {
      try {
        setBaseLoading(true);
        setErrorMessage(null);

        const result =
          selectedFilter === "favorites"
            ? await getFavoriteNewsletterList()
            : await getNewsletterList(
                isNewsletterCategoryFilter(selectedFilter)
                  ? { category: selectedFilter }
                  : undefined
              );
        const data = result?.data || (Array.isArray(result) ? result : []);

        if (!active || baseRequestIdRef.current !== requestId) return;

        if (Array.isArray(data)) {
          setBaseArticles(
            data.map((item: Record<string, any>) =>
              buildArticleCardItem(item, "Article")
            )
          );
          return;
        }

        console.error("Newsletter API did not return data array:", result);
        setBaseArticles([]);
        setErrorMessage("The newsletter response did not include a valid list.");
      } catch (err) {
        console.log("Newsletter API error", err);
        if (active && baseRequestIdRef.current === requestId) {
          setBaseArticles([]);
          setErrorMessage(getErrorMessage(err));
        }
      } finally {
        if (active && baseRequestIdRef.current === requestId) {
          setBaseLoading(false);
        }
      }
    };

    void loadBaseArticles();

    return () => {
      active = false;
    };
  }, [refreshTick, selectedFilter]);

  useEffect(() => {
    let active = true;
    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const loadSearchArticles = async () => {
      if (!searchActive) {
        setSearchLoading(false);
        setSearchErrorMessage(null);
        setSearchArticles([]);
        return;
      }

      if (selectedFilter === "favorites") {
        setSearchLoading(false);
        setSearchErrorMessage(null);
        setSearchArticles(filterArticlesByQuery(baseArticles, trimmedQuery));
        return;
      }

      try {
        setSearchLoading(true);
        setSearchErrorMessage(null);

        const result = await getNewsletterList({
          category: isNewsletterCategoryFilter(selectedFilter)
            ? selectedFilter
            : undefined,
          search: trimmedQuery,
        });
        const data = result?.data || (Array.isArray(result) ? result : []);

        if (!active || searchRequestIdRef.current !== requestId) return;

        if (Array.isArray(data)) {
          setSearchArticles(
            data.map((item: Record<string, any>) =>
              buildArticleCardItem(item, "Article")
            )
          );
          return;
        }

        console.error("Newsletter search API did not return data array:", result);
        setSearchArticles([]);
        setSearchErrorMessage(
          "The newsletter search response did not include a valid list."
        );
      } catch (err) {
        console.log("Newsletter search API error", err);
        if (active && searchRequestIdRef.current === requestId) {
          setSearchArticles([]);
          setSearchErrorMessage(getErrorMessage(err));
        }
      } finally {
        if (active && searchRequestIdRef.current === requestId) {
          setSearchLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadSearchArticles();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [baseArticles, searchActive, selectedFilter, trimmedQuery]);

  useEffect(() => {
    const uris = visibleArticles
      .map((item) => getRemoteArticleImageUri(item.image))
      .filter((uri): uri is string => Boolean(uri))
      .slice(0, 12);

    if (uris.length === 0) {
      return;
    }

    // Warm the first visible remote images so search result swaps feel faster.
    void ExpoImage.prefetch(uris);
  }, [visibleArticles]);

  const handleFilterPress = useCallback((label: string) => {
    setSelectedFilter(label);
  }, []);

  const handleItemClick = useCallback((item: ArticleCardItem) => {
    const params: { id: string; slug?: string } = { id: item.id };

    if (typeof item.raw?.slug === "string" && item.raw.slug.trim()) {
      params.slug = item.raw.slug;
    }

    router.push({
      pathname: ROUTES.AUTH.TOOLS_ARTICLE_DETAIL,
      params,
    });
  }, []);

  const renderHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <ScreenHeader
          title="Article Library"
          subtitle="Deep dives into healing, neuroscience, and mindful living."
          onBack={() => navigation.goBack()}
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
            clearButtonMode="never"
            style={styles.searchInput}
          />
          {searchLoading ? (
            <ActivityIndicator
              size="small"
              color={svaColors.text.secondary}
              style={styles.searchSpinner}
            />
          ) : null}
          {!!query && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
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

        {query.trim() && !searchActive ? (
          <Text style={styles.searchHint}>
            Type at least {SEARCH_MIN_LENGTH} characters to search.
          </Text>
        ) : null}

        <PillFilters
          options={filterOptions}
          selectedValue={selectedFilter}
          onChange={handleFilterPress}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersRow}
        />
      </View>
    ),
    [
      filterOptions,
      handleFilterPress,
      navigation,
      query,
      selectedFilter,
      searchActive,
      searchLoading,
      styles,
      svaColors.text.secondary,
    ]
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
    ) : activeErrorMessage ? (
      <EmptyState
        title="Unable to load newsletters."
        subtitle={activeErrorMessage}
        color={svaColors.text.secondary}
      />
    ) : (
      <EmptyState
        title={
          searchActive
            ? `No articles found for "${trimmedQuery}".`
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
      <View style={styles.root}>
        <FlatList
          data={isLoading ? [] : visibleArticles}
          keyExtractor={(item) => item.id}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => (
            <ProtocolTemplateCard
              item={item}
              style={styles.cardCell}
              onPress={() => handleItemClick(item)}
            />
          )}
        />
      </View>
    </ScreenView>
  );
};

const styling = (colors: SvaColorSet, spacing: Spacing) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
    },
    root: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    listContent: {
      paddingTop: spacing.xs,
      paddingBottom: Platform.OS === "ios" ? 120 : 140,
    },
    headerBlock: {
      marginBottom: spacing.md,
    },
    headerContainer: {
      marginBottom: spacing.sm,
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
      marginBottom: spacing.sm,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      height: "100%",
      paddingVertical: 0,
      marginLeft: spacing.sm,
      color: colors.text.primary,
      fontSize: 15,
      fontFamily: "Outfit_400Regular",
      textAlignVertical: "center",
    },
    searchSpinner: {
      marginLeft: spacing.xs,
    },
    clearButton: {
      marginLeft: spacing.xs,
    },
    searchHint: {
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
      fontFamily: "Outfit_400Regular",
    },
    filtersContainer: {
      height: 72,
      marginBottom: spacing.sm,
    },
    filtersRow: {
      minHeight: 72,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      paddingRight: spacing.md,
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
