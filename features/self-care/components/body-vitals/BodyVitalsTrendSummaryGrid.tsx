import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  useBodyVitalsTheme,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import type { ColorSet, Spacing } from "@/theme/types";

export type BodyVitalsTrendSummaryItem = {
  key: string;
  label: string;
  value: string;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type BodyVitalsTrendSummaryGridProps = {
  items: BodyVitalsTrendSummaryItem[];
};

export function BodyVitalsTrendSummaryGrid({
  items,
}: BodyVitalsTrendSummaryGridProps) {
  const { newTheme, spacing, bodyVitalsTypography } = useBodyVitalsTheme();
  const styles = useMemo(
    () => styling(newTheme, spacing, bodyVitalsTypography),
    [newTheme, spacing, bodyVitalsTypography]
  );

  return (
    <View style={styles.summaryGrid}>
      {items.map((item) => (
        <View key={item.key} style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIconWrap,
              { backgroundColor: `${item.accent}22` },
            ]}
          >
            <Ionicons name={item.icon} size={16} color={item.accent} />
          </View>
          <Text style={styles.summaryLabel}>{item.label}</Text>
          <Text style={styles.summaryValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: BodyVitalsTypography
) =>
  StyleSheet.create({
    summaryGrid: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    summaryCard: {
      flex: 1,
      minHeight: 118,
      borderRadius: 22,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.md,
      justifyContent: "space-between",
    },
    summaryIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryLabel: {
      ...t.sectionLabel,
      color: theme.textSecondary,
    },
    summaryValue: {
      ...t.sectionTitle,
      color: theme.textPrimary,
      fontSize: 20,
      lineHeight: 24,
    },
  });
