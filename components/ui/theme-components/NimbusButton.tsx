import React, { useContext } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  ViewStyle,
  TextStyle,
  View,
  ActivityIndicator,
} from "react-native";
import ThemeContext from "@/contexts/ThemeContext";
import { tokens } from "@/theme/tokens";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface NimbusButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function NimbusButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: NimbusButtonProps) {
  const { newTheme, svaColors, svaTypography } = useContext(ThemeContext);
  const isDisabled = !!disabled || !!loading;

  // Determine base colors based on variant
  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: svaColors.surface.base || newTheme.surfaceMuted,
          borderColor: "transparent",
          textColor: svaColors.text.primary || newTheme.textPrimary,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: svaColors.border.default || newTheme.border,
          textColor: svaColors.text.primary || newTheme.textPrimary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: svaColors.brand.primary || newTheme.accent,
        };
      case "primary":
      default:
        return {
          backgroundColor: svaColors.button.primary.bg || newTheme.accent,
          borderColor: "transparent",
          textColor: svaColors.button.primary.text || newTheme.buttonPrimaryText || "#10120E",
        };
    }
  };

  const { backgroundColor, borderColor, textColor } = getVariantStyle();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        s.btn,
        {
          backgroundColor: isDisabled ? newTheme.disabled : backgroundColor,
          borderColor: isDisabled ? "transparent" : borderColor,
          borderWidth: variant === "outline" ? tokens.border.strong : 0,
          opacity: pressed && !isDisabled ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leftIcon && <View style={s.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              svaTypography.textStyle.button,
              { color: isDisabled ? newTheme.textDisabled : textColor },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon && <View style={s.iconRight}>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    height: tokens.size.buttonHeight,
    borderRadius: tokens.radius.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
