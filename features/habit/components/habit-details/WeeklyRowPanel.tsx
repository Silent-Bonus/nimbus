import ThemeContext from "@/contexts/ThemeContext";
import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { ColorSet, Spacing, Typography } from "@/theme/types";

interface Props {
  data: { day: string; done: boolean; date: string }[];
  onToggle?: (day: string) => void;
}

export default function WeeklyHabitRow({
  data,
  onToggle,
}: Props) {
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, spacing, typography),
    [newTheme, spacing, typography]
  );

  const WEEK_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const normalized = WEEK_ORDER.map((day) => {
    const found = data?.find((item) => item.day === day);
    return found || { day, done: false, date: null as any };
  });

  return (
    <View style={styles.card}>
      {/* Days row */}
      <View style={styles.daysRow}>
        {normalized.map((item) => (
          <Pressable
            key={item.day}
            style={({ pressed }) => [
              styles.dayCircle,
              item.done && styles.dayCircleDone,
              pressed && styles.dayCirclePressed,
            ]}
            onPress={() => onToggle?.(item.day)}
          >
            {item.done && <Text style={styles.check}>✓</Text>}
          </Pressable>
        ))}
      </View>

      {/* Day labels */}
      <View style={styles.labelsRow}>
        {normalized.map((item) => (
          <Text key={item.day} style={styles.dayLabel}>
            {item.day}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styling = (newTheme: ColorSet, spacing: Spacing, typography: Typography) =>
  StyleSheet.create({
    card: {
      backgroundColor: newTheme.surface,
      borderRadius: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginVertical: spacing.sm,
      // soft Nimbus lift
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 10,
      elevation: 3,
    },

    // Days
    daysRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    },
    labelsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: newTheme.surfaceMuted,
      borderWidth: 1,
      borderColor: newTheme.borderMuted,
      justifyContent: "center",
      alignItems: "center",
    },
    dayCircleDone: {
      backgroundColor: newTheme.accent,
      borderColor: newTheme.accent,
      shadowColor: newTheme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    dayCirclePressed: {
      transform: [{ scale: 0.96 }],
      opacity: 0.85,
    },
    check: {
      fontSize: 16,
      color: newTheme.background,
      fontWeight: "600",
    },
    dayLabel: {
      width: 32,
      textAlign: "center",
      ...typography.caption,
      color: newTheme.textSecondary,
    },
  });
