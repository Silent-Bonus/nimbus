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
import type { PillFilterOption } from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import PillFilters from "@/components/ui/PillFilters";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/features/tools/components/common/EmptyState";
import { LibraryCardSkeletonGrid } from "@/features/tools/components/common/LibraryCardSkeletonGrid";
import { ROUTES } from "@/constants/routes";
import {
  getFavoriteNewsletterList,
  getNewsletterCategories,
  getNewsletterList,
} from "@/features/tools/services/newsletterService";
import {
  SEARCH_MIN_LENGTH,
  STATIC_ARTICLE_FILTER_OPTIONS,
  type ArticleCardItem,
  buildArticleCategoryFilterOptionsFromCategories,
  buildArticleCardItem,
  getArticleErrorMessage,
  getArticleFilterLabel,
  getRemoteArticleImageUri,
  isArticleCategoryFilter,
} from "@/features/tools/utils/articleList";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";
const SEARCH_DEBOUNCE_MS = 350;

export const ArticleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);
  const searchInputRef = useRef<TextInput>(null);
  const baseRequestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);
  const hasCompletedInitialFocusRef = useRef(false);
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
  const filterOptions = useMemo(
    () => [...STATIC_ARTICLE_FILTER_OPTIONS, ...categoryFilters],
    [categoryFilters]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (hasCompletedInitialFocusRef.current) {
        setRefreshTick((current) => current + 1);
      } else {
        hasCompletedInitialFocusRef.current = true;
      }
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
          setCategoryFilters(
            buildArticleCategoryFilterOptionsFromCategories(data)
          );
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
                isArticleCategoryFilter(selectedFilter)
                  ? { category: selectedFilter }
                  : undefined
              );
        const data = result?.data || (Array.isArray(result) ? result : []);

        // Ignore stale responses when the user changes filters or refocuses quickly.
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
        setErrorMessage(
          "The newsletter response did not include a valid list."
        );
      } catch (err) {
        console.log("Newsletter API error", err);
        if (active && baseRequestIdRef.current === requestId) {
          setBaseArticles([]);
          setErrorMessage(getArticleErrorMessage(err));
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
        setSearchLoading(true);
        setSearchErrorMessage(null);
      }

      try {
        const result =
          selectedFilter === "favorites"
            ? await getFavoriteNewsletterList({ search: trimmedQuery })
            : await getNewsletterList({
                category: isArticleCategoryFilter(selectedFilter)
                  ? selectedFilter
                  : undefined,
                search: trimmedQuery,
              });
        const data = result?.data || (Array.isArray(result) ? result : []);

        // Search requests are debounced, but older network responses can still arrive after newer ones.
        if (!active || searchRequestIdRef.current !== requestId) return;

        if (Array.isArray(data)) {
          setSearchArticles(
            data.map((item: Record<string, any>) =>
              buildArticleCardItem(item, "Article")
            )
          );
          return;
        }

        console.error(
          selectedFilter === "favorites"
            ? "Favorite newsletter search API did not return data array:"
            : "Newsletter search API did not return data array:",
          result
        );
        setSearchArticles([]);
        setSearchErrorMessage(
          selectedFilter === "favorites"
            ? "The favorite newsletter search response did not include a valid list."
            : "The newsletter search response did not include a valid list."
        );
      } catch (err) {
        console.log(
          selectedFilter === "favorites"
            ? "Favorite newsletter search API error"
            : "Newsletter search API error",
          err
        );
        if (active && searchRequestIdRef.current === requestId) {
          setSearchArticles([]);
          setSearchErrorMessage(getArticleErrorMessage(err));
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
  }, [searchActive, selectedFilter, trimmedQuery]);

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
      <LibraryCardSkeletonGrid
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
            : `No ${getArticleFilterLabel(
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
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      borderRadius: 18,
      height: 54,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    searchInput: {
      ...(typography?.textStyle?.body ?? {}),
      flex: 1,
      minWidth: 0,
      height: "100%",
      paddingVertical: 0,
      marginLeft: spacing.sm,
      color: colors.text.primary,
      textAlignVertical: "center",
    },
    searchSpinner: {
      marginLeft: spacing.xs,
    },
    clearButton: {
      marginLeft: spacing.xs,
    },
    searchHint: {
      ...(typography?.textStyle?.caption ??
        typography?.textStyle?.authTinyLabel ??
        {}),
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
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
