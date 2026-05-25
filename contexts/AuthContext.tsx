import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useContext, useState } from "react";
import { router, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

import { StoreKey } from "@/constants/Constant";
import { ROUTES } from "@/constants/routes";
import {
  normalizeUserProfile,
} from "@/features/auth/utils/userEntitlements";
import type { UserProfile } from "@/features/auth/types/userProfile";
import {
  login,
  signup,
  logout,
  getUserDetails,
  saveUpdateUser,
} from "@/features/auth/services/loginService";
import { setStoredUser, User, getStoredUser } from "@/services/storageService";
import { storageKey } from "@/services/remiderStorageService";

export async function clearAuthAndOnboarding() {
  await SecureStore.deleteItemAsync(StoreKey.TOKEN_KEY);
  await SecureStore.deleteItemAsync(StoreKey.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(StoreKey.ONBOARDING_DONE_KEY);
}

const resetApp = async () => {
  await clearAuthAndOnboarding();
  router.replace(ROUTES.PUBLIC.LANDING);
};

// Cache Token Key
const TOKEN_KEY = StoreKey.TOKEN_KEY;
const USER_KEY = StoreKey.USER_KEY;
const REFRESH_TOKEN = StoreKey.REFRESH_TOKEN;
const USER_PROFILE_KEY = StoreKey.USER_PROFILE_KEY;
const LAST_ACTIVE_KEY = StoreKey.LAST_ACTIVE_KEY;
const WELCOME_SEEN_KEY = StoreKey.WELCOME_SEEN_KEY;
const ONBOARDING_DONE_KEY = StoreKey.ONBOARDING_DONE_KEY;

// Refresh intervals & expiry
const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const AUTO_LOGOUT_DAYS = 15;
const AUTO_LOGOUT_MS = AUTO_LOGOUT_DAYS * 24 * 60 * 60 * 1000;

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
  user?: User;
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

  useEffect(() => {
    if (authState.authenticated === null) return;
    if (!segments?.length) return;

    const isAuthed = authState.authenticated === true;
    const root = segments[0];
    const child = segments[1];

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
  }, [authState.authenticated, onboardingDone, segments.join("/")]);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();
  const [loggedInUser, setLoggedInUser] = useState<{
    email: string | null;
    username: string | null;
  } | null>();

  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({ token: null, authenticated: null });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

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

  // refs for refresh flow
  const isRefreshingRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: set axios auth header + save token to secure store
  const applyAccessToken = async (accessToken: string | null) => {
    if (accessToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setAuthState({ token: accessToken, authenticated: true });
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      // update last active timestamp on token set
      await SecureStore.setItemAsync(LAST_ACTIVE_KEY, String(Date.now()));
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setAuthState({ token: null, authenticated: false });
    }
  };

  // Helper: get refresh token from store
  const getStoredRefreshToken = async () => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN);
  };

  const loadUserFromStorage = useCallback(async (): Promise<User | null> => {
    const cached = await getStoredUser();
    // console.log(cached, "cached");
    if (cached) {
      // setUser(cached);
      // setUserProfile(cached as any);
    }
    return cached;
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      resetApp();
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN);
        const profileInfo = await SecureStore.getItemAsync(USER_PROFILE_KEY);

        // ✅ Always load onboarding key too
        const ob = await SecureStore.getItemAsync(StoreKey.ONBOARDING_DONE_KEY);

        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setAuthState({ token, authenticated: true });

          if (profileInfo) {
            // Temporary entitlement seed: default to a free profile until the backend sends tier data consistently.
            const cachedProfile = normalizeUserProfile(JSON.parse(profileInfo));
            if (cachedProfile) setUserProfile(cachedProfile);
          }
          // ✅ If key missing, decide a default (recommended: false)
          setOnboardingDone(ob === "true");
        } else {
          setAuthState({ token: null, authenticated: false });
        }
      } catch (e) {
        setAuthState({ token: null, authenticated: false });
      }
    };

    loadToken();
  }, []);

  useEffect(() => {
    (async () => {
      const v = await SecureStore.getItemAsync(StoreKey.ONBOARDING_DONE_KEY);
      console.log("onboardingDone key: auth", v);
    })();
  }, []);

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
        await SecureStore.setItemAsync(StoreKey.TOKEN_KEY, data.access);
        await SecureStore.setItemAsync(StoreKey.ONBOARDING_DONE_KEY, "false");
        setOnboardingDone(false);
        await applyAccessToken(data.access); // sets axios header + authState + TOKEN_KEY
        // await _fetchUserProfile(); // optional but recommended

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.access}`;
        setAuthState({ token: data.access, authenticated: true });
        return result;
      }
    } catch (e) {
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
        const { username, email, ...tokens } = data; // Destructuring user details separately
        const userInfo = {
          email: email,
          username: username,
        };
        setAuthState({
          token: tokens.access,
          authenticated: true,
        });
        setLoggedInUser(userInfo);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokens.access}`;

        await SecureStore.setItemAsync(TOKEN_KEY, tokens.access);

        await SecureStore.setItemAsync(REFRESH_TOKEN, tokens.refresh);

        const ob = await SecureStore.getItemAsync(StoreKey.ONBOARDING_DONE_KEY);
        if (ob == null) {
          await SecureStore.setItemAsync(StoreKey.ONBOARDING_DONE_KEY, "true");
          setOnboardingDone(true);
        }

        await _fetchUserProfile();

        // await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userInfo));
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

      const result = await logout(request);

      if (result.success && result.message) {
        await clearAuthAndOnboarding();
        await SecureStore.setItemAsync(TOKEN_KEY, "");
        setOnboardingDone(null);
        delete axios.defaults.headers.common["Authorization"];
        await SecureStore.setItemAsync(USER_KEY, "");
        await SecureStore.setItemAsync(REFRESH_TOKEN, "");
        setLoggedInUser({ username: null, email: null });
        setAuthState({
          authenticated: false,
          token: null,
        });
        setUserProfile(null);
        router.replace(ROUTES.PUBLIC.LANDING);
      }
    } catch (e) {}
  };

  // single place to update state + storage from server
  const applyServerUser = useCallback(async (serverUser: User) => {
    setUser(serverUser);
    await setStoredUser(serverUser);
  }, []);

  // public helpers
  // const setLocalUser = useCallback(async (u: User | null) => {
  //   setUser(u);
  //   await setStoredUser(u);
  // }, []);

  const resetToPublic = useCallback(async () => {
    await SecureStore.deleteItemAsync(StoreKey.TOKEN_KEY);
    await SecureStore.deleteItemAsync(StoreKey.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(StoreKey.ONBOARDING_DONE_KEY);
    setOnboardingDone(null);
    delete axios.defaults.headers.common["Authorization"];

    setAuthState({ token: null, authenticated: false });
    setUserProfile(null);

    router.replace(ROUTES.PUBLIC.LANDING);
  }, []);

  const _fetchUserProfile = async () => {
    try {
      const response = await getUserDetails(); // 👈 your backend endpoint
      const { success, message, data } = response;
      // console.log(response, "response auth context");
      const { username, email, id, ...tokens } = data;
      if (success && "email" in data) {
        // console.log(response, "conimg response auth context 2222");

        const {
          username,
          email,
          first_name,
          id,
          last_name,
          profile,
          settings,
          avatar,
          notifications,
          ...tokens
        } = data;
        const usr = normalizeUserProfile({
          id: id,
          avatar: data.avatar || null,
          username: username,
          email: email,
          first_name: first_name,
          last_name: last_name,
          profile: profile,
          settings: settings,
          notifications: notifications,
        });
        if (usr) {
          await applyServerUser(usr as any);
        }
        // const profileInfo = await SecureStore.getItem(USER_PROFILE_KEY);
        await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(usr));
        setUserProfile(usr);
        return usr;
      }
      // return response;
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
          const { success, message, data } = res;
          const {
            id,
            username,
            email,
            first_name,
            last_name,
            profile,
            settings,
            address,
            notifications,
            notification_preferences,
          } = data;
          const usr = normalizeUserProfile({
            id: id,
            username: username,
            email: email,
            avatar: profile?.avatar || null,
            first_name: first_name,
            last_name: last_name,
            profile: profile,
            settings: settings,
            notifications: notifications,
          });
          await applyServerUser(usr as any); // keep app + storage in sync
          await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(usr));
          setUserProfile(usr);
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
    [applyServerUser]
  );

  const value = {
    onRegister: _register,
    onLogin: _login,
    onLogout: _logout,
    userProfile,
    authState,
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
