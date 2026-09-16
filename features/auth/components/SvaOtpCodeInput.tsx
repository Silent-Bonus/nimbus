import React, { useContext, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";

export type SvaOtpCodeInputProps = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  testID?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function SvaOtpCodeInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  testID,
  containerStyle,
}: SvaOtpCodeInputProps) {
  const { svaColors } = useContext(ThemeContext);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [active, setActive] = useState(0);

  const sanitizedValue = value.replace(/\D/g, "").slice(0, length);
  const digits = Array.from({ length }, (_, index) => sanitizedValue[index] ?? "");

  useEffect(() => {
    if (!autoFocus || disabled) return;
    inputs.current[0]?.focus();
  }, [autoFocus, disabled]);

  const setDigit = (text: string, idx: number) => {
    const nextText = text.replace(/\D/g, "");

    if (!nextText) {
      const next = [...digits];
      next[idx] = "";
      onChange(next.join("").slice(0, length));
      return;
    }

    if (nextText.length > 1) {
      const next = [...digits];
      nextText
        .slice(0, length - idx)
        .split("")
        .forEach((digit, offset) => {
          next[idx + offset] = digit;
        });
      onChange(next.join("").slice(0, length));

      const focusIndex = Math.min(length - 1, idx + nextText.length - 1);
      inputs.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[idx] = nextText[0];
    onChange(next.join("").slice(0, length));

    if (idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  return (
    <View style={[s.container, containerStyle]}>
      <View style={s.row}>
        {digits.map((digit, index) => {
          const focused = index === active;
          const filled = !!digit;

          return (
            <TextInput
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              testID={testID ? `${testID}-${index + 1}` : undefined}
              value={digit}
              onFocus={() => setActive(index)}
              onChangeText={(text) => setDigit(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && !digit && index > 0) {
                  inputs.current[index - 1]?.focus();
                }
              }}
              editable={!disabled}
              autoFocus={autoFocus && index === 0}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={1}
              caretHidden
              selectionColor={svaColors.brand.primary}
              cursorColor={svaColors.brand.primary}
              placeholder=""
              style={[
                s.input,
                {
                  color: svaColors.text.primary,
                  borderBottomColor: focused || filled
                    ? svaColors.brand.primary
                    : svaColors.border.muted,
                  marginRight: index === length - 1 ? 0 : 10,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    borderBottomWidth: StyleSheet.hairlineWidth,
    textAlign: "center",
    fontSize: 20,
    fontFamily: SVATypography.fontFamily.bodyStrong,
    fontWeight: "600",
    letterSpacing: 2,
    paddingVertical: 8,
  },
});
