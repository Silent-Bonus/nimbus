import React, { useContext, useMemo } from "react";
import {
  LinearGradient,
} from "expo-linear-gradient";
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import { resolveBodyVitalsTypography } from "@/features/self-care/utils/bodyVitalsTheme";
import type { ColorSet, Spacing } from "@/theme/types";

type MetricTileShellProps = {
  label: string;
  labelSuffix?: React.ReactNode;
  accentTint?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  children: React.ReactNode;
};

export const MetricTileShell = ({
  label,
  labelSuffix,
  accentTint,
  style,
  contentStyle,
  children,
}: MetricTileShellProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () => styling(newTheme, spacing, t),
    [newTheme, spacing, t]
  );

  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.015)", accentTint ?? "rgba(255,255,255,0.015)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.labelRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {labelSuffix ? <View>{labelSuffix}</View> : null}
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: ReturnType<typeof resolveBodyVitalsTypography>
) =>
  StyleSheet.create({
    card: {
      minHeight: 152,
      width: "100%",
      flexGrow: 0,
      flexShrink: 0,
      borderRadius: 26,
      overflow: "hidden",
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.borderMuted ?? theme.border,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.24,
      shadowRadius: 18,
      elevation: 5,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    label: {
      ...t.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.85,
    },
    content: {
      flex: 1,
    },
  });
