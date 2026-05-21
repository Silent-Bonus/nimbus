import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import {
  getMealDashboard,
  MealDashboardData,
  getDailyMealPlan,
  DayPlan,
  Meal,
} from "@/features/tools/services/mealService";
import { toApiDate } from "@/utils/date-time";
import { ROUTES } from "@/constants/routes";
import AppHeader from "@/components/layout/AppHeader";
import {
  MealCardSurface,
  MealMacroProgressCard,
  MealNutritionTileCard,
  type MealMacroProgressMetric,
  type MealNutritionMetric,
} from "@/features/tools/components/meal-flow";
import type { SvaColorSet, Spacing, Typography } from "@/theme/types";

/* ---------- Mock Data ---------- */
const MOCK_DAILY_CONSUMPTION = {
  calories: { consumed: 1440, goal: 2000, color: "#90B47A" },
  protein: { consumed: 82, goal: 150, color: "#4C8DFF" },
  carbs: { consumed: 145, goal: 250, color: "#79A9F2" },
  fats: { consumed: 35, goal: 70, color: "#FB923C" },
  fiber: { consumed: 28, goal: 30, color: "#9DD2C5" },
};

const MOCK_DASHBOARD: MealDashboardData = {
  period: "Last 30 days",
  days_tracked: 12,
  total_calories_consumed: 15400,
  average_calories: 1283.33,
  today_nutrition: MOCK_DAILY_CONSUMPTION,
};

const MOCK_EXPECTED_CONSUMPTION: MealNutritionMetric[] = [
  {
    key: "protein",
    label: "Protein",
    consumed: 34,
  },
  {
    key: "carbs",
    label: "Carbs",
    consumed: 126,
  },
  {
    key: "fiber",
    label: "Fiber",
    consumed: 18,
  },
];

