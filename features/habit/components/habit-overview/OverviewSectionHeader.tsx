import React, { useContext, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet, Spacing } from "@/theme/types";

type OverviewTypography = {
  titleFamily: string;
  monoFamily: string;
};

type OverviewSectionHeaderProps = {
  title: string;
  accessoryLabel?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

type OverviewSectionHeaderStyles = ReturnType<typeof createStyles>;

export default function OverviewSectionHeader({
  title,
  accessoryLabel,
  style,
  titleStyle,
}: OverviewSectionHeaderProps) {
  const { svaColors, svaTypography, typography, spacing } = useContext(ThemeContext);

  const fonts = useMemo<OverviewTypography>(
    () => ({
      titleFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        typography.h2.fontFamily ??
        "CormorantGaramond_500Medium",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles: OverviewSectionHeaderStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing),
    [svaColors, fonts, spacing]
  );

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>
      {accessoryLabel ? (
        <Text style={styles.accessory} numberOfLines={1}>
          {accessoryLabel}
        </Text>
      ) : (
        <View style={styles.accessorySpacer} />
      )}
    </View>
  );
}

function createStyles(
  colors: SvaColorSet,
  fonts: OverviewTypography,
  spacing: Spacing
) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    title: {
      flex: 1,
      fontFamily: fonts.titleFamily,
      color: colors.text.primary,
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.25,
    },
    accessory: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 13,
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    accessorySpacer: {
      width: 10,
    },
  });
}
