import React, { useContext } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";

type ArticleDetailSectionProps = {
  eyebrow: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ArticleDetailSection: React.FC<ArticleDetailSectionProps> = ({
  eyebrow,
  children,
  style,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styling = (colors: any, spacing: any, typography: any) =>
  StyleSheet.create({
    wrap: {
      marginBottom: spacing.xl,
    },
    eyebrow: {
      ...typography?.textStyle?.authTinyLabel,
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.8,
      marginBottom: spacing.md,
    },
    content: {
      gap: spacing.md,
    },
  });

export default ArticleDetailSection;
