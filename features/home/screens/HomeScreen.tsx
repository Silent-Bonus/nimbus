// Feature-owned implementation for the authenticated home tab.
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

import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import {
  getHabitList,
  markHabitDone,
} from "@/features/habit/services/habitService";
import type { NormalizedHabitListItem } from "@/features/habit/utils/habitList";

import DateScroller from "@/features/home/components/DateScroller";
import HabitItemCard from "@/features/home/components/HabitItem";
import TopBadge from "@/features/home/components/TopBadge";
import ProgressPill from "@/features/home/components/ProgressPill";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import SyncProgressCard from "@/features/home/components/SyncProgressCard";
import DailySutraCard from "@/features/home/components/DailySutraCard";
import HomeWalkthroughOverlay from "@/features/home/components/HomeWalkthroughOverlay";
import BioMetricBlueprintPanel from "@/features/home/components/BioMetricBlueprintPanel";
import ActionModal from "@/components/ui/modal/ActionModal";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { toApiDate } from "@/utils/date-time";
import { pickColor, pickIcon } from "@/features/check-in/utils/dailyCheckin";
import { StoreKey } from "@/constants/Constant";
import {
  getTodayResonance,
  type TodayResonance,
} from "@/features/home/services/resonanceService";

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
export default function HomeScreen() {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(theme, spacing, svaTypography);

  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [habitList, setHabitList] = useState<NormalizedHabitListItem[]>([]);
  const [completedHabit, setCompletedHabit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showVitalsBannerModal, setShowVitalsBannerModal] = useState(false);
  const [resonance, setResonance] = useState<TodayResonance | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const didShowDevTutorialRef = React.useRef(false);
  const homeListRef = React.useRef<FlatList<NormalizedHabitListItem>>(null);
  const homeScrollOffsetRef = React.useRef(0);
  const dateTargetRef = React.useRef<View>(null);
  const progressTargetRef = React.useRef<View>(null);
  const dailySutraTargetRef = React.useRef<View>(null);
  const bioMetricBlueprintTargetRef = React.useRef<View>(null);
  const dailyTrackerTargetRef = React.useRef<View>(null);
  const walkthroughSteps = useMemo(
    () => [
      {
        title: "Your rhythm, day by day",
        body: "See today’s rhythm at a glance, or choose another day to explore your routine.",
        targetRef: dateTargetRef,
      },
      {
        title: "Your resonance score",
        body: "Track how your daily check-ins and practices are adding up over time. Your score appears as you build active days.",
        targetRef: progressTargetRef,
      },
      {
        title: "Your Daily Sutra",
        body: "Get a personalized Ayurvedic tip each day, shaped around your wellness journey.",
        targetRef: dailySutraTargetRef,
      },
      {
        title: "Your BioMetric Blueprint",
        body: "Explore personalized wellness insights based on your daily signals, and use them to guide your routine.",
        targetRef: bioMetricBlueprintTargetRef,
      },
      {
        title: "Build your daily rhythm",
        body: "Your daily tracker helps you stay consistent. Check in on your practices each day and see your progress grow over time.",
        targetRef: dailyTrackerTargetRef,
      },
    ],
    []
  );

  const { userProfile } = useAuth();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (__DEV__) {
        if (!didShowDevTutorialRef.current) {
          didShowDevTutorialRef.current = true;
          setTutorialStep(0);
          setShowTutorial(true);
        }
        return () => {
          active = false;
        };
      }

      void SecureStore.getItemAsync(StoreKey.TUTORIAL_PENDING_KEY).then(
        (value) => {
          if (active && value === "true") {
            setTutorialStep(0);
            setShowTutorial(true);
          }
        }
      );

      return () => {
        active = false;
      };
    }, [])
  );

  const dismissTutorial = useCallback(async () => {
    setShowTutorial(false);
    setTutorialStep(0);
    await SecureStore.deleteItemAsync(StoreKey.TUTORIAL_PENDING_KEY);
  }, []);

  const advanceTutorial = useCallback(async () => {
    if (tutorialStep >= walkthroughSteps.length - 1) {
      await dismissTutorial();
      return;
    }

    const nextStep = tutorialStep + 1;
    if (nextStep >= 3) {
      const target = walkthroughSteps[nextStep]?.targetRef.current;
      target?.measureInWindow((_x, y) => {
        const nextOffset = Math.max(0, homeScrollOffsetRef.current + y - 170);
        homeListRef.current?.scrollToOffset({ offset: nextOffset, animated: true });
        setTimeout(() => setTutorialStep(nextStep), 350);
      });
      return;
    }

    setTutorialStep(nextStep);
  }, [dismissTutorial, tutorialStep, walkthroughSteps.length]);

  const toast = useNimbusToast();

  const isoDate = useMemo(() => {
    return toApiDate(selectedDate);
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
  const decorateHabits = useCallback(
    (data: any[]): NormalizedHabitListItem[] => {
      return data.map((item: any) => ({
        ...item,
        done: item.completed,
        color: item.color ? item.color : pickColor(item.name, theme),
        icon: item.icon ? item.icon : pickIcon(item.name),
      }));
    },
    [theme]
  );

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

  const loadResonance = useCallback(async () => {
    try {
      const today = await getTodayResonance();
      setResonance(today);
    } catch {
      setResonance(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // runs every time this screen is focused again
      void loadHabits(isoDate);
      void loadResonance();
    }, [loadHabits, loadResonance, isoDate])
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
    const currentIsoDate = toApiDate(startOfDay(selectedDate));
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
        // Reflect completion immediately; the focused reload below reconciles
        // the optimistic state with the backend response.
        setHabitList((current) =>
          current.map((habit) =>
            habit.id.toString() === id
              ? {
                  ...habit,
                  completed: true,
                  last_completed: currentIsoDate,
                }
              : habit
          )
        );
        setCompletedHabit((current) => current + 1);
        toast.show({
          variant: "success",
          title: "Habit completed",
          message: "Your habit was marked as done for this day.",
        });
        void loadHabits(currentIsoDate);
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
  const isProfileCompletion =
    userInfo?.vitals_context?.banner?.type === "profile_completion";
  const dashboardVitalsTitle =
    isProfileCompletion
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
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.gestureContainer}>
        <FlatList
          ref={homeListRef}
          data={isFirstTimeUser ? [] : habitList}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            homeScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
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

                  {/* <TopBadge
                    iconName="star"
                    variant="circle"
                    onPress={() => router.push(ROUTES.AUTH.COACH)}
                  /> */}
                </View>
              )}

              {/* Date scroller */}
              <View ref={dateTargetRef} collapsable={false}>
                <DateScroller
                  value={selectedDate}
                  onChange={(d) => setSelectedDate(startOfDay(d))}
                  isLoading={loading}
                  // centerSelected
                />
              </View>

              {dashboardVitalsBanner ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${dashboardVitalsTitle}`}
                  onPress={() => setShowVitalsBannerModal(true)}
                  style={({ pressed }) => [
                    styles.dashboardBanner,
                    pressed && styles.dashboardBannerPressed,
                  ]}
                >
                  <View style={styles.dashboardBannerInner}>
                    <View style={styles.dashboardBannerIconWrap}>
                      <Ionicons
                        name="warning-outline"
                        size={19}
                        color={theme.warning}
                      />
                    </View>

                    <View style={styles.dashboardBannerCopy}>
                      <Text style={styles.dashboardBannerEyebrow}>
                        {isProfileCompletion ? "PROFILE SETUP" : "PROFILE ADVISORY"}
                      </Text>
                      <Text style={styles.dashboardBannerTitle}>
                        {dashboardVitalsTitle}
                      </Text>
                      <Text
                        style={styles.dashboardBannerSubtitle}
                        numberOfLines={2}
                      >
                        {isProfileCompletion
                          ? "Add a few details for more personal insights."
                          : "Review your vitals profile to keep insights current."}
                      </Text>
                    </View>

                    <View style={styles.dashboardBannerArrow}>
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={theme.textSecondary}
                      />
                    </View>
                  </View>
                </Pressable>
              ) : null}

              <View ref={progressTargetRef} collapsable={false}>
                <SyncProgressCard
                  percentage={resonance?.score ?? 0}
                  pendingSummary={resonance?.score == null ? resonance?.summary : null}
                  activeDaysCount={resonance?.active_days_count}
                  requiredActiveDays={resonance?.required_active_days}
                  currentPhase="Flow State"
                  nextPhase="Master Healer"
                />
              </View>

              <View ref={dailySutraTargetRef} collapsable={false}>
                <DailySutraCard />
              </View>

              <View
                ref={bioMetricBlueprintTargetRef}
                collapsable={false}
              >
                <BioMetricBlueprintPanel date={isoDate} />
              </View>

              {/* Habits section header */}
              <View
                ref={dailyTrackerTargetRef}
                collapsable={false}
                style={styles.sectionHeader}
              >
                <View>
                  <Text style={styles.sectionTitle}>
                    {habitList.length > 0
                      ? `${sectionTitle}'S DAILY TRACKER`
                      : "YOUR DAILY TRACKER"}
                  </Text>
                  {/* {sectionSubtitle && (
                        <Text style={styles.sectionSubtitle}>{sectionSubtitle}</Text>
                      )} */}
                </View>
                {habitList.length > 0 ? (
                  <ProgressPill label={`${completedHabit}/${habitList.length}`} />
                ) : null}
              </View>
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
              habit_type_tracking={item.habit_type_tracking}
              actual_count={{
                count: item.metric_details?.target ?? 0,
                unit: item.metric_details?.unit ?? "unit",
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

      <HomeWalkthroughOverlay
        visible={showTutorial}
        stepIndex={tutorialStep}
        steps={walkthroughSteps}
        onNext={() => void advanceTutorial()}
        onSkip={() => void dismissTutorial()}
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

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    gestureContainer: {
      backgroundColor: theme.background,
      flex: 1,
    },
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
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
      ...svaTypography.textStyle.caption,
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
      minHeight: 88,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(235,203,139,0.14)",
      backgroundColor: theme.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 4,
    },
    dashboardBannerPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    dashboardBannerInner: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      minHeight: 88,
      gap: spacing.md,
    },
    dashboardBannerIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(235,203,139,0.12)",
      borderWidth: 1,
      borderColor: "rgba(235,203,139,0.18)",
      flexShrink: 0,
    },
    dashboardBannerCopy: {
      flex: 1,
      minWidth: 0,
    },
    dashboardBannerEyebrow: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.warning,
      fontSize: 9,
      lineHeight: 12,
      letterSpacing: 1.3,
      marginBottom: 2,
    },
    dashboardBannerTitle: {
      ...svaTypography.textStyle.title,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      color: theme.textPrimary,
      letterSpacing: 0,
    },
    dashboardBannerSubtitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 15,
      marginTop: 2,
    },
    dashboardBannerArrow: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.045)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      flexShrink: 0,
    },
    greetingTitle: {
      ...svaTypography.textStyle.heading2,
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
      ...svaTypography.textStyle.authTinyLabel,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.6,
      color: theme.accent,
      textTransform: "uppercase",
      opacity: 0.9,
    },
    sectionSubtitle: {
      ...svaTypography.textStyle.caption,
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
      ...svaTypography.textStyle.caption,
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
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      marginBottom: spacing.xs,
    },
    emptyText: {
      textAlign: "center",
      color: theme.textSecondary,
      ...svaTypography.textStyle.caption,
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
