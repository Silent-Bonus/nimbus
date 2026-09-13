import React, { useContext } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import ThemeContext from "@/contexts/ThemeContext";

type ProgressPillProps = {
  label: string; // e.g. "0/5"
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function ProgressPill({
  label,
  style,
  textStyle,
}: ProgressPillProps) {
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const styles = pillStyles(newTheme, spacing, typography);

  return (
    <View style={[styles.pill, style]}>
      <Text style={[styles.pillText, textStyle]}>{label}</Text>
    </View>
  );
}

const pillStyles = (theme: any, spacing: any, typography: any) =>
  StyleSheet.create({
    pill: {
      backgroundColor: theme.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999, // fully rounded – Nimbus standard
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    pillText: {
      ...typography.caption,
      color: theme.textSecondary,
      fontWeight: "500",
    },
  });
