import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import PillFilters from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import WorkoutCard from "@/features/self-care/components/workout/WorkoutCard";
import { ROUTES } from "@/constants/routes";
import {
  filterWorkoutCards,
  mockWorkoutRecommendations,
  WORKOUT_FILTER_OPTIONS,
  type WorkoutFilterCategory,
} from "@/features/self-care/utils/workoutLibrary";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

export const WorkoutListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );

  const [selectedCategory, setSelectedCategory] =
    useState<WorkoutFilterCategory>("all");

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const workouts = mockWorkoutRecommendations;

  const visibleWorkouts = useMemo(
    () => filterWorkoutCards(workouts, selectedCategory),
    [workouts, selectedCategory]
  );

  const handleOpenWorkout = useCallback(
    (workoutId: string, workoutTitle: string, workoutSubtitle: string) => {
      router.push({
        pathname: ROUTES.AUTH.SELF_CARE_WORKOUT_SESSION,
        params: {
          id: workoutId,
          title: workoutTitle,
          subtitle: workoutSubtitle,
        },
      });
    },
    []
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Workouts"
          subtitle="Find your rhythm in the silence. Move with intention, breathe with grace."
          onBack={handleBack}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          containerStyle={styles.header}
        />

        <FlatList
          testID="workout-library-list"
          data={visibleWorkouts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.filterBlock}>
              <PillFilters
                testID="workout-filters"
                options={WORKOUT_FILTER_OPTIONS}
                selectedValue={selectedCategory}
                onChange={setSelectedCategory}
                uppercase={false}
                scrollable
                contentContainerStyle={styles.filterRow}
                selectedPillStyle={styles.filterPillActive}
                inactivePillStyle={styles.filterPillInactive}
                selectedLabelStyle={styles.filterTextActive}
                inactiveLabelStyle={styles.filterTextInactive}
              />
            </View>
          }
          renderItem={({ item }) => (
            <WorkoutCard
              item={item}
              onPress={() => handleOpenWorkout(item.id, item.title, item.subtitle)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="fitness-outline"
                size={40}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyTitle}>No workouts in this mode.</Text>
              <Text style={styles.emptyText}>
                Try another filter to surface a different pace.
              </Text>
            </View>
          }
        />

      </View>
    </ScreenView>
  );
};

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing,

) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    root: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        svaTypography.textStyle.heading2.fontFamily,
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.6,
    },
    headerSubtitle: {
      fontStyle: "italic",
      color: theme.textSecondary,
      opacity: 0.9,
    },
    filterBlock: {
      marginBottom: spacing.lg,
    },
    filterRow: {
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    filterPillInactive: {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    filterPillActive: {
      backgroundColor: theme.buttonPrimary,
      borderColor: theme.buttonPrimary,
    },
    filterTextInactive: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        "Inter_600SemiBold",
      fontSize: 12,
      letterSpacing: 0.8,
      color: theme.textSecondary,
    },
    filterTextActive: {
      color: theme.buttonPrimaryText,
    },
    listContent: {
      paddingBottom: spacing.xl * 3,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: spacing.xl * 2,
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      marginTop: spacing.md,
      textAlign: "center",
    },
    emptyText: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
  });

export default WorkoutListScreen;
