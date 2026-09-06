import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import {
  resolveBodyVitalsTypography,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import type { ColorSet, Spacing } from "@/theme/types";

type MeasurementInputRowProps = {
  label: string;
  helper: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  unit?: string;
};

export function MeasurementInputRow({
  label,
  helper,
  value,
  onChangeText,
  onBlur,
  unit = "cm",
}: MeasurementInputRowProps) {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const resolvedTypography = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
  const styles = useMemo(
    () => makeMeasurementInputStyles(newTheme, spacing, resolvedTypography),
    [newTheme, resolvedTypography, spacing]
  );

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          maxLength={6}
          onBlur={onBlur}
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={newTheme.textDisabled}
          selectionColor={newTheme.accent}
          style={styles.input}
          value={value}
          autoCorrect={false}
          underlineColorAndroid="transparent"
        />
        <Text style={styles.unit}>{unit.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const makeMeasurementInputStyles = (
  theme: ColorSet,
  spacing: Spacing,
  typography: BodyVitalsTypography
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      ...typography.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.88,
    },
    helper: {
      ...typography.caption,
      color: theme.textSecondary,
      opacity: 0.72,
      marginTop: 4,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
      minWidth: 118,
      justifyContent: "flex-end",
    },
    input: {
      ...typography.numericValue,
      minWidth: 56,
      padding: 0,
      margin: 0,
      color: theme.textPrimary,
      backgroundColor: "transparent",
      textAlign: "right",
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.4,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    unit: {
      ...typography.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.9,
    },
  });
