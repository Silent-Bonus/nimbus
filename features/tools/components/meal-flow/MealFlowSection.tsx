import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  SvaColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

type MealFlowSectionProps = {
  title: string;
  children: React.ReactNode;
  description?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
};

export function MealFlowSection({
  title,
  children,
  description,
  style,
  titleStyle,
  descriptionStyle,
}: MealFlowSectionProps) {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, svaTypography),
    [svaColors, spacing, svaTypography]
  );

  return (
    <View style={[styles.section, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, descriptionStyle]}>
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) =>
  StyleSheet.create({
    section: {
      alignSelf: "stretch",
      marginBottom: spacing.xl,
    },
    title: {
      ...(svaTypography?.textStyle.bodyMedium ?? svaTypography.textStyle.bodyMedium),
      color: theme.text.primary,
      marginBottom: spacing.md,
    },
    description: {
      ...(svaTypography?.textStyle.caption ?? svaTypography.textStyle.caption),
      color: theme.text.secondary,
      marginBottom: spacing.sm,
    },
  });
