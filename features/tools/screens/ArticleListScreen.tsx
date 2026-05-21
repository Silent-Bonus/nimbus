import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

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
import { getArticleList } from "@/features/tools/services/toolService";
import {
  MOCK_ARTICLE_ITEMS,
  type ArticleCardItem,
  buildArticleCardItem,
} from "@/features/tools/data/articleLibrary";
import type { Spacing, SvaColorSet } from "@/theme/types";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
  { label: "Herbs", value: "Herbs" },
  { label: "Mindfulness", value: "Mindfulness" },
  { label: "Meditation", value: "Meditation" },
  { label: "Epigenetics", value: "Epigenetics" },
  { label: "Neuroplasticity", value: "Neuroplasticity" },
] as const satisfies readonly PillFilterOption<string>[];

type FilterLabel = (typeof FILTER_OPTIONS)[number]["value"];

const FILTER_MAP: Record<
  Exclude<FilterLabel, "favorites">,
  string | undefined
> = {
  all: undefined,
  Herbs: "healingHerbs",
  Mindfulness: "mindfullness",
  Meditation: "meditation",
  Epigenetics: "epigenetics",
  Neuroplasticity: "neuroplasticity",
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getFilterLabel = (value: FilterLabel) =>
  FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "Articles";

export const ArticleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);
  const searchInputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterLabel>("all");
  const [articles, setArticles] = useState<ArticleCardItem[]>(
    __DEV__ ? MOCK_ARTICLE_ITEMS : []
  );
  const [isLoading, setIsLoading] = useState(!__DEV__);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const fetchArticles = async (filter: Exclude<FilterLabel, "favorites">) => {
    try {
      setIsLoading(true);
      const categorySlug = FILTER_MAP[filter];
      const result: any = await getArticleList(categorySlug);
      const data = result?.data || (Array.isArray(result) ? result : []);

      if (Array.isArray(data)) {
        setArticles(
          data.map((item: Record<string, any>) =>
            buildArticleCardItem(item, filter === "all" ? "Article" : filter)
          )
        );
      } else {
        console.error("Article API did not return data array:", result);
        setArticles([]);
      }
    } catch (err) {
      console.log("Article API error", err);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (__DEV__) {
      setIsLoading(false);
      setArticles(MOCK_ARTICLE_ITEMS);
      return;
    }

    fetchArticles("all");
  }, []);

  const handleFilterPress = (label: FilterLabel) => {
    setSelectedFilter(label);

    if (__DEV__ || label === "favorites") {
      return;
    }

    fetchArticles(label);
  };

  const handleItemClick = (item: ArticleCardItem) => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_ARTICLE_DETAIL,
      params: { id: item.id },
    });
  };

  const filteredArticles = useMemo(() => {
    const normalizedQuery = normalize(query);
    const categoryFilteredArticles =
      __DEV__ && selectedFilter !== "all" && selectedFilter !== "favorites"
        ? articles.filter(
            (item) =>
              item.raw.filterKey === selectedFilter ||
              item.raw.category === selectedFilter
          )
        : selectedFilter === "favorites"
        ? articles.filter((item) => item.favorite)
        : articles;

    if (!normalizedQuery) return categoryFilteredArticles;

    return categoryFilteredArticles.filter((item) => {
      const searchBlob = normalize(
        [item.title, ...item.tags, item.raw.category, item.raw.description]
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
        options={FILTER_OPTIONS}
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
          selectedFilter === "all"
            ? "No articles found."
            : selectedFilter === "favorites"
            ? "No favorite articles found."
            : `No ${getFilterLabel(selectedFilter).toLowerCase()} articles found.`
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
