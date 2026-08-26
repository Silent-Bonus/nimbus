import type { ImageSourcePropType } from "react-native";

import type { PillFilterOption } from "@/components/ui/PillFilters";
import type {
  RecipeCardItem,
  RecipeCategory,
  RecipePreviewData,
} from "@/features/tools/types/recipeTypes";

export const SEARCH_MIN_LENGTH = 3;

export const STATIC_RECIPE_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
] as const satisfies readonly PillFilterOption<string>[];

export const getRecipeFilterLabel = (
  value: string,
  options: readonly PillFilterOption<string>[]
) => options.find((option) => option.value === value)?.label ?? "Recipes";

export const isRecipeCategoryFilter = (value: string) =>
  value !== "all" && value !== "favorites";

export const buildRecipeCategoryFilterOptions = (
  categories: RecipeCategory[]
): PillFilterOption<string>[] => {
  // The API can repeat category records; normalize by slug before rendering filter pills.
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

const resolveRecipeImageSource = (image: unknown): ImageSourcePropType => {
  if (!image) {
    return require("@/assets/images/mt.jpg");
  }

  if (typeof image === "string") {
    return { uri: image };
  }

  return image as ImageSourcePropType;
};

export const buildRecipeCardItem = (
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
    image: resolveRecipeImageSource(item?.image || item?.imageUri),
    imageFit: item?.imageFit,
    favorite: Boolean(
      item?.favorite ?? item?.is_favorited ?? item?.is_favorite ?? false
    ),
    tags: tags.length > 0 ? tags : [fallbackTag, "Fresh"],
    raw: item,
  };
};

export const getRemoteRecipeImageUri = (
  image: ImageSourcePropType
): string | null => {
  if (typeof image === "number") {
    return null;
  }

  if (Array.isArray(image)) {
    const first = image[0];
    return first ? getRemoteRecipeImageUri(first) : null;
  }

  if (image && typeof image === "object") {
    const candidate = image as { uri?: unknown };
    return typeof candidate.uri === "string" ? candidate.uri : null;
  }

  return null;
};

export const buildRecipePreviewData = (item: RecipeCardItem) => {
  const raw = item.raw as Record<string, any>;
  const payload: RecipePreviewData = {
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
  };

  // Route params must stay serializable, so pass the detail screen a minimal snapshot.
  return JSON.stringify(payload);
};
