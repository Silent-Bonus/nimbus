import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { getMovePlans } from "@/features/self-care/services/selfCareService";
import type { MoveRoutine } from "@/features/self-care/types/workoutTypes";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

const WEEKDAY_LABELS: Record<string, string> = {
  "0": "Mon", "1": "Tue", "2": "Wed", "3": "Thu", "4": "Fri", "5": "Sat", "6": "Sun",
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

const displayTitle = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatReminder = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
};

export const WorkoutRoutineListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const styles = useMemo(
    () => createStyles(svaColors, svaTypography, spacing),
    [svaColors, svaTypography, spacing]
  );
  const [routines, setRoutines] = useState<MoveRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadRoutines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMovePlans();
      if (!response.success) {
        throw new Error(response.message || "Could not load your workout plans.");
      }
      setRoutines(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      setRoutines([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "We couldn’t load your workout plans. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRoutines();
    }, [loadRoutines])
  );

  const renderRoutine = ({ item }: { item: MoveRoutine }) => {
    const frequencyType = item.frequency_type ?? item.schedule?.frequency_type;
    const frequency = frequencyType === "weekly"
      ? (item.schedule?.days_of_week ?? []).map((day) => WEEKDAY_LABELS[String(day).toLowerCase()] ?? String(day)).join(" · ") || "Weekly"
      : frequencyType === "daily" ? "Daily" : "Schedule unavailable";
    const reminder = formatReminder(item.reminder_time ?? item.schedule?.reminder_time);
    const itemCount = item.item_count ?? item.items?.length ?? 0;
    const totalDurationSeconds = item.duration_seconds ?? 0;
    const duration = item.duration || (totalDurationSeconds > 0
      ? `${Math.max(1, Math.round(totalDurationSeconds / 60))} min`
      : "Duration unavailable");
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${displayTitle(item.title)} workout plan`}
        onPress={() => router.push({
          pathname: ROUTES.AUTH.SELF_CARE_WORKOUT_PLAN_DETAIL,
          params: { planId: String(item.id) },
        })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={[styles.iconWrap, item.color ? { backgroundColor: `${item.color}22` } : null]}>
          <Ionicons name="fitness-outline" size={22} color={item.color || svaColors.brand.primary} />
        </View>
        <View style={styles.cardCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{displayTitle(item.title)}</Text>
            <Text style={styles.itemCount}>{itemCount} {itemCount === 1 ? "workout" : "workouts"}</Text>
          </View>
          {!!item.description && <Text style={styles.description} numberOfLines={1}>{item.description}</Text>}
          <View style={styles.details}>
            <View style={styles.detailPill}>
              <Ionicons name="repeat-outline" size={14} color={svaColors.brand.primary} />
              <Text style={styles.detailText} numberOfLines={1}>{frequency}</Text>
            </View>
            <View style={styles.detailPill}>
              <Ionicons name="time-outline" size={14} color={svaColors.text.secondary} />
              <Text style={styles.detailText}>{duration}</Text>
            </View>
          </View>
          <View style={styles.reminderRow}>
            <Ionicons name="alarm-outline" size={15} color={svaColors.text.secondary} />
            <Text style={styles.reminderText}>{reminder ? `Reminder · ${reminder}` : "No reminder set"}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={svaColors.text.secondary} style={styles.chevron} />
      </Pressable>
    );
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <AppHeader
        title="Workout plans"
        subtitle="Your routines, ready when you are."
        onBack={() => router.back()}
        rightActions={[{
          icon: "add",
          accessibilityLabel: "Create workout plan",
          onPress: () => router.push(ROUTES.AUTH.SELF_CARE_CREATE_WORKOUT_PLAN),
        }]}
        containerStyle={styles.header}
      />
      <FlatList
        data={routines}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRoutine}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={svaColors.brand.primary} />
            <Text style={styles.emptyText}>Loading your workout plans…</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-offline-outline" size={38} color={svaColors.text.secondary} />
            <Text style={styles.emptyTitle}>Plans are unavailable.</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => void loadRoutines()} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={38} color={svaColors.text.secondary} />
            <Text style={styles.emptyTitle}>No workout plans yet</Text>
            <Text style={styles.emptyText}>Create a routine and it’ll show up here.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(ROUTES.AUTH.SELF_CARE_CREATE_WORKOUT_PLAN)}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Create a plan</Text>
            </Pressable>
          </View>
        )}
      />
    </ScreenView>
  );
};

const createStyles = (
  colors: SvaColorSet,
  typography: TypographyTokens,
  spacing: Spacing
) => StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: spacing.md },
  listContent: { flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg.subtle,
    marginRight: spacing.md,
  },
  cardCopy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { ...typography.textStyle.title, color: colors.text.primary, flex: 1 },
  description: { ...typography.textStyle.body, color: colors.text.secondary, marginTop: 3 },
  itemCount: { ...typography.textStyle.caption, color: colors.text.secondary },
  details: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  detailPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.bg.subtle, maxWidth: "100%" },
  detailText: { ...typography.textStyle.caption, color: colors.text.primary },
  reminderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  reminderText: { ...typography.textStyle.caption, color: colors.text.secondary },
  chevron: { marginTop: 4, marginLeft: spacing.xs },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyTitle: { ...typography.textStyle.title, color: colors.text.primary, marginTop: spacing.md, textAlign: "center" },
  emptyText: { ...typography.textStyle.body, color: colors.text.secondary, marginTop: spacing.sm, textAlign: "center" },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    marginTop: spacing.md,
    backgroundColor: colors.brand.primary,
  },
  retryText: { ...typography.textStyle.button, color: colors.bg.base },
});
