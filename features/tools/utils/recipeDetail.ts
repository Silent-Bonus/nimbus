import type { ImageSourcePropType } from "react-native";

import type {
  AddRecipeFavoriteResponse,
  RecipeDetailItem,
  RecipeDetail,
  RecipeDetailRouteParams,
  RecipeFilterKey,
  RecipeNutrition,
  RecipeNutritionEntry,
  RecipePreviewData,
  RecipeReviewResponse,
  RecipeStep,
  RecipeTip,
} from "@/features/tools/types/recipeTypes";

export const getRecipeRouteParam = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return String(value[0]);
  }

  return String(value);
};

export const parseRecipePreviewData = (
  value: RecipeDetailRouteParams["recipeData"]
): RecipePreviewData | null => {
  const raw = getRecipeRouteParam(value);
  if (!raw) {
    return null;
  }

  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // Ignore decode failures and fall back to the raw string.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        return parsed as RecipePreviewData;
      }
    } catch (error) {
      console.warn("[RecipeDetail] failed to parse recipe preview", error);
    }
  }

  return null;
};

export const resolveRecipeDetailLookupKey = (
  params: Pick<RecipeDetailRouteParams, "id" | "slug">
) => {
  const slug = getRecipeRouteParam(params.slug)?.trim() || null;
  const id = getRecipeRouteParam(params.id)?.trim() || null;

  // Detail reads can resolve by slug first so the route contract stays stable
  // if we later move away from id-based URLs.
  return {
    id,
    slug,
    lookupKey: id || slug,
  };
};

export const buildRecipeActionErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      detail?: unknown;
      error?: unknown;
      non_field_errors?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.detail === "string" && candidate.detail.trim()) {
      return candidate.detail;
    }

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }

    if (Array.isArray(candidate.non_field_errors)) {
      const firstMessage = candidate.non_field_errors.find(
        (item) => typeof item === "string" && item.trim()
      );

      if (typeof firstMessage === "string") {
        return firstMessage;
      }
    }
  }

  return "Unable to update favorite right now.";
};

const getRecipeCategoryText = (category: unknown): string | undefined => {
  if (!category) {
    return undefined;
  }

  if (typeof category === "string") {
    return category;
  }

  if (typeof category === "object") {
    const candidate = category as { name?: string; slug?: string };
    return candidate.name || candidate.slug || undefined;
  }

  return undefined;
};

const formatRecipeLabel = (value?: string | null) => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const normalizeRecipeFilterKey = (
  category: unknown,
  fallback: RecipeFilterKey,
  mealSlot?: unknown
): RecipeFilterKey => {
  const normalizedCandidates = [mealSlot, category]
    .map((value) => getRecipeCategoryText(value) ?? "")
    .map((value) => value.toLowerCase().replace(/[^a-z]+/g, ""));

  if (normalizedCandidates.some((value) => value === "breakfast")) {
    return "Breakfast";
  }
  if (normalizedCandidates.some((value) => value === "lunch")) {
    return "Lunch";
  }
  if (normalizedCandidates.some((value) => value === "dinner")) {
    return "Dinner";
  }
  if (
    normalizedCandidates.some(
      (value) => value === "beverages" || value === "drink"
    )
  ) {
    return "Beverages";
  }
  if (
    normalizedCandidates.some(
      (value) => value === "snacks" || value === "snack"
    )
  ) {
    return "Snacks";
  }
  if (normalizedCandidates.some((value) => value === "soup")) {
    return "Soup";
  }
  if (normalizedCandidates.some((value) => value === "dessert")) {
    return "Dessert";
  }
  if (normalizedCandidates.some((value) => value === "sauce")) {
    return "Sauce";
  }
  if (normalizedCandidates.some((value) => value === "nonveg")) {
    return "NonVeg";
  }

  return fallback;
};

const resolveRecipeDetailImageSource = (
  image: unknown,
  fallback: RecipeDetail["image"]
) => {
  if (!image) {
    return fallback;
  }

  if (typeof image === "string") {
    return { uri: image };
  }

  if (typeof image === "object") {
    const candidate = image as { uri?: string; url?: string; path?: string };
    if (typeof candidate.uri === "string") return { uri: candidate.uri };
    if (typeof candidate.url === "string") return { uri: candidate.url };
    if (typeof candidate.path === "string") return { uri: candidate.path };
  }

  return fallback;
};

