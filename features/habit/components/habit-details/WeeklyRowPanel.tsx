import ThemeContext from "@/contexts/ThemeContext";
import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface Props {
  habitName: string;
  frequency: string;
  icon?: string; // emoji for now
  data: { day: string; done: boolean; date: string }[];
  onToggle?: (day: string) => void;
}

export default function WeeklyHabitRow({
  habitName,
  frequency,
  icon = "🧘",
  data,
  onToggle,
}: Props) {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  const WEEK_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const normalized = WEEK_ORDER.map((day) => {
    const found = data?.find((item) => item.day === day);
    return found || { day, done: false, date: null as any };
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.habitName} numberOfLines={1}>
            {habitName}
          </Text>
        </View>

        <View style={styles.frequencyPill}>
          <Text style={styles.frequencyText}>{frequency}</Text>
        </View>
      </View>

      <View style={styles.divider} />

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

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
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

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
    },
    icon: {
      fontSize: 20,
      marginRight: spacing.sm,
    },
    habitName: {
      ...svaTypography.bodyMedium,
      color: newTheme.textPrimary,
      fontWeight: "600",
      flexShrink: 1,
    },
    frequencyPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: newTheme.surfaceSoft ?? newTheme.disabled,
    },
    frequencyText: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textSecondary,
    },

    divider: {
      height: 1,
      backgroundColor: newTheme.divider,
      marginVertical: spacing.sm,
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
      backgroundColor: newTheme.disabled,
      borderWidth: 1,
      borderColor: newTheme.divider,
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
      color: newTheme.surface,
      fontWeight: "600",
    },
    dayLabel: {
      width: 32,
      textAlign: "center",
      ...svaTypography.textStyle.caption,
      color: newTheme.textSecondary,
    },
  });
