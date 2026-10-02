// app/index.tsx
import React from "react";
import { Redirect } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";

type Href =
  | typeof ROUTES.PUBLIC.SIGN_IN
  | "/(auth)/onboarding/questions"
  | "/(auth)/(tabs)";

export default function Index() {
  const { authState, authReady, onboardingDone } = useAuth();
  if (!authReady || authState?.authenticated == null) return null;

  let href: Href;
  if (authState.authenticated) {
    href = onboardingDone
      ? "/(auth)/(tabs)"
      : "/(auth)/onboarding/questions";
  } else {
    href = ROUTES.PUBLIC.SIGN_IN;
  }
  return <Redirect href={href} />;
}
