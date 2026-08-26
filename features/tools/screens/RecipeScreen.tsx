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
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type TextStyle,
  type ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { Image as ExpoImage } from "expo-image";

import ProtocolTemplateCard from "@/components/common/ProtocolTemplateCard";
import { ScreenView } from "@/components/ui/Themed";
import PillFilters, {
  type PillFilterOption,
} from "@/components/ui/PillFilters";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/features/tools/components/common/EmptyState";
import { RoutineSkeletonGrid } from "@/features/tools/components/common/RoutineSkeletonGrid";
import { ROUTES } from "@/constants/routes";
import {
  getFavoriteRecipeList,
  getRecipeCategories,
  getRecipeList,
} from "@/features/tools/services/toolService";
import { type RecipeCardItem } from "@/features/tools/data/recipePlans";
import type { RecipeCategory } from "@/features/tools/types/toolsTypes";
import type { Spacing, SvaColorSet, Typography } from "@/theme/types";

const SEARCH_MIN_LENGTH = 3;

const STATIC_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
] as const satisfies readonly PillFilterOption<string>[];

const getFilterLabel = (
  value: string,
  options: readonly PillFilterOption<string>[]
) => options.find((option) => option.value === value)?.label ?? "Recipes";

const isCategoryFilter = (value: string) =>
  value !== "all" && value !== "favorites";

const buildCategoryFilterOptions = (
  categories: RecipeCategory[]
): PillFilterOption<string>[] => {
  const uniqueCategories = categories.reduce<RecipeCategory[]>(
    (acc, category) => {
      const slug = category.slug?.trim();

      if (!slug) {
        return acc;
      }

      if (acc.some((item) => item.slug === slug)) {
        return acc;
      }

      acc.push({ ...category, slug });
      return acc;
    },
    []
  );

  return uniqueCategories
    .sort((a, b) => {
      const sortOrderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);

      if (sortOrderDiff !== 0) {
        return sortOrderDiff;
      }

      return (a.name || a.slug || "").localeCompare(b.name || b.slug || "");
    })
    .map((category) => {
      const label = category.name?.trim() || category.slug;

      return {
        label,
        value: category.slug,
        accessibilityLabel: `${label} recipes`,
      };
    });
};

const getRecipeCategoryLabel = (category: unknown, fallback: string) => {
  if (typeof category === "string") {
    return category || fallback;
  }

  if (category && typeof category === "object") {
    const candidate = category as { name?: string; slug?: string };
    return candidate.name || candidate.slug || fallback;
  }

  return fallback;
};

const buildRecipeCardItem = (
  item: Record<string, any>,
  fallbackTag: string
): RecipeCardItem => {
  const title = item?.title || item?.name || "Untitled Recipe";
  const categoryLabel = getRecipeCategoryLabel(
    item?.category || item?.meal_slot || item?.filterKey,
    fallbackTag
  );
  const durationLabel =
    item?.total_time_minutes != null && Number(item.total_time_minutes) > 0
      ? `${item.total_time_minutes} min`
      : item?.prep_time ||
        item?.prepTime ||
        item?.time ||
        item?.meta_info?.time ||
        item?.meta_info?.duration ||
        null;
  const ratingLabel =
    item?.avg_rating && item.avg_rating !== "0.00"
      ? `${item.avg_rating} ★`
      : item?.reviews_count
      ? `${item.reviews_count} reviews`
      : null;

  let tags = [categoryLabel, durationLabel, ratingLabel]
    .filter(Boolean)
    .slice(0, 2) as string[];

  if (tags.length === 1) {
    tags =
      tags[0] === fallbackTag ? [tags[0], "Fresh"] : [tags[0], fallbackTag];
  }

  return {
    id: String(item?.id ?? title),
    title,
    image: resolveImageSource(item?.image || item?.imageUri),
    imageFit: item?.imageFit,
    favorite: Boolean(
      item?.favorite ?? item?.is_favorited ?? item?.is_favorite ?? false
    ),
    tags: tags.length > 0 ? tags : [fallbackTag, "Fresh"],
    raw: item,
  };
};

