import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import WorkoutPrimaryButton from "@/features/self-care/components/workout/WorkoutPrimaryButton";
import { getMovePlanDetails, startMovePlan } from "@/features/self-care/services/selfCareService";
import type { MoveExercise } from "@/features/self-care/types/workoutTypes";
import type { MovePlanDetail, MovePlanExercise } from "@/features/self-care/types/workoutTypes";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formatReminder = (value?: string | null) => {
  if (!value) return "No reminder set";
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hours = Number(match[1]);
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
};

const formatDuration = (seconds?: number, label?: string) => {
  if (label) return label;
  if (!seconds || seconds <= 0) return "Duration unavailable";
  const minutes = Math.round(seconds / 60);
  return `${Math.max(minutes, 1)} min`;
};

const getExerciseTitle = (exercise: MovePlanExercise, index: number) =>
  (exercise.title || exercise.name || exercise.exercise?.title || exercise.slug || exercise.exercise?.slug || `Exercise ${index + 1}`)
    .replace(/-(medium|hard)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const WorkoutPlanDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const { planId } = useLocalSearchParams<{ planId?: string | string[] }>();
  const id = Array.isArray(planId) ? planId[0] : planId;
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const styles = useMemo(() => createStyles(svaColors, svaTypography, spacing), [svaColors, svaTypography, spacing]);
  const [plan, setPlan] = useState<MovePlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadPlan = useCallback(async () => {
    if (!id) {
      setError("This workout plan could not be identified.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMovePlanDetails(id);
      if (!response.success || !response.data) throw new Error(response.message || "Could not load this workout plan.");
      setPlan(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this workout plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { void loadPlan(); }, [loadPlan]);

  const schedule = plan?.schedule;
  const frequencyType = plan?.frequency_type ?? schedule?.frequency_type;
  const days = plan?.days_of_week ?? schedule?.days_of_week ?? [];
  const reminder = formatReminder(plan?.reminder_time ?? schedule?.reminder_time);
  const exercises = [...(plan?.exercises ?? plan?.items ?? [])].sort(
    (a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0)
  );

  const handleStartWorkout = async () => {
    if (!plan || !id || !exercises.length || isStarting) return;
    setStartError(null);
    setIsStarting(true);
    try {
      const response = await startMovePlan(id);
      const sessionRef = response.data?.session_ref ?? response.session_ref;
      if (!response.success || !sessionRef) {
        throw new Error(response.message || "Could not start this workout plan.");
      }
      const exerciseParams = exercises.map((item, index) => {
        const exercise = (item.exercise ?? item) as Partial<MoveExercise>;
        const exerciseId = exercise.id ?? item.exercise_id ?? item.id;
        if (!exerciseId) throw new Error(`Exercise ${index + 1} is missing its ID.`);
        const slug = exercise.slug ?? item.slug ?? "";
        const rawTitle = exercise.title ?? item.title ?? item.name ?? slug ?? `Exercise ${index + 1}`;
        const title = rawTitle.replace(/-(medium|hard)$/i, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
        const duration = Number(exercise.duration_seconds ?? item.duration_seconds);
        const durationFromLabel = typeof (exercise.duration ?? item.duration) === "string"
          ? parseDuration(exercise.duration ?? item.duration)
          : 0;
        const tags = exercise.tags ?? (Array.isArray(exercise.metadata?.tags) ? exercise.metadata.tags : []);
        return {
          id: String(exerciseId), title,
          description: String(exercise.description ?? item.description ?? ""),
          instructions: String(exercise.instructions ?? exercise.focus_instruction ?? exercise.description ?? item.description ?? item.notes ?? ""),
          reps: String(exercise.reps ?? ""), category: String(exercise.category ?? exercise.intent_display ?? exercise.intent ?? "Exercise"),
          image: String(exercise.thumbnail ?? ""), difficulty: String(exercise.difficulty ?? item.difficulty ?? slugDifficulty(slug)),
          durationSeconds: String(duration > 0 ? duration : durationFromLabel || 60),
          tags: JSON.stringify(tags), benefits: JSON.stringify(exercise.benefits ?? []),
          tips: JSON.stringify(exercise.tips ?? []), commonMistakes: JSON.stringify(exercise.common_mistakes ?? []),
          breathingPattern: String(exercise.breathing_pattern ?? ""),
        };
      });
      const planExercises = JSON.stringify(exerciseParams);
      router.push({ pathname: "/(auth)/self-care/workoutSession", params: {
        ...exerciseParams[0], planSessionRef: String(sessionRef), planId: String(id),
        planExercises, exerciseIndex: "0",
      } });
    } catch (startError) {
      setStartError(startError instanceof Error ? startError.message : "Could not start this workout plan. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <AppHeader title="Workout plan" onBack={() => router.back()} containerStyle={styles.header} />
      {isLoading ? (
        <View style={styles.centerState}><ActivityIndicator color={svaColors.brand.primary} /><Text style={styles.muted}>Loading plan…</Text></View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={38} color={svaColors.text.secondary} />
          <Text style={styles.sectionTitle}>Plan unavailable</Text>
          <Text style={styles.muted}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => void loadPlan()} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : plan ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={[styles.iconWrap, plan.color ? { backgroundColor: `${plan.color}22` } : null]}>
                <Ionicons name="fitness-outline" size={25} color={plan.color || svaColors.brand.primary} />
              </View>
              <View style={styles.activeBadge}><View style={styles.activeDot} /><Text style={styles.activeText}>{(plan.status || "Active").toUpperCase()}</Text></View>
            </View>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{plan.title}</Text>
            {!!plan.description && <Text style={styles.description}>{plan.description}</Text>}
            <View style={styles.summaryRow}>
              <View style={styles.summaryMetric}>
                <Ionicons name="time-outline" size={16} color={svaColors.brand.primary} />
                <Text style={styles.summaryText}>{formatDuration(plan.duration_seconds, plan.duration)}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.summaryMetric}>
                <Ionicons name="barbell-outline" size={16} color={svaColors.brand.primary} />
                <Text style={styles.summaryText}>{plan.item_count ?? exercises.length} workouts</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.eyebrow}>YOUR SCHEDULE</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="repeat-outline" label="Frequency" value={frequencyType === "weekly" ? "Weekly" : frequencyType === "daily" ? "Daily" : "Not specified"} styles={styles} iconColor={svaColors.brand.primary} />
              {frequencyType === "weekly" && (
                <InfoRow icon="calendar-outline" label="Days" value={days.length ? days.filter((day) => day >= 0 && day <= 6).map((day) => DAY_LABELS[day]).join(", ") : "Weekly · days not specified"} styles={styles} iconColor={svaColors.brand.primary} />
              )}
              <InfoRow icon="alarm-outline" label="Reminder" value={reminder} styles={styles} iconColor={svaColors.brand.primary} />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.exerciseHeader}>
              <View><Text style={styles.eyebrow}>YOUR ROUTINE</Text><Text style={styles.sectionTitle}>Workout sequence</Text></View>
              <View style={styles.countBadge}><Text style={styles.countText}>{plan.item_count ?? exercises.length}</Text></View>
            </View>
            {exercises.length ? exercises.map((exercise, index) => (
              <View key={String(exercise.id ?? exercise.exercise_id ?? index)} style={styles.exerciseCard}>
                <View style={styles.numberBadge}><Text style={styles.numberText}>{index + 1}</Text></View>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseTitle}>{getExerciseTitle(exercise, index)}</Text>
                  <View style={styles.exerciseMeta}>
                    {!!exercise.difficulty && <Text style={styles.difficultyBadge}>{exercise.difficulty}</Text>}
                    {!!(exercise.duration || exercise.duration_seconds || exercise.exercise?.duration || exercise.exercise?.duration_seconds) && (
                      <Text style={styles.metaText}>{String(exercise.duration ?? exercise.exercise?.duration ?? formatDuration(exercise.duration_seconds ?? exercise.exercise?.duration_seconds))}</Text>
                    )}
                    {exercise.is_optional && <Text style={styles.optionalBadge}>Optional</Text>}
                  </View>
                  {!!(exercise.description || exercise.exercise?.description) && <Text style={styles.exerciseDescription}>{exercise.description || exercise.exercise?.description}</Text>}
                  {!!exercise.notes && <Text style={styles.exerciseDescription}>{exercise.notes}</Text>}
                </View>
              </View>
            )) : (
              <View style={styles.emptyExercises}>
                <Ionicons name="barbell-outline" size={24} color={svaColors.text.secondary} />
                <Text style={styles.muted}>Exercise details aren’t available for this plan.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
      {plan && !isLoading && !error ? (
        <View style={styles.footer}>
          <WorkoutPrimaryButton label={isStarting ? "Starting workout…" : "Start workout"} onPress={() => void handleStartWorkout()} isLoading={isStarting} disabled={!exercises.length || isStarting} />
          {startError ? <Text accessibilityRole="alert" style={styles.actionError}>{startError}</Text> : null}
        </View>
      ) : null}
    </ScreenView>
  );
};

const InfoRow = ({ icon, label, value, styles, iconColor }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; styles: ReturnType<typeof createStyles>; iconColor: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}><Ionicons name={icon} size={18} color={iconColor} /></View>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const createStyles = (colors: SvaColorSet, typography: TypographyTokens, spacing: Spacing) => StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: spacing.md },
  content: { paddingHorizontal: spacing.md, paddingTop: 0, paddingBottom: spacing.lg },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  hero: { padding: spacing.md, borderRadius: 20, backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.border.subtle, borderTopWidth: 2, borderTopColor: colors.brand.primary },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg.subtle },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.bg.subtle },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.primary },
  activeText: { ...typography.textStyle.caption, color: colors.text.secondary, fontSize: 10, letterSpacing: 1 },
  title: { ...typography.textStyle.title, color: colors.text.primary, fontSize: 30, lineHeight: 38, letterSpacing: -0.2, flexShrink: 1, width: "100%" },
  description: { ...typography.textStyle.body, color: colors.text.secondary, marginTop: spacing.xs },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.subtle },
  summaryMetric: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  metricDivider: { height: 18, width: StyleSheet.hairlineWidth, backgroundColor: colors.border.subtle },
  summaryText: { ...typography.textStyle.caption, color: colors.text.primary },
  section: { marginTop: spacing.lg },
  eyebrow: { ...typography.textStyle.caption, color: colors.text.secondary, fontSize: 10, letterSpacing: 1.5, marginBottom: spacing.sm },
  sectionTitle: { ...typography.textStyle.title, color: colors.text.primary, marginBottom: spacing.sm },
  infoCard: { paddingHorizontal: spacing.md, borderRadius: 20, backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.border.subtle },
  infoRow: { minHeight: 48, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border.subtle, gap: spacing.sm },
  infoIcon: { width: 28, alignItems: "center" },
  infoLabel: { ...typography.textStyle.body, color: colors.text.secondary, flex: 1 },
  infoValue: { ...typography.textStyle.body, color: colors.text.primary, flexShrink: 1, textAlign: "right" },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  countBadge: { minWidth: 34, height: 34, paddingHorizontal: spacing.sm, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: `${colors.brand.primary}22` },
  countText: { ...typography.textStyle.caption, color: colors.brand.primary },
  exerciseCard: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.sm, marginBottom: spacing.xs, borderRadius: 16, backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.border.subtle },
  numberBadge: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: `${colors.brand.primary}22` },
  numberText: { ...typography.textStyle.caption, color: colors.brand.primary, fontWeight: "600" },
  exerciseCopy: { flex: 1 },
  exerciseTitle: { ...typography.textStyle.body, color: colors.text.primary, fontWeight: "600", fontSize: 16 },
  exerciseMeta: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  metaText: { ...typography.textStyle.caption, color: colors.text.secondary, textTransform: "capitalize" },
  difficultyBadge: { ...typography.textStyle.caption, color: colors.brand.primary, textTransform: "capitalize", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: "hidden", backgroundColor: `${colors.brand.primary}18` },
  optionalBadge: { ...typography.textStyle.caption, color: colors.text.secondary, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: "hidden", backgroundColor: colors.bg.subtle },
  exerciseDescription: { ...typography.textStyle.caption, color: colors.text.secondary, marginTop: spacing.xs },
  emptyExercises: { alignItems: "center", gap: spacing.sm, padding: spacing.lg, borderRadius: 18, backgroundColor: colors.surface.base },
  muted: { ...typography.textStyle.body, color: colors.text.secondary, textAlign: "center" },
  retryButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 999, marginTop: spacing.md, backgroundColor: colors.brand.primary },
  retryText: { ...typography.textStyle.button, color: colors.bg.base },
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md, backgroundColor: colors.bg.base, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.subtle },
  actionError: { ...typography.textStyle.caption, color: colors.text.secondary, textAlign: "center", marginTop: spacing.xs },
});

const parseDuration = (label?: string | number): number => {
  if (typeof label === "number") return label;
  if (!label) return 0;
  const value = label.toLowerCase().trim();
  const number = Number(value.match(/[\d.]+/)?.[0] ?? 0);
  if (value.includes("min")) return Math.round(number * 60);
  if (value.includes("h")) return Math.round(number * 3600);
  return Math.round(number);
};

const slugDifficulty = (slug: string) => /-hard$/i.test(slug) ? "hard" : /-medium$/i.test(slug) ? "medium" : "easy";
