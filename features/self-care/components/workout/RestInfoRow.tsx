import React, { useContext, useMemo } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

export type TimerMode = "workout" | "rest";

interface RestInfoRowProps {
  restSeconds: number;
  mode: TimerMode;
  remainingSeconds: number;
  onPress: (event: GestureResponderEvent) => void;
}

const RestInfoRow: React.FC<RestInfoRowProps> = ({
  restSeconds,
  mode,
  remainingSeconds,
  onPress,
}) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const isResting = mode === "rest";
  const labelSeconds = isResting ? remainingSeconds : restSeconds;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isResting ? "Return to workout" : "Start break"}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name={isResting ? "pause" : "moon-outline"}
          size={18}
          color={theme.buttonPrimary}
        />
      </View>

      <View style={styles.copy}>
        <Text style={styles.timeLabel}>{labelSeconds} sec</Text>
        <Text style={styles.caption}>
          {isResting ? "Tap to return to reps" : "Tap for a 30 sec break"}
        </Text>
      </View>
    </Pressable>
  );
};

const styling = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    containerPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    copy: {
      flex: 1,
    },
    timeLabel: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    caption: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 2,
    },
  });

export default RestInfoRow;