function resolveImageSource(image: unknown): ImageSourcePropType {
  if (!image) {
    return require("@/assets/images/mt.jpg");
  }

  if (typeof image === "string") {
    return { uri: image };
  }

  return image as ImageSourcePropType;
}

const getRemoteImageUri = (image: ImageSourcePropType): string | null => {
  if (typeof image === "number") {
    return null;
  }

  if (Array.isArray(image)) {
    const first = image[0];
    return first ? getRemoteImageUri(first) : null;
  }

  if (image && typeof image === "object") {
    const candidate = image as { uri?: unknown };
    return typeof candidate.uri === "string" ? candidate.uri : null;
  }

  return null;
};

const buildRecipePreviewData = (item: RecipeCardItem) => {
  const raw = item.raw as Record<string, any>;

  return JSON.stringify({
    id: raw?.id ?? item.id,
    slug: raw?.slug ?? null,
    title: item.title,
    short_description: raw?.short_description ?? raw?.description ?? null,
    meal_slot: raw?.meal_slot ?? raw?.filterKey ?? null,
    category: raw?.category ?? null,
    difficulty_level: raw?.difficulty_level ?? "",
    total_time_minutes: raw?.total_time_minutes ?? 0,
    avg_rating: raw?.avg_rating ?? "0.00",
    reviews_count: raw?.reviews_count ?? 0,
    favorites_count: raw?.favorites_count ?? 0,
    is_favorited:
      raw?.is_favorited ?? raw?.favorite ?? raw?.is_favorite ?? item.favorite,
    image:
      typeof raw?.image === "string"
        ? raw.image
        : typeof raw?.imageUri === "string"
        ? raw.imageUri
        : null,
  });
};

