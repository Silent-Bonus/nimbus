import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";
import { REMINDER_OPTIONS } from "@/features/check-in/utils/sleepCheckin";

type ReminderBufferCardProps = {
  reminderIndex: number;
  onChange: (value: number) => void;
};

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 28,
      overflow: "hidden",
      padding: 18,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
      shadowColor: theme.shadow ?? "#000",
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: spacing.sm,
    },
    sectionLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      fontWeight: "800",
      letterSpacing: 1.8,
      opacity: 0.88,
    },
    cardSubTitle: {
      ...svaTypography.textStyle.caption,
      marginTop: 4,
      color: theme.textSecondary,
      lineHeight: 16,
      opacity: 0.86,
    },
    reminderBadge: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    reminderBadgeText: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.1,
    },
    reminderSlider: {
      height: 30,
      marginTop: 4,
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
      minWidth: 44,
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

export const ReminderBufferCard = ({
  reminderIndex,
  onChange,
}: ReminderBufferCardProps) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const reminderMinutes = REMINDER_OPTIONS[reminderIndex] ?? REMINDER_OPTIONS[1];
  const accent = theme.chart2 ?? theme.accent;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>WIND-DOWN BUFFER</Text>
          <Text style={styles.cardSubTitle}>
            Set a subtle nudge before bedtime.
          </Text>
        </View>

        <View style={styles.reminderBadge}>
          <Text style={styles.reminderBadgeText}>{reminderMinutes}m</Text>
        </View>
      </View>

      <Slider
        style={styles.reminderSlider}
        minimumValue={0}
        maximumValue={REMINDER_OPTIONS.length - 1}
        step={1}
        value={reminderIndex}
        minimumTrackTintColor={accent}
        maximumTrackTintColor={theme.borderMuted ?? "rgba(255,255,255,0.12)"}
        thumbTintColor={accent}
        onValueChange={(value) => onChange(Math.round(value))}
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
  );
};
