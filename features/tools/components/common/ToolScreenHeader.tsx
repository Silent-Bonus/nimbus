// src/components/common/ToolScreenHeader.tsx

import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";

interface ToolScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  containerStyle?: ViewStyle;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

const ToolScreenHeader: React.FC<ToolScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  containerStyle,
  rightIcon,
  onRightPress,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Top action row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={newTheme.textSecondary}
          />
        </TouchableOpacity>

        {rightIcon && (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
            <Ionicons
              name={rightIcon}
              size={24}
              color={newTheme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Title + subtitle block */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    backButton: {
      // removed bottom margin as it's now in topRow
    },
    rightButton: {
      // optional: add padding if hit target is small
    },
    textBlock: {},
    title: {
      ...svaTypography.textStyle.heading2,
      color: newTheme.textPrimary,
    },
    subtitle: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
      marginTop: spacing.xs,
    },
  });

export default ToolScreenHeader;
