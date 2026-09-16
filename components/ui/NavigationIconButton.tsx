import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import ThemeContext from "@/contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface NavigationIconButtonProps {
  icon: IconName;
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  isActive?: boolean;
  spacingGap?: number; // optional override for gap between buttons
}

const NavigationIconButton = ({
  icon,
  label,
  isActive,
  onPress,
}: NavigationIconButtonProps) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  return (
    <View style={{ width: 72, alignItems: "center", marginRight: spacing.md }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isActive
            ? newTheme.buttonPrimary
            : newTheme.surfaceMuted,
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={isActive ? newTheme.buttonPrimaryText : newTheme.accent}
          style={{ opacity: isActive ? 1 : 0.6 }}
        />
      </TouchableOpacity>

      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        style={{
          marginTop: spacing.xs,
          color: isActive ? newTheme.accent : newTheme.textSecondary,
          textAlign: "center",
          ...svaTypography.textStyle.caption,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default NavigationIconButton;
