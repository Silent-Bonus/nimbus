import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useContext, useState } from "react";
import { AppState } from "react-native";
import { router, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

import { StoreKey } from "@/constants/Constant";
import { API_ENDPOINTS } from "@/config/apiConfig";
import { ROUTES } from "@/constants/routes";
import type { UserProfile } from "@/features/auth/types/userProfile";
import {
  login,
  signup,
  logout,
  getUserDetails,
  saveUpdateUser,
} from "@/features/auth/services/loginService";
import {
  clearUserProfileSync,
  publishUserProfileSync,
  subscribeToUserProfileSync,
  syncAndPublishUserProfile,
} from "@/features/auth/services/userProfileSyncService";
import { User, getStoredUser } from "@/services/storageService";
import {
  clearAuthSession,
  getAuthSessionTestModeEnabled,
  getFreshAuthTokenOrClearSession,
  setAuthSessionTestModeEnabled,
  touchAuthSessionActivity,
} from "@/services/authSessionService";

export async function clearAuthAndOnboarding() {
  await clearAuthSession();
}

// Cache Token Key
const TOKEN_KEY = StoreKey.TOKEN_KEY;
const REFRESH_TOKEN = StoreKey.REFRESH_TOKEN;
const AUTH_ENDPOINTS = [
  API_ENDPOINTS.login,
  API_ENDPOINTS.register,
  API_ENDPOINTS.logout,
  API_ENDPOINTS.getOtp,
  API_ENDPOINTS.verifyOtp,
  API_ENDPOINTS.setPassword,
  API_ENDPOINTS.forgotPassword,
  API_ENDPOINTS.changePassword,
];

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.startsWith(endpoint));
}

interface AuthProps {
  authState?: { token: string | null; authenticated: boolean | null };
  onRegister?: (
    username: string,
    fullName: string,
    countryCode: string,
    mobile: string,
    email: string,
    password: string
  ) => Promise<any>;
  onLogin?: (userName: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
  userProfile?: UserProfile | null;
  getUserDetails?: () => Promise<any>;
  updateProfile?: (val: any) => Promise<any>;
  loadUserFromStorage?: () => Promise<any>;
  resetToPublic?: () => Promise<void>;
  markOnboardingDone?: () => Promise<void>;
  onboardingDone?: boolean | null;
  authSessionTestMode?: boolean;
  setAuthSessionTestMode?: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  if (!useContext(AuthContext)) {
    throw new Error("useAuth must be used within a <AuthProvider />");
  }

  return useContext(AuthContext);
};

function useProtectedRoute(
  authState: { token: string | null; authenticated: boolean | null },
  onboardingDone: boolean | null
) {
  const segments = useSegments() as string[];
  const hasSegments = segments.length > 0;
  const segmentsKey = segments.join("/");
  const root = segments[0];
  const child = segments[1];

  useEffect(() => {
    if (authState.authenticated === null) return;
    if (!hasSegments) return;

    const isAuthed = authState.authenticated === true;

    if (isAuthed && onboardingDone === null) return;

    // not authed -> block auth routes
    if (!isAuthed && root === "(auth)") {
      router.replace(ROUTES.PUBLIC.LANDING);
      return;
    }

    // authed but onboarding not done -> must be in onboarding
    if (isAuthed && onboardingDone === false) {
      const inOnboarding = root === "(auth)" && child === "onboarding";
      if (!inOnboarding) router.replace("/(auth)/onboarding/questions");
      return;
    }

    // authed + onboarding done -> block public screens only
    if (isAuthed && onboardingDone === true) {
      if (root === "(public)") router.replace("/(auth)/(tabs)");
      return; // ✅ allow any /(auth) route
    }
    if (isAuthed && onboardingDone === null) return;
  }, [authState.authenticated, onboardingDone, hasSegments, root, child, segmentsKey]);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({ token: null, authenticated: null });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [authSessionTestMode, setAuthSessionTestModeState] =
    useState<boolean>(false);

  const sessionClearInProgressRef = useRef(false);
  const authStateRef = useRef(authState);

  useEffect(() => {
    return subscribeToUserProfileSync((profile) => {
      setUserProfile(profile);
    });
  }, []);

  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);

