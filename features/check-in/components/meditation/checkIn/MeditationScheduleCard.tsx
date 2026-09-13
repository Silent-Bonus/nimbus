import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, Typography } from "@/theme/types";
import { formatClockTime } from "@/features/check-in/utils/meditationCheckin";

type MeditationScheduleCardProps = {
  startTime: Date;
  onOpenTimePicker: () => void;
};

const makeStyles = (theme: ColorSet, spacing: Spacing, typography: Typography) =>
  StyleSheet.create({
    card: {
      marginTop: spacing.lg,
      borderRadius: 28,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 8,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    sectionLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.7,
    },
    cardSubTitle: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
    timeField: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    timeFieldPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    timeFieldLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.4,
    },
    timeFieldValue: {
      ...typography.h2,
      color: theme.textPrimary,
      letterSpacing: -0.5,
      marginTop: 4,
    },
  });

export const MeditationScheduleCard = ({
  startTime,
  onOpenTimePicker,
}: MeditationScheduleCardProps) => {
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, typography),
    [theme, spacing, typography]
  );

  const accent = theme.chart5 ?? theme.accent;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>SESSION START</Text>
          <Text style={styles.cardSubTitle}>
            Choose the start time for your meditation session.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onOpenTimePicker}
        style={({ pressed }) => [
          styles.timeField,
          pressed && styles.timeFieldPressed,
        ]}
      >
        <View>
          <Text style={styles.timeFieldLabel}>Start time</Text>
          <Text style={styles.timeFieldValue}>{formatClockTime(startTime)}</Text>
        </View>

        <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
};
