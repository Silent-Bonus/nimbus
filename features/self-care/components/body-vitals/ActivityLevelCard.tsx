import React, { useContext, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import {
  resolveBodyVitalsTypography,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import {
  ACTIVITY_LEVEL_OPTIONS,
  getActivityOption,
} from "@/features/self-care/utils/bodyVitalsUtils";
import type { ColorSet, Spacing } from "@/theme/types";

import { MetricTileShell } from "./MetricTileShell";

type ActivityLevelCardProps = {
  value: number;
  onChange: (value: number) => void;
};

export const ActivityLevelCard = ({
  value,
  onChange,
}: ActivityLevelCardProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const selectedOption = getActivityOption(value);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () => styling(newTheme, spacing, t),
    [newTheme, spacing, t]
  );

  return (
    <MetricTileShell
      accentTint={newTheme.selected}
      label="Activity Level"
      labelSuffix={
        <View style={styles.bandPill}>
          <Text style={styles.bandLabel}>
            {selectedOption.label.toUpperCase()}
          </Text>
        </View>
      }
      style={styles.card}
      contentStyle={styles.content}
    >
      <View style={styles.optionRow}>
        {ACTIVITY_LEVEL_OPTIONS.map((option) => {
          const active = option.key === selectedOption.key;

          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                {option.label}
              </Text>
              <Text style={[styles.optionDescription, active && styles.optionDescriptionActive]}>
                {option.description.toUpperCase()}
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
    card: {
      minHeight: 176,
    },
    content: {
      justifyContent: "space-between",
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
    },
    bandPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.selected ?? "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
    },
    bandLabel: {
      ...t.sectionLabel,
      color: theme.accent,
      opacity: 0.95,
    },
    optionRow: {
      width: "100%",
      flexDirection: "row",
      gap: spacing.sm,
      paddingTop: spacing.sm,
    },
    option: {
      flex: 1,
      minHeight: 78,
      borderRadius: 18,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.sm,
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.borderMuted ?? theme.border,
      shadowColor: theme.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    optionActive: {
      backgroundColor: theme.selected ?? "rgba(163,190,140,0.16)",
      borderColor: theme.accentPressed ?? theme.accent,
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    optionPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    optionLabel: {
      ...t.action,
      color: theme.textSecondary,
      textAlign: "center",
    },
    optionLabelActive: {
      color: theme.accent,
    },
    optionDescription: {
      ...t.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.68,
      textAlign: "center",
    },
    optionDescriptionActive: {
      color: theme.textPrimary,
      opacity: 0.9,
    },
  });
