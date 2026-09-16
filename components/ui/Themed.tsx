/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useColorScheme } from "./UseColorScheme";
import { useContext } from "react";
import ThemeContext from "@/contexts/ThemeContext";
import { Spacing, TypographyTokens } from "@/theme/types";
import { SVATypography } from "@/theme/typography";
import { Ionicons } from "@expo/vector-icons";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type TextInputProps = ThemeProps & DefaultTextInput["props"];

export type ThemeKey = "basic" | "light" | "dark";

export const Button = ({
  title,
  onPress,
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
}) => {
  const { newTheme } = useContext(ThemeContext);
  const styles = btnStyling(newTheme);

  return (
    <TouchableOpacity onPress={onPress} style={[style]}>
      <DefaultText style={[textStyle]}>{title}</DefaultText>
    </TouchableOpacity>
  );
};

const btnStyling = (theme: any) => StyleSheet.create({});

export function ScreenView(
  props: ViewProps & {
    bgColor?: string;
    padding?: number;
    useSafeTop?: boolean;
  }
) {
  const { style, bgColor, padding, useSafeTop = true, ...otherProps } = props;
  const { newTheme, tokens, spacing } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  console.log("ScreenView insets:", insets, spacing.md);

  const standardStyle = {
    backgroundColor: bgColor || newTheme.background,
    paddingHorizontal: padding !== undefined ? padding : tokens.layout.screenX,
    paddingTop: useSafeTop ? insets.top + spacing.md : padding ?? spacing.md,
    flex: 1,
  };

  console.log("ScreenView rendered with bgColor:", standardStyle);

  return <DefaultView style={[standardStyle, style]} {...otherProps} />;
}

// new component input
export const StyledInput = ({
  label,
  iconName,
  placeholder,
  onChangeText,
  value,
  isPassword = false,
  style,
}: any) => {
  //   useContext(ThemeContext);
  // State to track if the input is focused to change border color
  const [isFocused, setIsFocused] = useState(false);
  // State to toggle password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  // Set focused state to true when input is focused
  const handleFocus = () => setIsFocused(true);
  // Set focused state to false when input is blurred
  const handleBlur = () => setIsFocused(false);

  const { toggleTheme, spacing, svaTypography, newTheme, useSystemTheme } =
    useContext(ThemeContext);

  const styles = styledInputStyling(newTheme, isFocused, spacing, svaTypography);

  // Styles are now JS objects for inline styling
  return (
    <DefaultView style={[styles.container, style]}>
      {/* Label for the input field */}
      <DefaultText style={styles.label}>{label}</DefaultText>
      {/* Container for the icon, text input, and password toggle icon */}
      <DefaultView
        style={[
          styles.inputContainer,
          // Apply focused styles when the input is active
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {/* Left icon */}
        <Ionicons
          name={iconName}
          size={22}
          color={isFocused ? "#FFFFFF" : "#9CA3AF"}
          style={styles.icon}
        />
        {/* Text input field */}
        <DefaultTextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={onChangeText}
          value={value}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
        />
        {/* Eye icon to toggle password visibility, only shown if isPassword is true */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#9CA3AF"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        )}
      </DefaultView>
    </DefaultView>
  );
};

const styledInputStyling = (
  newTheme: any,
  isFocused: boolean,
  spacing: Spacing,
  svaTypography: TypographyTokens
) =>
  StyleSheet.create({
    // Container for the label and the input box
    container: {
      width: "100%",
    },
    // Style for the label text above the input
    label: {
      ...SVATypography.textStyle.inputLabel,
      color: "#FFFFFF",
      fontSize: 16,
      marginBottom: 10,
    },
    // Container that holds the icon and the TextInput
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1F2937", // A slightly lighter dark shade for the input background
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#374151", // Default border color
      paddingHorizontal: 15,
    },
    // Style applied to the input container when it is focused
    inputContainerFocused: {
      borderColor: "#4A5568", // A slightly lighter border color for focus state
    },
    // Style for the icon on the left
    icon: {
      marginRight: 12,
    },
    // Style for the eye icon on the right (for password fields)
    eyeIcon: {
      marginLeft: 12,
    },
    // Style for the actual TextInput element
    input: {
      flex: 1,
      color: "#FFFFFF",
      paddingVertical: 14,
      ...SVATypography.textStyle.input,
    },
  });
