// app/_layout.tsx
import React, { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";

import AuthProvider from "@/contexts/AuthContext";
import { PremiumGateProvider } from "@/contexts/PremiumGateContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MeditationSessionProvider } from "@/contexts/MeditationSessionContext";
// import HabitContext from "@/context/HabitContext";
import { NimbusAlertProvider } from "@/components/ui/alert/NimbusAlertProvider";
import { NimbusToastHost } from "@/components/ui/toast/NimbusToast";
import { FloatingMeditationControl } from "@/components/ui/FloatingMeditationControl";

// Register before the first render; Expo Go/fast refresh may already have
// dismissed the native splash, so never let this promise become unhandled.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

// ✅ Force cold start to (public)
export const unstable_settings = {
  initialRouteName: "(public)",
};

export default function RootLayout() {
  const splashHidden = useRef(false);
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded || splashHidden.current) return;

    splashHidden.current = true;
    // The native view controller can disappear during reload/navigation.
    // Treat that case as already hidden instead of creating an unhandled error.
    void SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PremiumGateProvider>
          <NimbusAlertProvider>
            <MeditationSessionProvider>
              {/* <HabitContext.Provider value={{ habitData, setHabitData }}> */}
              <Stack screenOptions={{ headerShown: false }}>
                {/* ✅ explicitly declare groups */}
                <Stack.Screen name="(public)" />
                <Stack.Screen name="(auth)" />
              </Stack>

              <FloatingMeditationControl />
              <NimbusToastHost />
              {/* </HabitContext.Provider> */}
            </MeditationSessionProvider>
          </NimbusAlertProvider>
        </PremiumGateProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