  useEffect(() => {
    (async () => {
      const key = await SecureStore.getItemAsync(StoreKey.ONBOARDING_DONE_KEY);

      // If user is authenticated and key is missing, treat as existing user => skip onboarding
      if (authState.authenticated === true && key == null) {
        await SecureStore.setItemAsync(StoreKey.ONBOARDING_DONE_KEY, "true");
        setOnboardingDone(true);
        return;
      }

      if (key === "true") setOnboardingDone(true);
      else if (key === "false") setOnboardingDone(false);
      else setOnboardingDone(null); // still not sure (pre-login state)
    })();
  }, [authState.authenticated]);

  useEffect(() => {
    (async () => {
      const enabled = await getAuthSessionTestModeEnabled();
      setAuthSessionTestModeState(enabled);
    })();
  }, []);

  const clearLocalSession = useCallback(async () => {
    if (sessionClearInProgressRef.current) return;

    sessionClearInProgressRef.current = true;

    try {
      await clearAuthSession();
    } catch {
      // Keep going: state must still be cleared locally.
    } finally {
      delete axios.defaults.headers.common["Authorization"];
      setAuthState({ token: null, authenticated: false });
      clearUserProfileSync();
      setOnboardingDone(null);
      sessionClearInProgressRef.current = false;
    }
  }, []);

  const setAuthSessionTestMode = useCallback(async (enabled: boolean) => {
    await setAuthSessionTestModeEnabled(enabled);
    setAuthSessionTestModeState(enabled);
  }, []);

  const resetToPublic = useCallback(async () => {
    await clearLocalSession();

    router.replace(ROUTES.PUBLIC.LANDING);
  }, [clearLocalSession]);

  // Helper: set axios auth header + save token to secure store
  const applyAccessToken = async (accessToken: string | null) => {
    if (accessToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setAuthState({ token: accessToken, authenticated: true });
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      try {
        await touchAuthSessionActivity();
      } catch {
        // A missing activity timestamp should not block login.
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setAuthState({ token: null, authenticated: false });
    }
  };

  const loadUserFromStorage = useCallback(async (): Promise<User | null> => {
    return await getStoredUser();
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getFreshAuthTokenOrClearSession();
        const ob = await SecureStore.getItemAsync(StoreKey.ONBOARDING_DONE_KEY);

        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setAuthState({ token, authenticated: true });

          const cachedProfile = await getStoredUser();
          if (cachedProfile) {
            await publishUserProfileSync(cachedProfile);
          }
          setOnboardingDone(ob === "true");
          return;
        }

        delete axios.defaults.headers.common["Authorization"];
        setAuthState({ token: null, authenticated: false });
        clearUserProfileSync();
        setOnboardingDone(null);
      } catch {
        delete axios.defaults.headers.common["Authorization"];
        setAuthState({ token: null, authenticated: false });
        clearUserProfileSync();
        setOnboardingDone(null);
      }
    };

