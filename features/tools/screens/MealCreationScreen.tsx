import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import DateInput from "@/components/ui/picker/DateInput";
import DatePickerSheet from "@/components/ui/picker/DatePickerSheet";
import { FilterPill } from "@/features/self-care/components/workout/FilterPill";
import { searchRecipes } from "@/features/tools/services/recipeService";
import {
  bulkUpdateMealPlan,
} from "@/features/tools/services/mealPlannerService";
import type {
  BulkMealUpdatePayload,
  MealPlannerApiMealType,
  MealPlannerDayDraft,
  MealPlannerDraftEntry,
  MealPlannerUiMealType,
  MealPlannerWeeklyPlanStore,
} from "@/features/tools/types/mealPlannerTypes";
import {
  DAY_MEAL_TYPES,
  mealTypeToApiKey,
  normalizeMealTypeParam,
} from "@/features/tools/utils/mealPlannerUtils";
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
  MealPlannerDayPreviewCard,
  MealPlannerModeTabs,
  MealPlannerReviewList,
  MealPlannerStageActionCard,
  MealFlowSection,
  MealPlannerSearchDropdown,
} from "@/features/tools/components/meal-flow";
import type {
  Spacing,
  TypographyTokens,
  SvaColorSet,
  SvaTokens,
} from "@/theme/types";

