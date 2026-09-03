import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  Spacing,
  SvaColorSet,
  SvaTokens,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type RightAction = {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
  iconColor?: string;
};

export type HeaderRightAction = {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
  badge?: number | boolean;
  iconColor?: string;
};

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: RightAction;
  rightActions?: HeaderRightAction[];
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
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
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);

  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
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
                color={svaColors.text.secondary}
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
                color={action.iconColor ?? svaColors.text.primary}
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

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  tokens: SvaTokens
) =>
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
      backgroundColor: theme.interaction.pressed,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.subtle,
      position: "relative",
    },
    badge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.brand.primary,
      borderWidth: tokens.border.strong,
      borderColor: theme.bg.base,
    },
    textBlock: {
      paddingHorizontal: spacing.xs,
    },
    title: {
      ...(svaTypography?.textStyle.authTitle ?? typography.h2),
      color: theme.text.primary,
    },
    subtitle: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.secondary,
      marginTop: spacing.xs,
    },
  });

export default AppHeader;
