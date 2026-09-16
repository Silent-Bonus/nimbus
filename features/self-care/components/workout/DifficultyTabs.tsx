import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

export type DifficultyOptionKey = "easy" | "medium" | "hard";

interface DifficultyTabsProps {
  activeKey: DifficultyOptionKey;
  onChange: (key: DifficultyOptionKey) => void;
  style?: ViewStyle;
}

const OPTIONS: { key: DifficultyOptionKey; label: string }[] = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

const DifficultyTabs: React.FC<DifficultyTabsProps> = ({
  activeKey,
  onChange,
  style,
}) => {
  const { newTheme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, svaTypography, spacing),
    [newTheme, svaTypography, spacing]
  );

  return (
    <View style={[styles.container, style]}>
      {OPTIONS.map((opt) => {
        const isActive = opt.key === activeKey;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(opt.key)}
            style={({ pressed }) => [
              styles.pill,
              isActive && styles.pillActive,
              pressed && styles.pillPressed,
            ]}
          >
            <Text style={isActive ? styles.textActive : styles.textInactive}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing,

) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    pill: {
      minHeight: 40,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    pillActive: {
      backgroundColor: theme.buttonPrimary,
      borderColor: theme.buttonPrimary,
    },
    pillPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.98 }],
    },
    textInactive: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.textSecondary,
      fontSize: 12,
      letterSpacing: 0.8,
    },
    textActive: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.buttonPrimaryText,
      fontSize: 12,
      letterSpacing: 0.8,
    },
  });

export default DifficultyTabs;