export const MealCreationScreen = () => {
  const { svaColors, spacing, svaTypography, tokens } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, svaTypography, tokens),
    [svaColors, spacing, svaTypography, tokens]
  );
  const params = useLocalSearchParams();
  const toast = useNimbusToast();
  const initialMealType = normalizeMealTypeParam(params.type);
  const initialFoodName =
    typeof params.foodName === "string" ? params.foodName : "";

  /* --- UI State --- */
  const [activeTab, setActiveTab] = useState<"day" | "week">(
    params.type || params.foodName ? "day" : "day"
  );
  const [showReview, setShowReview] = useState(false);
  const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);

  /* --- Day Tab State --- */
  const todayAtMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tenDaysLater = useMemo(() => {
    const d = new Date(todayAtMidnight);
    d.setDate(d.getDate() + 10);
    return d;
  }, [todayAtMidnight]);

  const [dayDate, setDayDate] = useState(
    params.date ? new Date(params.date as string) : todayAtMidnight
  );
  const [mealType, setMealType] = useState<MealPlannerUiMealType>(initialMealType);
  const [foodSearch, setFoodSearch] = useState(initialFoodName);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [dayDraftStore, setDayDraftStore] = useState<MealPlannerWeeklyPlanStore>(() => {
    if (!initialFoodName.trim()) {
      return {};
    }

    const initialDateKey = toApiDate(
      params.date ? new Date(params.date as string) : todayAtMidnight
    );

    return {
      [initialDateKey]: {
        [mealTypeToApiKey(initialMealType)]: {
          foodName: initialFoodName.trim(),
          calories: 0,
        },
      },
    };
  });

  /* --- Week Tab State --- */
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [startDate, setStartDate] = useState(tomorrow);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [bulkMealType, setBulkMealType] =
    useState<MealPlannerUiMealType>("Breakfast");
  const [bulkFoodSearch, setBulkFoodSearch] = useState("");
  const [bulkSelectedRecipe, setBulkSelectedRecipe] = useState<any>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlannerWeeklyPlanStore>({});

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

  const dayDraftKey = useMemo(() => toApiDate(dayDate), [dayDate]);
  const dayPlanDraft = useMemo<MealPlannerDayDraft>(
    () => dayDraftStore[dayDraftKey] ?? {},
    [dayDraftKey, dayDraftStore]
  );

  const getDraftEntryFromInput = () => {
    const trimmedName = foodSearch.trim();

    if (!trimmedName) {
      return null;
    }

    if (
      selectedRecipe &&
      selectedRecipe.id !== 0 &&
      selectedRecipe.title === trimmedName
    ) {
      return {
        foodName: trimmedName,
        recipeId: selectedRecipe.id,
        calories: 0,
      } satisfies MealPlannerDraftEntry;
    }

    return {
      foodName: trimmedName,
      calories: 0,
    } satisfies MealPlannerDraftEntry;
  };

  useEffect(() => {
    const entry = dayPlanDraft[mealTypeToApiKey(mealType)];

    if (entry?.foodName) {
      setFoodSearch(entry.foodName);
      setSelectedRecipe(
        entry.recipeId
          ? {
              id: entry.recipeId,
              title: entry.foodName,
            }
          : null
      );
      return;
    }

    setFoodSearch("");
    setSelectedRecipe(null);
  }, [dayPlanDraft, mealType]);

  // Actions
  const handleAddDaySlot = () => {
    const entry = getDraftEntryFromInput();

    if (!entry) {
      return;
    }

    const slotKey = mealTypeToApiKey(mealType);
    setDayDraftStore((prev) => ({
      ...prev,
      [dayDraftKey]: {
        ...(prev[dayDraftKey] ?? {}),
        [slotKey]: entry,
      },
    }));
    toast.show({
      variant: "success",
      title: `${mealType} ready`,
      message: `${entry.foodName} has been staged for ${toFriendlyDate(dayDate)}.`,
      position: "top",
    });
  };

  const handleRemoveDaySlot = (slotKey: MealPlannerApiMealType) => {
    setDayDraftStore((prev) => {
      const currentDraft = { ...(prev[dayDraftKey] ?? {}) };
      delete currentDraft[slotKey];

      if (Object.keys(currentDraft).length === 0) {
        const nextStore = { ...prev };
        delete nextStore[dayDraftKey];
        return nextStore;
      }

      return {
        ...prev,
        [dayDraftKey]: currentDraft,
      };
    });

    if (mealTypeToApiKey(mealType) === slotKey) {
      setFoodSearch("");
      setSelectedRecipe(null);
    }
  };

  const handleSaveDayPlan = async () => {
    try {
      const slotKey = mealTypeToApiKey(mealType);
      const currentEntry = getDraftEntryFromInput();
      const dayEntries: MealPlannerDayDraft = {
        ...dayPlanDraft,
        ...(currentEntry ? { [slotKey]: currentEntry } : {}),
      };
      const plannedEntries = Object.entries(dayEntries).filter(
        ([, entry]) => entry?.foodName?.trim()
      ) as [MealPlannerApiMealType, MealPlannerDraftEntry][];

      if (plannedEntries.length === 0) {
        return;
      }

      const formattedDate = toApiDate(dayDate);
      const payload: BulkMealUpdatePayload = {
        [formattedDate]: {},
      };

      plannedEntries.forEach(([mealKey, entry]) => {
        payload[formattedDate][mealKey] = entry.recipeId
          ? {
              recipe_id: entry.recipeId,
            }
          : {
              name: entry.foodName,
              calories: entry.calories || 0,
              protein: entry.protein,
              carbohydrates: entry.carbohydrates,
              fats: entry.fats,
              fiber: entry.fiber,
            };
      });

      console.log("Saving day plan:", JSON.stringify(payload, null, 2));
      await bulkUpdateMealPlan(payload);
      toast.show({
        variant: "success",
        title: "Nourishment",
        message:
          plannedEntries.length === 1
            ? "Your meal has been saved to your plan."
            : "Your day plan has been saved with all selected meal slots.",
      });
      router.back();
    } catch (e) {
      console.error("Failed to save day plan:", e);
      toast.show({
        variant: "error",
        title: "Oh no!",
        message: "We couldn't save your day plan right now. Please try again.",
      });
    }
  };

  const handleSaveFinal = async () => {
    try {
      const payload: BulkMealUpdatePayload = {};

      Object.entries(weeklyPlan).forEach(([date, meals]) => {
        payload[date] = {};
        Object.entries(meals).forEach(([type, entry]) => {
          if (entry) {
            if (entry.recipeId) {
              payload[date][type] = {
                recipe_id: entry.recipeId,
              };
            } else {
              payload[date][type] = {
                name: entry.foodName,
                calories: entry.calories || 0,
                protein: entry.protein,
                carbohydrates: entry.carbohydrates,
                fats: entry.fats,
                fiber: entry.fiber,
              };
            }
          } else {
            // Explicitly support clearing slots
            payload[date][type] = null;
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
      const typeKey = mealTypeToApiKey(bulkMealType);

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

  const searchQuery = activeTab === "day" ? foodSearch : bulkFoodSearch;
  const isRecipeSelectionLocked =
    (activeTab === "day" &&
      Boolean(selectedRecipe && selectedRecipe.title === foodSearch)) ||
    (activeTab === "week" &&
      Boolean(
        bulkSelectedRecipe && bulkSelectedRecipe.title === bulkFoodSearch
      ));

  const renderDayForm = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formPadding}
    >
      <MealFlowSection title="Plan the day">
        <MealCardSurface tone="accent" radius={16} style={styles.infoBanner}>
          <Ionicons
            name="layers-outline"
            size={18}
            color={svaColors.brand.primary}
          />
          <Text style={styles.infoBannerText}>
            For {toFriendlyDate(dayDate)}, you can save one meal slot or stage
            breakfast, lunch, dinner, and snack together in one sync.
          </Text>
        </MealCardSurface>
      </MealFlowSection>

      <MealFlowSection title="When?">
        <DateInput
          value={dayDate}
          onChange={(nextDate) => {
            setDayDate(nextDate);
          }}
          label="Select Date"
          title="Meal Date"
          minimumDate={todayAtMidnight}
          maximumDate={tenDaysLater}
        />
      </MealFlowSection>

      <MealFlowSection title="Meal Type">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
        >
          {DAY_MEAL_TYPES.map((type) => (
            <FilterPill
              key={type}
              label={type}
              isActive={mealType === type}
              onPress={() => setMealType(type)}
              style={styles.chip}
            />
          ))}
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
                ? svaColors.brand.primary
                : svaColors.text.secondary
            }
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or enter recipe name..."
            placeholderTextColor={svaColors.text.secondary}
            value={foodSearch}
            onChangeText={(t) => {
              setFoodSearch(t);
              if (selectedRecipe && t !== selectedRecipe.title) {
                setSelectedRecipe(null);
              }
            }}
          />
        </View>
        <MealPlannerSearchDropdown
          query={searchQuery}
          results={recipeResults}
          isSearching={isSearching}
          isSelectionLocked={isRecipeSelectionLocked}
          onSelectOption={handleSelectRecipe}
          onSelectCustom={(query) => handleSelectRecipe({ id: 0, title: query })}
        />

        {foodSearch.trim() ? (
          <MealPlannerStageActionCard
            title="Add or Update This Slot"
            message={`Stage ${foodSearch.trim()} for ${mealType.toLowerCase()} on ${toFriendlyDate(dayDate)}.`}
            onPress={handleAddDaySlot}
          />
        ) : null}
      </MealFlowSection>

      <MealFlowSection title="Day plan preview">
        <MealPlannerDayPreviewCard
          date={dayDate}
          draft={dayPlanDraft}
          activeMealType={mealType}
          onSelectMealType={setMealType}
          onRemoveSlot={handleRemoveDaySlot}
        />
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
            color={svaColors.brand.primary}
          />
          <Text style={styles.infoBannerText}>
            You can set your plan's start date up to 10 days in advance.
          </Text>
        </MealCardSurface>

        <TouchableOpacity activeOpacity={0.8} onPress={() => setIsRangePickerVisible(true)}>
          <MealCardSurface tone="surface" radius={24} style={styles.rangePanel}>
            <View style={styles.rangePanelHeader}>
              <View style={styles.rangeIconCircle}>
                <Ionicons name="calendar" size={20} color={svaColors.brand.primary} />
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
          {DAY_MEAL_TYPES.map(
            (type) => {
              const alreadyPlanned = weekDates.filter(
                (d) => weeklyPlan[toApiDate(d)]?.[mealTypeToApiKey(type)]
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
                ? svaColors.brand.primary
                : svaColors.text.secondary
            }
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Choose oatmeal, protein shake..."
            placeholderTextColor={svaColors.text.secondary}
            value={bulkFoodSearch}
            onChangeText={(t) => {
              setBulkFoodSearch(t);
              if (bulkSelectedRecipe && t !== bulkSelectedRecipe.title) {
                setBulkSelectedRecipe(null);
              }
            }}
          />
        </View>
        <MealPlannerSearchDropdown
          query={searchQuery}
          results={recipeResults}
          isSearching={isSearching}
          isSelectionLocked={isRecipeSelectionLocked}
          onSelectOption={handleSelectRecipe}
          onSelectCustom={(query) => handleSelectRecipe({ id: 0, title: query })}
        />
      </MealFlowSection>

      {selectedWeekdays.length > 0 && bulkFoodSearch !== "" && (
        <MealPlannerStageActionCard
          title="Ready to Add"
          message={`${bulkFoodSearch} for ${bulkMealType} on ${selectedWeekdays.length} days.`}
          onPress={handleAddToPlan}
        />
      )}
    </ScrollView>
  );

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <View style={styles.root}>
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

          {!showReview && (
            <MealPlannerModeTabs
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          )}

          <View style={{ flex: 1 }}>
            {showReview
              ? <MealPlannerReviewList weekDates={weekDates} weeklyPlan={weeklyPlan} />
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
                  ? "Save Day Plan"
                  : "Add to Plan"
              }
              onPress={() => {
                if (showReview) {
                  handleSaveFinal();
                } else if (activeTab === "day") {
                  handleSaveDayPlan();
                } else {
                  handleAddToPlan();
                }
              }}
              variant="primary"
              fullWidth
              disabled={
                !showReview &&
                (activeTab === "day"
                  ? !foodSearch.trim() &&
                    Object.values(dayPlanDraft).every(
                      (entry) => !entry?.foodName?.trim()
                    )
                  : selectedWeekdays.length === 0 || !bulkFoodSearch)
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenView>
  );
};

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
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
      ...svaTypography?.textStyle.caption,
      color: theme.text.primary,
      flex: 1,
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
      backgroundColor: theme.surface.base,
      borderRadius: 16,
      paddingHorizontal: spacing.md,
      height: 56,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      ...svaTypography?.textStyle.input,
      color: theme.text.primary,
    },
    searchBarSelected: {
      borderColor: theme.brand.primary,
      backgroundColor: theme.brand.primary + "05",
    },
    footer: {
      paddingVertical: spacing.md,
      backgroundColor: theme.bg.base,
      borderTopWidth: tokens.border.hairline,
      borderTopColor: theme.border.default,
    },
    rangePanel: {
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: theme.shadow.default,
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
      backgroundColor: theme.brand.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.sm,
    },
    rangeTextCol: {
      flex: 1,
    },
    rangeLabel: {
      ...svaTypography?.textStyle.authTinyLabel,
      color: theme.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    rangeValue: {
      ...svaTypography?.textStyle.bodyMedium,
      color: theme.text.primary,
    },
    rangeEditBadge: {
      backgroundColor: theme.bg.subtle,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    rangeEditText: {
      ...svaTypography?.textStyle.authActionLabel,
      color: theme.brand.primary,
    },
    rangeHint: {
      ...svaTypography?.textStyle.caption,
      color: theme.text.secondary,
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
      backgroundColor: theme.surface.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    dayTileActive: {
      backgroundColor: theme.brand.primary,
      borderColor: theme.brand.primary,
    },
    dayTileNumber: {
      ...svaTypography?.textStyle.bodyMedium,
      color: theme.text.primary,
    },
    dayTileLabel: {
      ...svaTypography?.textStyle.authTinyLabel,
      color: theme.text.secondary,
      marginTop: 2,
    },
    dayTileTextActive: {
      color: theme.text.inverse,
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
      backgroundColor: theme.brand.primary,
    },
    plannedCountText: {
      ...svaTypography?.textStyle.authTinyLabel,
      color: theme.text.secondary,
      marginTop: 4,
    },
  });