    void loadToken();
  }, []);

  useEffect(() => {
    if (authState.authenticated !== true) return;

    const checkSessionFreshness = async () => {
      if (sessionClearInProgressRef.current) return;

      const token = await getFreshAuthTokenOrClearSession();
      if (!token) {
        await resetToPublic();
      }
    };

    void checkSessionFreshness();

    const interval = setInterval(() => {
      void checkSessionFreshness();
    }, 60 * 1000);

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void checkSessionFreshness();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [authState.authenticated, resetToPublic]);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (authStateRef.current.authenticated !== true) {
          return config;
        }

        if (isAuthEndpoint(config.url)) {
          return config;
        }

        const token = await getFreshAuthTokenOrClearSession();
        if (!token) {
          await resetToPublic();
          return Promise.reject(new Error("Session expired"));
        }

        await touchAuthSessionActivity();
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (authStateRef.current.authenticated !== true) {
          return Promise.reject(error);
        }

        const url = error?.config?.url as string | undefined;
        if (error?.response?.status === 401 && !isAuthEndpoint(url)) {
          await resetToPublic();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [resetToPublic]);

  const markOnboardingDone = useCallback(async () => {
    await SecureStore.setItemAsync(StoreKey.ONBOARDING_DONE_KEY, "true");
    setOnboardingDone(true);
  }, []);

  // test added optional paramter
  const _register = async (
    username: string,
    fullName: string,
    countryCode: string,
    mobile: string,
    email?: string,
    password?: string
  ) => {
    try {
      const cleanedMobile = mobile.trim();
      const normalizedCountryCode = countryCode.trim().startsWith("+")
        ? countryCode.trim()
        : `+${countryCode.trim()}`;

      const request = {
        username: username,
        email,
        phone_number: `${normalizedCountryCode}${cleanedMobile}`,
        full_name: fullName,
        password,
      };
      const result = await signup(request);
      const { success, data } = result || {};
      // ✅ If backend returns tokens on signup, apply them immediately
      if (success && data?.access) {
        await SecureStore.setItemAsync(
          StoreKey.REFRESH_TOKEN,
          data.refresh ?? ""
        );
        await applyAccessToken(data.access);
        await SecureStore.setItemAsync(StoreKey.ONBOARDING_DONE_KEY, "false");
        setOnboardingDone(false);
        return result;
      }
    } catch {
      return {
        success: false,
        error: true,
        message: "Signup failed",
      };
    }
  };

  const _login = async (userName: string, password: string) => {
    try {
      const request = {
        username: userName,
        password: password,
      };

      const result = await login(request);
      const { success, message, data } = result;

      if (success && "email" in data) {
        const { access, refresh } = data;
        await applyAccessToken(access);

        await SecureStore.setItemAsync(REFRESH_TOKEN, refresh);

        const ob = await SecureStore.getItemAsync(StoreKey.ONBOARDING_DONE_KEY);
        if (ob == null) {
          await SecureStore.setItemAsync(StoreKey.ONBOARDING_DONE_KEY, "true");
          setOnboardingDone(true);
        }

        await _fetchUserProfile();
      } else {
        console.error("Login failed:", message);
      }

      return result;
    } catch (e) {
      return { error: true, msg: (e as any).response.data.msg };
    }
  };

  const _logout = async () => {
    const ref = await SecureStore.getItem(REFRESH_TOKEN);
    try {
      const request = {
        refresh: ref ?? "",
      };

      await logout(request);
    } catch {
      // best effort remote logout; local session will still be cleared.
    }

    await resetToPublic();
  };

  // single place to update state + storage from server
  const _fetchUserProfile = async () => {
    try {
      const response = await getUserDetails();
      const { success, data } = response;

      if (success && data) {
        return await syncAndPublishUserProfile(data);
      }

      return null;
    } catch (e) {
      console.error("Failed to fetch user profile", e);
      return null;
    }
  };

  const updateProfile = useCallback(
    async (payload: any): Promise<any> => {
      try {
        const res = await saveUpdateUser(payload); // your API
        // if your API shape is { success, data: { user }, message }
        if (res?.success && res?.data) {
          await syncAndPublishUserProfile(res.data); // keep app + storage in sync
        }
        return res; // caller decides what to do
      } catch (err: any) {
        // keep errors visible to caller
        return {
          success: false,
          message: err?.response?.data?.message ?? "Update failed",
        };
      }
    },
    []
  );

  const value = {
    onRegister: _register,
    onLogin: _login,
    onLogout: _logout,
    userProfile,
    authState,
    authSessionTestMode,
    setAuthSessionTestMode,
    resetToPublic,
    getUserDetails: _fetchUserProfile,
    updateProfile: updateProfile,
    loadUserFromStorage: loadUserFromStorage,
    markOnboardingDone,
    onboardingDone,
  };

  useProtectedRoute(authState, onboardingDone);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
