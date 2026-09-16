import React, { useContext } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet, Spacing, TypographyTokens } from "@/theme/types";
import { SVATypography } from "@/theme/typography";

export type PillFilterOption<T extends string = string> = {
  label: string;
  value: T;
  accessibilityLabel?: string;
  testID?: string;
};

type PillFilterProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
  selectedPillStyle?: StyleProp<ViewStyle>;
  inactivePillStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedLabelStyle?: StyleProp<TextStyle>;
  inactiveLabelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

export const PillFilter = ({
  label,
  selected = false,
  onPress,
  uppercase = true,
  style,
  selectedPillStyle,
  inactivePillStyle,
  textStyle,
  selectedLabelStyle,
  inactiveLabelStyle,
  accessibilityLabel,
  testID,
}: PillFilterProps) => {
  const { svaColors, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, svaTypography ?? SVATypography);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected ? styles.pillSelected : styles.pillInactive,
        selected ? selectedPillStyle : inactivePillStyle,
        pressed && styles.pillPressed,
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          selected ? styles.labelSelected : undefined,
          selected ? selectedLabelStyle : inactiveLabelStyle,
          textStyle,
        ]}
      >
        {uppercase ? label.toUpperCase() : label}
      </Text>
    </Pressable>
  );
};

export type PillFiltersProps<T extends string = string> = {
  options: readonly PillFilterOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  uppercase?: boolean;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  pillStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  selectedPillStyle?: StyleProp<ViewStyle>;
  inactivePillStyle?: StyleProp<ViewStyle>;
  selectedLabelStyle?: StyleProp<TextStyle>;
  inactiveLabelStyle?: StyleProp<TextStyle>;
  testID?: string;
};

export function PillFilters<T extends string>({
  options,
  selectedValue,
  onChange,
  uppercase = true,
  scrollable = true,
  style,
  contentContainerStyle,
  pillStyle,
  labelStyle,
  selectedPillStyle,
  inactivePillStyle,
  selectedLabelStyle,
  inactiveLabelStyle,
  testID,
}: PillFiltersProps<T>) {
  const { spacing } = useContext(ThemeContext);
  const rowStyles = rowStyling(spacing);

  const pills = options.map((option) => (
    <PillFilter
      key={option.value}
      label={option.label}
      selected={option.value === selectedValue}
      onPress={() => onChange(option.value)}
      uppercase={uppercase}
      accessibilityLabel={option.accessibilityLabel}
      testID={option.testID}
      style={pillStyle}
      textStyle={labelStyle}
      selectedPillStyle={selectedPillStyle}
      inactivePillStyle={inactivePillStyle}
      selectedLabelStyle={selectedLabelStyle}
      inactiveLabelStyle={inactiveLabelStyle}
    />
  ));

  if (scrollable) {
    return (
      <ScrollView
        testID={testID}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[rowStyles.row, contentContainerStyle]}
        style={style}
      >
        {pills}
      </ScrollView>
    );
  }

  return (
    <View
      testID={testID}
      style={[rowStyles.row, rowStyles.wrapRow, style, contentContainerStyle]}
    >
      {pills}
    </View>
  );
}

const rowStyling = (spacing: Spacing) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    wrapRow: {
      flexWrap: "wrap",
    },
  });

const styling = (colors: SvaColorSet, svaTypography: TypographyTokens) =>
  StyleSheet.create({
    pill: {
      minHeight: 40,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface.base,
    },
    pillInactive: {
      borderColor: colors.border.default,
    },
    pillSelected: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    pillPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    label: {
      color: colors.text.secondary,
      ...svaTypography.textStyle.authLabel,
      fontSize: 12,
      letterSpacing: 0.8,
      textAlign: "center",
    },
    labelSelected: {
      color: colors.text.inverse,
    },
  });

export default PillFilters;
