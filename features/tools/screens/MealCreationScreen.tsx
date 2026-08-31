import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/Themed";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import DateInput from "@/components/ui/picker/DateInput";
import DatePickerSheet from "@/components/ui/picker/DatePickerSheet";
import { FilterPill } from "@/features/self-care/components/workout/FilterPill";
import { searchRecipes } from "@/features/tools/services/recipeService";
import {
  addMealItem,
  bulkUpdateMealPlan,
  BulkMealUpdatePayload,
} from "@/features/tools/services/mealService";
import {
  formatDay,
  toApiDate,
  toFriendlyDate,
  toFriendlyRange,
} from "@/utils/date-time";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { addDays } from "date-fns";
import AppHeader from "@/components/layout/AppHeader";
import {
  MealCardSurface,
  MealFlowSection,
} from "@/features/tools/components/meal-flow";
import type { ColorSet, Spacing, Typography } from "@/theme/types";

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

interface MealEntry {
  foodName: string;
  calories?: number;
  recipeId?: number;
}

interface DayPlan {
  [key: string]: MealEntry | null;
}

interface WeeklyPlanStore {
  [date: string]: DayPlan;
}

export const MealCreationScreen = () => {
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, typography);
  const params = useLocalSearchParams();
  const toast = useNimbusToast();

  /* --- UI State --- */
  const [activeTab, setActiveTab] = useState<"day" | "week">(
    params.type || params.foodName ? "day" : "day"
  );
  const [showReview, setShowReview] = useState(false);
  const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);

  /* --- Day Tab State --- */
  const tomorrowAtMidnight = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tenDaysLater = useMemo(() => {
    const d = new Date(tomorrowAtMidnight);
    d.setDate(d.getDate() + 10);
    return d;
  }, [tomorrowAtMidnight]);

  const [dayDate, setDayDate] = useState(
    params.date ? new Date(params.date as string) : tomorrowAtMidnight
  );
  const [mealType, setMealType] = useState<MealType>(
    (params.type as MealType) || "Breakfast"
  );
  const [foodSearch, setFoodSearch] = useState(
    (params.foodName as string) || ""
  );
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  /* --- Week Tab State --- */
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [startDate, setStartDate] = useState(tomorrow);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [bulkMealType, setBulkMealType] = useState<MealType>("Breakfast");
  const [bulkFoodSearch, setBulkFoodSearch] = useState("");
  const [bulkSelectedRecipe, setBulkSelectedRecipe] = useState<any>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanStore>({});

  /* --- Search State --- */
  const [recipeResults, setRecipeResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { weekDates, rangeString } = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(startDate, i);
      dates.push(d);
    }
    const lastDate = dates[6];
    return {
      weekDates: dates,
      rangeString: toFriendlyRange(startDate, lastDate),
    };
  }, [startDate]);

  // Actions
  const handleSave = async () => {
    try {
      // Map "Snacks" -> "snack" for backend
      const normalizedType =
        mealType.toLowerCase() === "snacks" ? "snack" : mealType.toLowerCase();

      const payload: any = {
        date: dayDate, // Pass Date object, not string
        meal_type: normalizedType,
      };

      // Use selectedRecipe if its title matches the current foodSearch exactly
      if (
        selectedRecipe &&
        selectedRecipe.id !== 0 &&
        selectedRecipe.title === foodSearch
      ) {
        payload.recipe_id = selectedRecipe.id;
      } else {
        payload.name = foodSearch;
        payload.calories = 0;
      }

      console.log("Saving single day meal:", payload);
      await addMealItem(payload);
      toast.show({
        variant: "success",
        title: "Nourishment",
        message: "Your meal has been saved to your plan.",
      });
      router.back();
    } catch (e) {
      console.error("Failed to save meal:", e);
      toast.show({
        variant: "error",
        title: "Oh no!",
        message: "We couldn't save your meal right now. Please try again.",
      });
    }
  };

  const handleSaveFinal = async () => {
    try {
      const payload: BulkMealUpdatePayload = {};

      Object.entries(weeklyPlan).forEach(([date, meals]) => {
        payload[date] = {};
        Object.entries(meals).forEach(([type, entry]) => {
          // Standardize meal type keys for API (e.g., "snacks" -> "snack")
          const apiType = type === "snacks" ? "snack" : type;

          if (entry) {
            if (entry.recipeId) {
              payload[date][apiType] = {
                recipe_id: entry.recipeId,
              };
            } else {
              payload[date][apiType] = {
                name: entry.foodName,
                calories: entry.calories || 0,
              };
            }
          } else {
            // Explicitly support clearing slots
            payload[date][apiType] = null;
          }
        });
      });

      console.log(
        "Submitting bulk plan to API:",
        JSON.stringify(payload, null, 2)
      );
      await bulkUpdateMealPlan(payload);
      toast.show({
        variant: "success",
        title: "Weekly Plan",
        message: "Your week is now beautifully planned!",
      });
      router.back();
    } catch (e) {
      console.error("Failed to bulk update meals:", e);
      toast.show({
        variant: "error",
        title: "Update Failed",
        message: "Something went wrong while syncing your weekly plan.",
      });
    }
  };

  const handleAddToPlan = () => {
    if (selectedWeekdays.length === 0 || !bulkFoodSearch) return;

    const newPlan = { ...weeklyPlan };
    selectedWeekdays.forEach((date) => {
      if (!newPlan[date]) newPlan[date] = {};
      const typeKey = bulkMealType.toLowerCase(); // "breakfast", "lunch", "dinner", "snacks"

      newPlan[date][typeKey] = {
        foodName: bulkFoodSearch,
        recipeId:
          bulkSelectedRecipe?.id &&
          bulkSelectedRecipe.id !== 0 &&
          bulkSelectedRecipe.title === bulkFoodSearch
            ? bulkSelectedRecipe.id
            : undefined,
        calories: 0,
      };
    });
    setWeeklyPlan(newPlan);
    setBulkFoodSearch("");
    setBulkSelectedRecipe(null);
    setSelectedWeekdays([]);
  };

  const toggleWeekday = (date: Date) => {
    const dateStr = toApiDate(date);
    setSelectedWeekdays((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleSelectRecipe = (recipe: any) => {
    if (activeTab === "day") {
      setFoodSearch(recipe.title);
      setSelectedRecipe(recipe);
    } else {
      setBulkFoodSearch(recipe.title);
      setBulkSelectedRecipe(recipe);
    }
    setRecipeResults([]);
  };

  // Sync Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const query = activeTab === "day" ? foodSearch : bulkFoodSearch;
      if (query && query.length >= 3) {
        setIsSearching(true);
        try {
          const res = await searchRecipes(query);
          const data = res?.success && Array.isArray(res.data) ? res.data : [];
          setRecipeResults(data.slice(0, 5));
        } catch (e) {
          console.error("Search error:", e);
          setRecipeResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setRecipeResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [foodSearch, bulkFoodSearch, activeTab]);

  /* --- Renders --- */

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("day")}
        style={[styles.tab, activeTab === "day" && styles.activeTab]}
      >
        <Text
          style={[styles.tabText, activeTab === "day" && styles.activeTabText]}
        >
          Day Meal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveTab("week")}
        style={[styles.tab, activeTab === "week" && styles.activeTab]}
      >
        <Text
          style={[styles.tabText, activeTab === "week" && styles.activeTabText]}
        >
          Week Plan
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchDropdown = () => {
    if (isSearching)
      return (
        <ActivityIndicator style={{ marginTop: 10 }} color={newTheme.accent} />
      );

    const query = activeTab === "day" ? foodSearch : bulkFoodSearch;
    const isDayRecipeSelected =
      activeTab === "day" &&
      selectedRecipe &&
      selectedRecipe.title === foodSearch;
    const isWeekRecipeSelected =
      activeTab === "week" &&
      bulkSelectedRecipe &&
      bulkSelectedRecipe.title === bulkFoodSearch;

    // If a recipe is already "locked in" (selected and matches input), don't show dropdown
    if (isDayRecipeSelected || isWeekRecipeSelected) return null;

    if (recipeResults.length === 0 && query.trim().length >= 3) {
      return (
        <MealCardSurface tone="surface" radius={16} style={styles.searchDropdown}>
          <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => handleSelectRecipe({ id: 0, title: query })}
          >
            <MaterialCommunityIcons
              name="pencil-plus"
              size={16}
              color={newTheme.textSecondary}
            />
            <Text style={styles.searchResultText}>Use "{query}"</Text>
          </TouchableOpacity>
        </MealCardSurface>
      );
    }

    if (recipeResults.length === 0) return null;

    return (
      <MealCardSurface tone="surface" radius={16} style={styles.searchDropdown}>
        {recipeResults.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.searchResultItem}
            onPress={() => handleSelectRecipe(item)}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={16}
              color={newTheme.accent}
            />
            <Text style={styles.searchResultText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </MealCardSurface>
    );
  };

  const renderDayForm = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formPadding}
    >
      <MealFlowSection title="When?">
        <DateInput
          value={dayDate}
          onChange={setDayDate}
          label="Select Date"
          title="Meal Date"
          minimumDate={tomorrowAtMidnight}
          maximumDate={tenDaysLater}
        />
      </MealFlowSection>

      <MealFlowSection title="Meal Type">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
        >
          {(["Breakfast", "Lunch", "Dinner", "Snacks"] as MealType[]).map(
            (type) => (
              <FilterPill
                key={type}
                label={type}
                isActive={mealType === type}
                onPress={() => setMealType(type)}
                style={styles.chip}
              />
            )
          )}
        </ScrollView>
      </MealFlowSection>

      <MealFlowSection title="What are you eating?">
        <View
          style={[
            styles.searchBar,
            selectedRecipe &&
              selectedRecipe.title === foodSearch &&
              styles.searchBarSelected,
          ]}
        >
          <Ionicons
            name={
              selectedRecipe && selectedRecipe.title === foodSearch
                ? "checkmark-circle"
                : "search"
            }
            size={20}
            color={
              selectedRecipe && selectedRecipe.title === foodSearch
                ? newTheme.accent
                : newTheme.textSecondary
            }
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or enter recipe name..."
            placeholderTextColor={newTheme.textSecondary}
            value={foodSearch}
            onChangeText={(t) => {
              setFoodSearch(t);
              if (selectedRecipe && t !== selectedRecipe.title) {
                setSelectedRecipe(null);
              }
            }}
          />
        </View>
        {renderSearchDropdown()}
      </MealFlowSection>
    </ScrollView>
  );

  const renderWeekForm = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formPadding}
    >
      <MealFlowSection title="Step 1: Which days are we planning for?">
        <MealCardSurface tone="accent" radius={12} style={styles.infoBanner}>
          <Ionicons
            name="information-circle"
            size={18}
            color={newTheme.accent}
          />
          <Text style={styles.infoBannerText}>
            You can set your plan's start date up to 10 days in advance.
          </Text>
        </MealCardSurface>

        <TouchableOpacity activeOpacity={0.8} onPress={() => setIsRangePickerVisible(true)}>
          <MealCardSurface tone="surface" radius={24} style={styles.rangePanel}>
            <View style={styles.rangePanelHeader}>
              <View style={styles.rangeIconCircle}>
                <Ionicons name="calendar" size={20} color={newTheme.accent} />
              </View>
              <View style={styles.rangeTextCol}>
                <Text style={styles.rangeLabel}>Active Window</Text>
                <Text style={styles.rangeValue}>{rangeString}</Text>
              </View>
              <View style={styles.rangeEditBadge}>
                <Text style={styles.rangeEditText}>Change</Text>
              </View>
            </View>
            <Text style={styles.rangeHint}>
              Plan your entire week starting from{" "}
              {startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              .
            </Text>
          </MealCardSurface>
        </TouchableOpacity>

        <DatePickerSheet
          visible={isRangePickerVisible}
          value={startDate}
          title="Select Start Date"
          onClose={() => setIsRangePickerVisible(false)}
          onChange={(d) => {
            setStartDate(d);
            setWeeklyPlan({});
            setSelectedWeekdays([]);
          }}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)}
        />

        <View style={styles.weekdayRow}>
          {weekDates.map((date) => {
            const dateStr = toApiDate(date);
            const isSelected = selectedWeekdays.includes(dateStr);
            const dayPlan = weeklyPlan[dateStr] || {};
            const plannedCount = Object.keys(dayPlan).length;

            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => toggleWeekday(date)}
                style={[styles.dayTile, isSelected && styles.dayTileActive]}
              >
                <Text
                  style={[
                    styles.dayTileNumber,
                    isSelected && styles.dayTileTextActive,
                  ]}
                >
                  {date.getDate()}
                </Text>
                <Text
                  style={[
                    styles.dayTileLabel,
                    isSelected && styles.dayTileTextActive,
                  ]}
                >
                  {formatDay(date).charAt(0)}
                </Text>

                {plannedCount > 0 && !isSelected && (
                  <View style={styles.plannedIndicators}>
                    {Array.from({ length: Math.min(plannedCount, 4) }).map(
                      (_, i) => (
                        <View key={i} style={styles.plannedDot} />
                      )
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </MealFlowSection>

      <MealFlowSection title="Step 2: Which meal is this?">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
        >
          {(["Breakfast", "Lunch", "Dinner", "Snacks"] as MealType[]).map(
            (type) => {
              const alreadyPlanned = weekDates.filter(
                (d) => weeklyPlan[toApiDate(d)]?.[type.toLowerCase()]
              ).length;

              return (
                <View key={type} style={{ alignItems: "center" }}>
                  <FilterPill
                    label={type}
                    isActive={bulkMealType === type}
                    onPress={() => setBulkMealType(type)}
                    style={styles.chip}
                  />
                  {alreadyPlanned > 0 && (
                    <Text style={styles.plannedCountText}>
                      {alreadyPlanned}/7 days
                    </Text>
                  )}
                </View>
              );
            }
          )}
        </ScrollView>
      </MealFlowSection>

      <MealFlowSection title="Step 3: What are you eating?">
        <View
          style={[
            styles.searchBar,
            bulkSelectedRecipe &&
              bulkSelectedRecipe.title === bulkFoodSearch &&
              styles.searchBarSelected,
          ]}
        >
          <Ionicons
            name={
              bulkSelectedRecipe && bulkSelectedRecipe.title === bulkFoodSearch
                ? "checkmark-circle"
                : "search"
            }
            size={20}
            color={
              bulkSelectedRecipe && bulkSelectedRecipe.title === bulkFoodSearch
                ? newTheme.accent
                : newTheme.textSecondary
            }
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Choose oatmeal, protein shake..."
            placeholderTextColor={newTheme.textSecondary}
            value={bulkFoodSearch}
            onChangeText={(t) => {
              setBulkFoodSearch(t);
              if (bulkSelectedRecipe && t !== bulkSelectedRecipe.title) {
                setBulkSelectedRecipe(null);
              }
            }}
          />
        </View>
        {renderSearchDropdown()}
      </MealFlowSection>

      {selectedWeekdays.length > 0 && bulkFoodSearch !== "" && (
        <TouchableOpacity onPress={handleAddToPlan}>
          <MealCardSurface
            tone="raised"
            radius={24}
            borderColor={`${newTheme.accent}40`}
            style={styles.summaryCard}
          >
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>📝 Ready to Add</Text>
              <Text style={styles.summaryText}>
                {bulkFoodSearch} for {bulkMealType} on {selectedWeekdays.length}{" "}
                days.
              </Text>
            </View>
            <View style={styles.addButtonCircle}>
              <Ionicons name="add" size={24} color={newTheme.background} />
            </View>
          </MealCardSurface>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderReviewScreen = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formPadding}
    >
      <Text style={styles.reviewHeader}>Weekly Summary</Text>
      {weekDates.map((date) => {
        const dateStr = toApiDate(date);
        const dayPlan = weeklyPlan[dateStr] || {};
        return (
          <MealCardSurface
            key={dateStr}
            tone="surface"
            radius={20}
            style={styles.reviewDayCard}
          >
            <View style={styles.reviewDayHeader}>
              <Text style={styles.reviewDayDate}>{toFriendlyDate(date)}</Text>
              <Text style={styles.reviewDayStatus}>
                {Object.keys(dayPlan).length}/4 meals
              </Text>
            </View>
            {["breakfast", "lunch", "dinner", "snacks"].map((meal) => (
              <View key={meal} style={styles.reviewMealRow}>
                <Text style={styles.reviewMealType}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
                <Text
                  style={[
                    styles.reviewMealFood,
                    !dayPlan[meal] && {
                      fontStyle: "italic",
                      color: newTheme.textSecondary,
                    },
                  ]}
                >
                  {dayPlan[meal]?.foodName || "Not planned"}
                </Text>
              </View>
            ))}
          </MealCardSurface>
        );
      })}
    </ScrollView>
  );

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <AppHeader
            title={showReview ? "Review Plan" : "Plan Meal"}
            subtitle={
              showReview
                ? "Check your weekly balance."
                : "Design your nourishment journey."
            }
            onBack={() => (showReview ? setShowReview(false) : router.back())}
          />

          {!showReview && renderTabs()}

          <View style={{ flex: 1 }}>
            {showReview
              ? renderReviewScreen()
              : activeTab === "day"
              ? renderDayForm()
              : renderWeekForm()}
          </View>

          <View style={styles.footer}>
            {!showReview && activeTab === "week" && (
              <StyledButton
                label="Proceed to Review"
                variant={
                  Object.keys(weeklyPlan).length > 0 ? "primary" : "secondary"
                }
                onPress={() => setShowReview(true)}
                disabled={Object.keys(weeklyPlan).length === 0}
                style={{ marginBottom: 12 }}
              />
            )}

            <StyledButton
              label={
                showReview
                  ? "Confirm & Sync"
                  : activeTab === "day"
                  ? "Save Meal"
                  : "Add to Plan"
              }
              onPress={() => {
                if (showReview) {
                  handleSaveFinal();
                } else if (activeTab === "day") {
                  handleSave();
                } else {
                  handleAddToPlan();
                }
              }}
              variant="primary"
              fullWidth
              disabled={
                !showReview &&
                (activeTab === "day"
                  ? !foodSearch
                  : selectedWeekdays.length === 0 || !bulkFoodSearch)
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenView>
  );
};

const styling = (theme: ColorSet, spacing: Spacing, typography: Typography) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: "row",
      backgroundColor: theme.surfaceMuted,
      borderRadius: 16,
      padding: 4,
      marginBottom: spacing.lg,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: 12,
    },
    activeTab: {
      backgroundColor: theme.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      ...typography.body,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    activeTabText: {
      color: theme.accent,
    },
    formPadding: {
      paddingHorizontal: 0,
      paddingBottom: 40,
    },
    infoBanner: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.sm,
      marginBottom: spacing.md,
      gap: 8,
    },
    infoBannerText: {
      ...typography.caption,
      color: theme.textPrimary,
      flex: 1,
      fontWeight: "600",
    },
    chipRow: {
      flexDirection: "row",
      marginBottom: spacing.sm,
    },
    chip: {
      marginRight: spacing.sm,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 16,
      paddingHorizontal: spacing.md,
      height: 56,
      borderWidth: 1,
      borderColor: theme.divider,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: theme.textPrimary,
      fontSize: 16,
    },
    searchBarSelected: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + "05",
    },
    searchDropdown: {
      marginTop: 8,
      padding: spacing.xs,
    },
    searchResultItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
      gap: 10,
    },
    searchResultText: {
      ...typography.body,
      color: theme.textPrimary,
    },
    footer: {
      paddingVertical: spacing.md,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    rangePanel: {
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    rangePanelHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    rangeIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.accent + "15",
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.sm,
    },
    rangeTextCol: {
      flex: 1,
    },
    rangeLabel: {
      ...typography.caption,
      color: theme.textSecondary,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    rangeValue: {
      ...typography.bodyStrong,
      fontSize: 17,
      color: theme.textPrimary,
    },
    rangeEditBadge: {
      backgroundColor: theme.surfaceMuted,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    rangeEditText: {
      ...typography.caption,
      color: theme.accent,
      fontWeight: "700",
    },
    rangeHint: {
      ...typography.caption,
      color: theme.textSecondary,
      lineHeight: 16,
      fontStyle: "italic",
    },
    weekdayRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.md,
    },
    dayTile: {
      width: 44,
      height: 64,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.divider,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    dayTileActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    dayTileNumber: {
      ...typography.bodyStrong,
      fontSize: 14,
      color: theme.textPrimary,
    },
    dayTileLabel: {
      ...typography.caption,
      fontSize: 10,
      color: theme.textSecondary,
      marginTop: 2,
    },
    dayTileTextActive: {
      color: theme.background,
    },
    plannedIndicators: {
      flexDirection: "row",
      position: "absolute",
      bottom: 6,
      gap: 2,
    },
    plannedDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.accent,
    },
    plannedCountText: {
      ...typography.caption,
      fontSize: 10,
      color: theme.textSecondary,
      marginTop: 4,
    },
    addButtonCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    summaryCard: {
      padding: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.sm,
    },
    summaryInfo: {
      flex: 1,
    },
    summaryTitle: {
      ...typography.bodyStrong,
      color: theme.textPrimary,
      marginBottom: 2,
    },
    summaryText: {
      ...typography.caption,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    reviewHeader: {
      ...typography.h3,
      color: theme.textPrimary,
      marginBottom: spacing.lg,
    },
    reviewDayCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    reviewDayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      paddingBottom: 8,
      marginBottom: 12,
    },
    reviewDayDate: {
      ...typography.bodyStrong,
      color: theme.accent,
    },
    reviewDayStatus: {
      ...typography.caption,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    reviewMealRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    reviewMealType: {
      ...typography.caption,
      fontWeight: "700",
      color: theme.textSecondary,
      width: 80,
    },
    reviewMealFood: {
      ...typography.body,
      color: theme.textPrimary,
      flex: 1,
      textAlign: "right",
    },
  });
