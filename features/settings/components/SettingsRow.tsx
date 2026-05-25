import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";

import { SETTINGS_LAYOUT } from "../settingsLayout";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
  showExternal?: boolean;
  showDot?: boolean;
  rightSlot?: React.ReactNode;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function SettingsRow({
  icon,
  label,
  onPress,
  danger = false,
  showChevron = false,
  showExternal = false,
  showDot = false,
  rightSlot,
  iconColor,
  style,
}: Props) {
  const { newTheme, svaTypography, typography } = useContext(ThemeContext);
  const bodyFamily =
    svaTypography?.textStyle.bodyMedium.fontFamily ??
    typography.bodyStrong.fontFamily ??
    "Outfit_600SemiBold";

  const rowIconColor = iconColor ?? (danger ? newTheme.error : newTheme.textPrimary);
  const labelColor = danger ? newTheme.error : newTheme.textPrimary;
  const iconBackground = danger ? newTheme.surfaceMuted : newTheme.cardRaised;
  const trailingColor = danger ? newTheme.error : newTheme.textSecondary;

  const rowContent = (
    <>
      <View
        style={[
          styles.iconWrap,
          danger && styles.iconWrapDanger,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={rowIconColor} />
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: labelColor,
            fontFamily: bodyFamily,
          },
        ]}
      >
        {label}
      </Text>

      <View style={styles.flexSpacer} />

      {showDot ? (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: newTheme.success,
              shadowColor: newTheme.success,
            },
          ]}
        />
      ) : null}

      {rightSlot ? (
        rightSlot
      ) : showExternal ? (
        <Ionicons
          name="open-outline"
          size={17}
          color={trailingColor}
          style={styles.trailingIcon}
        />
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={trailingColor}
          style={styles.trailingIcon}
        />
      ) : null}
    </>
  );

  const rowStyle = [styles.row, style];

  return onPress ? (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: newTheme.pressed }}
      style={({ pressed }) => [
        rowStyle,
        pressed && { backgroundColor: newTheme.pressed },
      ]}
    >
      {rowContent}
    </Pressable>
  ) : (
    <View style={rowStyle}>{rowContent}</View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: SETTINGS_LAYOUT.rowHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SETTINGS_LAYOUT.rowHorizontal,
    paddingVertical: SETTINGS_LAYOUT.rowVertical,
    borderRadius: 18,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconWrapDanger: {
    opacity: 0.96,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  flexSpacer: {
    flex: 1,
  },
  trailingIcon: {
    marginLeft: 10,
    opacity: 0.72,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginRight: 10,
    shadowOpacity: 0.45,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
