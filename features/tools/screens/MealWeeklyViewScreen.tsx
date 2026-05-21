import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { addDays, format, isBefore, startOfDay, startOfWeek } from "date-fns";
import * as FileSystem from "expo-file-system";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import AppHeader from "@/components/layout/AppHeader";
import { PillFilters } from "@/components/ui/PillFilters";
import { ROUTES } from "@/constants/routes";
import { toApiDate } from "@/utils/date-time";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMealPlanPdfUrl,
  getMealPlanRange,
  type DayPlan,
  type Meal,
} from "@/features/tools/services/mealService";
import {
  MealPlanDayCard,
  type MealPlanMealRow,
  type MealPlanMealType,
} from "@/features/tools/components/meal-flow";
import type { Spacing, Typography, SvaColorSet } from "@/theme/types";

type WeekRangeId = "previous" | "current" | "next";

type WeekRange = {
  value: WeekRangeId;
  label: string;
  startDate: Date;
  endDate: Date;
};

type DisplayDay = {
  id: string;
  title: string;
  date: Date;
  mealRows: MealPlanMealRow[];
  sourcePlan: DayPlan | null;
};

const MEAL_TYPES: MealPlanMealType[] = ["breakfast", "lunch", "dinner"];

const MEAL_LABELS: Record<MealPlanMealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const FALLBACK_MEAL_IMAGE = require("@/assets/images/mt.jpg");

type MockWeekTemplate = {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  calories: number;
};

const MOCK_WEEK_TEMPLATES: MockWeekTemplate[] = [
  {
    breakfast: "Zesty Quinoa & Citrus Bowl",
    lunch: "Mediterranean Buddha Bowl",
    dinner: "Golden Tofu Stir-fry",
    calories: 1580,
  },
  {
    lunch: "Herbed Grain Bowl with Roasted Vegetables",
    calories: 840,
  },
  {
    breakfast: "Berry Overnight Oats",
    dinner: "Lemon Herb Salmon Plate",
    calories: 1120,
  },
  {
    breakfast: "Avocado Toast Stack",
    lunch: "Crunchy Chickpea Salad",
    dinner: "Miso Ginger Noodle Bowl",
    calories: 1495,
  },
  {
    breakfast: "Coconut Chia Pudding",
    calories: 610,
  },
  {
    lunch: "Sesame Veggie Wrap",
    dinner: "Spiced Paneer Skillet",
    calories: 1170,
  },
  {
    breakfast: "Banana Almond Pancakes",
    lunch: "Rainbow Pesto Pasta Salad",
    dinner: "Charred Veg Bowl",
    calories: 1625,
  },
];

const createMockMeal = (
  id: number,
  name: string,
  mealType: MealPlanMealType,
  planId: number
): Meal => ({
  id,
  name,
  calories: 0,
  image: null,
  is_consumed: false,
  plan: planId,
  meal_type: mealType,
  recipe: id * 10,
});

const getMockStatusLabel = (template: MockWeekTemplate) => {
  const filledSlots = [template.breakfast, template.lunch, template.dinner].filter(
    Boolean
  ).length;
  const emptySlots = 3 - filledSlots;
  return emptySlots === 0
    ? "Fully planned"
    : `${emptySlots} empty slot${emptySlots === 1 ? "" : "s"}`;
};

const buildMockWeeklyPlans = (weekStart: Date): DayPlan[] =>
  MOCK_WEEK_TEMPLATES.map((template, index) => {
    const date = addDays(weekStart, index);
    const planId = 9000 + index;

    return {
      id: planId,
      date: toApiDate(date),
      status: getMockStatusLabel(template),
      meals: {
        breakfast: template.breakfast
          ? createMockMeal(planId * 10 + 1, template.breakfast, "breakfast", planId)
          : null,
        lunch: template.lunch
          ? createMockMeal(planId * 10 + 2, template.lunch, "lunch", planId)
          : null,
        dinner: template.dinner
          ? createMockMeal(planId * 10 + 3, template.dinner, "dinner", planId)
          : null,
        snacks: null,
      },
      total_calories: template.calories,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0,
    };
  });

