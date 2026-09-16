import { useContext, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "../../../../contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "../../../../theme/types";

const createStyles = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: any
) =>
  StyleSheet.create({
    card: {
      marginTop: spacing.lg,
      borderRadius: 28,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      elevation: 8,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.selected ?? "rgba(163,190,140,0.12)",
      marginBottom: spacing.sm,
    },
    title: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      textAlign: "center",
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

type HydrationErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export const HydrationErrorState = ({
  message,
  onRetry,
}: HydrationErrorStateProps) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => createStyles(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  const accent = newTheme.chart2 ?? newTheme.accent;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="water-outline" size={22} color={accent} />
      </View>
      <Text style={styles.title}>Couldn&apos;t load hydration flow</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <Pressable onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
};
