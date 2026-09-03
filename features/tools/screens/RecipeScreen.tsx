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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { Image as ExpoImage } from "expo-image";

import AppHeader from "@/components/layout/AppHeader";
import ProtocolTemplateCard from "@/components/common/ProtocolTemplateCard";
import { ScreenView } from "@/components/ui/Themed";
import PillFilters from "@/components/ui/PillFilters";
import ThemeContext from "@/contexts/ThemeContext";
import EmptyState from "@/features/tools/components/common/EmptyState";
import { LibraryCardSkeletonGrid } from "@/features/tools/components/common/LibraryCardSkeletonGrid";
import { ROUTES } from "@/constants/routes";
import {
  getFavoriteRecipeList,
  getRecipeCategories,
  getRecipeList,
} from "@/features/tools/services/recipeService";
import type {
  Spacing,
  SvaColorSet,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import type { RecipeCardItem } from "@/features/tools/types/recipeTypes";
import {
  SEARCH_MIN_LENGTH,
  STATIC_RECIPE_FILTER_OPTIONS,
  buildRecipeCardItem,
  buildRecipeCategoryFilterOptions,
  buildRecipePreviewData,
  getRemoteRecipeImageUri,
  getRecipeFilterLabel,
  isRecipeCategoryFilter,
} from "@/features/tools/utils/recipeList";

export const RecipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, svaTypography, spacing, typography),
    [spacing, svaColors, svaTypography, typography]
  );
  const searchInputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [categoryFilters, setCategoryFilters] = useState<
    ReturnType<typeof buildRecipeCategoryFilterOptions>
  >([]);
  const [baseRecipes, setBaseRecipes] = useState<RecipeCardItem[]>([]);
  const [searchRecipes, setSearchRecipes] = useState<RecipeCardItem[]>([]);
  const [baseLoading, setBaseLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const filterOptions = useMemo(
    () => [...STATIC_RECIPE_FILTER_OPTIONS, ...categoryFilters],
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
          setCategoryFilters(buildRecipeCategoryFilterOptions(data));
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
                isRecipeCategoryFilter(selectedFilter)
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

        const requestParams = isRecipeCategoryFilter(selectedFilter)
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

    // Debounce search requests so the list stays stable while the user is typing.
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
      .map((item) => getRemoteRecipeImageUri(item.image))
      .filter((uri): uri is string => Boolean(uri))
      .slice(0, 12);

    if (uris.length === 0) {
      return;
    }

    // Warm the first visible remote images to reduce perceived card load time.
    void ExpoImage.prefetch(uris);
  }, [visibleRecipes]);

  const handleFilterPress = useCallback((label: string) => {
    setSelectedFilter(label);
  }, []);

  const handleItemClick = useCallback((item: RecipeCardItem) => {
    const raw = item.raw as { slug?: string | null };

    router.push({
      pathname: ROUTES.AUTH.TOOLS_RECIPE_DETAIL,
      params: {
        id: item.id,
        slug: raw?.slug ?? undefined,
        recipeData: buildRecipePreviewData(item),
      },
    });
  }, []);

  const renderListHeader = useMemo(
    () => (
      <View style={styles.controlsBlock}>
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
            placeholder="Search recipes, ingredients, tags"
            placeholderTextColor={svaColors.text.secondary}
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
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersRow}
          selectedPillStyle={styles.filterPillSelected}
          inactivePillStyle={styles.filterPillInactive}
          selectedLabelStyle={styles.filterLabelSelected}
          inactiveLabelStyle={styles.filterLabelInactive}
          labelStyle={styles.filterLabel}
        />
      </View>
    ),
    [
      filterOptions,
      handleFilterPress,
      query,
      selectedFilter,
      styles,
      svaColors.brand.primary,
      svaColors.text.secondary,
    ]
  );

  const renderEmpty = useMemo(
    () =>
      isLoading ? (
        <LibraryCardSkeletonGrid
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
              : `No ${getRecipeFilterLabel(
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
      <View style={styles.root}>
        <AppHeader
          title="Recipe Plan"
          subtitle="Find recipes that support your routine and nourish you."
          onBack={() => navigation.goBack()}
          containerStyle={styles.header}
          subtitleStyle={styles.headerSubtitle}
        />

        <FlatList
          data={visibleRecipes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          renderItem={renderRecipeCard}
        />
      </View>
    </ScreenView>
  );
};

const styling = (
  colors: SvaColorSet,
  svaTypography: TypographyTokens | undefined,
  spacing: Spacing,
  typography: Typography
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
    header: {
      marginBottom: spacing.sm,
    },
    headerSubtitle: {
      ...(svaTypography?.textStyle?.authTinyLabel ?? {}),
      lineHeight: 16,
      minHeight: 32,
      textTransform: "uppercase",
      color: colors.text.secondary,
    },
    listContent: {
      paddingTop: spacing.xs,
      paddingBottom: Platform.OS === "ios" ? 120 : 140,
    },
    controlsBlock: {
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
      marginBottom: spacing.sm,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      height: "100%",
      paddingVertical: 0,
      marginLeft: spacing.sm,
      color: colors.text.primary,
      ...(svaTypography?.textStyle?.input ?? typography.body),
      textAlignVertical: "center",
    },
    clearButton: {
      marginLeft: spacing.xs,
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
    filterLabel: {
      ...(svaTypography?.textStyle?.authTinyLabel ?? {}),
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    filterLabelSelected: {
      color: colors.text.inverse,
    },
    filterLabelInactive: {
      color: colors.text.secondary,
    },
    filterPillSelected: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    filterPillInactive: {
      backgroundColor: colors.surface.base,
      borderColor: colors.border.default,
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
