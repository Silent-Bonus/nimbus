// app/_layout.tsx
import React, { useEffect } from "react";
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
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_600SemiBold,
} from "@expo-google-fonts/outfit";
import {
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from "@expo-google-fonts/urbanist";

import AuthProvider from "@/contexts/AuthContext";
import { PremiumGateProvider } from "@/contexts/PremiumGateContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
// import HabitContext from "@/context/HabitContext";
import { NimbusAlertProvider } from "@/components/ui/alert/NimbusAlertProvider";
import { NimbusToastHost } from "@/components/ui/toast/NimbusToast";

SplashScreen.preventAutoHideAsync();

// ✅ Force cold start to (public)
export const unstable_settings = {
  initialRouteName: "(public)",
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_600SemiBold,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
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
            {/* <HabitContext.Provider value={{ habitData, setHabitData }}> */}
            <Stack screenOptions={{ headerShown: false }}>
              {/* ✅ explicitly declare groups */}
              <Stack.Screen name="(public)" />
              <Stack.Screen name="(auth)" />
            </Stack>

            <NimbusToastHost />
            {/* </HabitContext.Provider> */}
          </NimbusAlertProvider>
        </PremiumGateProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
