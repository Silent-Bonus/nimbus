import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

import { ScreenView } from "@/components/ui/Themed";
import PillFilters, {
  type PillFilterOption,
} from "@/components/ui/PillFilters";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/features/tools/components/common/EmptyState";
import ProtocolTemplateCard from "@/features/tools/components/common/ProtocolTemplateCard";
import { RoutineSkeletonGrid } from "@/features/tools/components/common/RoutineSkeletonGrid";
import { ROUTES } from "@/constants/routes";
import { getRecipeList } from "@/features/tools/services/toolService";
import {
  MOCK_RECIPE_ITEMS,
  type RecipeCardItem,
} from "@/features/tools/data/recipePlans";
import type { Spacing, SvaColorSet } from "@/theme/types";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Lunch" },
  { label: "Dinner", value: "Dinner" },
  { label: "Beverages", value: "Beverages" },
  { label: "Snacks", value: "Snacks" },
  { label: "Soup", value: "Soup" },
  { label: "Dessert", value: "Dessert" },
  { label: "Sauce", value: "Sauce" },
  { label: "Non-Veg", value: "NonVeg" },
] as const satisfies readonly PillFilterOption<string>[];

type FilterLabel = (typeof FILTER_OPTIONS)[number]["value"];

const FILTER_MAP: Record<
  Exclude<FilterLabel, "favorites">,
  string | undefined
> = {
  all: undefined,
  Breakfast: "Breakfast",
  Lunch: "Lunch",
  Dinner: "Dinner",
  Beverages: "Drink",
  Snacks: "Snack",
  Soup: "Soup",
  Dessert: "Dessert",
  Sauce: "Sauce",
  NonVeg: "Non-Veg",
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getFilterLabel = (value: FilterLabel) =>
  FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "Recipes";

const resolveImageSource = (image: unknown): ImageSourcePropType => {
  if (!image) {
    return require("@/assets/images/mt.jpg");
  }

  if (typeof image === "string") {
    return { uri: image };
  }

  return image as ImageSourcePropType;
};

const buildRecipeCardItem = (
  item: Record<string, any>,
  fallbackTag: string
): RecipeCardItem => {
  const title = item?.title || item?.name || "Untitled Recipe";
  const category = item?.category || fallbackTag;
  const duration =
    item?.prep_time ||
    item?.time ||
    item?.meta_info?.time ||
    item?.meta_info?.duration;
  const calories =
    item?.calories != null
      ? `${item.calories} kcal`
      : item?.meta_info?.points != null
      ? `${item.meta_info.points} pts`
      : null;

  const tags = [category, duration, calories].filter(Boolean).slice(0, 2);

  return {
    id: String(item?.id ?? title),
    title,
    image: resolveImageSource(item?.image || item?.imageUri),
    imageFit: item?.imageFit,
    favorite: Boolean(item?.favorite ?? item?.is_favorite ?? false),
    tags: tags.length > 0 ? (tags as string[]) : [fallbackTag, "Fresh"],
    raw: item,
  };
};

export const RecipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);
  const searchInputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterLabel>("all");
  const [recipes, setRecipes] = useState<RecipeCardItem[]>(
    __DEV__ ? MOCK_RECIPE_ITEMS : []
  );
  const [isLoading, setIsLoading] = useState(!__DEV__);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const fetchRecipes = async (filter: Exclude<FilterLabel, "favorites">) => {
    try {
      setIsLoading(true);
      const categorySlug = FILTER_MAP[filter];
      const result: any = await getRecipeList(categorySlug);
      const data = result?.data || (Array.isArray(result) ? result : []);

      if (Array.isArray(data)) {
        setRecipes(
          data.map((item: Record<string, any>) =>
            buildRecipeCardItem(item, filter === "all" ? "Recipe" : filter)
          )
        );
      } else {
        console.error("Recipe API did not return data array:", result);
        setRecipes([]);
      }
    } catch (err) {
      console.log("Recipe API error", err);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (__DEV__) {
      setIsLoading(false);
      setRecipes(MOCK_RECIPE_ITEMS);
      return;
    }

    fetchRecipes("all");
  }, []);

  const handleFilterPress = (label: FilterLabel) => {
    setSelectedFilter(label);

    if (__DEV__ || label === "favorites") {
      return;
    }

    fetchRecipes(label);
  };

  const handleItemClick = (item: RecipeCardItem) => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_RECIPE_DETAIL,
      params: { id: item.id },
    });
  };

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = normalize(query);
    const categoryFilteredRecipes =
      __DEV__ && selectedFilter !== "all" && selectedFilter !== "favorites"
        ? recipes.filter(
            (item) =>
              item.raw.filterKey === selectedFilter ||
              item.raw.category === selectedFilter
          )
        : selectedFilter === "favorites"
        ? recipes.filter((item) => item.favorite)
        : recipes;

    if (!normalizedQuery) return categoryFilteredRecipes;

    return categoryFilteredRecipes.filter((item) => {
      const searchBlob = normalize(
        [item.title, ...item.tags, item.raw.category, item.raw.description]
          .filter(Boolean)
          .join(" ")
      );

      return searchBlob.includes(normalizedQuery);
    });
  }, [query, recipes, selectedFilter]);

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <ScreenHeader
        title="Recipe Plan"
        subtitle="Find recipes that support your routine and nourish you."
        onBack={() => navigation.goBack()}
        rightActions={[
          {
            icon: "search-outline",
            accessibilityLabel: "Focus search",
            onPress: () => searchInputRef.current?.focus(),
          },
          {
            icon: "bag-outline",
            accessibilityLabel: "Open cart",
            badge: true,
            onPress: () => console.log("[RecipeScreen] cart pressed"),
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
          placeholder="Search recipes, ingredients, tags"
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
            ? "No recipes found."
            : selectedFilter === "favorites"
            ? "No favorite recipes found."
            : `No ${getFilterLabel(
                selectedFilter
              ).toLowerCase()} recipes found.`
        }
        subtitle="Try switching filters or checking back later for new recipes."
        color={svaColors.text.secondary}
      />
    );

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <FlatList
        data={filteredRecipes}
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

export default RecipeScreen;
