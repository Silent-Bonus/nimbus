// UI data Type

export interface SoundscapeTrackListItem {
  id: number;
  title: string;
  image: { uri: string };
  category: string;
  duration: number | string;
  description: string;
  source: string;
}

// Backend Data Type

// TODO add types

// TODO ADD PROPER TYPE
export interface ArticleListItem {
  id: number;
  title: string;
  image: string;
}

export type ArticleData = ArticleListItem;

export interface ArticleListResponse {
  data: ArticleListItem[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface NewsletterItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  published_at: string;
  content?: string;
  is_favorited?: boolean;
  favorite?: boolean;
  is_favorite?: boolean;
}

export interface NewsletterCategory {
  value: string;
  label: string;
}

export interface NewsletterPagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results_count: number;
}

export interface NewsletterCategoryListResponse {
  data: NewsletterCategory[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface NewsletterListResponse {
  data: NewsletterItem[];
  success: boolean;
  message: string;
  pagination?: NewsletterPagination;
  error_code?: string;
}

export interface FavoriteNewsletterItem extends NewsletterItem {
  is_favorited: boolean;
}

export interface FavoriteNewsletterListResponse {
  success: boolean;
  message: string;
  data: FavoriteNewsletterItem[];
  pagination?: NewsletterPagination;
  error_code?: string;
}

export interface NewsletterFavoriteData {
  newsletter_id: number;
  slug: string;
  is_favorited: boolean;
  favorites_count: number;
}

export interface NewsletterFavoriteResponse {
  success: boolean;
  message: string;
  data?: NewsletterFavoriteData | null;
  error_code?: string;
}

export interface NewsletterReflectionPrompt {
  eyebrow?: string;
  title?: string;
  prompt?: string;
  helper?: string;
  actionLabel?: string;
  action_label?: string;
}

export interface NewsletterCampaign {
  id: number;
  name: string;
  slug: string;
  concept: string;
}

export interface NewsletterSeries {
  id: number;
  name: string;
  slug: string;
  sequence: number;
  status: string;
}

export interface NewsletterPromo {
  title: string;
  body: string;
  cta_label: string;
  cta_url: string;
  capture_mode: string;
}

export interface NewsletterReviewItem {
  id: number;
  reviewer_display_name: string;
  rating: number;
  review_text: string;
  clarity_score: number;
  helpfulness_score: number;
  would_recommend: boolean;
  source_platform: string;
  moderation_status: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterReviewPayload {
  rating: number;
  review_text: string;
  clarity_score: number;
  helpfulness_score: number;
  would_recommend: boolean;
}

export interface NewsletterReviewSummary {
  avg_rating: number;
  avg_clarity_score: number;
  avg_helpfulness_score: number;
  reviews_count: number;
  recommendation_count: number;
  recommendation_rate: number;
}

export interface NewsletterDetailItem extends NewsletterItem {
  content: string;
  issue_number?: number;
  reflection_prompt?: string | NewsletterReflectionPrompt;
  reflectionPrompt?: string | NewsletterReflectionPrompt;
  call_to_action?: string;
  callToAction?: string;
  is_published?: boolean;
  views_count?: number;
  favorites_count?: number;
  reviews_count?: number;
  avg_rating?: string;
  created_at?: string;
  updated_at?: string;
  campaign?: NewsletterCampaign | null;
  series?: NewsletterSeries | null;
  promo?: NewsletterPromo | null;
  review_summary?: NewsletterReviewSummary | null;
}

export interface NewsletterDetailResponse {
  success: boolean;
  message: string;
  data: NewsletterDetailItem;
  error_code?: string;
}

export interface NewsletterReviewListResponse {
  success: boolean;
  message: string;
  data: NewsletterReviewItem[];
  pagination?: NewsletterPagination;
  error_code?: string;
}

export interface NewsletterReviewCreateResponse {
  success: boolean;
  message: string;
  data?: NewsletterReviewItem | null;
  error_code?: string;
}

export interface SoundscapeListResponse {
  data: ArticleDetails[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface ShortVideoItem {
  id: number;
  title: string;
  image: string;
}

export interface ShortVideoListResponse {
  data: ArticleDetails[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface AudioBookItem {
  id: number;
  title: string;
  image: string;
}

export interface AudioBookListResponse {
  data: ArticleDetails[];
  success: boolean;
  message: string;
  error_code?: string;
}

export interface calorieCalculatorRequest {
  weight: string;
  height: string;
  age: string;
  gender: string;
  activityLevel: string;
}

export interface calorieCalculatorResponse {
  basalMetabolicRate: number;
  maintenanceCalories: number;
  goals: {
    mildWeightLoss: {
      calories: number;
    };
    weightLoss: {
      calories: number;
    };
    mildWeightGain: {
      calories: number;
    };
    weightGain: {
      calories: number;
    };
  };
}

export interface proteinIntakeCalculatorRequest {
  weight: string;
  // gender: string;
  activityLevel: string;
}

export interface proteinIntakeCalculatorResponse {
  activityLevel: string;
  recommendedIntake: {
    grams: number;
  };
  generalRange: {
    minimumGrams: number;
    highActivityGrams: number;
  };
}

export interface bodyShapeCalculatorRequest {
  bust: string;
  waist: string;
  highHip: string;
  lowHip: string;
}

export interface bodyShapeCalculatorResponse {
  shape: string;
  measurements: {
    bust: number;
    waist: number;
    hips: number;
  };
}

export type Meditations = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  image: any; // Replace with actual image
  source: any; // Replace with actual audio
  category: string;
  isLocked: boolean;
};

type ArticleDetails = {
  id: number | string;
  title: string;
  image?: string;
  imageUri?: string | null;
  meta_info?: {
    points: number;
    time: string;
  };
  author_info?: any;
  section_data?: {
    title: string;
    content: string;
  }[];
  instructions?: { step: string; instruction: string }[];
  nutrition?: any;
  action_button?: string | null;
  routine_items?: any[];
  web_url?: string | null;
  source?: string | null;
  [key: string]: any;
};
