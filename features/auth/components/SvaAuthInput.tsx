import React, { forwardRef, useContext, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  type StyleProp,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";

type Preset = "default" | "email" | "phone" | "password";

export type SvaAuthInputProps = TextInputProps & {
  label: string;
  preset?: Preset;
  showPasswordToggle?: boolean;
  helperText?: string;
  errorText?: string;
  labelAccessory?: ReactNode;
  leadingAccessory?: ReactNode;
  trailingAccessory?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
};

export const SvaAuthInput = forwardRef<TextInput, SvaAuthInputProps>(
  (
    {
      label,
      preset = "default",
      showPasswordToggle,
      helperText,
      errorText,
      labelAccessory,
      leadingAccessory,
      trailingAccessory,
      containerStyle,
      labelStyle,
      inputStyle,
      fieldStyle,
      secureTextEntry,
      autoCapitalize,
      keyboardType,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const { svaColors } = useContext(ThemeContext);
    const [focused, setFocused] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    const hasSecureContent = preset === "password" || !!secureTextEntry;
    const shouldShowToggle =
      (showPasswordToggle ?? preset === "password") && hasSecureContent;

    const effectiveSecureTextEntry = hasSecureContent
      ? shouldShowToggle
        ? !showSecret
        : true
      : secureTextEntry;

    const effectiveKeyboardType =
      keyboardType ??
      (preset === "email"
        ? "email-address"
        : preset === "phone"
        ? "phone-pad"
        : "default");

    const effectiveAutoCapitalize = autoCapitalize ?? "none";

    const borderColor = focused
      ? svaColors.brand.primary
      : svaColors.border.muted;

    return (
      <View style={[s.container, containerStyle]}>
        {labelAccessory ? (
          <View style={s.labelRow}>
            <Text
              style={[
                s.label,
                {
                  color: svaColors.text.secondary,
                  flex: 1,
                  marginBottom: 0,
                },
                labelStyle,
              ]}
            >
              {label}
            </Text>
            {labelAccessory}
          </View>
        ) : (
          <Text
            style={[s.label, { color: svaColors.text.secondary }, labelStyle]}
          >
            {label}
          </Text>
        )}

        <View style={[s.field, { borderBottomColor: borderColor }, fieldStyle]}>
          {leadingAccessory ? (
            <View style={s.leadingAccessory}>{leadingAccessory}</View>
          ) : null}

          <TextInput
            ref={ref}
            {...rest}
            autoCapitalize={effectiveAutoCapitalize}
            keyboardType={effectiveKeyboardType}
            placeholderTextColor={svaColors.text.disabled}
            secureTextEntry={effectiveSecureTextEntry}
            style={[s.input, { color: svaColors.text.primary }, inputStyle]}
            selectionColor={svaColors.brand.primary}
            cursorColor={svaColors.brand.primary}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
          />

          {trailingAccessory ? (
            <View style={s.trailingAccessory}>{trailingAccessory}</View>
          ) : shouldShowToggle ? (
            <Pressable
              onPress={() => setShowSecret((value) => !value)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={
                showSecret ? "Hide access code" : "Show access code"
              }
              style={s.trailingAccessory}
            >
              <Ionicons
                name={showSecret ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={svaColors.text.secondary}
              />
            </Pressable>
          ) : null}
        </View>

        {errorText ? (
          <Text style={[s.feedback, { color: svaColors.state.error }]}>
            {errorText}
          </Text>
        ) : helperText ? (
          <Text style={[s.feedback, { color: svaColors.text.secondary }]}>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  }
);

SvaAuthInput.displayName = "SvaAuthInput";

const s = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    ...SVATypography.textStyle.inputLabel,
    fontSize: 11,
    fontFamily: SVATypography.fontFamily.bodyStrong,
    fontWeight: "600",
    letterSpacing: 2.2,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  field: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    minHeight: 36,
    // paddingVertical: 6,
    textAlignVertical: "center",
    includeFontPadding: true,
    ...SVATypography.textStyle.body,
    fontFamily: SVATypography.fontFamily.body,
    fontSize: 16,
    fontWeight: "400",
  },
  leadingAccessory: {
    marginRight: 10,
  },
  trailingAccessory: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  feedback: {
    marginTop: 8,
    ...SVATypography.textStyle.caption,
    fontFamily: SVATypography.fontFamily.body,
  },
});
