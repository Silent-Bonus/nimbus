import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import AppHeader from "@/components/layout/AppHeader";
import { PillFilters } from "@/components/ui/PillFilters";
import { ROUTES } from "@/constants/routes";
import { toApiDate } from "@/utils/date-time";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import {
  DayPlan,
  MealPlanMealRow,
  MealPlannerWeekRangeId,
} from "@/features/tools/types/mealPlannerTypes";
import {
  downloadMealPlanPdf,
  getMealPlanRange,
} from "@/features/tools/services/mealPlannerService";
import { MealPlanDayCard } from "@/features/tools/components/meal-flow";
import type {
  Spacing,
  Typography,
  SvaColorSet,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";
import {
  WEEKLY_MEAL_TYPES,
  buildMealDayShareMessage,
  buildMealPlannerWeekDisplayDays,
  buildMealPlannerWeekRanges,
} from "@/features/tools/utils/mealPlannerUtils";

export const MealWeeklyViewScreen = () => {
  const { svaColors, spacing, typography, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, typography, svaTypography, tokens),
    [svaColors, spacing, typography, svaTypography, tokens]
  );
  const toast = useNimbusToast();

  const [selectedWeek, setSelectedWeek] = useState<MealPlannerWeekRangeId>("current");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [weeklyPlanData, setWeeklyPlanData] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const weekRanges = useMemo(() => buildMealPlannerWeekRanges(new Date()), []);

  const activeWeekRange =
    weekRanges.find((range) => range.value === selectedWeek) ?? weekRanges[1];

  // The range endpoint only returns dates that exist on the backend, so the
  // screen expands that sparse payload into a fixed seven-day week view.
  const displayDays = useMemo(
    () => buildMealPlannerWeekDisplayDays(activeWeekRange.startDate, weeklyPlanData),
    [activeWeekRange.startDate, weeklyPlanData]
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPlan = async () => {
        try {
          setLoading(true);
          const range =
            weekRanges.find((item) => item.value === selectedWeek) ?? weekRanges[1];
          const res = await getMealPlanRange(range.startDate, range.endDate);

          let data: DayPlan[] = [];
          if (res?.success) {
            if (Array.isArray(res.data)) {
              data = res.data;
            } else if (res.data && typeof res.data === "object") {
              data = [res.data];
            }
          }

          if (active) {
            setWeeklyPlanData(data);
          }
        } catch (error) {
          console.error("Error fetching meal plan range:", error);
          if (active) {
            setWeeklyPlanData([]);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      void loadPlan();

      return () => {
        active = false;
      };
    }, [selectedWeek, weekRanges])
  );

  const toggleAccordion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleOpenRecipe = (meal: MealPlanMealRow) => {
    if (!meal.recipeId && !meal.recipeSlug) {
      return;
    }

    router.push({
      pathname: ROUTES.AUTH.TOOLS_RECIPE_DETAIL,
      params: {
        id: meal.recipeId,
        slug: meal.recipeSlug,
        recipeData: meal.recipeData,
      },
    });
  };

  const sharePdfFile = async (
    fileUri: string,
    fallbackMessage: string,
    dialogTitle: string
  ) => {
    const canShareFile = await Sharing.isAvailableAsync();

    if (!canShareFile) {
      await Share.share({ message: fallbackMessage });
      return;
    }

    await Sharing.shareAsync(fileUri, {
      UTI: ".pdf",
      mimeType: "application/pdf",
      dialogTitle,
    });
  };

  const onShareWeekPlan = async () => {
    const startDate = toApiDate(activeWeekRange.startDate);
    const endDate = toApiDate(activeWeekRange.endDate);

    try {
      setLoading(true);
      const fileUri = await downloadMealPlanPdf(startDate, endDate);

      await sharePdfFile(
        fileUri,
        `My Nourish Horizon plan for ${startDate} to ${endDate}`,
        "Share weekly meal plan"
      );
    } catch (error) {
      console.error("Error sharing weekly PDF:", error);
      toast.show({
        variant: "error",
        title: "Export failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to export the weekly meal plan right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSharePlan = async (data: DayPlan) => {
    try {
      await Share.share({ message: buildMealDayShareMessage(data) });
    } catch (error) {
      console.error("Error sharing plan details:", error);
      toast.show({
        variant: "error",
        title: "Share failed",
        message: "We couldn't share this day plan right now.",
      });
    }
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <View style={styles.container}>
        <AppHeader
          title="Nourish Horizon"
          subtitle="Design your week"
          onBack={() => router.back()}
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
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Share weekly meal plan from ${toApiDate(
              activeWeekRange.startDate
            )} to ${toApiDate(activeWeekRange.endDate)}`}
            activeOpacity={0.8}
            onPress={onShareWeekPlan}
            style={styles.weekShareButton}
          >
            <View style={styles.weekShareContent}>
              <View style={styles.weekShareIconWrap}>
                <Ionicons
                  name="share-social-outline"
                  size={16}
                  color={svaColors.text.primary}
                />
              </View>
              <View style={styles.weekShareCopy}>
                <Text style={styles.weekShareLabel}>Share This Week</Text>
                <Text style={styles.weekShareMeta}>
                  PDF · {toApiDate(activeWeekRange.startDate)} to{" "}
                  {toApiDate(activeWeekRange.endDate)}
                </Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={svaColors.text.secondary}
            />
          </TouchableOpacity>
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
              const emptySlots = Math.max(WEEKLY_MEAL_TYPES.length - day.mealRows.length, 0);
              const normalizedStatus = day.statusLabel.toLowerCase();
              const statusLabel =
                day.statusLabel ||
                (emptySlots === 0
                  ? "Fully planned"
                  : `${emptySlots} empty slot${emptySlots === 1 ? "" : "s"}`);
              const statusColor =
                normalizedStatus.includes("fully planned")
                  ? svaColors.state.success
                  : normalizedStatus.includes("not planned")
                    ? svaColors.text.secondary
                    : svaColors.state.warning;
              const isExpanded = expandedIndex === index;
              const shareablePlan = day.sourcePlan;

              return (
                <MealPlanDayCard
                  key={day.id}
                  title={day.title}
                  statusLabel={statusLabel}
                  statusColor={statusColor}
                  mealRows={day.mealRows}
                  isExpanded={isExpanded}
                  onToggle={() => toggleAccordion(index)}
                  onOpenRecipe={handleOpenRecipe}
                  onSharePlan={shareablePlan ? () => onSharePlan(shareablePlan) : undefined}
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
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  tokens: SvaTokens
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.bg.base,
      paddingBottom: spacing.lg,
    },
    container: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    filterBlock: {
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    filterLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? typography.smallCaption),
      color: theme.text.secondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    chipContainer: {
      marginBottom: 0,
    },
    weekShareButton: {
      minHeight: 56,
      borderRadius: 20,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      backgroundColor: theme.surface.raised,
      paddingHorizontal: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    weekShareContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: 1,
    },
    weekShareIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.bg.subtle,
    },
    weekShareCopy: {
      flex: 1,
      gap: 2,
    },
    weekShareLabel: {
      ...(svaTypography?.textStyle.bodyMedium ?? typography.bodyStrong),
      color: theme.text.primary,
    },
    weekShareMeta: {
      ...(svaTypography?.textStyle.caption ?? typography.caption),
      color: theme.text.secondary,
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
