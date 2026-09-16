import React, { useContext, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

interface Props {
  completedDays?: number[]; // e.g. [21, 22, 23, 24, 25]
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Monday-first labels to match your Weekly Overview
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthlyOverviewPanel({ completedDays = [] }: Props) {
  const now = new Date();
  const [currentMonth] = useState(now.getMonth());
  const [currentYear] = useState(now.getFullYear());

  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  // Build matrix of weeks for current month, Monday-first
  const weeks = useMemo(() => {
    // JS: 0 = Sun ... 6 = Sat
    const jsFirstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Convert to Monday-first offset: 0 = Mon ... 6 = Sun
    const firstDayIndex = (jsFirstDay + 6) % 7;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const matrix: (number | null)[][] = [];

    let day = 1 - firstDayIndex;

    while (day <= daysInMonth) {
      const week: (number | null)[] = [];
      for (let i = 0; i < 7; i++) {
        if (day < 1 || day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
        }
        day++;
      }
      matrix.push(week);
    }

    return matrix;
  }, [currentMonth, currentYear]);

  const safeCompleted = completedDays ?? [];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {MONTH_NAMES[currentMonth]}, {currentYear}
        </Text>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((d) => (
          <Text key={d} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            const isCompleted =
              day != null && safeCompleted.includes(day as number);

            return (
              <View key={di} style={styles.dayCell}>
                {day ? (
                  <View style={styles.dayWrapper}>
                    {isCompleted ? (
                      <View style={styles.dropMarker}>
                        <Text style={styles.dropText}>{day}</Text>
                      </View>
                    ) : (
                      <Text style={styles.dayText}>{day}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.dayText} />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styling = (newTheme: ColorSet, spacing: Spacing, svaTypography: TypographyTokens) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: newTheme.borderMuted,
      borderRadius: spacing.lg,
      paddingBottom: spacing.sm,
      marginTop: spacing.sm,
      backgroundColor: newTheme.cardRaised ?? newTheme.surface,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      backgroundColor: newTheme.surfaceMuted,
      borderTopLeftRadius: spacing.lg,
      borderTopRightRadius: spacing.lg,
      paddingVertical: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.md,
    },
    headerText: {
      ...svaTypography.textStyle.bodyMedium,
      color: newTheme.textPrimary,
      marginRight: spacing.xs,
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: spacing.xs,
    },
    weekDay: {
      ...svaTypography.textStyle.authTinyLabel,
      color: newTheme.textSecondary,
      width: 30,
      textAlign: "center",
    },
    dayCell: {
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    dayWrapper: {
      justifyContent: "center",
      alignItems: "center",
    },
    dayText: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textPrimary,
    },
    // Teardrop / pill marker for completed days
    dropMarker: {
      backgroundColor: newTheme.accent,
      width: 30,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      transform: [{ rotate: "45deg" }],
    },
    dropText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: newTheme.background,
      fontWeight: "600",
      transform: [{ rotate: "-45deg" }],
    },
  });
