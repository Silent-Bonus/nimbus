import type { ImageSourcePropType } from "react-native";

import type { ProtocolTemplateCardItem } from "@/components/common/ProtocolTemplateCard";
import type { PillFilterOption } from "@/components/ui/PillFilters";
import type { NewsletterCategory } from "@/features/tools/types/newsletterTypes";

export const STATIC_ARTICLE_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
] as const satisfies readonly PillFilterOption<string>[];

export const SEARCH_MIN_LENGTH = 3;

export type ArticleCardItem = ProtocolTemplateCardItem & {
  id: string;
  favorite: boolean;
  raw: Record<string, any>;
};

const normalizeArticleText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const getArticleFilterLabel = (
  value: string,
  options: readonly PillFilterOption<string>[]
) => options.find((option) => option.value === value)?.label ?? "Articles";

export const isArticleCategoryFilter = (value: string) =>
  value !== "all" && value !== "favorites";

export const getArticleErrorMessage = (error: unknown) => {
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

const getArticleCategoryValue = (category: unknown) => {
  if (typeof category === "string") {
    return category.trim();
  }

  if (category && typeof category === "object") {
    const candidate = category as { slug?: string; value?: string; name?: string };
    return (candidate.slug || candidate.value || candidate.name || "").trim();
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

const getNewsletterCategoryValue = (category: NewsletterCategory) => {
  if (typeof category.value === "string" && category.value.trim()) {
    return category.value.trim();
  }

  return getNewsletterCategoryLabel(category);
};

export const buildArticleCategoryFilterOptionsFromCategories = (
  categories: NewsletterCategory[]
): PillFilterOption<string>[] => {
  // The category endpoint can return duplicate labels in different shapes; collapse them before rendering pills.
  const uniqueCategories = categories.reduce<NewsletterCategory[]>(
    (acc, category) => {
      const label = getNewsletterCategoryLabel(category);
      if (!label) {
        return acc;
      }

      const normalizedLabel = normalizeArticleText(label);
      if (
        acc.some(
          (item) =>
            normalizeArticleText(getNewsletterCategoryLabel(item)) ===
            normalizedLabel
        )
      ) {
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
      const value = getNewsletterCategoryValue(category);

      return {
        label,
        value,
        accessibilityLabel: `${label} articles`,
      };
    });
};

const resolveImageSource = (image: unknown): ImageSourcePropType => {
  if (!image) {
    return require("@/assets/images/mt.jpg");
  }

  if (typeof image === "string") {
    return { uri: image };
  }

  return image as ImageSourcePropType;
};

const formatPublishedDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

export const buildArticleCardItem = (
  item: Record<string, any>,
  fallbackTag: string
): ArticleCardItem => {
  const title = item?.title || item?.name || "Untitled Article";
  const category =
    getArticleCategoryText(item?.category) ||
    getArticleCategoryText(item?.topic) ||
    fallbackTag;
  const publishedDate = formatPublishedDate(item?.published_at);
  const tags = [category, publishedDate ?? "Insight"].filter(Boolean).slice(0, 2);

  return {
    id: String(item?.id ?? title),
    title,
    image: resolveImageSource(item?.image || item?.imageUri),
    imageFit: item?.imageFit,
    favorite: Boolean(
      item?.favorite ?? item?.is_favorite ?? item?.is_favorited ?? false
    ),
    tags: tags.length > 0 ? (tags as string[]) : [fallbackTag, "Insight"],
    raw: item,
  };
};

export const getRemoteArticleImageUri = (
  image: ImageSourcePropType
): string | null => {
  if (typeof image === "number") {
    return null;
  }

  if (Array.isArray(image)) {
    const first = image[0];
    return first ? getRemoteArticleImageUri(first) : null;
  }

  if (image && typeof image === "object") {
    const candidate = image as { uri?: unknown };
    return typeof candidate.uri === "string" ? candidate.uri : null;
  }

  return null;
};

const MOCK_ARTICLE_DATA = [
  {
    id: 101,
    title: "Synchronizing the Human Machine",
    category: "Mindfulness",
    filterKey: "Mindfulness",
    image: require("@/assets/images/mt.jpg"),
    imageFit: "cover",
    readTime: "8 min",
    favorite: true,
    description:
      "A chronobiology brief on shaping morning light, evening dimming, and cleaner timing cues across the day.",
  },
  {
    id: 102,
    title: "Ashwagandha Timing Guide",
    category: "Herbs",
    filterKey: "Herbs",
    image: require("@/assets/images/bodyShape/1.png"),
    imageFit: "contain",
    readTime: "6 min",
    favorite: false,
    description:
      "When to use adaptogens, who should avoid them, and how to pair them with recovery windows.",
  },
  {
    id: 103,
    title: "The 4-Minute Breath Reset",
    category: "Meditation",
    filterKey: "Meditation",
    image: require("@/assets/images/bodyShape/2.png"),
    imageFit: "contain",
    readTime: "5 min",
    favorite: true,
    description:
      "A practical reset sequence you can use between meetings, meals, or before sleep.",
  },
  {
    id: 104,
    title: "Epigenetics of Sleep Debt",
    category: "Epigenetics",
    filterKey: "Epigenetics",
    image: require("@/assets/images/bodyShape/3.png"),
    imageFit: "contain",
    readTime: "11 min",
    favorite: false,
    description:
      "How short sleep, light exposure, and late meals can influence gene expression over time.",
  },
  {
    id: 105,
    title: "Neuroplasticity and Repetition",
    category: "Neuroplasticity",
    filterKey: "Neuroplasticity",
    image: require("@/assets/images/bodyShape/4.png"),
    imageFit: "contain",
    readTime: "7 min",
    favorite: true,
    description:
      "Why tiny repeated actions are more powerful than occasional intensity when building new habits.",
  },
  {
    id: 106,
    title: "Polyphenols for Recovery",
    category: "Herbs",
    filterKey: "Herbs",
    image: require("@/assets/images/bodyShape/5.png"),
    imageFit: "contain",
    readTime: "9 min",
    favorite: true,
    description:
      "A practical breakdown of plant compounds that can support recovery, inflammation balance, and resilience.",
  },
  {
    id: 107,
    title: "Meditation Before Meals",
    category: "Mindfulness",
    filterKey: "Mindfulness",
    image: require("@/assets/images/bodyShape/6.png"),
    imageFit: "contain",
    readTime: "4 min",
    favorite: false,
    description:
      "A simple pause ritual to help shift from task mode into a calmer eating state.",
  },
  {
    id: 108,
    title: "Light Exposure and Dopamine",
    category: "Epigenetics",
    filterKey: "Epigenetics",
    image: require("@/assets/images/mt.jpg"),
    imageFit: "cover",
    readTime: "10 min",
    favorite: false,
    description:
      "How morning and evening light patterns can nudge mood, drive, and focus across the day.",
  },
] as const;

export const MOCK_ARTICLE_ITEMS: ArticleCardItem[] = MOCK_ARTICLE_DATA.map(
  (item) => buildArticleCardItem(item, item.category)
);
