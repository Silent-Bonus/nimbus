import type { UserProfile } from "@/features/auth/types/userProfile";
import { normalizeUserProfile } from "@/features/auth/utils/userEntitlements";
import { setStoredUser } from "@/services/storageService";
import { syncStoredBodyVitalsContext } from "@/features/self-care/services/body-vitals/storage";

type UserProfileListener = (profile: UserProfile | null) => void;

const listeners = new Set<UserProfileListener>();
let currentProfile: UserProfile | null = null;

function notifyUserProfileListeners(profile: UserProfile | null) {
  currentProfile = profile;
  listeners.forEach((listener) => listener(profile));
}

export function subscribeToUserProfileSync(listener: UserProfileListener) {
  listeners.add(listener);
  listener(currentProfile);

  return () => {
    listeners.delete(listener);
  };
}

export function clearUserProfileSync() {
  notifyUserProfileListeners(null);
}

export function publishUserProfileSync(profile: UserProfile | null | undefined) {
  const normalizedProfile = normalizeUserProfile(profile);
  notifyUserProfileListeners(normalizedProfile);
  return normalizedProfile;
}

export async function syncAndPublishUserProfile(
  profile: UserProfile | null | undefined
) {
  const normalizedProfile = normalizeUserProfile(profile);
  await setStoredUser(normalizedProfile);
  await syncStoredBodyVitalsContext(normalizedProfile);
  notifyUserProfileListeners(normalizedProfile);
  return normalizedProfile;
}
