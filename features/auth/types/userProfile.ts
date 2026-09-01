import type { BodyVitalsContext } from "@/features/self-care/types/bodyVitals";

export type UserSubscriptionTier = "free" | "plus";

export type UserSubscription = {
  tier: UserSubscriptionTier;
  status?: "active" | "trial" | "inactive";
  source?: "api" | "mock";
  expires_at?: string | null;
};

export type UserNotification = {
  notification_type: string;
  enabled: boolean;
  time: string;
  days_of_week: string[];
};

export type UserProfileDetails = {
  phone_number?: string | null;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  gender?: "male" | "female" | null;
  gender_prefer_not_to_say?: boolean | null;
};

export type UserSettings = {
  onboarding_intent?: string | null;
  weight_unit?: string | null;
  height_unit?: string | null;
  liquid_unit?: string | null;
  weather_unit?: string | null;
  start_of_week?: string | null;
  location?: string | null;
};

export type UserAddress = {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
};

export type UserNotificationPreferences = {
  timezone?: string | null;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
};

export type UserProfile = {
  id: number;
  username: string | null;
  email: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  profile?: UserProfileDetails | null;
  settings?: UserSettings | null;
  address?: UserAddress | null;
  notifications?: UserNotification[];
  notification_preferences?: UserNotificationPreferences | null;
  vitals_context?: BodyVitalsContext | null;
  subscription?: UserSubscription | null;
};
