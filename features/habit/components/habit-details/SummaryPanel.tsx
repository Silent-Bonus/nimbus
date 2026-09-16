import ThemeContext from "@/contexts/ThemeContext";
import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

interface SummaryItem {
  label: string;
  value: string | number;
}

interface Props {
  data: SummaryItem[];
}

export default function SummaryPanel({ data }: Props) {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  const formatValue = (item: SummaryItem): string => {
    const { label, value } = item;

    // Numeric success rate → "65%"
    if (label.toLowerCase().includes("success rate")) {
      if (typeof value === "number") return `${value}%`;
      if (typeof value === "string" && !value.trim().endsWith("%")) {
        return `${value.trim()}%`;
      }
      return String(value);
    }

    // Handle plural grammar like "1 days" / "1 times"
    if (typeof value === "string") {
      const match = value.match(/^(\d+)\s+(\w+)$/); // "1 days"
      if (match) {
        const count = parseInt(match[1], 10);
        let noun = match[2];
        if (count === 1 && noun.endsWith("s")) {
          noun = noun.slice(0, -1); // days → day, times → time
        }
        return `${count} ${noun}`;
      }
    }

    return String(value);
  };

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{formatValue(item)}</Text>
        </View>
      ))}
    </View>
  );
}

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginVertical: spacing.md,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      width: "48%", // 2 per row
      marginBottom: spacing.sm,
      // Nimbus soft shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    label: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
    },
    value: {
      ...svaTypography.bodyLarge,
      fontWeight: "700",
      color: theme.textPrimary,
    },
  });
