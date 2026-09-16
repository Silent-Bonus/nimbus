import { View, Text, StyleSheet, Platform } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenView } from "@/components/ui/Themed";
import { getHabitDetailsById } from "@/features/habit/services/habitService";
import ThemeContext from "@/contexts/ThemeContext";
import WeeklyHabitRowPanel from "@/features/habit/components/habit-details/WeeklyRowPanel";
import SummaryPanel from "@/features/habit/components/habit-details/SummaryPanel";
import HabitDetailsPanel from "@/features/habit/components/habit-details/HabitDetailsPanel";
import HeaderPanel from "@/features/habit/components/habit-details/HeaderPanel";
import MonthlyOverviewPanel from "@/features/habit/components/habit-details/MonthlyOverviewPanel";
import AppHeader from "@/components/layout/AppHeader";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { formatReminderTime, toApiDate } from "@/utils/date-time";
import HabitDetailsSkeleton from "@/features/habit/components/habit-details/HabitDetailsSkeleton";
import { DeleteHabitModal } from "@/features/habit/components/habit-details/DeleteHabitModal";

export const HabitDetailScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  const { id, date } = useLocalSearchParams<{
    id: string | string[];
    date?: string | string[];
  }>();
  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");

  const styles = styling(newTheme, spacing);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const getHabitDetails = async (habitId: string, selectedDate: string) => {
    setLoading(true);
    try {
      const result = await getHabitDetailsById(habitId, selectedDate);
      if (result?.success) {
        const data = result.data;
        const formattedData = {
          ...data,
          name: data.name,
          success_rate: data.success_rate ?? 0,
          completed_habits: data.total_completed_habits ?? 0,
          type: data.habit_type,
          metric_unit: data.metric_unit ?? "",
          summary_data: [
            {
              label: "Current streak",
              value: `${data.current_streak ?? 0}`,
            },
            {
              label: "Success rate",
              value: `${data.success_rate ?? 0}%`,
            },
            {
              label: "Best streak day",
              value: `${data.longest_streak ?? 0}`,
            },
            {
              label: "Completed habits",
              value: `${data.total_completed_habits ?? 0}`,
            },
          ],
        };
        setHabit(formattedData);
      }
    } catch (error: any) {
      console.log(error, "API Error Response");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      const habitId = Array.isArray(id) ? id[0] : id;
      const selectedDate = Array.isArray(date) ? date?.[0] : date; // "2025-12-10"
      const safeDate = selectedDate ?? toApiDate(startOfDay(new Date()));
      getHabitDetails(habitId, safeDate);
    }
  }, [id, date]);

  const habitId = Array.isArray(id) ? id[0] : id;

  if (loading) {
    return (
      <ScreenView
        style={{
          paddingTop:
            Platform.OS === "ios"
              ? spacing["xxl"] + spacing["xxl"] * 0.4
              : spacing.xl,
          paddingHorizontal: spacing.md,
        }}
      >
        <View style={styles.gestureContainer}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <HabitDetailsSkeleton spacing={spacing} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </ScreenView>
    );
  }

  const selectedDateStr = Array.isArray(date) ? date?.[0] : date;
  const selectedDay = startOfDay(
    selectedDateStr ? parseISO(selectedDateStr) : new Date()
  );
  const today = startOfDay(new Date());

  // show for today + future
  const showRightAction = !isBefore(selectedDay, today);

  return (
    <ScreenView
      style={{
        // flex: 1,
        paddingTop:
          Platform.OS === "ios"
            ? spacing["xl"] + spacing["xl"] * 0.4
            : spacing.xl,
        paddingHorizontal: spacing.md,
      }}
    >
      <View style={styles.gestureContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Nimbus shared header */}
            <AppHeader
              title={habit?.name || "Habit details"}
              subtitle={
                habit
                  ? `${habit.frequency || "Every day"} • ${
                      habit.metric_count ?? ""
                    } ${habit.metric_unit ?? ""}`.trim()
                  : "Review your streaks and progress."
              }
              onBack={() => router.back()}
              rightAction={
                showRightAction
                  ? {
                      icon: "ellipsis-horizontal",
                      onPress: () => setDeleteOpen(true),
                      accessibilityLabel: "Habit options",
                    }
                  : undefined
              }
            />

            {/* Top details card */}
            <HabitDetailsPanel
              reminderTime={formatReminderTime(habit?.reminder_time)}
              frequency={habit?.frequency || "Everyday"}
              type={habit?.type || "Build"}
              metric_count={habit?.metric_count || 3}
              metric_unit={habit?.metric_unit || "liters"}
            />

            {/* Summary */}
            {habit && habit.summary_data.length > 0 && (
              <>
                <HeaderPanel
                  title="Summary"
                  accentColor={newTheme.surface}
                  onSelect={(value) => console.log("Selected:", value)}
                />
                <SummaryPanel data={habit.summary_data} />
              </>
            )}

            {/* Weekly */}
            {habit && habit.name && (
              <View style={styles.sectionWrapper}>
                <HeaderPanel
                  title="Weekly Overview"
                  accentColor={newTheme.surface}
                  onSelect={(value) => console.log("Selected:", value)}
                />
                <WeeklyHabitRowPanel
                  key={habit.name}
                  data={habit.last_7_days_completion}
                />
              </View>
            )}

            {/* Monthly */}
            {habit && habit.name && (
              <>
                <HeaderPanel
                  title="Monthly Overview"
                  accentColor={newTheme.surface}
                  onSelect={(value) => console.log("Selected:", value)}
                />
                <MonthlyOverviewPanel
                  completedDays={habit.completed_days_in_month || []}
                />
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
      {/* Delete Modal */}
      <DeleteHabitModal
        visible={deleteOpen}
        selectedDate={Array.isArray(date) ? date?.[0] : date}
        habit={{
          id: habitId,
          name: habit?.name ?? "Habit",
          current_streak: habit?.current_streak ?? 0,
          longest_streak: habit?.total_completed_habits ?? 0,
          ...habit,
        }}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          router.back(); // go back after deletion
        }}
      />
    </ScreenView>
  );
};

const styling = (newTheme: any, spacing: any) =>
  StyleSheet.create({
    gestureContainer: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.lg, // space for bottom / home indicator
    },
    sectionWrapper: {
      paddingTop: spacing.sm,
    },
    header: {
      color: newTheme.textPrimary,
    },
  });
