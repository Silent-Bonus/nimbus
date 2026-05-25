import type {
  UserProfile,
  UserSubscription,
  UserSubscriptionTier,
} from "@/features/auth/types/userProfile";

const FALLBACK_SUBSCRIPTION = {
  tier: "free",
  status: "active",
  source: "mock",
  expires_at: null,
} satisfies UserSubscription;

export const normalizeUserProfile = (
  profile: UserProfile | null | undefined
): UserProfile | null => {
  if (!profile) return null;

  return {
    ...profile,
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
