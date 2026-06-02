import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

type RightAction = {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
};

export type HeaderRightAction = {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
  badge?: number | boolean;
};

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: RightAction;
  rightActions?: HeaderRightAction[];
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  rightActions = [],
  titleStyle,
  subtitleStyle,
  containerStyle,
}) => {
  const { newTheme, svaColors, spacing, typography } = useContext(ThemeContext);

  const styles = useMemo(
    () => styling(newTheme, svaColors, spacing, typography),
    [newTheme, svaColors, spacing, typography]
  );

  const actions = rightActions.length
    ? rightActions
    : rightAction
      ? [rightAction]
      : [];

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.topRow}>
        <View style={styles.leftSlot}>
          {onBack && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={svaColors.text.secondary || newTheme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightSlot}>
          {actions.slice(0, 3).map((action, index) => (
            <TouchableOpacity
              key={`${action.icon ?? "action"}-${index}`}
              style={[styles.iconButton, index > 0 && { marginLeft: spacing.sm }]}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel ?? "Action"}
              activeOpacity={0.7}
            >
              <Ionicons
                name={action.icon ?? "ellipsis-horizontal"}
                size={20}
                color={newTheme.textPrimary}
                style={{ opacity: 0.9 }}
              />
              {!!("badge" in action && action.badge) && <View style={styles.badge} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styling = (theme: any, c: any, spacing: any, typography: any) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.sm,
      marginBottom: spacing.lg,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    leftSlot: {
      flex: 1,
      alignItems: "flex-start",
    },
    rightSlot: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.interaction.pressed || "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: c.border.subtle || "rgba(255,255,255,0.08)",
      position: "relative",
    },
    badge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.accent,
      borderWidth: 1.5,
      borderColor: theme.surface,
    },
    textBlock: {
      paddingHorizontal: spacing.xs,
    },
    title: {
      ...typography.h2,
      color: c.text.primary || theme.textPrimary,
    },
    subtitle: {
      ...typography.body,
      color: c.text.secondary || theme.textSecondary,
      marginTop: spacing.xs,
    },
  });

export default AppHeader;
