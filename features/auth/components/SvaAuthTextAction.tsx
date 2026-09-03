import React, { useContext, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type Insets,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";

type Variant = "muted" | "link";

export type SvaAuthTextActionProps = {
  onPress: () => void;
  children: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  hitSlop?: Insets | number;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  secondaryContent?: ReactNode;
  secondaryContentStyle?: StyleProp<ViewStyle>;
};

export function SvaAuthTextAction({
  onPress,
  children,
  variant = "muted",
  disabled = false,
  hitSlop = 10,
  accessibilityLabel,
  testID,
  style,
  contentStyle,
  secondaryContent,
  secondaryContentStyle,
}: SvaAuthTextActionProps) {
  const { svaColors } = useContext(ThemeContext);
  const textColor =
    variant === "link" ? svaColors.brand.primary : svaColors.text.secondary;
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (typeof children === "string" ? children : undefined);

  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={resolvedAccessibilityLabel}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        { opacity: pressed && !disabled ? 0.82 : 1 },
        style,
      ]}
    >
      <View style={[s.content, contentStyle]}>
        <Text
          style={[
            s.label,
            { color: textColor, textDecorationColor: textColor },
            variant === "link" ? s.link : null,
          ]}
        >
          {children}
        </Text>

        {secondaryContent ? (
          <View style={[s.secondaryContent, secondaryContentStyle]}>
            {secondaryContent}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  label: {
    ...SVATypography.textStyle.authActionLabel,
  },
  link: {
    textDecorationLine: "underline",
  },
  secondaryContent: {
    marginTop: 10,
  },
  content: {
    alignItems: "center",
  },
});