export const MealPlannerScreen = () => {
  const { svaColors, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography),
    [svaColors, spacing, typography]
  );

  const [selectedDate] = useState(new Date());
  const [dashboardData, setDashboardData] =
    useState<MealDashboardData>(MOCK_DASHBOARD);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const result = await getMealDashboard(30);
      if (
        result &&
        result.success &&
        result.data &&
        result.data.today_nutrition
      ) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Dashboard API error:", error);
    }
  };

  const fetchDailyPlan = async (date: Date) => {
    try {
      setLoading(true);
      const result: any = await getDailyMealPlan(date);

      if (
        result &&
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        setDayPlan(result.data[0]);
      } else if (
        result &&
        result.success &&
        result.data &&
        !Array.isArray(result.data)
      ) {
        setDayPlan(result.data);
      } else {
        setDayPlan(null);
      }
    } catch (error) {
      console.error("Daily Plan API error:", error);
      setDayPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchDailyPlan(new Date());
  }, []);

  const handleAddMeal = (type: string) => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_MEAL_CREATION,
      params: { type, date: toApiDate(selectedDate) },
    });
  };

  const handlePlanAhead = () => {
    router.push(ROUTES.AUTH.TOOLS_MEAL_CREATION);
  };

  const handleWeeklyView = () => {
    router.push(ROUTES.AUTH.TOOLS_MEAL_WEEKLY);
  };

  const macroProgressMetrics = useMemo<MealMacroProgressMetric[]>(() => {
    const nutrition = dashboardData.today_nutrition;

    return [
      {
        key: "carbs",
        label: "Carbs",
        consumed: nutrition.carbs.consumed,
        goal: nutrition.carbs.goal,
        color: svaColors.chart.blue,
        letter: "C",
      },
      {
        key: "protein",
        label: "Protein",
        consumed: nutrition.protein.consumed,
        goal: nutrition.protein.goal,
        color: svaColors.chart.lavender,
        letter: "P",
      },
      {
        key: "fiber",
        label: "Fiber",
        consumed: nutrition.fiber.consumed,
        goal: nutrition.fiber.goal,
        color: svaColors.chart.seafoam,
        letter: "F",
      },
    ];
  }, [dashboardData.today_nutrition, svaColors]);

  const macroProgressPercent = useMemo(() => {
    const calories = dashboardData.today_nutrition.calories;
    if (!calories.goal) return 0;
    return Math.round((calories.consumed / calories.goal) * 100);
  }, [dashboardData.today_nutrition.calories]);

  const renderMealCard = (type: string, data: Meal | undefined | null) => {
    const iconMap: any = {
      breakfast: "coffee",
      lunch: "white-balance-sunny",
      dinner: "moon-waning-crescent",
      snacks: "apple",
    };

    if (!data) {
      return (
        <TouchableOpacity
          style={styles.ghostCard}
          activeOpacity={0.7}
          onPress={() => handleAddMeal(type)}
        >
          <View style={styles.timelinePoint}>
            <MaterialCommunityIcons
              name={iconMap[type]}
              size={20}
              color={svaColors.text.secondary}
            />
          </View>
          <MealCardSurface
            tone="dashed"
            radius={24}
            style={styles.ghostCardBody}
          >
            <Text style={styles.ghostText}>Plan your {type}</Text>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={svaColors.brand.primary}
            />
          </MealCardSurface>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.mealCardContainer}>
        <View style={styles.timelinePointActive}>
          <MaterialCommunityIcons
            name={iconMap[type]}
            size={20}
            color={svaColors.bg.base}
          />
        </View>
        <MealCardSurface tone="surface" radius={24} style={styles.mealCard}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealType}>{type.toUpperCase()}</Text>
            <Text style={styles.mealTitle}>{data.name}</Text>
            <Text style={styles.mealMeta}>{data.calories ?? 0} kcal</Text>
          </View>
          {data.image && (
            <View style={styles.mealImagePlaceholder}>
              <Ionicons
                name="restaurant-outline"
                size={24}
                color={svaColors.text.secondary}
              />
            </View>
          )}
        </MealCardSurface>
      </View>
    );
  };

  return (
    <ScreenView
      style={{
        paddingTop:
          Platform.OS === "ios"
            ? spacing["xxl"] + spacing["xxl"] * 0.2
            : spacing.xl,
        paddingHorizontal: spacing.md,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
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
          <MealNutritionTileCard
            title="Expected Consumption"
            eyebrow="Status"
            metrics={MOCK_EXPECTED_CONSUMPTION}
          />

          <MealMacroProgressCard
            title="Daily Consumption"
            progressLabel={`${macroProgressPercent}% of goal`}
            metrics={macroProgressMetrics}
          />

          <View style={styles.timelineContainer}>
            <View style={styles.timelineVerticalLine} />
            {loading ? (
              <ActivityIndicator color={svaColors.chart.blue} />
            ) : (
              <>
                {renderMealCard("breakfast", dayPlan?.meals?.breakfast)}
                {renderMealCard("lunch", dayPlan?.meals?.lunch)}
                {renderMealCard("dinner", dayPlan?.meals?.dinner)}
                {renderMealCard(
                  "snacks",
                  Array.isArray(dayPlan?.meals?.snacks)
                    ? dayPlan?.meals?.snacks[0]
                    : (dayPlan?.meals?.snacks as unknown as Meal)
                )}
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
      </SafeAreaView>
    </ScreenView>
  );
};

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: Typography
) =>
  StyleSheet.create({
    mainScroll: {
      paddingHorizontal: 0,
      paddingBottom: 120,
      paddingTop: spacing.md,
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
    mealCardContainer: {
      marginBottom: spacing.xl,
      flexDirection: "row",
      alignItems: "center",
    },
    timelinePointActive: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.chart.blue,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      marginRight: 16,
    },
    mealCard: {
      flex: 1,
      padding: spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    mealInfo: {
      flex: 1,
    },
    mealType: {
      ...typography.caption,
      color: theme.chart.blue,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 4,
    },
    mealTitle: {
      ...typography.bodyStrong,
      fontSize: 16,
      color: theme.text.primary,
    },
    mealMeta: {
      ...typography.caption,
      color: theme.text.secondary,
      marginTop: 2,
    },
    mealImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: theme.surface.raised,
      justifyContent: "center",
      alignItems: "center",
    },
    ghostCard: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    timelinePoint: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.bg.subtle,
      borderWidth: 1,
      borderColor: theme.border.default,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      marginRight: 16,
    },
    ghostCardBody: {
      flex: 1,
      height: 80,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    ghostText: {
      ...typography.body,
      color: theme.text.secondary,
      fontStyle: "italic",
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
      ...typography.bodyStrong,
      color: theme.button.primary.text,
    },
  });
