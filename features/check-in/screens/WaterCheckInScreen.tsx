/**
 * Legacy water check-in screen.
 * Reads the normalized hydration detail response and keeps the reminder and
 * weekly summary UI available for the older water-tracking entry point.
 */
import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/Themed";
import WaterTracker from "@/features/check-in/components/waterIntake/WaterIntakeLog";
import NotificationSettingRow from "@/features/check-in/components/common/NotificationSettingRow";
import WeeklySummaryChartSvg from "@/features/check-in/components/waterIntake/WeekySummary";

import { getHabitDetailsByDate } from "@/features/check-in/services/dailyCheckinService";
import { DailyCheckInDetailResponse } from "@/features/check-in/types/dailyCheckin";
import { ErrorCard } from "@/features/check-in/components/waterIntake/ErrorCard";
import { SkeletonCard } from "@/features/check-in/components/waterIntake/SkeletonCard";
import { SkeletonRow } from "@/features/check-in/components/waterIntake/SkeletonRow";
import type { ColorSet } from "@/theme/types";

const remindOptions = [
  { key: "15m", label: "Every 15 minutes" },
  { key: "30m", label: "Every 30 minutes" },
  { key: "45m", label: "Every 45 minutes" },
  { key: "60m", label: "Every 1 hour" },
];

export const WaterCheckInScreen = () => {
  const navigation = useNavigation();
  const { newTheme } = useContext(ThemeContext);
  const styles = styling(newTheme);
  // route params: id + date (both strings)
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();

  // UI state for reminder controls and the animated water tracker.
  const [enabled, setEnabled] = useState(true);
  const [valueKey, setValueKey] = useState<string | null>("45m");

  // API states
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0); // target_unit (glasses)
  const [completed, setCompleted] = useState<number>(0); // completed_unit
  const [weekly, setWeekly] = useState<{ day: string; percent: number }[]>([]);

  // skeleton pulse
  const pulse = useRef(new Animated.Value(0.3)).current;
  // Load the selected day's hydration detail when route parameters change.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // fetch habit detail
  useEffect(() => {
    const run = async () => {
      if (!id || !date) {
        setErr("Missing habit id or date.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErr(null);
        const habitId = Number(id);
        const res = await getHabitDetailsByDate(
          habitId,
          date
        );

        const h = res?.data;
        setTotal(Number(h?.goal_details.metric_details.target ?? 0));
        setCompleted(Number(h?.goal_details.metric_details.completed ?? 0));
        setWeekly(
          Array.isArray(h?.progress.last_7_days_completion)
            ? h.progress.last_7_days_completion
            : []
        );
      } catch (e: any) {
        setErr(typeof e === "string" ? e : e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, date]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const weeklyForChart = useMemo(
    () =>
      weekly.map((d) => ({
        day: d.day,
        percent: Math.max(0, Math.min(100, Number(d.percent) || 0)),
      })),
    [weekly]
  );

  const handleChange = (newValue: number) => {
    // local update only; you’ll call PATCH API in onChange if needed
    setCompleted(newValue);
  };

  // Render the legacy water flow using the shared themed screen container.
  return (
    <ScreenView style={{ paddingTop: Platform.OS === "ios" ? 40 : 20 }}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={newTheme.textSecondary}
          />
        </TouchableOpacity>

        <ScrollView
          bounces
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>WaterCheckIn</Text>
            <Text style={styles.subtitle}>
              Immense Yourself in true nature.
            </Text>
          </View>

          {/* Content */}
          {loading ? (
            <View>
              <SkeletonCard pulse={pulse} theme={newTheme} height={130} />
              <View style={{ height: 16 }} />
              <SkeletonRow pulse={pulse} theme={newTheme} />
              <View style={{ height: 16 }} />
              <SkeletonCard pulse={pulse} theme={newTheme} height={180} />
            </View>
          ) : err ? (
            <ErrorCard
              theme={newTheme}
              message={err}
              onRetry={async () => {
                setLoading(true);
                setErr(null);
                try {
                  const res = await getHabitDetailsByDate(
                    Number(id),
                    String(date)
                  );
                  const h = res?.data;
                  setTotal(Number(h?.goal_details.metric_details.target ?? 0));
                  setCompleted(Number(h?.goal_details.metric_details.completed ?? 0));
                  setWeekly(
                    Array.isArray(h?.progress.last_7_days_completion)
                      ? h.progress.last_7_days_completion
                      : []
                  );
                } catch (e: any) {
                  setErr(
                    typeof e === "string" ? e : e?.message ?? "Failed to load"
                  );
                } finally {
                  setLoading(false);
                }
              }}
            />
          ) : (
            <>
              {/* Tracker */}
              <View style={{ height: 15 }} />
              <View style={styles.section}>
                <WaterTracker
                  value={completed}
                  total={total}
                  plusColor={newTheme.buttonGhostBg}
                  filledColor={newTheme.surfaceMuted}
                  emptySlotColor={newTheme.borderMuted}
                  onChange={handleChange}
                  contentPadding={0}
                />
              </View>

              {/* Notifications */}
              <View style={{ height: 20 }} />
              <View style={{ paddingHorizontal: 0 }}>
                <NotificationSettingRow
                  label="Notification"
                  subtitle="Remind me to drink water"
                  helpText=""
                  enabled={enabled}
                  onToggle={setEnabled}
                  options={remindOptions}
                  valueKey={valueKey}
                  onOptionSelect={(item) => setValueKey(item.key)}
                />
              </View>

              {/* Weekly summary */}
              <View style={{ height: 12 }} />
              <WeeklySummaryChartSvg
                data={weeklyForChart.map((d) => ({
                  day: d.day,
                  percent: d.percent,
                }))}
                barColor={newTheme.chart3}
              />
            </>
          )}
        </ScrollView>
      </View>
    </ScreenView>
  );
};

const styling = (theme: ColorSet) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    backButton: {
      marginTop: 50,
      marginBottom: 10,
    },
    itemTitle: {
      fontSize: 16,
      color: theme.textPrimary,
      fontWeight: "bold",
    },
    header: {
      paddingTop: 10,
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      color: theme.textPrimary,
      fontWeight: "bold",
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    section: {
      paddingHorizontal: 0,
    },
  });
