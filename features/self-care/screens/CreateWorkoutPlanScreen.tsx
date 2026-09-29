import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { format } from "date-fns";

import AppHeader from "@/components/layout/AppHeader";
import TimePickerSheet from "@/components/ui/picker/TimePickerSheet";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import {
  createMoveRoutine,
  getMoveExercises,
} from "@/features/self-care/services/selfCareService";
import type {
  MoveExercise,
  MoveRoutineFrequency,
} from "@/features/self-care/types/workoutTypes";
import {
  getMoveExerciseDifficulty,
  getMoveExerciseTitle,
} from "@/features/self-care/utils/workoutLibrary";
import type { SvaColorSet, Spacing, TypographyTokens } from "@/theme/types";

const WEEKDAYS = [
  { label: "Mo", name: "Monday", value: 0 },
  { label: "Tu", name: "Tuesday", value: 1 },
  { label: "We", name: "Wednesday", value: 2 },
  { label: "Th", name: "Thursday", value: 3 },
  { label: "Fr", name: "Friday", value: 4 },
  { label: "Sa", name: "Saturday", value: 5 },
  { label: "Su", name: "Sunday", value: 6 },
] as const;

const FREQUENCIES: { label: string; value: MoveRoutineFrequency }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

export const CreateWorkoutPlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const toast = useNimbusToast();
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const styles = useMemo(
    () => createStyles(svaColors, svaTypography, spacing),
    [svaColors, svaTypography, spacing]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<MoveRoutineFrequency>("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState(() => {
    const date = new Date();
    date.setHours(7, 30, 0, 0);
    return date;
  });
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<MoveExercise[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadExercises = useCallback(async () => {
    setIsLoadingExercises(true);
    setExerciseError(null);
    try {
      const response = await getMoveExercises();
      if (!response.success) {
        throw new Error(response.message || "Could not load workouts.");
      }
      setExercises(response.data);
    } catch (error) {
      setExerciseError(
        error instanceof Error
          ? error.message
          : "We couldn’t load workouts. Please try again."
      );
    } finally {
      setIsLoadingExercises(false);
    }
  }, []);

  useEffect(() => {
    void loadExercises();
  }, [loadExercises]);

  const visibleExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exercises;
    return exercises.filter((exercise) =>
      [getMoveExerciseTitle(exercise), exercise.description, exercise.category_display ?? exercise.category]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [exercises, search]);

  const selectedExercises = useMemo(
    () =>
      selectedExerciseIds
        .map((id) => exercises.find((exercise) => exercise.id === id))
        .filter((exercise): exercise is MoveExercise => Boolean(exercise)),
    [exercises, selectedExerciseIds]
  );

  const toggleWeekday = (day: number) => {
    setDaysOfWeek((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  };

  const toggleExercise = (id: number) => {
    setSelectedExerciseIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const handleCreatePlan = async () => {
    setFormError(null);
    if (!title.trim()) {
      setFormError("Add a title for your workout plan.");
      return;
    }
    if (frequency === "weekly" && daysOfWeek.length === 0) {
      setFormError("Choose at least one day for a weekly plan.");
      return;
    }
    if (selectedExercises.length === 0) {
      setFormError("Add at least one workout to your plan.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await createMoveRoutine({
        title: title.trim(),
        description: description.trim(),
        source: "manual",
        status: "active",
        schedule: {
          frequency_type: frequency,
          interval: 1,
          start_date: format(new Date(), "yyyy-MM-dd"),
          end_date: null,
          days_of_week:
            frequency === "weekly"
              ? WEEKDAYS.filter((day) => daysOfWeek.includes(day.value)).map(
                  (day) => day.value
                )
              : [],
          days_of_month: [],
          reminder_time: format(reminderTime, "HH:mm:ss"),
          start_time: null,
          end_time: null,
          all_day: false,
        },
        items: selectedExercises.map((exercise, index) => ({
          exercise_id: exercise.id,
          sequence_order: index + 1,
          transition_seconds: 5,
          notes: "",
          is_optional: false,
          metadata: {},
        })),
        icon: "sunrise",
        color: "#F4B942",
        metadata: {},
      });

      if (!response.success) {
        throw new Error(response.message || "Could not create workout plan.");
      }

      toast.show({
        variant: "success",
        title: "Workout plan created",
        message: response.message,
      });
      router.back();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn’t create this plan. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderExercise = ({ item }: { item: MoveExercise }) => {
    const selected = selectedExerciseIds.includes(item.id);
    const imageUri = item.thumbnail;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${selected ? "Remove" : "Add"} ${getMoveExerciseTitle(item)}`}
        accessibilityState={{ selected }}
        onPress={() => toggleExercise(item.id)}
        style={[styles.protocolCard, selected && styles.protocolCardSelected]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.protocolImage} />
        ) : (
          <View style={[styles.protocolImage, styles.protocolImageFallback]}>
            <Ionicons name="fitness-outline" size={30} color={svaColors.text.secondary} />
          </View>
        )}
        <View style={styles.protocolCopy}>
          <Text numberOfLines={1} style={styles.protocolTitle}>
            {getMoveExerciseTitle(item)}
          </Text>
          <Text style={styles.protocolMeta}>
            {item.category_display ?? item.category} · {getMoveExerciseDifficulty(item)}
          </Text>
          <Text numberOfLines={2} style={styles.protocolDescription}>
            {item.description}
          </Text>
        </View>
        <View style={[styles.addIcon, selected && styles.addIconSelected]}>
          <Ionicons
            name={selected ? "checkmark" : "add"}
            size={18}
            color={selected ? svaColors.bg.base : svaColors.text.primary}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AppHeader
          title="Create workout plan"
          subtitle="Build a rhythm you can return to."
          onBack={() => router.back()}
          containerStyle={styles.header}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan details</Text>
            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Morning Reset"
              placeholderTextColor={svaColors.text.disabled}
              style={styles.input}
              maxLength={80}
              returnKeyType="next"
            />
            <Text style={[styles.fieldLabel, styles.descriptionLabel]}>
              DESCRIPTION
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What would you like this routine to support?"
              placeholderTextColor={svaColors.text.disabled}
              style={[styles.input, styles.descriptionInput]}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <Text style={styles.fieldLabel}>FREQUENCY</Text>
            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((option) => {
                const active = frequency === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFrequency(option.value)}
                    style={[styles.frequencyOption, active && styles.frequencyOptionActive]}
                  >
                    <Text style={[styles.frequencyText, active && styles.frequencyTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {frequency === "weekly" ? (
              <>
                <Text style={styles.fieldLabel}>REPEAT ON</Text>
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((day) => {
                    const selected = daysOfWeek.includes(day.value);
                    return (
                      <Pressable
                        key={day.value}
                        accessibilityRole="checkbox"
                        accessibilityLabel={day.name}
                        accessibilityState={{ checked: selected }}
                        onPress={() => toggleWeekday(day.value)}
                        style={[styles.weekday, selected && styles.weekdaySelected]}
                      >
                        <Text style={[styles.weekdayText, selected && styles.weekdayTextSelected]}>
                          {day.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            <Text style={styles.fieldLabel}>REMINDER TIME</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose reminder time"
              onPress={() => setIsTimePickerOpen(true)}
              style={styles.timeField}
            >
              <Text style={styles.timeValue}>{format(reminderTime, "HH:mm")}</Text>
              <Ionicons name="time-outline" size={20} color={svaColors.text.secondary} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add workouts</Text>
            <Text style={styles.sectionHint}>
              Choose exercises to add them to your plan in order.
            </Text>
            <View style={styles.searchField}>
              <Ionicons name="search" size={18} color={svaColors.text.secondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search workouts"
                placeholderTextColor={svaColors.text.disabled}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {!!search && (
                <Pressable onPress={() => setSearch("")} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={18} color={svaColors.text.secondary} />
                </Pressable>
              )}
            </View>

            {isLoadingExercises ? (
              <View style={styles.stateMessage}>
                <ActivityIndicator color={svaColors.brand.primary} />
                <Text style={styles.sectionHint}>Loading exercises…</Text>
              </View>
            ) : exerciseError ? (
              <View style={styles.stateMessage}>
                <Text style={styles.errorText}>{exerciseError}</Text>
                <Pressable onPress={() => void loadExercises()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <FlatList
                horizontal
                nestedScrollEnabled
                data={visibleExercises}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderExercise}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.protocolList}
                ListEmptyComponent={
                  <Text style={styles.sectionHint}>No matching workouts found.</Text>
                }
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Selected workouts ({selectedExercises.length})
            </Text>
            {selectedExercises.length === 0 ? (
              <Text style={styles.sectionHint}>Your selected workouts will appear here.</Text>
            ) : (
              selectedExercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.selectedRow}>
                  <View style={styles.sequenceBadge}>
                    <Text style={styles.sequenceText}>{index + 1}</Text>
                  </View>
                  <View style={styles.selectedCopy}>
                    <Text style={styles.selectedTitle} numberOfLines={1}>
                      {getMoveExerciseTitle(exercise)}
                    </Text>
                    <Text style={styles.protocolMeta}>
                      {exercise.category_display ?? exercise.category} · {getMoveExerciseDifficulty(exercise)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${getMoveExerciseTitle(exercise)}`}
                    onPress={() => toggleExercise(exercise.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle-outline" size={22} color={svaColors.text.secondary} />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {formError ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {formError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving, busy: isSaving }}
            disabled={isSaving}
            onPress={() => void handleCreatePlan()}
            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          >
            {isSaving ? (
              <ActivityIndicator color={svaColors.bg.base} />
            ) : (
              <Text style={styles.submitText}>Create workout plan</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <TimePickerSheet
        visible={isTimePickerOpen}
        value={reminderTime}
        title="Reminder time"
        is24Hour
        onChange={setReminderTime}
        onClose={() => setIsTimePickerOpen(false)}
      />
    </ScreenView>
  );
};

const createStyles = (
  colors: SvaColorSet,
  typography: TypographyTokens,
  spacing: Spacing
) =>
  StyleSheet.create({
    screen: { flex: 1 },
    header: { marginBottom: spacing.sm, paddingHorizontal: spacing.md },
    content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    section: {
      marginBottom: spacing.lg,
      padding: spacing.md,
      borderRadius: 22,
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    sectionTitle: {
      ...typography.textStyle.title,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    sectionHint: {
      ...typography.textStyle.body,
      color: colors.text.secondary,
    },
    fieldLabel: {
      ...typography.textStyle.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
      letterSpacing: 0.8,
    },
    input: {
      ...typography.textStyle.body,
      color: colors.text.primary,
      backgroundColor: colors.bg.base,
      borderColor: colors.border.subtle,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    descriptionLabel: { marginTop: spacing.md },
    descriptionInput: { minHeight: 92 },
    frequencyRow: {
      flexDirection: "row",
      padding: 4,
      marginBottom: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.bg.base,
    },
    frequencyOption: {
      flex: 1,
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderRadius: 11,
    },
    frequencyOptionActive: { backgroundColor: colors.brand.primary },
    frequencyText: {
      ...typography.textStyle.button,
      color: colors.text.secondary,
    },
    frequencyTextActive: { color: colors.bg.base },
    weekdaysRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    weekday: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    weekdaySelected: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    weekdayText: {
      ...typography.textStyle.caption,
      color: colors.text.secondary,
    },
    weekdayTextSelected: { color: colors.bg.base },
    timeField: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    timeValue: {
      ...typography.textStyle.body,
      color: colors.text.primary,
    },
    searchField: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    searchInput: {
      ...typography.textStyle.body,
      flex: 1,
      minHeight: 48,
      color: colors.text.primary,
    },
    protocolList: { gap: spacing.sm, paddingRight: spacing.md },
    protocolCard: {
      width: 260,
      overflow: "hidden",
      borderRadius: 18,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    protocolCardSelected: {
      borderColor: colors.brand.primary,
      borderWidth: 2,
    },
    protocolImage: { width: "100%", height: 126 },
    protocolImageFallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.subtle,
    },
    protocolCopy: { padding: spacing.sm },
    protocolTitle: {
      ...typography.textStyle.title,
      color: colors.text.primary,
      fontSize: 15,
    },
    protocolMeta: {
      ...typography.textStyle.caption,
      color: colors.brand.primary,
      marginTop: 2,
    },
    protocolDescription: {
      ...typography.textStyle.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      minHeight: 34,
    },
    addIcon: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: colors.bg.elevated,
    },
    addIconSelected: { backgroundColor: colors.brand.primary },
    stateMessage: {
      minHeight: 120,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    retryButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.interaction.pressed,
    },
    retryText: {
      ...typography.textStyle.button,
      color: colors.text.primary,
    },
    selectedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.subtle,
    },
    sequenceBadge: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      backgroundColor: colors.interaction.pressed,
    },
    sequenceText: {
      ...typography.textStyle.caption,
      color: colors.text.primary,
    },
    selectedCopy: { flex: 1 },
    selectedTitle: {
      ...typography.textStyle.body,
      color: colors.text.primary,
    },
    errorText: {
      ...typography.textStyle.body,
      color: colors.state.error,
      marginBottom: spacing.md,
    },
    submitButton: {
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
      borderRadius: 16,
      backgroundColor: colors.brand.primary,
    },
    submitButtonDisabled: { opacity: 0.65 },
    submitText: {
      ...typography.textStyle.button,
      color: colors.bg.base,
    },
  });

export default CreateWorkoutPlanScreen;
