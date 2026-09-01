// app/(auth)/index/TabOneScreen.tsx
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Platform,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  format,
  isAfter,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
} from "date-fns";

import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import {
  getHabitList,
  markHabitDone,
} from "@/features/habit/services/habitService";
import { HabitItem } from "@/features/habit/types/habitTypes";

import DateScroller from "@/features/home/components/DateScroller";
import HabitItemCard from "@/features/home/components/component/HabitItem";
import TopBadge from "@/features/home/components/TopBadge";
import ProgressPill from "@/features/home/components/component/ProgressPill";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import SyncProgressCard from "@/features/home/components/component/SyncProgressCard";
import DailySutraCard from "@/features/home/components/component/DailySutraCard";
import BioMetricBlueprintPanel from "@/features/home/components/BioMetricBlueprintPanel";
import ActionModal from "@/components/ui/modal/ActionModal";
import { Ionicons } from "@expo/vector-icons";

// ---------- Nimbus visual helpers ----------
const HABIT_ICONS = ["🍰", "🌱", "🏃‍♂️", "🧘", "📚", "💧"];
const HABIT_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#6A4C93"];
const PROFILE_UPDATE_ROUTE = ROUTES.AUTH.ADVANCED_SETTINGS;
// Replace this with the dedicated profile-update route once that screen exists.

