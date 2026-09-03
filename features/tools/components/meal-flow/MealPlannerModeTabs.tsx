import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  Spacing,
  SvaColorSet,
  SvaTokens,
  Typography,
  TypographyTokens,
} from "@/theme/types";

export type MealPlannerMode = "day" | "week";

export type MealPlannerModeTabsProps = {
  activeTab: MealPlannerMode;
  onChange: (tab: MealPlannerMode) => void;
};

/**
 * Shared top-level mode switch for day and week planner flows.
 */
export function MealPlannerModeTabs({
  activeTab,
  onChange,
}: MealPlannerModeTabsProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange("day")}
        style={[styles.tab, activeTab === "day" && styles.activeTab]}
      >
        <Text style={[styles.tabText, activeTab === "day" && styles.activeTabText]}>
          Day Meal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange("week")}
        style={[styles.tab, activeTab === "week" && styles.activeTab]}
      >
        <Text
          style={[styles.tabText, activeTab === "week" && styles.activeTabText]}
        >
          Week Plan
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  tokens: SvaTokens
) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: "row",
      backgroundColor: theme.bg.subtle,
      borderRadius: tokens.radius.card,
      padding: spacing.xs,
      marginBottom: spacing.lg,
    },
    tab: {
      flex: 1,
      minHeight: tokens.size.buttonHeight - 4,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: tokens.radius.button,
    },
    activeTab: {
      backgroundColor: theme.surface.base,
      shadowColor: theme.shadow.default,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.secondary,
    },
    activeTabText: {
      color: theme.brand.primary,
    },
  });