const MOCK_DAY_LAYOUT: Array<Array<{ mealType: MealPlanMealType; recipeName: string }>> =
  [
    [
      {
        mealType: "breakfast",
        recipeName: "Zesty Quinoa & Citrus Bowl",
      },
      {
        mealType: "lunch",
        recipeName: "Mediterranean Buddha Bowl",
      },
      {
        mealType: "dinner",
        recipeName: "Golden Tofu Stir-fry",
      },
    ],
    [
      {
        mealType: "lunch",
        recipeName: "Herbed Grain Bowl with Roasted Vegetables",
      },
    ],
    [
      {
        mealType: "breakfast",
        recipeName: "Berry Overnight Oats",
      },
      {
        mealType: "dinner",
        recipeName: "Lemon Herb Salmon Plate",
      },
    ],
    [
      {
        mealType: "breakfast",
        recipeName: "Avocado Toast Stack",
      },
      {
        mealType: "lunch",
        recipeName: "Crunchy Chickpea Salad",
      },
      {
        mealType: "dinner",
        recipeName: "Miso Ginger Noodle Bowl",
      },
    ],
    [
      {
        mealType: "breakfast",
        recipeName: "Coconut Chia Pudding",
      },
      {
        mealType: "dinner",
        recipeName: "Spiced Paneer Skillet",
      },
    ],
    [
      {
        mealType: "lunch",
        recipeName: "Sesame Veggie Wrap",
      },
    ],
    [
      {
        mealType: "breakfast",
        recipeName: "Banana Almond Pancakes",
      },
      {
        mealType: "lunch",
        recipeName: "Rainbow Pesto Pasta Salad",
      },
      {
        mealType: "dinner",
        recipeName: "Charred Veg Bowl",
      },
    ],
  ];

const normalizeMealRow = (
  mealType: MealPlanMealType,
  meal: Meal | null | undefined
): MealPlanMealRow | null => {
  if (!meal) return null;

  return {
    mealType,
    recipeName: meal.name || "Untitled recipe",
    image: meal.image || FALLBACK_MEAL_IMAGE,
  };
};

const buildLiveMealRows = (plan: DayPlan): MealPlanMealRow[] =>
  MEAL_TYPES.map((mealType) =>
    normalizeMealRow(mealType, plan.meals?.[mealType] ?? null)
  ).filter((row): row is MealPlanMealRow => Boolean(row));

const buildMockMealRows = (dayIndex: number): MealPlanMealRow[] =>
  MOCK_DAY_LAYOUT[dayIndex % MOCK_DAY_LAYOUT.length].map((entry) => ({
    mealType: entry.mealType,
    recipeName: entry.recipeName,
    image: FALLBACK_MEAL_IMAGE,
  }));

const buildDisplayDays = (
  weekStart: Date,
  plans: DayPlan[]
): DisplayDay[] => {
  const planMap = new Map(
    plans.map((plan) => [toApiDate(new Date(plan.date)), plan])
  );
  const hasLiveData = plans.length > 0;

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = toApiDate(date);
    const livePlan = planMap.get(key) ?? null;
    const title = format(date, "EEEE, MMM d");

    return {
      id: key,
      title,
      date,
      mealRows: livePlan
        ? buildLiveMealRows(livePlan)
        : hasLiveData
          ? []
          : buildMockMealRows(index),
      sourcePlan: livePlan,
    };
  });
};

