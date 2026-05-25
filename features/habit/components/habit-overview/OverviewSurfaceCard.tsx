import React, { useContext, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View, ViewStyle, StyleProp } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet } from "@/theme/types";

type OverviewSurfaceCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type OverviewSurfaceCardStyles = ReturnType<typeof createStyles>;

export default function OverviewSurfaceCard({
  children,
  style,
}: OverviewSurfaceCardProps) {
  const { svaColors } = useContext(ThemeContext);
  const styles: OverviewSurfaceCardStyles = useMemo(
    () => createStyles(svaColors),
    [svaColors]
  );

  return (
    <View style={[styles.shell, style]}>
      <LinearGradient
        colors={[svaColors.surface.raised, svaColors.surface.base]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />
        {children}
      </LinearGradient>
    </View>
  );
}

function createStyles(colors: SvaColorSet) {
  return StyleSheet.create({
    shell: {
      borderRadius: 28,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.24,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    card: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      padding: 16,
      backgroundColor: colors.surface.base,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.default,
        },
      }),
    },
    glowOne: {
      position: "absolute",
      top: -24,
      right: -20,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.brand.primary,
      opacity: 0.05,
    },
    glowTwo: {
      position: "absolute",
      bottom: -34,
      left: -30,
      width: 116,
      height: 116,
      borderRadius: 58,
      backgroundColor: colors.chart.blue,
      opacity: 0.05,
    },
  });
}
