import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

interface WorkoutTipBannerProps {
  text: string;
}

const WorkoutTipBanner: React.FC<WorkoutTipBannerProps> = ({ text }) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styling = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 18,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    text: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
  });

export default WorkoutTipBanner;
