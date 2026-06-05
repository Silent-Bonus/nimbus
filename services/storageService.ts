// services/storageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { StoreKey } from "@/constants/Constant";
import type { UserProfile } from "@/features/auth/types/userProfile";

const USER_KEY = "@nimbus_user";
const LEGACY_PROFILE_KEY = StoreKey.USER_PROFILE_KEY;
const TOKEN_KEY = StoreKey.TOKEN_KEY;

export type User = UserProfile;

function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

async function clearLegacyProfileCache() {
  try {
    await SecureStore.deleteItemAsync(LEGACY_PROFILE_KEY);
  } catch {
    // Ignore legacy cache cleanup failures; AsyncStorage is the source of truth.
  }
}

export async function getStoredUser(): Promise<User | null> {
  const cached = parseStoredUser(await AsyncStorage.getItem(USER_KEY));
  if (cached) return cached;

  const legacy = parseStoredUser(await SecureStore.getItemAsync(LEGACY_PROFILE_KEY));
  if (!legacy) return null;

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(legacy));
  await clearLegacyProfileCache();
  return legacy;
}

export async function setStoredUser(user: User | null): Promise<void> {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY);
    await clearLegacyProfileCache();
    return;
  }

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  await clearLegacyProfileCache();
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string | null) {
  if (!token) return SecureStore.deleteItemAsync(TOKEN_KEY);
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}
