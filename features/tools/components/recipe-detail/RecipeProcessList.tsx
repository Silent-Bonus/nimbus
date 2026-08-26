import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type RecipeProcessListProps = {
  steps: string[];
};

const RecipeProcessList: React.FC<RecipeProcessListProps> = ({ steps }) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => (
        <View key={step} style={styles.row}>
          <Text style={styles.stepIndex}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    wrap: {
      gap: spacing.md,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    stepIndex: {
      minWidth: 30,
      color: colors.brand.primary,
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 16,
      lineHeight: 22,
      fontStyle: "italic",
      marginTop: 2,
    },
    stepText: {
      flex: 1,
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 22,
      fontFamily:
        typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
    },
  });

export default RecipeProcessList;
