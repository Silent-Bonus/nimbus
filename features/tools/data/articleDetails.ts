import type { ImageSourcePropType } from "react-native";

export type ArticleContextCard = {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  description: string;
};

export type ArticleReflectionPrompt = {
  eyebrow: string;
  title: string;
  prompt: string;
  helper: string;
  actionLabel: string;
};

export type ArticleRecommendation = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: ImageSourcePropType;
  imageFit?: "cover" | "contain";
};

export type ArticleDetail = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readingTime: string;
  authorName: string;
  authorRole: string;
  heroImage: ImageSourcePropType;
  heroImageFit?: "cover" | "contain";
  contextCard: ArticleContextCard;
  content: string[];
  pullQuote: string;
  reflectionPrompt: ArticleReflectionPrompt;
  callToAction: ArticleReflectionPrompt;
  recommendationLabel: string;
  recommendation: ArticleRecommendation;
  tags: string[];
  favorite: boolean;
  saveLabel: string;
};
