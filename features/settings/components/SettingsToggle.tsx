import React, { useContext, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: "small" | "medium";
};

export default function SettingsToggle({
  value,
  onValueChange,
  disabled = false,
  style,
  size = "medium",
}: Props) {
  const { newTheme } = useContext(ThemeContext);
  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [animated, value]);

  const isSmall = size === "small";
  const trackWidth = isSmall ? 40 : 46;
  const trackHeight = isSmall ? 22 : 24;
  const thumbSize = isSmall ? 16 : 18;
  const padding = (trackHeight - thumbSize) / 2;
  const travel = trackWidth - thumbSize - padding * 2;

  const trackColor = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [newTheme.borderMuted, newTheme.accent],
  });

  const thumbTranslate = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });

  return (
    <Pressable
      onPress={() => {
        if (!disabled) onValueChange(!value);
      }}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: trackColor,
            borderColor: newTheme.divider,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              transform: [{ translateX: thumbTranslate }],
              backgroundColor: newTheme.background,
              shadowColor: newTheme.shadow,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    opacity: 1,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
  track: {
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumb: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3.5,
    elevation: 3,
  },
});
