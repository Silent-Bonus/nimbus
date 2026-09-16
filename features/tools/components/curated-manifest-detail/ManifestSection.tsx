import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";

type ManifestSectionProps = {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
};

const ManifestSection: React.FC<ManifestSectionProps> = ({
  title,
  children,
  compact = false,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styling = (colors: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    wrap: {
      marginBottom: spacing.xl,
    },
    wrapCompact: {
      marginBottom: spacing.lg,
    },
    title: {
      ...svaTypography.textStyle.authTinyLabel,
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
      marginBottom: spacing.md,
    },
    content: {
      gap: spacing.md,
    },
  });

export default ManifestSection;
