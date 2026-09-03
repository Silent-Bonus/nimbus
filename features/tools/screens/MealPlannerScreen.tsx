import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import {
  DayPlan,
  Meal,
  MealPlanResponse,
  NormalizedMealDashboardData,
  MealPlannerScreenMealSlotKey,
} from "@/features/tools/types/mealPlannerTypes";
import {
  getMealDashboard,
  getDailyMealPlan,
  updateMealItem,
} from "@/features/tools/services/mealPlannerService";
import {
  getMealName,
  getMealPlannerGoalOverrides,
  transformMealDashboardResponse,
} from "@/features/tools/utils/mealPlannerUtils";
import { toApiDate } from "@/utils/date-time";
import { ROUTES } from "@/constants/routes";
import AppHeader from "@/components/layout/AppHeader";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import {
  MealCardSurface,
  MealInsightCard,
  MealNutritionPieCard,
  MealPlannerSlotCard,
  MealTrendCard,
  type MealNutritionPieMetric,
  type MealTrendMetric,
} from "@/features/tools/components/meal-flow";
import type {
  SvaColorSet,
  Spacing,
  Typography,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

type OverviewStat = {
  key: "tracked" | "streak" | "completion";
  label: string;
  value: string;
};

const DASHBOARD_RANGE_DAYS = 30;

const formatMealSlotLabel = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "None";

const getMealItems = (meal: Meal | Meal[] | null | undefined): Meal[] => {
  if (!meal) {
    return [];
  }

  return Array.isArray(meal) ? meal.filter(Boolean) : [meal];
};

const getMealSearchQuery = (meal: Meal | Meal[] | null | undefined) => {
  const mealItems = getMealItems(meal);
  if (mealItems.length === 0) {
    return "";
  }

  return getMealName(Array.isArray(meal) ? mealItems[0] : meal).trim();
};

const resolveDayPlan = (response: MealPlanResponse<DayPlan | DayPlan[]>) => {
  if (!response?.success) {
    return null;
  }

  if (Array.isArray(response.data)) {
    return response.data[0] ?? null;
  }

  return response.data ?? null;
};

const applyGoalOverride = (
  metric: NormalizedMealDashboardData["today"]["nutrition"]["calories"],
  goalOverride: number | null
) => {
  const goal = goalOverride ?? metric.goal;
  const remaining = Math.max(goal - metric.consumed, 0);
  const progressPercent =
    goal > 0 ? Math.min(100, Math.round((metric.consumed / goal) * 100)) : 0;

  return {
    ...metric,
    goal,
    remaining,
    progress_percent: progressPercent,
  };
};

export const MealPlannerScreen = () => {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const toast = useNimbusToast();
  const params = useLocalSearchParams<{
    targetCalories?: string | string[];
    protein?: string | string[];
  }>();
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );

  const [dashboardData, setDashboardData] =
    useState<NormalizedMealDashboardData | null>(null);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [dayPlanLoading, setDayPlanLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [consumingMealSlot, setConsumingMealSlot] =
    useState<MealPlannerScreenMealSlotKey | null>(null);

  const { targetCalories, targetProtein } = useMemo(
    () => getMealPlannerGoalOverrides(params),
    [params]
  );

  /**
   * Dashboard analytics and the day-plan timeline are fetched separately so
   * each section can recover independently from transient API failures.
   */
  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const result = await getMealDashboard(DASHBOARD_RANGE_DAYS);
      if (result?.success) {
        setDashboardData(transformMealDashboardResponse(result).data);
      } else {
        setDashboardData(null);
      }
    } catch (error) {
      console.error("Dashboard API error:", error);
      setDashboardData(null);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchDailyPlan = async (date: Date, showLoading = true) => {
    try {
      if (showLoading) {
        setDayPlanLoading(true);
      }
      const result = await getDailyMealPlan(date);
      setDayPlan(resolveDayPlan(result));
    } catch (error) {
      console.error("Daily Plan API error:", error);
      setDayPlan(null);
    } finally {
      if (showLoading) {
        setDayPlanLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      void fetchDashboardData();
      void fetchDailyPlan(new Date());
    }, [])
  );

  const handleAddMeal = (type: MealPlannerScreenMealSlotKey) => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_MEAL_CREATION,
      params: { type, date: toApiDate(new Date()) },
    });
  };

  const handlePlanAhead = () => {
    router.push(ROUTES.AUTH.TOOLS_MEAL_CREATION);
  };

  const handleWeeklyView = () => {
    router.push(ROUTES.AUTH.TOOLS_MEAL_WEEKLY);
  };

  const handleOpenRecipeSearch = (data: Meal | Meal[] | null | undefined) => {
    const query = getMealSearchQuery(data);

    if (!query || query === "Not planned") {
      return;
    }

    router.push({
      pathname: ROUTES.AUTH.TOOLS_RECIPE,
      params: { query },
    });
  };

  /**
   * Route params can override calorie/protein goals coming from calculator
   * flows without mutating the underlying dashboard response.
   */
  const activeNutrition = useMemo(() => {
    if (!dashboardData) {
      return null;
    }

    const nutrition = dashboardData.today.nutrition;

    return {
      ...nutrition,
      calories: applyGoalOverride(nutrition.calories, targetCalories),
      protein: applyGoalOverride(nutrition.protein, targetProtein),
    };
  }, [dashboardData, targetCalories, targetProtein]);

  const dashboardUi = useMemo(() => {
    if (!dashboardData || !activeNutrition) {
      return null;
    }

    const nutritionMetrics: MealNutritionPieMetric[] = [
      {
        key: "calories",
        label: "Calories",
        consumed: activeNutrition.calories.consumed,
        goal: activeNutrition.calories.goal,
        unit: activeNutrition.calories.unit,
        color: activeNutrition.calories.color,
      },
      {
        key: "carbs",
        label: "Carbs",
        consumed: activeNutrition.carbs.consumed,
        goal: activeNutrition.carbs.goal,
        unit: activeNutrition.carbs.unit,
        color: activeNutrition.carbs.color,
      },
      {
        key: "protein",
        label: "Protein",
        consumed: activeNutrition.protein.consumed,
        goal: activeNutrition.protein.goal,
        unit: activeNutrition.protein.unit,
        color: activeNutrition.protein.color,
      },
      {
        key: "fats",
        label: "Fats",
        consumed: activeNutrition.fats.consumed,
        goal: activeNutrition.fats.goal,
        unit: activeNutrition.fats.unit,
        color: activeNutrition.fats.color,
      },
      {
        key: "fiber",
        label: "Fiber",
        consumed: activeNutrition.fiber.consumed,
        goal: activeNutrition.fiber.goal,
        unit: activeNutrition.fiber.unit,
        color: activeNutrition.fiber.color,
      },
    ];

    const trendMetrics: MealTrendMetric[] = [
      {
        key: "calories",
        label: "Calories",
        averageValue: dashboardData.trends.last_7_days.avg_calories,
        unit: " kcal",
        direction: dashboardData.trends.direction.calories,
        hitRate: dashboardData.adherence.goal_hit_rate.calories,
        color: activeNutrition.calories.color,
      },
      {
        key: "protein",
        label: "Protein",
        averageValue: dashboardData.trends.last_7_days.avg_protein,
        unit: "g",
        direction: dashboardData.trends.direction.protein,
        hitRate: dashboardData.adherence.goal_hit_rate.protein,
        color: activeNutrition.protein.color,
      },
      {
        key: "fiber",
        label: "Fiber",
        averageValue: dashboardData.trends.last_7_days.avg_fiber,
        unit: "g",
        direction: dashboardData.trends.direction.fiber,
        hitRate: dashboardData.adherence.goal_hit_rate.fiber,
        color: activeNutrition.fiber.color,
      },
    ];

    const overviewStats: OverviewStat[] = [
      {
        key: "tracked",
        label: "Tracked",
        value: `${dashboardData.summary.days_tracked}/${dashboardData.range.days}`,
      },
      {
        key: "streak",
        label: "Streak",
        value: `${dashboardData.summary.current_streak_days} days`,
      },
      {
        key: "completion",
        label: "Completion",
        value: `${dashboardData.summary.meal_completion_rate}%`,
      },
    ];

    const overviewCaption = dashboardData.today.status.fully_tracked
      ? "Every planned meal is already tracked for today."
      : dashboardData.today.status.next_pending_meal
        ? `Next pending meal: ${formatMealSlotLabel(
            dashboardData.today.status.next_pending_meal
          )}.`
        : dashboardData.today.status.last_logged_meal
          ? `Last logged meal: ${formatMealSlotLabel(
              dashboardData.today.status.last_logged_meal
            )}.`
          : "Start logging meals to build a steady streak.";

    return {
      overviewCaption,
      overviewStats,
      nutritionMetrics,
      trendsCaption: `Last 7 days: ${Math.round(
        dashboardData.trends.last_7_days.avg_calories
      )} kcal avg, ${Math.round(
        dashboardData.trends.last_7_days.avg_protein
      )}g protein, ${Math.round(
        dashboardData.trends.last_7_days.avg_fiber
      )}g fiber. Direction: calories ${dashboardData.trends.direction.calories}, protein ${dashboardData.trends.direction.protein}, fiber ${dashboardData.trends.direction.fiber}.`,
      trendsPanelCaption: `Week ending ${dashboardData.range.end_date}: protein is holding at ${dashboardData.adherence.goal_hit_rate.protein}% goal hits, while fiber trails at ${dashboardData.adherence.goal_hit_rate.fiber}%.`,
      insightsCaption: `Signals generated from ${dashboardData.range.label.toLowerCase()} of meal tracking.`,
      trendMetrics,
    };
  }, [activeNutrition, dashboardData]);

  /**
   * Consumed-state is patched per item. We update the visible slot optimistically
   * and then refetch both day and dashboard data so aggregate cards stay in sync.
   */
  const updatePlanMealsConsumed = (
    plan: DayPlan | null,
    mealType: MealPlannerScreenMealSlotKey,
    itemIds: number[]
  ): DayPlan | null => {
    if (!plan || itemIds.length === 0) {
      return plan;
    }

    const currentSlot = plan.meals?.[mealType];
    if (!currentSlot) {
      return plan;
    }

    if (Array.isArray(currentSlot)) {
      return {
        ...plan,
        meals: {
          ...plan.meals,
          [mealType]: currentSlot.map((meal) =>
            itemIds.includes(meal.id) ? { ...meal, is_consumed: true } : meal
          ),
        },
      };
    }

    if (!itemIds.includes(currentSlot.id)) {
      return plan;
    }

    return {
      ...plan,
      meals: {
        ...plan.meals,
        [mealType]: { ...currentSlot, is_consumed: true },
      },
    };
  };

  const handleMarkConsumed = async (
    mealType: MealPlannerScreenMealSlotKey,
    data: Meal | Meal[] | null | undefined
  ) => {
    const meals = getMealItems(data);
    const pendingMeals = meals.filter((meal) => !meal.is_consumed);

    if (pendingMeals.length === 0) {
      return;
    }

    try {
      setConsumingMealSlot(mealType);

      await Promise.all(
        pendingMeals.map((meal) =>
          updateMealItem(meal.id, {
            is_consumed: true,
          })
        )
      );

      setDayPlan((prev) =>
        updatePlanMealsConsumed(
          prev,
          mealType,
          pendingMeals.map((meal) => meal.id)
        )
      );

      void fetchDashboardData();
      void fetchDailyPlan(new Date(), false);

      const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
      toast.show({
        variant: "success",
        title:
          pendingMeals.length > 1
            ? `${mealLabel} updated`
            : `${mealLabel} consumed`,
        message:
          pendingMeals.length > 1
            ? "Every item in this slot is now counted in your daily intake."
            : "This meal has been added to your daily intake.",
        position: "top",
      });
    } catch (error) {
      console.error("Error marking meal consumed:", error);
      toast.show({
        variant: "error",
        title: "Update failed",
        message: "We couldn't mark this meal as consumed right now.",
        position: "top",
      });
    } finally {
      setConsumingMealSlot(null);
    }
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Nourish Plan"
          subtitle="Fuel your body with intention."
          onBack={() => router.back()}
          rightActions={[
            {
              icon: "calendar-outline",
              onPress: handleWeeklyView,
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainScroll}
        >
          {dashboardLoading ? (
            <MealCardSurface tone="surface" radius={28} style={styles.dashboardLoaderCard}>
              <ActivityIndicator size="small" color={svaColors.brand.primary} />
              <Text style={styles.dashboardLoaderText}>Loading dashboard insights</Text>
            </MealCardSurface>
          ) : dashboardData && dashboardUi ? (
            <>
              <MealCardSurface tone="surface" radius={28} style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <View style={styles.overviewHeaderCopy}>
                    <Text style={styles.overviewEyebrow}>
                      {dashboardData.range.label.toUpperCase()}
                    </Text>
                    <Text style={styles.overviewTitle}>Tracking Overview</Text>
                    <Text style={styles.overviewCaption}>{dashboardUi.overviewCaption}</Text>
                  </View>
                  <View style={styles.overviewBadge}>
                    <Text style={styles.overviewBadgeText}>
                      {dashboardData.summary.tracked_days_percentage}%
                    </Text>
                  </View>
                </View>

                <View style={styles.overviewStatsRow}>
                  {dashboardUi.overviewStats.map((stat) => (
                    <View key={stat.key} style={styles.overviewStatTile}>
                      <Text style={styles.overviewStatLabel}>{stat.label}</Text>
                      <Text style={styles.overviewStatValue}>{stat.value}</Text>
                    </View>
                  ))}
                </View>
              </MealCardSurface>

              <MealNutritionPieCard
                title="Today’s Nutrition"
                statusLabel={dashboardData.range.label}
                caption={dashboardUi.trendsCaption}
                metrics={dashboardUi.nutritionMetrics}
              />

              <MealTrendCard
                title="Weekly Trend Signals"
                eyebrow="Trend Dashboard"
                caption={dashboardUi.trendsPanelCaption}
                metrics={dashboardUi.trendMetrics}
              />

              <MealInsightCard
                title="Nutrition Insights"
                eyebrow="SVA Insight"
                caption={dashboardUi.insightsCaption}
                insights={dashboardData.insights}
              />
            </>
          ) : (
            <MealCardSurface tone="surface" radius={28} style={styles.dashboardLoaderCard}>
              <Text style={styles.overviewTitle}>Dashboard unavailable</Text>
              <Text style={styles.overviewCaption}>
                We couldn&apos;t load your nutrition insights right now.
              </Text>
            </MealCardSurface>
          )}

          <View style={styles.timelineContainer}>
            <View style={styles.timelineVerticalLine} />
            {dayPlanLoading ? (
              <ActivityIndicator color={svaColors.chart.blue} />
            ) : (
              <>
                <MealPlannerSlotCard
                  mealType="breakfast"
                  mealData={dayPlan?.meals?.breakfast}
                  isConsuming={consumingMealSlot === "breakfast"}
                  onAddMeal={handleAddMeal}
                  onOpenRecipeSearch={handleOpenRecipeSearch}
                  onMarkConsumed={handleMarkConsumed}
                />
                <MealPlannerSlotCard
                  mealType="lunch"
                  mealData={dayPlan?.meals?.lunch}
                  isConsuming={consumingMealSlot === "lunch"}
                  onAddMeal={handleAddMeal}
                  onOpenRecipeSearch={handleOpenRecipeSearch}
                  onMarkConsumed={handleMarkConsumed}
                />
                <MealPlannerSlotCard
                  mealType="dinner"
                  mealData={dayPlan?.meals?.dinner}
                  isConsuming={consumingMealSlot === "dinner"}
                  onAddMeal={handleAddMeal}
                  onOpenRecipeSearch={handleOpenRecipeSearch}
                  onMarkConsumed={handleMarkConsumed}
                />
                <MealPlannerSlotCard
                  mealType="snack"
                  mealData={dayPlan?.meals?.snack}
                  isConsuming={consumingMealSlot === "snack"}
                  onAddMeal={handleAddMeal}
                  onOpenRecipeSearch={handleOpenRecipeSearch}
                  onMarkConsumed={handleMarkConsumed}
                />
              </>
            )}
          </View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={handlePlanAhead}
        >
          <Ionicons
            name="add"
            size={32}
            color={svaColors.button.primary.text}
          />
          <Text style={styles.fabLabel}>Plan Ahead</Text>
        </TouchableOpacity>
      </View>
    </ScreenView>
  );
};

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  tokens: SvaTokens
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.bg.base,
    },
    root: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    mainScroll: {
      paddingHorizontal: 0,
      paddingBottom: 120,
      paddingTop: spacing.md,
    },
    overviewCard: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      marginBottom: spacing.xl,
      gap: spacing.lg,
    },
    dashboardLoaderCard: {
      minHeight: 148,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      marginBottom: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    dashboardLoaderText: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 18,
    },
    overviewHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    overviewHeaderCopy: {
      flex: 1,
      gap: 6,
    },
    overviewEyebrow: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    overviewTitle: {
      ...(svaTypography?.textStyle.title ?? typography.h3),
      color: theme.text.primary,
      fontSize: 20,
      lineHeight: 24,
    },
    overviewCaption: {
      ...(svaTypography?.textStyle.body ?? typography.body),
      color: theme.text.secondary,
      fontSize: 13,
      lineHeight: 18,
    },
    overviewBadge: {
      minWidth: 58,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    overviewBadgeText: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.brand.primary,
      fontSize: 16,
    },
    overviewStatsRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    overviewStatTile: {
      flex: 1,
      minHeight: 88,
      borderRadius: 20,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
      justifyContent: "space-between",
    },
    overviewStatLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      fontSize: 10,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    overviewStatValue: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
      fontSize: 16,
      lineHeight: 20,
    },
    timelineContainer: {
      paddingLeft: 20,
    },
    timelineVerticalLine: {
      position: "absolute",
      left: 30,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: theme.divider,
      opacity: 0.6,
    },
    fab: {
      position: "absolute",
      bottom: spacing.xl,
      alignSelf: "center",
      backgroundColor: theme.button.primary.bg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: 32,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      shadowColor: theme.button.primary.bg,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    fabLabel: {
      ...(svaTypography?.textStyle.authActionLabel ?? typography.bodyStrong),
      color: theme.button.primary.text,
    },
  });
