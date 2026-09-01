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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import type { ColorSet, Spacing } from "@/theme/types";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type ToolAction = {
  label: string;
  icon: IconName;
  route: string;
};

type ToolSection = {
  eyebrow: string;
  title: string;
  chipIcon: IconName;
  actions: ToolAction[];
};

type ToolFonts = {
  serif: string;
  mono: string;
  action: string;
};

const TOOL_SECTION: ToolSection = {
  eyebrow: "Blueprint Library",
  title: "Workbench",
  chipIcon: "toolbox-outline",
  actions: [
    {
      label: "Protocol Template",
      icon: "clipboard-text-outline",
      route: ROUTES.AUTH.TOOLS_CURATED_MANIFESTS,
    },
    {
      label: "Articles",
      icon: "newspaper-variant-outline",
      route: ROUTES.AUTH.TOOLS_ARTICLE_LIST,
    },
    {
      label: "Recipe",
      icon: "silverware-fork-knife",
      route: ROUTES.AUTH.TOOLS_RECIPE,
    },
    {
      label: "Meal Planner",
      icon: "calendar-heart",
      route: ROUTES.AUTH.TOOLS_MEAL_PLANNER,
    },
  ],
};

const ToolActionTile = ({
  action,
  onPress,
  iconColor,
  styles,
}: {
  action: ToolAction;
  onPress: (route: string) => void;
  iconColor: string;
  styles: ReturnType<typeof makeStyles>;
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={() => onPress(action.route)}
      style={({ pressed }) => [
        styles.actionTile,
        pressed && styles.actionTilePressed,
      ]}
    >
      <View style={styles.actionIconWrap}>
        <MaterialCommunityIcons
          name={action.icon}
          size={18}
          color={iconColor}
        />
      </View>

      <Text style={styles.actionLabel} numberOfLines={2}>
        {action.label}
      </Text>
    </Pressable>
  );
};

const ToolSectionCard = ({
  section,
  onPress,
  chipIconColor,
  styles,
}: {
  section: ToolSection;
  onPress: (route: string) => void;
  chipIconColor: string;
  styles: ReturnType<typeof makeStyles>;
}) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionInner}>
        <View style={styles.sectionTopRow}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionEyebrow} numberOfLines={1}>
              {section.eyebrow}
            </Text>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              {section.title}
            </Text>
          </View>

          <View style={styles.sectionChip}>
            <MaterialCommunityIcons
              name={section.chipIcon}
              size={18}
              color={chipIconColor}
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          {section.actions.map((action) => (
            <ToolActionTile
              key={action.label}
              action={action}
              onPress={onPress}
              iconColor={chipIconColor}
              styles={styles}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default function ToolsLandingScreen() {
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const fonts = useMemo<ToolFonts>(
    () => ({
      serif:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      mono:
        svaTypography?.textStyle.authMonoLabel.fontFamily ?? "SpaceMono-Regular",
      action: typography.button.fontFamily ?? "Outfit_600SemiBold",
    }),
    [svaTypography, typography.button.fontFamily]
  );

  const styles = useMemo(
    () => makeStyles(theme, spacing, fonts),
    [theme, spacing, fonts]
  );
  const contentBottomPadding = insets.bottom + spacing.xl * 2.5;

  const onRoutePress = (route: string) => {
    router.push(route as never);
  };

  return (
    <ScreenView bgColor={theme.background} padding={0} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.root}>
        <AppHeader
          title="Tools"
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
            <ToolSectionCard
              section={TOOL_SECTION}
              onPress={onRoutePress}
              chipIconColor={theme.accent}
              styles={styles}
            />
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
    sectionCard: {
      borderRadius: 30,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.32,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 9,
    },
    sectionInner: {
      paddingHorizontal: 18,
      paddingVertical: 18,
    },
    sectionTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    sectionCopy: {
      flex: 1,
      paddingRight: 12,
    },
    sectionEyebrow: {
      fontFamily: fonts.mono,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color: theme.textSecondary,
      opacity: 0.9,
    },
    sectionTitle: {
      marginTop: 6,
      fontFamily: fonts.serif,
      fontSize: 32,
      lineHeight: 34,
      color: theme.textPrimary,
    },
    sectionChip: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    actionTile: {
      width: "48%",
      minHeight: 98,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 14,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      marginBottom: spacing.sm,
    },
    actionTilePressed: {
      backgroundColor: theme.surface,
      borderColor: theme.accent,
      transform: [{ scale: 0.98 }],
    },
    actionIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    actionLabel: {
      fontFamily: fonts.action,
      fontSize: 13,
      lineHeight: 16,
      letterSpacing: 0.2,
      color: theme.textPrimary,
      textAlign: "center",
      opacity: 0.94,
    },
  });