function formatMissingFieldLabel(field: string) {
  return field
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ---------- Screen ----------
export default function TabOneScreen() {
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const styles = styling(theme, spacing, typography);

  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [habitList, setHabitList] = useState<HabitItem[]>([]);
  const [completedHabit, setCompletedHabit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showVitalsBannerModal, setShowVitalsBannerModal] = useState(false);

  const { userProfile } = useAuth();

  const toast = useNimbusToast();

  const isoDate = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  // Friendly label for the selected date
  const dateLabel = useMemo(() => {
    if (isToday(selectedDate)) return "Today";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    if (isYesterday(selectedDate)) return "Yesterday";
    return format(selectedDate, "EEE, MMM dd");
  }, [selectedDate]);

  // Section header – one clear “Today” / “Tomorrow” etc.
  const sectionTitle = useMemo(() => dateLabel, [dateLabel]);
  // decorate habits with Nimbus icon + color
  const decorateHabits = useCallback((data: any[]): HabitItem[] => {
    return data.map((item: any, idx: number) => ({
      ...item,
      done: item.completed,
      color: item.color ? item.color : HABIT_COLORS[idx % HABIT_COLORS.length],
      icon: item.icon ? item.icon : HABIT_ICONS[idx % HABIT_ICONS.length],
    }));
  }, []);

  // single loader used everywhere
  const loadHabits = useCallback(
    async (dateString: string) => {
      try {
        setLoading(true);
        const res = await getHabitList(dateString);

        if (res?.success && Array.isArray(res.data)) {
          const formatted = decorateHabits(res.data);
          // console.log("Formatted habits:", formatted);
          setHabitList(formatted);
          setCompletedHabit(res.data.filter((h: any) => h.completed).length);
        } else {
          setHabitList([]);
          setCompletedHabit(0);
        }
      } catch {
        setHabitList([]);
        setCompletedHabit(0);
      } finally {
        setLoading(false);
      }
    },
    [decorateHabits]
  );

  useFocusEffect(
    useCallback(() => {
      // runs every time this screen is focused again
      loadHabits(isoDate);
    }, [loadHabits, isoDate])
  );

  // keep userInfo in sync
  useEffect(() => {
    setUserInfo(userProfile || null);
  }, [userProfile]);

  // // fetch when date changes
  // useEffect(() => {
  //   loadHabits(isoDate);
  // }, [isoDate, loadHabits]);

  const handleHabitDoneClick = async (id: string, count: any) => {
    const currentIsoDate = format(startOfDay(selectedDate), "yyyy-MM-dd");
    const day = startOfDay(selectedDate);
    const today = startOfDay(new Date());

    if (isAfter(day, today)) {
      toast.show({
        variant: "warning",
        title: "Not yet",
        message: "You can mark a habit once that day arrives.",
      });
      return;
    }

    try {
      const payload = { date: currentIsoDate };
      const result = await markHabitDone(payload, id);

      if (result?.success) {
        toast.show({
          variant: "success",
          title: "Habit",
          message: "Habit marked as done",
        });
        loadHabits(currentIsoDate);
      }
    } catch {
      toast.show({
        variant: "error",
        title: "Something went wrong",
        message: "Not able to update the habit",
      });
    }
  };

  // ---------- Loading state ----------
  if (loading && !userInfo) {
    return (
      <ScreenView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Preparing your routine…</Text>
      </ScreenView>
    );
  }

  const isFirstTimeUser = !!userInfo?.firstTimeUser;
  const dashboardVitalsBanner =
    userInfo?.vitals_context?.banner?.show &&
    userInfo?.vitals_context?.banner?.message
      ? userInfo.vitals_context.banner.message
      : null;
  const dashboardVitalsTitle =
    userInfo?.vitals_context?.banner?.type === "profile_completion"
      ? "Complete Your Vitals Profile"
      : "Body Vitals Need Attention";
  const dashboardMissingFieldsRaw =
    userInfo?.vitals_context?.missing_fields?.profile_completion ?? [];
  const dashboardMissingFields = Array.isArray(dashboardMissingFieldsRaw)
    ? dashboardMissingFieldsRaw.filter(
        (value: unknown): value is string => typeof value === "string"
      )
    : [];
  const dashboardMissingFieldCopy = dashboardMissingFields.length
    ? dashboardMissingFields.map(formatMissingFieldLabel).join(", ")
    : "Sleep Time, Sleep Duration";
  const dashboardBannerBody = [
    dashboardVitalsBanner,
    `Missing fields: ${dashboardMissingFieldCopy}.`,
  ]
    .filter(Boolean)
    .join("\n\n");

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
        <FlatList
          data={isFirstTimeUser ? [] : habitList}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Greeting + coach badge */}
              {userInfo && (
                <View style={styles.greetingRow}>
                  <View>
                    <Text style={styles.greetingTitle}>
                      {`Good ${getTimeOfDayGreeting()}, ${userInfo.username}.`}
                    </Text>
                  </View>

                  <TopBadge
                    iconName="star"
                    variant="circle"
                    onPress={() => router.push(ROUTES.AUTH.COACH)}
                  />
                </View>
              )}

              {/* Date scroller */}
              <DateScroller
                value={selectedDate}
                onChange={(d) => setSelectedDate(startOfDay(d))}
                isLoading={loading}
                // centerSelected
              />

              {dashboardVitalsBanner ? (
                <View style={styles.dashboardBanner}>
                  <View style={styles.dashboardBannerGlow} />
                  <View style={styles.dashboardBannerInner}>
                    <View style={styles.dashboardBannerIconWrap}>
                      <Ionicons
                        name="warning-outline"
                        size={20}
                        color={theme.warning}
                      />
                    </View>

                    <Text
                      style={styles.dashboardBannerTitle}
                      numberOfLines={1}
                    >
                      {dashboardVitalsTitle}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open vitals profile notice"
                      onPress={() => setShowVitalsBannerModal(true)}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.dashboardBannerClose,
                        pressed && styles.dashboardBannerClosePressed,
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={theme.textSecondary}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : null}

              <SyncProgressCard
                percentage={84}
                currentPhase="Flow State"
                nextPhase="Master Healer"
              />

              <DailySutraCard />

              <>
                {/* Bio-Metric Blueprint */}
                <BioMetricBlueprintPanel date={isoDate} />

                {/* Habits section header */}
                {habitList.length > 0 && (
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text
                        style={styles.sectionTitle}
                      >{`${sectionTitle}'S PROTOCOLS`}</Text>
                      {/* {sectionSubtitle && (
                        <Text style={styles.sectionSubtitle}>{sectionSubtitle}</Text>
                      )} */}
                    </View>
                    <ProgressPill
                      label={`${completedHabit}/${habitList.length}`}
                    />
                  </View>
                )}
              </>
            </>
          }
          renderItem={({ item }) => (
            <HabitItemCard
              id={item.id.toString()}
              name={item.name}
              icon={item.icon}
              color={item.color}
              frequency={item.frequency}
              time={item.time}
              currentStreak={item.current_streak}
              lastCompleted={item.last_completed}
              actual_count={{
                count: item.metric_count,
                unit: item.metric_unit,
              }}
              description={item.description}
              done={item.completed}
              onToggle={handleHabitDoneClick}
              // onHabitDelete={loadHabits(selectedDate)}
              selectedDate={isoDate}
            />
          )}
          ListEmptyComponent={
            !isFirstTimeUser ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyTitle}>No habits yet</Text>
                <Text style={styles.emptyText}>
                  Create a habit to start building your routine for this day.
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      <ActionModal
        visible={showVitalsBannerModal}
        onClose={() => setShowVitalsBannerModal(false)}
        eyebrow="Profile Advisory"
        title={dashboardVitalsTitle}
        body={dashboardBannerBody}
        iconName="warning-outline"
        primaryAction={{
          label: "Update",
          onPress: () => router.push(PROFILE_UPDATE_ROUTE),
        }}
        secondaryAction={{
          label: "Not now",
          variant: "outline",
        }}
      />
    </ScreenView>
  );
}