export const RecipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography),
    [spacing, svaColors, typography]
  );
  const searchInputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [categoryFilters, setCategoryFilters] = useState<
    PillFilterOption<string>[]
  >([]);
  const [baseRecipes, setBaseRecipes] = useState<RecipeCardItem[]>([]);
  const [searchRecipes, setSearchRecipes] = useState<RecipeCardItem[]>([]);
  const [baseLoading, setBaseLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const filterOptions = useMemo(
    () => [...STATIC_FILTER_OPTIONS, ...categoryFilters],
    [categoryFilters]
  );
  const trimmedQuery = deferredQuery.trim();
  const searchActive = trimmedQuery.length >= SEARCH_MIN_LENGTH;
  const visibleRecipes = searchActive ? searchRecipes : baseRecipes;
  const isLoading = searchActive ? searchLoading : baseLoading;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const result: any = await getRecipeCategories();
        const data = result?.data || (Array.isArray(result) ? result : []);

        if (!active) return;

        if (Array.isArray(data)) {
          setCategoryFilters(buildCategoryFilterOptions(data));
        } else {
          console.error(
            "Recipe category API did not return data array:",
            result
          );
          setCategoryFilters([]);
        }
      } catch (err) {
        console.log("Recipe category API error", err);
        if (active) {
          setCategoryFilters([]);
        }
      }
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadRecipes = async () => {
      try {
        setBaseLoading(true);

        const result: any =
          selectedFilter === "favorites"
            ? await getFavoriteRecipeList()
            : await getRecipeList(
                isCategoryFilter(selectedFilter)
                  ? { category: selectedFilter }
                  : undefined
              );
        const data = result?.data || (Array.isArray(result) ? result : []);

        if (!active) return;

        if (Array.isArray(data)) {
          const mappedRecipes = data.map((item: Record<string, any>) =>
            buildRecipeCardItem(item, "Recipe")
          );
          setBaseRecipes(mappedRecipes);
        } else {
          console.error("Recipe API did not return data array:", result);
          setBaseRecipes([]);
        }
      } catch (err) {
        console.log("Recipe API error", err);
        if (active) {
          setBaseRecipes([]);
        }
      } finally {
        if (active) {
          setBaseLoading(false);
        }
      }
    };

    loadRecipes();
    return () => {
      active = false;
    };
  }, [selectedFilter]);

  useEffect(() => {
    let active = true;
    const loadSearchRecipes = async () => {
      if (!searchActive) {
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);

        const requestParams = isCategoryFilter(selectedFilter)
          ? { category: selectedFilter, search: trimmedQuery }
          : { search: trimmedQuery };

        const result: any = await getRecipeList(requestParams);
        const data = result?.data || (Array.isArray(result) ? result : []);

        if (!active) return;

        if (Array.isArray(data)) {
          const mappedRecipes = data.map((item: Record<string, any>) =>
            buildRecipeCardItem(item, "Recipe")
          );
          const finalRecipes =
            selectedFilter === "favorites"
              ? mappedRecipes.filter((item) => item.favorite)
              : mappedRecipes;

          setSearchRecipes(finalRecipes);
        } else {
          console.error("Recipe API did not return search data array:", result);
          setSearchRecipes([]);
        }
      } catch (err) {
        console.log("Recipe search error", err);
        if (active) {
          setSearchRecipes([]);
        }
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadSearchRecipes();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchActive, selectedFilter, trimmedQuery]);

  useEffect(() => {
    const uris = visibleRecipes
      .map((item) => getRemoteImageUri(item.image))
      .filter((uri): uri is string => Boolean(uri))
      .slice(0, 12);

    if (uris.length === 0) {
      return;
    }

    void ExpoImage.prefetch(uris);
  }, [visibleRecipes]);

  const handleFilterPress = useCallback((label: string) => {
    setSelectedFilter(label);
  }, []);

  const handleItemClick = useCallback((item: RecipeCardItem) => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_RECIPE_DETAIL,
      params: { id: item.id, recipeData: buildRecipePreviewData(item) },
    });
  }, []);

  const renderHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <ScreenHeader
          title="Recipe Plan"
          subtitle="Find recipes that support your routine and nourish you."
          onBack={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
          titleStyle={styles.headerTitle}
        />

        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={svaColors.text.primary}
          />
          <TextInput
            ref={searchInputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes, ingredients, tags"
            placeholderTextColor={svaColors.text.primary}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="search"
            selectionColor={svaColors.brand.primary}
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
    ),
    [
      filterOptions,
      handleFilterPress,
      navigation,
      query,
      selectedFilter,
      styles,
      svaColors.brand.primary,
      svaColors.text.primary,
      svaColors.text.secondary,
    ]
  );

  const renderEmpty = useMemo(
    () =>
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
            searchActive
              ? `No recipes found for "${trimmedQuery}".`
              : selectedFilter === "favorites"
              ? "No favorite recipes found."
              : selectedFilter === "all"
              ? "No recipes found."
              : `No ${getFilterLabel(
                  selectedFilter,
                  filterOptions
                ).toLowerCase()} recipes found.`
          }
          subtitle="Try switching filters or checking back later for new recipes."
          color={svaColors.text.secondary}
        />
      ),
    [
      filterOptions,
      isLoading,
      searchActive,
      selectedFilter,
      spacing,
      svaColors.border.default,
      svaColors.surface.base,
      svaColors.text.secondary,
      trimmedQuery,
    ]
  );

  const renderRecipeCard = useCallback(
    ({ item }: { item: RecipeCardItem }) => (
      <ProtocolTemplateCard
        item={item}
        style={styles.cardCell}
        titleNumberOfLines={4}
        onPress={() => handleItemClick(item)}
      />
    ),
    [handleItemClick, styles.cardCell]
  );

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <FlatList
        data={visibleRecipes}
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
        renderItem={renderRecipeCard}
      />
    </ScreenView>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography: Typography
) =>
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
    headerTitle: {
      ...(typography.h2 as TextStyle),
      color: colors.text.primary,
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
      minWidth: 0,
      height: "100%",
      paddingVertical: 0,
      marginLeft: spacing.sm,
      color: colors.text.primary,
      fontSize: 15,
      fontFamily: "Outfit_400Regular",
      textAlignVertical: "center",
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

export default RecipeScreen;
