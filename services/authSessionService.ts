import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { StoreKey } from "@/constants/Constant";
import { clearStoredBodyVitalsContext } from "@/features/self-care/services/body-vitals/storage";
import { setStoredUser } from "@/services/storageService";

export const AUTH_SESSION_DEFAULT_TIMEOUT_MS = 15 * 24 * 60 * 60 * 1000;
export const AUTH_SESSION_TEST_TIMEOUT_MS = 15 * 60 * 1000;

const TEST_MODE_KEY = StoreKey.AUTH_SESSION_TEST_MODE_KEY;

async function clearAuthStorage() {
  delete axios.defaults.headers.common["Authorization"];
  await Promise.allSettled([
    SecureStore.deleteItemAsync(StoreKey.TOKEN_KEY),
    SecureStore.deleteItemAsync(StoreKey.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(StoreKey.ONBOARDING_DONE_KEY),
    SecureStore.deleteItemAsync(StoreKey.LAST_ACTIVE_KEY),
    clearStoredBodyVitalsContext(),
    setStoredUser(null),
  ]);
}

export async function clearAuthSession() {
  await clearAuthStorage();
}

export async function getAuthSessionTestModeEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(TEST_MODE_KEY)) === "true";
}

export async function setAuthSessionTestModeEnabled(
  enabled: boolean
): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(TEST_MODE_KEY, "true");
    return;
  }

  await AsyncStorage.removeItem(TEST_MODE_KEY);
}

export async function getAuthSessionTimeoutMs(): Promise<number> {
  const testModeEnabled = await getAuthSessionTestModeEnabled();
  return testModeEnabled
    ? AUTH_SESSION_TEST_TIMEOUT_MS
    : AUTH_SESSION_DEFAULT_TIMEOUT_MS;
}

export async function touchAuthSessionActivity(): Promise<void> {
  await SecureStore.setItemAsync(
    StoreKey.LAST_ACTIVE_KEY,
    String(Date.now())
  );
}

export async function getFreshAuthTokenOrClearSession(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(StoreKey.TOKEN_KEY);
  if (!token) return null;

  const lastActiveRaw = await SecureStore.getItemAsync(StoreKey.LAST_ACTIVE_KEY);
  const lastActive = Number(lastActiveRaw);

  if (!lastActiveRaw || !Number.isFinite(lastActive)) {
    await touchAuthSessionActivity();
    return token;
  }

  const timeoutMs = await getAuthSessionTimeoutMs();
  const isExpired = Date.now() - lastActive >= timeoutMs;

  if (isExpired) {
    await clearAuthStorage();
    return null;
  }

  return token;
}
