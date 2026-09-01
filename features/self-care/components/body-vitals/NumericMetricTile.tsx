import React, { useContext, useMemo } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { resolveBodyVitalsTypography } from "@/features/self-care/utils/bodyVitalsTheme";
import type {
  ColorSet,
  Spacing,
  Typography,
} from "@/theme/types";

import { MetricTileShell } from "./MetricTileShell";

type NumericMetricTileProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  unit?: string;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  footer?: React.ReactNode;
  accentTint?: string;
  style?: ViewStyle;
};

export const NumericMetricTile = ({
  label,
  value,
  onChangeText,
  onBlur,
  unit,
  trailingIcon,
  keyboardType = "number-pad",
  maxLength,
  footer,
  accentTint,
  style,
}: NumericMetricTileProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, t),
    [newTheme, spacing, typography, t]
  );

  return (
    <MetricTileShell
      accentTint={accentTint}
      label={label}
      style={style}
      contentStyle={styles.content}
    >
      <View style={styles.valueRow}>
        <TextInput
          accessibilityLabel={label}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder="0"
          placeholderTextColor={newTheme.textDisabled}
          selectionColor={newTheme.accent}
          style={styles.valueInput}
          value={value}
          underlineColorAndroid="transparent"
          autoCorrect={false}
        />

        {unit ? <Text style={styles.unit}>{unit.toUpperCase()}</Text> : null}

        {trailingIcon ? (
          <View style={styles.trailingIconWrap}>
            <Ionicons
              name={trailingIcon}
              size={20}
              color={newTheme.accent}
              style={{ opacity: 0.9 }}
            />
          </View>
        ) : null}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </MetricTileShell>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  t: ReturnType<typeof resolveBodyVitalsTypography>
) =>
  StyleSheet.create({
    content: {
      justifyContent: "space-between",
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: spacing.xs,
      paddingTop: spacing.xs,
    },
    valueInput: {
      flex: 1,
      minWidth: 0,
      padding: 0,
      margin: 0,
      color: theme.textPrimary,
      backgroundColor: "transparent",
      fontFamily: t.numericValue.fontFamily,
      fontSize: 29,
      lineHeight: 34,
      fontWeight: t.numericValue.fontWeight,
      letterSpacing: t.numericValue.letterSpacing ?? -0.6,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    unit: {
      ...t.sectionLabel,
      color: theme.textSecondary,
      marginBottom: 4,
      opacity: 0.9,
    },
    trailingIconWrap: {
      width: 26,
      alignItems: "flex-end",
      justifyContent: "center",
      marginBottom: 6,
    },
    footer: {
      marginTop: spacing.sm,
    },
    stepperRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    stepperButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
    },
    stepperIcon: {
      marginTop: -1,
    },
    stepperText: {
      ...t.caption,
      color: theme.textSecondary,
    },
    progressTrack: {
      height: 4,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: theme.divider,
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.accent,
    },
  });

type StepperRowProps = {
  onDecrement: () => void;
  onIncrement: () => void;
  label?: string;
};

export const NumericMetricTileStepperRow = ({
  onDecrement,
  onIncrement,
  label,
}: StepperRowProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
  const styles = useMemo(
    () => styling(newTheme, spacing, typography, t),
    [newTheme, spacing, typography, t]
  );

  return (
    <View style={styles.stepperRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease value"
        onPress={onDecrement}
        style={({ pressed }) => [
          styles.stepperButton,
          pressed && { opacity: 0.78, transform: [{ scale: 0.96 }] },
        ]}
      >
        <Ionicons
          name="remove"
          size={14}
          color={newTheme.textSecondary}
          style={styles.stepperIcon}
        />
      </Pressable>

      {label ? <Text style={styles.stepperText}>{label}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase value"
        onPress={onIncrement}
        style={({ pressed }) => [
          styles.stepperButton,
          pressed && { opacity: 0.78, transform: [{ scale: 0.96 }] },
        ]}
      >
        <Ionicons
          name="add"
          size={14}
          color={newTheme.textSecondary}
          style={styles.stepperIcon}
        />
      </Pressable>
    </View>
  );
};

type ProgressBarProps = {
  progress: number;
};

export const NumericMetricTileProgressBar = ({ progress }: ProgressBarProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
  const styles = useMemo(
    () => styling(newTheme, spacing, typography, t),
    [newTheme, spacing, typography, t]
  );

  const width = `${Math.max(0, Math.min(progress, 1)) * 100}%` as ViewStyle["width"];

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width }]} />
    </View>
  );
};

export const NumericMetricTileFooter = {
  StepperRow: NumericMetricTileStepperRow,
  ProgressBar: NumericMetricTileProgressBar,
};
