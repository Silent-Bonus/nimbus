import {
  MOCK_FREE_USER_PROFILE,
  MOCK_PLUS_USER_PROFILE,
} from "@/features/auth/data/mockUserProfiles";
import {
  getMembershipLabel,
  hasPremiumAccess,
  normalizeUserProfile,
} from "../userEntitlements";

describe("userEntitlements", () => {
  it("seeds a mock free subscription when the profile does not include tier data", () => {
    const profile = normalizeUserProfile({
      id: 123,
      username: "demo",
      email: "demo@nimbus.dev",
      first_name: "Demo",
      last_name: "User",
      avatar: null,
      profile: {},
      settings: {},
      notifications: [],
    });

    expect(profile?.subscription?.tier).toBe("free");
    expect(profile?.subscription?.source).toBe("mock");
  });

  it("maps user profiles to the expected membership labels", () => {
    expect(hasPremiumAccess(MOCK_FREE_USER_PROFILE)).toBe(false);
    expect(hasPremiumAccess(MOCK_PLUS_USER_PROFILE)).toBe(true);
    expect(getMembershipLabel(MOCK_FREE_USER_PROFILE)).toBe("FREE MEMBER");
    expect(getMembershipLabel(MOCK_PLUS_USER_PROFILE)).toBe("PREMIUM MEMBER");
  });
});
