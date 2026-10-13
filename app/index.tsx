// app/index.tsx
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";

type Href =
  | typeof ROUTES.PUBLIC.SIGN_IN
  | "/(auth)/onboarding/questions"
  | "/(auth)/(tabs)";

export default function Index() {
  const { authState, authReady, onboardingDone } = useAuth();
  if (!authReady || authState?.authenticated == null) {
    return (
      <View style={styles.startupFallback}>
        <ActivityIndicator color="#D7E6C2" />
        <Text style={styles.startupFallbackText}>Getting things ready…</Text>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  startupFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#1C1E1A",
  },
  startupFallbackText: {
    color: "#D7E6C2",
    fontSize: 15,
  },
});
