import React, { useContext, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Typography } from "@/theme/types";
import LogSheet, { LogPayload } from "../common/logSheet/SleepLogSheet";
import { setHM } from "@/features/check-in/utils/sleepLog";
import {
  clamp,
  formatGoalHours,
  formatHours,
} from "@/features/check-in/utils/sleepPerformance";

type Props = {
  asleepMinutes: number;
  goalMinutes: number;
  onSleepSessionStart?: (startedAt: Date) => void;
  onSleepSessionInvalid?: () => void;
  onSleepSessionComplete?: (durationHours: number) => Promise<void> | void;
  onPastSleepComplete?: (
    durationHours: number,
    sleepDate: Date
  ) => Promise<void> | void;
};

export default function SleepPerformanceCard({
  asleepMinutes,
  goalMinutes,
  onSleepSessionStart,
  onSleepSessionInvalid,
  onSleepSessionComplete,
  onPastSleepComplete,
}: Props) {
  const { newTheme: theme, typography } = useContext(ThemeContext);
  const styles = useMemo(() => styling(theme, typography), [theme, typography]);
  const [open, setOpen] = useState(false);
  const [sleepNowProcessing, setSleepNowProcessing] = useState(false);
  const [sleepStartedAt, setSleepStartedAt] = useState<Date | null>(null);

  const progress = useMemo(() => {
    if (!goalMinutes) return 0;
    return clamp(asleepMinutes / goalMinutes, 0, 1);
  }, [asleepMinutes, goalMinutes]);

  const ringSize = 184;
  const strokeWidth = 15;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressLength = circumference * progress;
  const dashOffset = circumference * (1 - progress);

  const defaultBed = useMemo(() => setHM(23, 0), []);
  const defaultWake = useMemo(() => setHM(7, 0), []);

  const handleSleepNow = async () => {
    if (sleepNowProcessing) return;

    if (!sleepStartedAt) {
      const startedAt = new Date();
      setSleepStartedAt(startedAt);
      onSleepSessionStart?.(startedAt);
      return;
    }

    setSleepNowProcessing(true);
    try {
      const now = new Date();
      const elapsedHours = (now.getTime() - sleepStartedAt.getTime()) / 3600000;
      const durationHours = Math.min(
        8,
        Math.round(Math.max(0, elapsedHours) * 100) / 100
      );

      if (durationHours <= 0) {
        onSleepSessionInvalid?.();
        return;
      }

      console.log("[Nidra Sync] sleep session completed", {
        startedAt: sleepStartedAt.toISOString(),
        wokeAt: now.toISOString(),
        durationHours,
      });

      await onSleepSessionComplete?.(durationHours);
      setSleepStartedAt(null);
    } finally {
      setSleepNowProcessing(false);
    }
  };

  const handleSaveManual = (payload: LogPayload) => {
    const durationHours = payload.durationMin / 60;
    return onPastSleepComplete?.(durationHours, payload.bedTime);
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", "rgba(94,129,172,0.12)"]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.innerGlow} />

      <View style={styles.topRow}>
        <View style={styles.headerBlock}>
          <Text style={styles.sectionLabel}>SLEEP LOG</Text>
          <Text style={styles.cardSubTitle}>
            Track tonight&apos;s rest or add a past sleep session.
          </Text>
        </View>

      </View>

      <View style={styles.ringStage}>
        <Svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={theme.borderMuted ?? "rgba(255,255,255,0.08)"}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={theme.chart5 ?? theme.gradBlue ?? theme.chart2 ?? theme.accent}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            fill="none"
          />
        </Svg>

        <View style={styles.centerWrap}>
          <Text style={styles.centerValue}>
            <Text style={styles.centerPrimary}>{formatHours(asleepMinutes)}</Text>
            <Text style={styles.centerSecondary}> / {formatGoalHours(goalMinutes)}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>{Math.round(progress * 100)}%</Text>
          <Text style={styles.metricLabel}>efficiency</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>{formatHours(asleepMinutes)}</Text>
          <Text style={styles.metricLabel}>time asleep</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={handleSleepNow}
          disabled={sleepNowProcessing}
          style={({ pressed }) => [
            styles.primaryActionButton,
            pressed && !sleepNowProcessing && styles.actionPressed,
            sleepNowProcessing && styles.actionProcessing,
          ]}
        >
          <Ionicons
            name="moon-outline"
            size={16}
            color={sleepNowProcessing ? (theme.textSecondary ?? theme.textPrimary) : theme.textPrimary}
          />
          <Text style={styles.primaryActionText}>
            {sleepNowProcessing
              ? "Saving sleep..."
              : sleepStartedAt
              ? "Wake up"
              : "Sleep now"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.secondaryActionButton,
            pressed && styles.actionPressed,
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.textPrimary}
          />
          <Text style={styles.secondaryActionText}>Add past sleep</Text>
        </Pressable>
      </View>

      <LogSheet
        visible={open}
        onClose={() => setOpen(false)}
        showNowTab={false}
        onSaveManual={handleSaveManual}
        defaultBed={defaultBed}
        defaultWake={defaultWake}
        titleText="Add a past sleep"
        manualMode="duration"
        manualDateSelection="pastWeek"
        defaultDurationMinutes={goalMinutes}
        manualTitleText="Select sleep date"
        manualSubtitleText="Choose one of the last five days or any future date."
        saveText="Add past sleep"
      />
    </View>
  );
}

const styling = (theme: ColorSet, typography: Typography) =>
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
      minHeight: 320,
    },
    innerGlow: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.015)",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 14,
      gap: 12,
    },
    headerBlock: {
      flex: 1,
    },
    sectionLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    cardSubTitle: {
      ...typography.caption,
      marginTop: 4,
      color: theme.textSecondary,
      opacity: 0.86,
    },
    ringStage: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 6,
      minHeight: 220,
    },
    centerWrap: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: "rgba(0,0,0,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.04)",
    },
    centerValue: {
      textAlign: "center",
    },
    centerPrimary: {
      ...typography.h1,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: -0.4,
    },
    centerSecondary: {
      ...typography.h3,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    centerLabel: {
      ...typography.smallCaption,
      marginTop: 6,
      color: theme.textSecondary,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    metricRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    metricCell: {
      flex: 1,
      alignItems: "center",
    },
    metricDivider: {
      width: 1,
      height: 34,
      backgroundColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      opacity: 0.9,
    },
    metricValue: {
      ...typography.h3,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    metricLabel: {
      ...typography.smallCaption,
      marginTop: 2,
      color: theme.textSecondary,
      fontWeight: "700",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
    },
    primaryActionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.09)",
    },
    actionProcessing: {
      opacity: 0.72,
    },
    secondaryActionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    actionPressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.94,
    },
    primaryActionText: {
      ...typography.button,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    secondaryActionText: {
      ...typography.button,
      color: theme.textPrimary,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
  });
