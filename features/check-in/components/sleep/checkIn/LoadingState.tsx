import { useContext, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    card: {
      marginTop: spacing.lg,
      minHeight: 220,
      borderRadius: 28,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      elevation: 8,
    },
    title: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      marginTop: spacing.md,
      textAlign: "center",
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
      lineHeight: 20,
    },
  });

export const SleepLoadingState = () => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const accent = theme.chart2 ?? theme.accent;

  return (
    <View style={styles.card}>
      <ActivityIndicator size="large" color={accent} />
      <Text style={styles.title}>Preparing sleep flow…</Text>
      <Text style={styles.subtitle}>
        Pulling tonight&apos;s recovery window, reminders, and weekly pattern.
      </Text>
    </View>
  );
};
