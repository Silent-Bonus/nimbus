import React, { useContext, useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  Spacing,
  SvaColorSet,
  SvaTokens,
  Typography,
  TypographyTokens,
} from "@/theme/types";
import { MealCardSurface } from "./MealCardSurface";

type MealPlannerSearchOption = {
  id: number | string;
  title: string;
};

export type MealPlannerSearchDropdownProps = {
  query: string;
  results: readonly MealPlannerSearchOption[];
  isSearching: boolean;
  isSelectionLocked?: boolean;
  minQueryLength?: number;
  onSelectOption: (option: MealPlannerSearchOption) => void;
  onSelectCustom: (query: string) => void;
};

/**
 * Shared recipe search dropdown for day and week planning flows.
 */
export function MealPlannerSearchDropdown({
  query,
  results,
  isSearching,
  isSelectionLocked = false,
  minQueryLength = 3,
  onSelectOption,
  onSelectCustom,
}: MealPlannerSearchDropdownProps) {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  const trimmedQuery = query.trim();

  if (isSelectionLocked || trimmedQuery.length < minQueryLength) {
    return null;
  }

  if (isSearching) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={svaColors.brand.primary} />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <MealCardSurface tone="surface" radius={16} style={styles.dropdown}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.resultItem}
          onPress={() => onSelectCustom(trimmedQuery)}
        >
          <MaterialCommunityIcons
            name="pencil-plus"
            size={16}
            color={svaColors.text.secondary}
          />
          <Text style={styles.resultText}>Use "{trimmedQuery}"</Text>
        </TouchableOpacity>
      </MealCardSurface>
    );
  }

  return (
    <MealCardSurface tone="surface" radius={16} style={styles.dropdown}>
      {results.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          style={[
            styles.resultItem,
            index < results.length - 1 && styles.resultItemBorder,
          ]}
          onPress={() => onSelectOption(item)}
        >
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={16}
            color={svaColors.brand.primary}
          />
          <Text style={styles.resultText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </MealCardSurface>
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
    loaderWrap: {
      marginTop: spacing.sm + 2,
      alignItems: "center",
      justifyContent: "center",
    },
    dropdown: {
      marginTop: spacing.sm,
      padding: spacing.xs,
    },
    resultItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      gap: spacing.sm + 2,
    },
    resultItemBorder: {
      borderBottomWidth: tokens.border.hairline,
      borderBottomColor: theme.border.default,
    },
    resultText: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.primary,
      flex: 1,
    },
  });