// simple time-of-day helper for greeting
function getTimeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const styling = (theme: any, spacing: any, typography: any) =>
  StyleSheet.create({
    gestureContainer: {
      backgroundColor: theme.background,
      flex: 1,
    },
    listContent: {
      paddingBottom: 130, // Increased to accommodate floating tab bar
    },

    // Loading
    loadingScreen: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 12,
      color: theme.textSecondary,
      ...typography.caption,
    },

    // Greeting
    greetingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
      marginTop: spacing.md,
    },
    dashboardBanner: {
      minHeight: 92,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
      borderRadius: 22,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(235,203,139,0.16)",
      backgroundColor: theme.cardRaised || "#262A22",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 14,
      elevation: 6,
      justifyContent: "center",
      position: "relative",
    },
    dashboardBannerGlow: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(235,203,139,0.04)",
    },
    dashboardBannerInner: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      flexDirection: "row",
      alignItems: "center",
      minHeight: 92,
    },
    dashboardBannerIconWrap: {
      width: 50,
      height: 50,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(235,203,139,0.12)",
      borderWidth: 1,
      borderColor: "rgba(235,203,139,0.18)",
      marginRight: spacing.md,
    },
    dashboardBannerTitle: {
      ...typography.h3,
      flex: 1,
      minWidth: 0,
      fontSize: 17,
      lineHeight: 21,
      fontWeight: "800",
      color: theme.textPrimary,
      letterSpacing: 0.1,
    },
    dashboardBannerClose: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.md,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    dashboardBannerClosePressed: {
      opacity: 0.86,
    },
    greetingTitle: {
      ...typography.h2,
      color: theme.textPrimary,
    },

    // Daily check-in
    checkInContainer: {
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },

    // Section header
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      marginTop: spacing.xs,
    },
    sectionTitle: {
      ...typography.smallCaption,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.6,
      color: theme.accent,
      textTransform: "uppercase",
      opacity: 0.9,
    },
    sectionSubtitle: {
      ...typography.caption,
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.8,
      color: theme.textSecondary,
      textTransform: "uppercase",
      opacity: 0.5,
      marginTop: 2,
    },
    pill: {
      backgroundColor: theme.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
    },
    pillText: {
      ...typography.caption,
      color: theme.textSecondary,
    },

    taskListContainer: {
      marginTop: spacing.lg,
    },

    // Empty state
    emptyStateContainer: {
      marginTop: spacing.xl,
      alignItems: "center",
    },
    emptyTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      marginBottom: spacing.xs,
    },
    emptyText: {
      textAlign: "center",
      color: theme.textSecondary,
      ...typography.caption,
      paddingHorizontal: spacing.lg,
    },

    // FAB – slightly smaller & softer
    floatingButton: {
      position: "absolute",
      right: spacing.lg,
      bottom: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.accent,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 8,
    },
    fabIcon: {
      color: theme.surface,
    },
  });
