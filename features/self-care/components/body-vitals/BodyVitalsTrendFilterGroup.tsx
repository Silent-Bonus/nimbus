import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  useBodyVitalsTheme,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import type { ColorSet, Spacing } from "@/theme/types";

type BodyVitalsTrendFilterGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  getOptionLabel?: (value: T) => string;
};

export function BodyVitalsTrendFilterGroup<T extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  getOptionLabel,
}: BodyVitalsTrendFilterGroupProps<T>) {
  const { newTheme, spacing, bodyVitalsTypography } = useBodyVitalsTheme();
  const styles = useMemo(
    () => styling(newTheme, spacing, bodyVitalsTypography),
    [newTheme, spacing, bodyVitalsTypography]
  );

  return (
    <View style={styles.block}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterRow}>
        {options.map((option) => {
          const active = option === selectedValue;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {getOptionLabel ? getOptionLabel(option) : option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: BodyVitalsTypography
) =>
  StyleSheet.create({
    block: {
      gap: spacing.sm,
    },
    filterLabel: {
      ...t.sectionLabel,
      color: theme.textSecondary,
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
    },
    filterChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterChipText: {
      ...t.action,
      color: theme.textPrimary,
    },
    filterChipTextActive: {
      color: theme.background,
    },
  });
