import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type ArticlePullQuoteProps = {
  quote: string;
};

const ArticlePullQuote: React.FC<ArticlePullQuoteProps> = ({ quote }) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.card}>
      <View style={styles.bar} />
      <Text style={styles.quote}>{quote}</Text>
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
      flexDirection: "row",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderRadius: 24,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    bar: {
      width: 2,
      borderRadius: 999,
      backgroundColor: colors.brand.primary,
      opacity: 0.85,
    },
    quote: {
      flex: 1,
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 22,
      lineHeight: 28,
      fontStyle: "italic",
      color: colors.brand.primary,
      letterSpacing: -0.2,
    },
  });

export default ArticlePullQuote;
