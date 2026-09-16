import { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

type MeditationErrorStateProps = {
  message: string;
  onRetry: () => void;
};

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
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    title: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      textAlign: "center",
      marginTop: spacing.md,
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginTop: spacing.xs,
    },
    button: {
      marginTop: spacing.lg,
      minWidth: 120,
      borderRadius: 999,
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
      backgroundColor: theme.accent,
    },
    buttonText: {
      ...svaTypography.textStyle.button,
      color: theme.background,
      textAlign: "center",
    },
  });

export const MeditationErrorState = ({
  message,
  onRetry,
}: MeditationErrorStateProps) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const accent = theme.chart5 ?? theme.accent;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="leaf-outline" size={22} color={accent} />
      </View>
      <Text style={styles.title}>Couldn&apos;t load meditation flow</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <Pressable onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
};
