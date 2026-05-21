import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type RecipeMealPlanButtonProps = {
  label: string;
  onPress: () => void;
};

const RecipeMealPlanButton: React.FC<RecipeMealPlanButtonProps> = ({
  label,
  onPress,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name="add-circle-outline"
        size={18}
        color={svaColors.brand.primary}
      />
      <Text style={styles.label}>{label.toUpperCase()}</Text>
    </Pressable>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    button: {
      minHeight: 52,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.brand.primary,
      backgroundColor: colors.surface.base,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: spacing.sm,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    pressed: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    label: {
      ...typography?.textStyle?.authLabelStrong,
      color: colors.text.primary,
      fontSize: 13,
      lineHeight: 16,
      letterSpacing: 0.7,
    },
  });

export default RecipeMealPlanButton;
