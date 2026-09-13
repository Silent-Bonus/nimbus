import ThemeContext from "@/contexts/ThemeContext";
import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  reminderTime?: string;
  frequency: string; // still passed if you ever want it later
  type: string;
  metric_count: number; // kept in props, but not re-shown in this card
  metric_unit: string;
}

export default function HabitDetailsPanel({
  reminderTime,
  frequency,
  type,
  metric_count,
  metric_unit,
}: Props) {
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, spacing, typography),
    [newTheme, spacing, typography]
  );

  // Only show fields that are NOT already in the header:
  // - Header shows: "Every day · 3 ltrs"
  // - Card shows:    Reminder time + Type
  const rows: { label: string; value: string }[] = [];

  if (reminderTime) {
    rows.push({ label: "Reminder time", value: reminderTime });
  }

  rows.push({ label: "Type", value: type });

  // If in future you remove metric from header and want it here instead:
  // rows.push({
  //   label: "Daily target",
  //   value: `${metric_count} ${metric_unit}`,
  // });

  return (
    <View style={styles.card}>
      {rows.map((row) => (
        <DetailRow
          key={row.label}
          label={row.label}
          value={row.value}
          styles={styles}
        />
      ))}
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  styles: ReturnType<typeof styling>;
}

function DetailRow({ label, value, styles }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styling = (theme: any, spacing: any, typography: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.lg,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.caption,
      color: theme.textSecondary,
    },
    value: {
      ...typography.bodyStrong,
      color: theme.textPrimary,
      marginLeft: spacing.md,
    },
  });
