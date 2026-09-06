import type { UserProfile } from "../types/userProfile";

const buildMockUserProfile = (tier: "free" | "plus"): UserProfile => ({
  id: tier === "plus" ? 902 : 901,
  username: tier === "plus" ? "nimbus.plus" : "nimbus.free",
  email: tier === "plus" ? "plus@nimbus.dev" : "free@nimbus.dev",
  full_name: tier === "plus" ? "Nimbus Plus Member" : "Nimbus Free Member",
  first_name: tier === "plus" ? "Nimbus" : "Free",
  last_name: tier === "plus" ? "Plus" : "Member",
  avatar: null,
  profile: {
    phone_number: null,
    height: null,
    weight: null,
    age: null,
    gender: null,
  },
  settings: {
    liquid_unit: "ml",
    height_unit: "cm",
    weight_unit: "kg",
    weather_unit: "celsius",
    start_of_week: "monday",
    location: null,
  },
  address: {
    street: null,
    city: null,
    state: null,
    zip_code: null,
    country: null,
  },
  notifications: [],
  subscription: {
    tier,
    status: "active",
    source: "mock",
  },
});

// Temporary fixtures until the backend returns a subscription payload for every profile.
export const MOCK_FREE_USER_PROFILE = buildMockUserProfile("free");
export const MOCK_PLUS_USER_PROFILE = buildMockUserProfile("plus");
