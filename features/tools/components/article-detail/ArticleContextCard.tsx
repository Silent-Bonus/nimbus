import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type ArticleContextCardProps = {
  eyebrow: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  description: string;
};

const ArticleContextCard: React.FC<ArticleContextCardProps> = ({
  eyebrow,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  description,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>{primaryLabel.toUpperCase()}</Text>
          <Text style={styles.metricValue}>{primaryValue}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>{secondaryLabel.toUpperCase()}</Text>
          <Text style={styles.metricValue}>{secondaryValue}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    card: {
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.28,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 7,
    },
    eyebrow: {
      ...typography?.textStyle?.authTinyLabel,
      color: colors.text.secondary,
      fontSize: 9.5,
      letterSpacing: 2,
      marginBottom: spacing.sm,
    },
    metricsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    metric: {
      flex: 1,
    },
    metricLabel: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_600SemiBold",
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 1.6,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    metricValue: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 22,
      lineHeight: 24,
      color: colors.text.primary,
      letterSpacing: -0.2,
    },
    description: {
      fontFamily: typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.secondary,
    },
  });

export default ArticleContextCard;
