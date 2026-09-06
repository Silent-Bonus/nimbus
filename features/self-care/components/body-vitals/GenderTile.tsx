import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import {
  resolveBodyVitalsTypography,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import type { SomaticGender } from "@/features/self-care/types/bodyVitals";
import type { ColorSet, Spacing } from "@/theme/types";

import { MetricTileShell } from "./MetricTileShell";

type GenderTileProps = {
  value: SomaticGender;
  onChange: (value: SomaticGender) => void;
  style?: ViewStyle;
};

const OPTIONS: { key: SomaticGender; label: string }[] = [
  { key: "masculine", label: "Masculine" },
  { key: "feminine", label: "Feminine" },
];

export const GenderTile = ({ value, onChange, style }: GenderTileProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () => styling(newTheme, spacing, t),
    [newTheme, spacing, t]
  );

  return (
    <MetricTileShell accentTint={newTheme.selected} label="Gender" style={style}>
      <View style={styles.container}>
        {OPTIONS.map((option) => {
          const active = option.key === value;

          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              onPress={() => onChange(option.key)}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {option.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </MetricTileShell>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: BodyVitalsTypography
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      gap: spacing.sm,
      paddingTop: spacing.xs,
    },
    option: {
      minHeight: 46,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      justifyContent: "center",
    },
    optionActive: {
      backgroundColor: theme.selected ?? "rgba(163,190,140,0.12)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.accentPressed ?? theme.accent,
    },
    optionPressed: {
      opacity: 0.92,
    },
    optionText: {
      ...t.action,
      color: theme.textSecondary,
      opacity: 0.5,
    },
    optionTextActive: {
      color: theme.accent,
      opacity: 1,
    },
  });
