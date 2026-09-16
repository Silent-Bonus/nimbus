import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";
import {
  REMINDER_OPTIONS,
  formatClockTime,
} from "@/features/check-in/utils/meditationCheckin";

type MeditationScheduleCardProps = {
  startTime: Date;
  reminderIndex: number;
  onOpenTimePicker: () => void;
  onReminderChange: (index: number) => void;
};

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
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
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.7,
    },
    cardSubTitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
    reminderBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
      flexShrink: 1,
    },
    reminderBadgeText: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "700",
      flexShrink: 1,
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
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.4,
    },
    timeFieldValue: {
      ...svaTypography.textStyle.heading2,
      color: theme.textPrimary,
      letterSpacing: -0.5,
      marginTop: 4,
    },
    reminderSliderWrap: {
      marginTop: spacing.lg,
    },
    reminderSlider: {
      width: "100%",
      height: 30,
    },
    reminderLabelsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      paddingHorizontal: 2,
    },
    reminderLabelCell: {
      alignItems: "center",
      gap: 6,
      flex: 1,
    },
    reminderTick: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.surfaceMuted ?? "rgba(255,255,255,0.12)",
    },
    reminderLabel: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    reminderLabelActive: {
      color: theme.textPrimary,
    },
  });

export const MeditationScheduleCard = ({
  startTime,
  reminderIndex,
  onOpenTimePicker,
  onReminderChange,
}: MeditationScheduleCardProps) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const reminderMinutes = REMINDER_OPTIONS[reminderIndex] ?? REMINDER_OPTIONS[1];
  const accent = theme.chart5 ?? theme.accent;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>SESSION START</Text>
          <Text style={styles.cardSubTitle}>
            Choose the start time and set a gentle pre-session cue.
          </Text>
        </View>

        <View style={styles.reminderBadge}>
          <Ionicons name="notifications-outline" size={14} color={accent} />
          <Text style={styles.reminderBadgeText}>{reminderMinutes}m before</Text>
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

      <View style={styles.reminderSliderWrap}>
        <Slider
          style={styles.reminderSlider}
          minimumValue={0}
          maximumValue={REMINDER_OPTIONS.length - 1}
          step={1}
          value={reminderIndex}
          minimumTrackTintColor={accent}
          maximumTrackTintColor={theme.borderMuted ?? "rgba(255,255,255,0.12)"}
          thumbTintColor={accent}
          onValueChange={(value) => onReminderChange(Math.round(value))}
        />

        <View style={styles.reminderLabelsRow}>
          {REMINDER_OPTIONS.map((minutes, index) => {
            const active = index === reminderIndex;
            return (
              <View key={minutes} style={styles.reminderLabelCell}>
                <View
                  style={[
                    styles.reminderTick,
                    active && {
                      backgroundColor: accent,
                      transform: [{ scale: 1.18 }],
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.reminderLabel,
                    active && styles.reminderLabelActive,
                  ]}
                >
                  {minutes}m
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
