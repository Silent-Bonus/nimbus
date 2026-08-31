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
}

export interface NewsletterListResponse {
  data: NewsletterItem[];
  success: boolean;
  message: string;
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

export interface NewsletterDetailItem extends NewsletterItem {
  content: string;
  reflection_prompt?: string | NewsletterReflectionPrompt;
  reflectionPrompt?: string | NewsletterReflectionPrompt;
  call_to_action?: string;
  callToAction?: string;
}

export interface NewsletterDetailResponse {
  success: boolean;
  message: string;
  data: NewsletterDetailItem;
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