export const MealWeeklyViewScreen = () => {
  const { svaColors, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography),
    [svaColors, spacing, typography]
  );
  const { authState } = useAuth();

  const [selectedWeek, setSelectedWeek] = useState<WeekRangeId>("current");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [weeklyPlanData, setWeeklyPlanData] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(!__DEV__);

  const weekRanges = useMemo<WeekRange[]>(() => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

    return [
      {
        value: "previous",
        label: "Previous",
        startDate: addDays(currentWeekStart, -7),
        endDate: addDays(currentWeekStart, -1),
      },
      {
        value: "current",
        label: "Current",
        startDate: currentWeekStart,
        endDate: addDays(currentWeekStart, 6),
      },
      {
        value: "next",
        label: "Future",
        startDate: addDays(currentWeekStart, 7),
        endDate: addDays(currentWeekStart, 13),
      },
    ];
  }, []);

  const activeWeekRange =
    weekRanges.find((range) => range.value === selectedWeek) ?? weekRanges[1];

  const planSource = useMemo(
    () => (__DEV__ ? buildMockWeeklyPlans(activeWeekRange.startDate) : weeklyPlanData),
    [activeWeekRange.startDate, weeklyPlanData]
  );

  const displayDays = useMemo(
    () => buildDisplayDays(activeWeekRange.startDate, planSource),
    [activeWeekRange.startDate, planSource]
  );

  const fetchPlan = async (weekId: WeekRangeId) => {
    try {
      setLoading(true);
      const range =
        weekRanges.find((item) => item.value === weekId) ?? weekRanges[1];
      const res: any = await getMealPlanRange(range.startDate, range.endDate);

      let data: DayPlan[] = [];
      if (res?.success) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data && typeof res.data === "object") {
          data = [res.data];
        }
      }

      setWeeklyPlanData(data);
    } catch (error) {
      console.error("Error fetching meal plan range:", error);
      setWeeklyPlanData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (__DEV__) {
      // Mock data should render immediately in dev so the future-plan states are easy to test.
      setWeeklyPlanData([]);
      setLoading(false);
      return;
    }

    fetchPlan(selectedWeek);
  }, [selectedWeek]);

  const toggleAccordion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleEditMeal = (
    mealType: MealPlanMealType,
    date: Date,
    recipeName: string
  ) => {
    router.push({
      pathname: ROUTES.AUTH.TOOLS_MEAL_CREATION,
      params: {
        type: MEAL_LABELS[mealType],
        date: toApiDate(date),
        foodName: recipeName,
      },
    });
  };

  const onSharePlan = async (data: DayPlan) => {
    try {
      setLoading(true);
      const dateStr = toApiDate(new Date(data.date));
      const pdfUrl = getMealPlanPdfUrl(dateStr, dateStr);
      const fileUri = `${FileSystem.cacheDirectory}NourishPlan_${dateStr}.pdf`;

      const downloadRes = await FileSystem.downloadAsync(pdfUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${authState?.token}`,
        },
      });

      if (downloadRes.status === 200) {
        await Share.share(
          Platform.OS === "ios"
            ? { url: downloadRes.uri }
            : {
                message: `My Nourish Plan for ${dateStr}`,
                url: downloadRes.uri,
              }
        );
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      const getMealName = (meal: any) => {
        if (!meal) return "Not planned";
        if (Array.isArray(meal)) {
          return meal.length > 0
            ? meal.map((item: any) => item.name).join(", ")
            : "Not planned";
        }
        return meal.name || "Not planned";
      };

      const message =
        `My Meal Plan for ${new Date(data.date).toDateString()}:\n` +
        `Breakfast: ${getMealName(data.meals?.breakfast)}\n` +
        `Lunch: ${getMealName(data.meals?.lunch)}\n` +
        `Dinner: ${getMealName(data.meals?.dinner)}\n` +
        `Snacks: ${getMealName(data.meals?.snacks)}\n` +
        `Total Calories: ${data.total_calories || 0} kcal`;

      await Share.share({ message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} style={styles.screen}>
      <View style={styles.container}>
        <AppHeader
          title="Nourish Horizon"
          subtitle="Design your week"
          onBack={() => router.back()}
          subtitleStyle={styles.headerSubtitle}
        />

        <View style={styles.filterBlock}>
          <Text style={styles.filterLabel}>Weekly filter</Text>
          <PillFilters
            options={weekRanges.map(({ value, label }) => ({ value, label }))}
            selectedValue={selectedWeek}
            onChange={(value) => {
              setSelectedWeek(value);
              setExpandedIndex(0);
            }}
            uppercase={false}
            scrollable={false}
            style={styles.chipContainer}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={svaColors.brand.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {displayDays.map((day, index) => {
              const emptySlots = MEAL_TYPES.length - day.mealRows.length;
              const statusLabel =
                emptySlots === 0
                  ? "Fully planned"
                  : `${emptySlots} empty slot${emptySlots === 1 ? "" : "s"}`;
              const statusColor =
                emptySlots === 0
                  ? svaColors.state.success
                  : svaColors.state.warning;
              const isPast = isBefore(day.date, startOfDay(new Date()));
              const isExpanded = expandedIndex === index;

              return (
                <MealPlanDayCard
                  key={day.id}
                  title={day.title}
                  statusLabel={statusLabel}
                  statusColor={statusColor}
                  mealRows={day.mealRows}
                  isExpanded={isExpanded}
                  isPast={isPast}
                  onToggle={() => toggleAccordion(index)}
                  onEditMeal={(mealType) => {
                    const meal = day.mealRows.find(
                      (row) => row.mealType === mealType
                    );
                    handleEditMeal(
                      mealType,
                      day.date,
                      meal?.recipeName || ""
                    );
                  }}
                  onSharePlan={
                    day.sourcePlan ? () => onSharePlan(day.sourcePlan!) : undefined
                  }
                />
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScreenView>
  );
};

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  typography: Typography
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingBottom: spacing.lg,
    },
    container: {
      flex: 1,
    },
    headerSubtitle: {
      ...typography.caption,
      color: theme.text.secondary,
      marginTop: spacing.xs,
      letterSpacing: 0.2,
    },
    filterBlock: {
      marginBottom: spacing.lg,
    },
    filterLabel: {
      ...typography.caption,
      color: theme.text.secondary,
      marginBottom: spacing.sm,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    chipContainer: {
      marginBottom: 0,
    },
    scrollContent: {
      paddingBottom: spacing.xxl,
      flexGrow: 1,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.xxl,
    },
  });
