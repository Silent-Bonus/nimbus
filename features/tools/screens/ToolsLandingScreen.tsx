import React, { useContext, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";
import { ROUTES } from "@/constants/routes";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import type { ColorSet, Spacing } from "@/theme/types";
import RecipeHighlightsRail from "@/features/tools/components/RecipeHighlightsRail";
import ProtocolHighlightsRail from "@/features/tools/components/ProtocolHighlightsRail";
import ArticleHighlightsRail from "@/features/tools/components/ArticleHighlightsRail";

type ToolFonts = {
  serif: string;
  mono: string;
  action: string;
};

export default function ToolsLandingScreen() {
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const fonts = useMemo<ToolFonts>(
    () => ({
      serif:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      mono:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        SVATypography.fontFamily.mono,
      action: svaTypography.textStyle.button.fontFamily ?? SVATypography.fontFamily.bodyStrong,
    }),
    [svaTypography.textStyle.button.fontFamily]
  );

  const styles = useMemo(
    () => makeStyles(theme, spacing, fonts),
    [theme, spacing, fonts]
  );
  const contentBottomPadding = insets.bottom + spacing.xl * 2.5;

  return (
    <ScreenView bgColor={theme.background} padding={0} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.root}>
        <AppHeader
          title="Tools"
          subtitle="A quiet orbit for mind, body, soul."
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentBottomPadding },
          ]}
        >
          <View style={styles.sectionStack}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Scribble"
              onPress={() => router.push(ROUTES.AUTH.TOOLS_SCRIBBLE_LIST as never)}
              style={({ pressed }) => [
                styles.scribbleCard,
                pressed && styles.scribblePressed,
              ]}
            >
              <LinearGradient
                colors={["#303A28", "#22271F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.scribbleIcon}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={23}
                  color={theme.accent}
                />
              </View>
              <View style={styles.scribbleCopy}>
                <Text style={styles.scribbleEyebrow}>MAKE SPACE FOR THOUGHTS</Text>
                <Text style={styles.scribbleTitle}>Scribble</Text>
                <Text style={styles.scribbleDescription} numberOfLines={2}>
                  Capture your thoughts, ideas, and reflections in one place.
                </Text>
              </View>
              <View style={styles.scribbleArrow}>
                <Ionicons name="arrow-forward" size={17} color={theme.background} />
              </View>
            </Pressable>
            <RecipeHighlightsRail />
            <ProtocolHighlightsRail />
            <ArticleHighlightsRail />
          </View>
        </ScrollView>
      </View>
    </ScreenView>
  );
}

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  fonts: ToolFonts
) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    header: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingTop: spacing.xs,
    },
    sectionStack: {
      gap: spacing.md,
    },
    scribbleCard: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: 138,
      padding: spacing.md,
      borderRadius: 25,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 7 },
      elevation: 6,
    },
    scribblePressed: {
      transform: [{ scale: 0.985 }],
      borderColor: theme.accent,
    },
    scribbleIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.2)",
    },
    scribbleCopy: {
      flex: 1,
      minWidth: 0,
    },
    scribbleEyebrow: {
      fontFamily: fonts.mono,
      fontSize: 9,
      lineHeight: 12,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      color: theme.accent,
    },
    scribbleTitle: {
      marginTop: 3,
      fontFamily: fonts.serif,
      fontSize: 24,
      lineHeight: 28,
      color: theme.textPrimary,
    },
    scribbleDescription: {
      marginTop: 4,
      fontFamily: fonts.action,
      fontSize: 11,
      lineHeight: 16,
      color: theme.textSecondary,
    },
    scribbleArrow: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
  });
