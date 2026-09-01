import type {
  UserAddress,
  UserNotification,
  UserNotificationPreferences,
  UserProfile,
  UserProfileDetails,
  UserSettings,
  UserSubscription,
  UserSubscriptionTier,
} from "@/features/auth/types/userProfile";
import { normalizeBodyVitalsContext } from "@/features/self-care/services/bodyVitalsNormalizer";

const FALLBACK_SUBSCRIPTION = {
  tier: "free",
  status: "active",
  source: "mock",
  expires_at: null,
} satisfies UserSubscription;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

function normalizeProfileDetails(raw: unknown): UserProfileDetails | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    phone_number: toStringOrNull(raw.phone_number),
    height: toNumber(raw.height),
    weight: toNumber(raw.weight),
    age: toNumber(raw.age),
    gender: raw.gender === "male" || raw.gender === "female" ? raw.gender : null,
    gender_prefer_not_to_say: toBoolean(raw.gender_prefer_not_to_say),
  };
}

function normalizeSettings(raw: unknown): UserSettings | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    onboarding_intent: toStringOrNull(raw.onboarding_intent),
    weight_unit: toStringOrNull(raw.weight_unit),
    height_unit: toStringOrNull(raw.height_unit),
    liquid_unit: toStringOrNull(raw.liquid_unit),
    weather_unit: toStringOrNull(raw.weather_unit),
    start_of_week: toStringOrNull(raw.start_of_week),
    location: toStringOrNull(raw.location),
  };
}

function normalizeAddress(raw: unknown): UserAddress | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    street: toStringOrNull(raw.street),
    city: toStringOrNull(raw.city),
    state: toStringOrNull(raw.state),
    zip_code: toStringOrNull(raw.zip_code),
    country: toStringOrNull(raw.country),
  };
}

function normalizeNotificationPreferences(
  raw: unknown
): UserNotificationPreferences | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    timezone: toStringOrNull(raw.timezone),
    quiet_hours_start: toStringOrNull(raw.quiet_hours_start),
    quiet_hours_end: toStringOrNull(raw.quiet_hours_end),
  };
}

function normalizeNotifications(raw: unknown): UserNotification[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(isRecord)
    .map((item) => ({
      notification_type: toStringOrNull(item.notification_type) ?? "",
      enabled: toBoolean(item.enabled) ?? false,
      time: toStringOrNull(item.time) ?? "",
      days_of_week: Array.isArray(item.days_of_week)
        ? item.days_of_week.filter(
            (value): value is string => typeof value === "string"
          )
        : [],
    }))
    .filter((item) => item.notification_type.length > 0);
}

export const normalizeUserProfile = (
  profile: UserProfile | null | undefined
): UserProfile | null => {
  if (!profile) return null;

  return {
    id: profile.id,
    username: profile.username ?? null,
    email: profile.email ?? null,
    full_name: profile.full_name ?? null,
    phone_number: profile.phone_number ?? null,
    first_name: profile.first_name ?? null,
    last_name: profile.last_name ?? null,
    avatar: profile.avatar ?? null,
    profile: normalizeProfileDetails(profile.profile),
    settings: normalizeSettings(profile.settings),
    address: normalizeAddress(profile.address),
    notifications: normalizeNotifications(profile.notifications),
    notification_preferences: normalizeNotificationPreferences(
      profile.notification_preferences
    ),
    vitals_context: normalizeBodyVitalsContext(profile.vitals_context),
    subscription: profile.subscription ?? FALLBACK_SUBSCRIPTION,
  };
};

export const getUserTier = (
  profile: UserProfile | null | undefined
): UserSubscriptionTier => profile?.subscription?.tier ?? "free";

export const hasPremiumAccess = (
  profile: UserProfile | null | undefined
) => getUserTier(profile) === "plus";

export const getMembershipLabel = (
  profile: UserProfile | null | undefined
) => (hasPremiumAccess(profile) ? "PREMIUM MEMBER" : "FREE MEMBER");
