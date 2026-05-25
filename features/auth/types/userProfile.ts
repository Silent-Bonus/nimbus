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

export type UserProfile = {
  id: number;
  username: string | null;
  email: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  profile?: Record<string, unknown> | null;
  settings?: Record<string, unknown> | null;
  address?: Record<string, unknown> | null;
  notifications?: UserNotification[];
  subscription?: UserSubscription | null;
};