export const formatRecipeMinutes = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Number(value)} min`;
};

export const getRecipeReviewCountFromResponse = (
  response: RecipeReviewResponse,
  fallbackCount?: number
) => {
  // Review creation currently returns the created review object, not the
  // aggregate review count. Prefer an explicit count if the backend adds one,
  // otherwise treat a successful create response as one additional review.
  const fallback = Math.max(0, Number(fallbackCount ?? 0));
  const candidates = [response, response?.data];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const possibleCount =
      (
        candidate as {
          reviews_count?: unknown;
          reviewsCount?: unknown;
        }
      ).reviews_count ??
      (
        candidate as {
          reviews_count?: unknown;
          reviewsCount?: unknown;
        }
      ).reviewsCount;

    const normalizedCount = Number(possibleCount);
    if (Number.isFinite(normalizedCount) && normalizedCount > 0) {
      return normalizedCount;
    }
  }

  if (response.success && response.data?.id) {
    return fallback + 1;
  }

  return fallback;
};

export const getRecipeFavoriteStateFromResponse = (
  response: AddRecipeFavoriteResponse,
  fallbackFavorite: boolean
) => {
  const candidates = [response?.data, response];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const possibleFavorite =
      (
        candidate as {
          is_favorited?: unknown;
          isFavorited?: unknown;
        }
      ).is_favorited ??
      (
        candidate as {
          is_favorited?: unknown;
          isFavorited?: unknown;
        }
      ).isFavorited;

    if (typeof possibleFavorite === "boolean") {
      return possibleFavorite;
    }
  }

  return fallbackFavorite;
};

export const getRecipeFavoritesCountFromResponse = (
  response: AddRecipeFavoriteResponse,
  fallbackCount?: number
) => {
  const fallback = Math.max(0, Number(fallbackCount ?? 0));
  const candidates = [response?.data, response];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const possibleCount =
      (
        candidate as {
          favorites_count?: unknown;
          favoritesCount?: unknown;
        }
      ).favorites_count ??
      (
        candidate as {
          favorites_count?: unknown;
          favoritesCount?: unknown;
        }
      ).favoritesCount;

    const normalizedCount = Number(possibleCount);
    if (Number.isFinite(normalizedCount) && normalizedCount >= 0) {
      return normalizedCount;
    }
  }

  return fallback;
};

const toRecipeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      if (item && typeof item === "object") {
        const candidate = item as {
          title?: string;
          description?: string;
          instruction?: string;
        };

        const heading = candidate.title || candidate.instruction;
        const body = candidate.description || "";

        if (heading && body) {
          return `${heading}: ${body}`;
        }

        return heading || body || "";
      }

      return "";
    })
    .filter(Boolean);
};

const normalizeRecipeSteps = (value: unknown): RecipeStep[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as {
        step?: number;
        title?: string;
        description?: string;
        instruction?: string;
      };

      const title =
        candidate.title || candidate.instruction || `Step ${index + 1}`;
      const description = candidate.description || candidate.instruction || "";

      if (!title && !description) {
        return null;
      }

      return {
        step: Number(candidate.step ?? index + 1),
        title,
        description,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
};

type RecipeDetailSource = (RecipeDetailItem | RecipePreviewData) & {
  name?: string;
  description?: string | null;
  imageUri?: string | null;
  imageFit?: RecipeDetail["imageFit"];
  prep_time?: string | null;
  prepTime?: string | null;
  calories?: number | string | null;
  favorite?: boolean;
  is_favorite?: boolean;
  ctaLabel?: string;
  action_button?: string | null;
};

const buildRecipeTips = (
  apiRecipe: RecipeDetailSource,
  fallback: RecipeDetail
) => {
  const tips = [
    apiRecipe?.pro_tip
      ? {
          key: "pro_tip",
          title: "Pro Tip",
          description: String(apiRecipe.pro_tip),
          icon: "sparkles-outline",
        }
      : null,
    apiRecipe?.fast_track
      ? {
          key: "fast_track",
          title: "Fast Track",
          description: String(apiRecipe.fast_track),
          icon: "flash-outline",
        }
      : null,
    apiRecipe?.bio_hacker
      ? {
          key: "bio_hacker",
          title: "Bio Hacker",
          description: String(apiRecipe.bio_hacker),
          icon: "pulse-outline",
        }
      : null,
  ].filter(Boolean) as RecipeTip[];

  return tips.length > 0 ? tips : fallback.tips;
};

export const createEmptyRecipeDetail = (id = ""): RecipeDetail => ({
  id,
  title: "Recipe details unavailable",
  subtitle: "Open a recipe from the list to load it.",
  category: "",
  mealSlot: "Recipe",
  filterKey: "Lunch",
  image: require("@/assets/images/mt.jpg") as ImageSourcePropType,
  imageFit: "cover",
  prepTime: "—",
  calories: 0,
  favorite: false,
  nutrition: {
    calories: "0",
    protein: "0g",
    carbs: "0g",
    fats: "0g",
  },
  description: "We could not load this recipe yet.",
  ingredients: [],
  process: [],
  tips: [],
  wisdomTitle: "Nutritional Wisdom",
  wisdom: "The full recipe will appear once the API responds.",
  ctaLabel: "Add to Meal Plan",
});

const normalizeRecipeNutrition = (
  value: RecipeDetailItem["nutrition_json"] | unknown,
  fallback: RecipeNutrition
): RecipeNutrition => {
  if (Array.isArray(value)) {
    const entryMap = value.reduce<Record<string, string>>((acc, entry) => {
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as RecipeNutritionEntry).label === "string" &&
        typeof (entry as RecipeNutritionEntry).value === "string"
      ) {
        acc[(entry as RecipeNutritionEntry).label.trim().toLowerCase()] = (
          entry as RecipeNutritionEntry
        ).value;
      }

      return acc;
    }, {});

    return {
      calories: entryMap.calories ?? fallback.calories,
      protein: entryMap.protein ?? fallback.protein,
      carbs: entryMap.carbs ?? fallback.carbs,
      fats: entryMap.fats ?? fallback.fats,
    };
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const candidate = value as {
      calories?: string | number;
      protein?: string | number;
      carbs?: string | number;
      fats?: string | number;
    };

    return {
      calories: String(candidate.calories ?? fallback.calories),
      protein: String(candidate.protein ?? fallback.protein),
      carbs: String(candidate.carbs ?? fallback.carbs),
      fats: String(candidate.fats ?? fallback.fats),
    };
  }

  return fallback;
};

export const normalizeRecipeFromApi = (
  apiRecipe: RecipeDetailSource,
  fallback: RecipeDetail
): RecipeDetail => {
  // Keep backend-to-UI mapping centralized so the screen only renders a
  // normalized detail model instead of branching on API response shapes.
  const categoryText = getRecipeCategoryText(apiRecipe?.category);
  const mealSlotText = getRecipeCategoryText(apiRecipe?.meal_slot);
  const difficultyLevel = String(apiRecipe?.difficulty_level ?? "").trim();
  const ingredients = toRecipeStringArray(apiRecipe?.ingredients_json);
  const steps = normalizeRecipeSteps(apiRecipe?.steps_json);
  const tips = buildRecipeTips(apiRecipe, fallback);
  const context = String(apiRecipe?.context ?? "").trim();
  const prepTimeMinutes = Number(apiRecipe?.prep_time_minutes ?? NaN);
  const activeTimeMinutes = Number(apiRecipe?.active_time_minutes ?? NaN);
  const totalTimeMinutes = Number(apiRecipe?.total_time_minutes ?? NaN);
  const shortDescription =
    apiRecipe?.short_description ||
    apiRecipe?.description ||
    fallback.description;

  return {
    ...fallback,
    id: String(apiRecipe?.id ?? fallback.id),
    title: apiRecipe?.title || apiRecipe?.name || fallback.title,
    subtitle:
      [categoryText || formatRecipeLabel(mealSlotText), difficultyLevel]
        .filter(Boolean)
        .join(" • ") || fallback.subtitle,
    category: categoryText || fallback.category,
    mealSlot: formatRecipeLabel(mealSlotText) || fallback.mealSlot,
    filterKey: normalizeRecipeFilterKey(
      apiRecipe?.category,
      fallback.filterKey,
      apiRecipe?.meal_slot
    ),
    image: resolveRecipeDetailImageSource(
      apiRecipe?.image || apiRecipe?.imageUri,
      fallback.image
    ),
    imageFit: apiRecipe?.imageFit || fallback.imageFit,
    prepTime:
      !Number.isNaN(prepTimeMinutes) && prepTimeMinutes >= 0
        ? formatRecipeMinutes(prepTimeMinutes)
        : apiRecipe?.prep_time || apiRecipe?.prepTime || fallback.prepTime,
    prepTimeMinutes: Number.isNaN(prepTimeMinutes)
      ? fallback.prepTimeMinutes
      : prepTimeMinutes,
    activeTimeMinutes: Number.isNaN(activeTimeMinutes)
      ? fallback.activeTimeMinutes
      : activeTimeMinutes,
    totalTimeMinutes: Number.isNaN(totalTimeMinutes)
      ? fallback.totalTimeMinutes
      : totalTimeMinutes,
    calories: Number(apiRecipe?.calories ?? fallback.calories),
    favorite: Boolean(
      apiRecipe?.favorite ??
        apiRecipe?.is_favorite ??
        apiRecipe?.is_favorited ??
        fallback.favorite
    ),
    avgRating: String(apiRecipe?.avg_rating ?? fallback.avgRating ?? "0.00"),
    reviewsCount: Number(
      apiRecipe?.reviews_count ?? fallback.reviewsCount ?? 0
    ),
    favoritesCount: Number(
      apiRecipe?.favorites_count ?? fallback.favoritesCount ?? 0
    ),
    viewsCount: Number(apiRecipe?.views_count ?? fallback.viewsCount ?? 0),
    nutrition: normalizeRecipeNutrition(
      apiRecipe?.nutrition_json,
      fallback.nutrition
    ),
    description: shortDescription || fallback.description,
    context: context || fallback.context,
    ingredients: ingredients.length > 0 ? ingredients : fallback.ingredients,
    ingredientsJson: ingredients,
    process:
      steps.length > 0
        ? steps.map((step) =>
            step.description ? `${step.title}: ${step.description}` : step.title
          )
        : fallback.process,
    stepsJson: steps,
    tips,
    wisdomTitle: context ? "Context" : fallback.wisdomTitle,
    wisdom: context || fallback.wisdom,
    ctaLabel:
      apiRecipe?.ctaLabel || apiRecipe?.action_button || fallback.ctaLabel,
    tagsJson: toRecipeStringArray(apiRecipe?.tags_json),
  };
};
