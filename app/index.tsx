// app/index.tsx
import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ROUTES } from "@/constants/routes";
import * as SecureStore from "expo-secure-store";
import { StoreKey } from "@/constants/Constant";
import { getFreshAuthTokenOrClearSession } from "@/services/authSessionService";

const ONBOARDING_DONE_KEY = StoreKey.ONBOARDING_DONE_KEY;

type Href =
  | typeof ROUTES.PUBLIC.LANDING
  | "/(auth)/onboarding/questions"
  | "/(auth)/(tabs)";

export default function Index() {
  const [href, setHref] = useState<Href | null>(null);

  useEffect(() => {
    (async () => {
      /*
       * TEMP: uncomment while working on onboarding.
       * This forces a clean app start by clearing auth/session state before
       * the initial route decision.
       *
       * await Promise.all([
       *   SecureStore.deleteItemAsync(StoreKey.TOKEN_KEY),
       *   SecureStore.deleteItemAsync(StoreKey.REFRESH_TOKEN),
       *   SecureStore.deleteItemAsync(StoreKey.ONBOARDING_DONE_KEY),
       *   SecureStore.deleteItemAsync(StoreKey.LAST_ACTIVE_KEY),
       * ]);
       *
       * setHref(ROUTES.PUBLIC.LANDING);
       * return;
       */

      const token = await getFreshAuthTokenOrClearSession();

      // ✅ No token => always show Landing first
      if (!token) {
        setHref(ROUTES.PUBLIC.LANDING);
        return;
      }

      // ✅ Token exists => decide onboarding vs tabs
      const done =
        (await SecureStore.getItemAsync(ONBOARDING_DONE_KEY)) === "true";

      setHref(done ? "/(auth)/(tabs)" : "/(auth)/onboarding/questions");
    })();
  }, []);

  if (!href) return null;
  return <Redirect href={href} />;
}
