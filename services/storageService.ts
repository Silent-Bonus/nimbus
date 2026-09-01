// services/storageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { StoreKey } from "@/constants/Constant";
import type { UserProfile } from "@/features/auth/types/userProfile";

const LEGACY_PROFILE_KEY = StoreKey.USER_PROFILE_KEY;
const TOKEN_KEY = StoreKey.TOKEN_KEY;

export type User = UserProfile;
export type AppAsyncStorageSchema = {
  [StoreKey.USER_KEY]: User | null;
  [StoreKey.BODY_VITALS_CONTEXT_KEY]: User["vitals_context"] | null;
  [StoreKey.AUTH_SESSION_TEST_MODE_KEY]: string | null;
  [StoreKey.WELCOME_SEEN_KEY]: string | null;
  [StoreKey.THEME_KEY]: string | null;
};
export type AppAsyncStorageKey = keyof AppAsyncStorageSchema;

function parseStoredValue<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as T;
  }
}

async function clearLegacyProfileCache() {
  try {
    await SecureStore.deleteItemAsync(LEGACY_PROFILE_KEY);
  } catch {
    // Ignore legacy cache cleanup failures; AsyncStorage is the source of truth.
  }
}

// Shared AsyncStorage CRUD helpers for app-level cached data.
export async function getStoredValue<K extends AppAsyncStorageKey>(
  key: K
): Promise<AppAsyncStorageSchema[K]> {
  const raw = await AsyncStorage.getItem(key);
  return parseStoredValue<AppAsyncStorageSchema[K]>(raw);
}

export async function setStoredValue<K extends AppAsyncStorageKey>(
  key: K,
  value: AppAsyncStorageSchema[K]
): Promise<void> {
  if (value == null) {
    await AsyncStorage.removeItem(key);
    return;
  }

  if (typeof value === "string") {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeStoredValue(key: AppAsyncStorageKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getStoredUser(): Promise<User | null> {
  const cached = await getStoredValue(StoreKey.USER_KEY);
  if (cached) return cached;

  const legacy = parseStoredValue<User>(
    await SecureStore.getItemAsync(LEGACY_PROFILE_KEY)
  );
  if (!legacy) return null;

  await setStoredValue(StoreKey.USER_KEY, legacy);
  await clearLegacyProfileCache();
  return legacy;
}

export async function setStoredUser(user: User | null): Promise<void> {
  if (!user) {
    await removeStoredValue(StoreKey.USER_KEY);
    await clearLegacyProfileCache();
    return;
  }

  await setStoredValue(StoreKey.USER_KEY, user);
  await clearLegacyProfileCache();
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string | null) {
  if (!token) return SecureStore.deleteItemAsync(TOKEN_KEY);
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}
