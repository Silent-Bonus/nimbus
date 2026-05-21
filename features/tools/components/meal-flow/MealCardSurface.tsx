import React, { useContext, useMemo } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet } from "@/theme/types";

export type MealCardTone =
  | "surface"
  | "muted"
  | "raised"
  | "accent"
  | "dashed";

type MealCardSurfaceProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: MealCardTone;
  radius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: ViewStyle["borderStyle"];
  testID?: string;
};

export function MealCardSurface({
  children,
  style,
  tone = "surface",
  radius = 24,
  borderColor,
  borderWidth,
  borderStyle,
  testID,
}: MealCardSurfaceProps) {
  const { svaColors } = useContext(ThemeContext);
  const styles = useMemo(() => styling(svaColors, radius), [svaColors, radius]);
  const toneStyle = useMemo<ViewStyle>(() => {
    switch (tone) {
      case "muted":
        return {
          backgroundColor: svaColors.bg.subtle,
          borderColor: svaColors.border.default,
          borderWidth: 1,
        };
      case "raised":
        return {
          backgroundColor: svaColors.surface.raised,
          borderColor: svaColors.border.default,
          borderWidth: 1,
        };
      case "accent":
        return {
          backgroundColor: svaColors.brand.subtle,
          borderColor: svaColors.brand.primary,
          borderWidth: 1,
        };
      case "dashed":
        return {
          backgroundColor: svaColors.surface.base,
          borderColor: svaColors.border.default,
          borderWidth: 2,
          borderStyle: "dashed",
        };
      case "surface":
      default:
        return {
          backgroundColor: svaColors.surface.base,
          borderColor: svaColors.border.default,
          borderWidth: 1,
        };
    }
  }, [svaColors, tone]);

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        toneStyle,
        borderColor ? { borderColor } : null,
        borderWidth !== undefined ? { borderWidth } : null,
        borderStyle ? { borderStyle } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styling = (theme: SvaColorSet, radius: number) =>
  StyleSheet.create({
    base: {
      alignSelf: "stretch",
      borderRadius: radius,
      backgroundColor: theme.surface.base,
    },
  });
