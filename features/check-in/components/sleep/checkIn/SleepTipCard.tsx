import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 28,
      overflow: "hidden",
      padding: 18,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
      shadowColor: theme.shadow ?? "#000",
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
      marginTop: spacing.lg,
    },
    tipHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    tipIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted,
    },
    sectionLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      fontWeight: "800",
      letterSpacing: 1.7,
      opacity: 0.88,
    },
    tipQuote: {
      marginTop: spacing.md,
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      fontStyle: "italic",
      lineHeight: svaTypography.textStyle.title.lineHeight,
      letterSpacing: -0.2,
    },
  });

export const SleepTipCard = () => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );
  const accent = theme.chart2 ?? theme.accent;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", "rgba(121,169,242,0.12)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.tipHeaderRow}>
        <View style={styles.tipIconWrap}>
          <Ionicons name="moon-outline" size={18} color={accent} />
        </View>

        <Text style={styles.sectionLabel}>SLEEP TIP</Text>
      </View>

      <Text style={styles.tipQuote}>
        Keep wake time consistent for two weeks and let bedtime adjust around it.
      </Text>
    </View>
  );
};
