import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
} from "react-native";
// import InputField from "./InputField";
import Svg, { Path } from "react-native-svg";

// ----------------------
// Reusable Button
// ----------------------
type ButtonProps = {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: object;
};

export const StyledButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  leftIcon,
  style,
}) => {
  const colors = getButtonColors(variant, disabled);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.pressed : colors.bg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      <Text style={[styles.buttonLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
};

function getButtonColors(variant: string, disabled: boolean) {
  if (variant === "primary")
    return disabled
      ? {
          bg: "#5C6157",
          pressed: "#5C6157",
          border: "transparent",
          text: "#2A2D24",
        }
      : {
          bg: "#A3BE8C",
          pressed: "#8FAD78",
          border: "transparent",
          text: "#1C1E1A",
        };

  if (variant === "secondary")
    return disabled
      ? {
          bg: "#2A2D24",
          pressed: "#2A2D24",
          border: "transparent",
          text: "#5C6157",
        }
      : {
          bg: "#242721",
          pressed: "#2A2D24",
          border: "transparent",
          text: "#ECEFF4",
        };

  if (variant === "outline")
    return disabled
      ? {
          bg: "transparent",
          pressed: "transparent",
          border: "#5C6157",
          text: "#5C6157",
        }
      : {
          bg: "transparent",
          pressed: "#2A2D24",
          border: "#A3BE8C",
          text: "#A3BE8C",
        };

  return {
    bg: "#A3BE8C",
    pressed: "#8FAD78",
    border: "transparent",
    text: "#1C1E1A",
  };
}

// export default b

export const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M21.35 11.1h-9.17v2.92h5.33c-.23 1.34-.92 2.47-1.97 3.22v2.67h3.18c1.86-1.7 2.93-4.21 2.93-7.19 0-.7-.07-1.37-.2-2.02z"
    />
    <Path
      fill="#34A853"
      d="M12.18 22c2.64 0 4.86-.87 6.48-2.36l-3.18-2.67c-.88.6-2 1-3.3 1-2.53 0-4.67-1.7-5.44-3.97H3.43v2.74C5.04 20.06 8.35 22 12.18 22z"
    />
    <Path
      fill="#FBBC05"
      d="M6.74 13c-.2-.6-.31-1.23-.31-1.88s.11-1.28.31-1.88V6.5H3.43A9.82 9.82 0 0 0 2.36 11c0 1.57.37 3.06 1.07 4.5l3.31-2.5z"
    />
    <Path
      fill="#EA4335"
      d="M12.18 4.75c1.43 0 2.71.5 3.72 1.47l2.77-2.77C17.04 1.98 14.82 1 12.18 1 8.35 1 5.04 2.94 3.43 6.5l3.31 2.5c.77-2.27 2.91-3.97 5.44-3.97z"
    />
  </Svg>
);

export const AppleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#ECEFF4"
      d="M16.365 1.43c0 1.14-.46 2.24-1.28 3.04-.74.82-1.96 1.46-3.12 1.37-.15-1.1.44-2.28 1.17-3.07.75-.91 2.07-1.54 3.23-1.34zM20.16 17.65c-.57 1.32-.85 1.91-1.6 3.08-1.04 1.61-2.51 3.62-4.32 3.64-1.6.02-2.01-1.05-4.19-1.04-2.18.01-2.63 1.06-4.23 1.04-1.81-.02-3.2-1.83-4.25-3.44-2.91-4.54-3.22-9.86-1.43-12.67 1.28-1.95 3.3-3.1 5.2-3.1 1.94 0 3.16 1.05 4.77 1.05 1.57 0 2.53-1.05 4.78-1.05 1.64 0 3.38.9 4.62 2.45-4.05 2.23-3.39 8.07.65 9.44z"
    />
  </Svg>
);

// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1E1A",
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    color: "#ECEFF4",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  subheading: {
    color: "#A1A69B",
    fontSize: 14,
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#A3BE8C",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#A3BE8C",
  },
  termsText: {
    color: "#ECEFF4",
    fontSize: 14,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    marginRight: 8,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#242721",
    marginHorizontal: 8,
  },
});
