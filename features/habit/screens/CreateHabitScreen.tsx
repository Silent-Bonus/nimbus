import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
  Pressable,
  Text,
  Platform,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";

import HabitTypeInput from "@/features/habit/components/create-habit/HabitTypeInput";
import HabitTagsInput, {
  selectedTag,
} from "@/features/habit/components/create-habit/HabitTagsInput";
import { ScreenView } from "@/components/ui/Themed";

import HabitMetricInput from "@/features/habit/components/create-habit/HabitMetricInput";
import HabitDurationInput from "@/features/habit/components/create-habit/HabitDurationInput";
import HabitDateInput from "@/features/habit/components/create-habit/HabitDateInput";
import HabitReminderInput from "@/features/habit/components/create-habit/HabitReminderInput";
import EmojiSelector from "@/features/habit/components/create-habit/EmojiSelectorModal";
import AppHeader from "@/components/layout/AppHeader";

import { createHabit } from "@/features/habit/services/habitService";
import { fromApiDate, toApiDate, toBackendTime } from "@/utils/date-time";

import {
  ReminderAt,
  MetricFormat,
  Duration,
  HabitDateType,
} from "@/features/habit/types/habitTypes";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { ROUTES } from "@/constants/routes";

const COLOR_OPTIONS = [
  "#FFEDFA",
  "#B4EBE6",
  "#F8ED8C",
  "#C1CFA1",
  "#B7B1F2",
] as const;

export const CreateHabitScreen = () => {
  // form state
  const [colorSchema, setColorSchema] =
    useState<(typeof COLOR_OPTIONS)[number]>("#FFEDFA");
  const [name, setName] = useState("");
  const [habitTypeId, sethabitTypeId] = useState<number>(0);
  const [tags, setTags] = useState<selectedTag>({} as selectedTag);
  const [metric, setMetric] = useState<MetricFormat | null>(null);
  const [duration, setDuration] = useState<Duration>({ all_day: true });
  const [date, setDate] = useState<HabitDateType>();
  const [reminderAt, setReminderAt] = useState<ReminderAt>({});
  const [emoji, setEmoji] = useState<string>("🙂");

  const toast = useNimbusToast();

  // ui / api state
  const [isLoading, setIsLoading] = useState(false);

  // context
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  // navigation & safe area
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // hide native header → use AppHeader instead
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // handlers passed to child input components
  const handleColorSelect = (color: (typeof COLOR_OPTIONS)[number]) => {
    setColorSchema(color);
  };
  const handleHabitTypeSelect = (id: number) => {
    sethabitTypeId(id);
  };

  const handleMetricSelect = (v: { count: string; unit: number }) => {
    setMetric(v);
  };
  const handleHabitTagSelection = (s: selectedTag) => setTags(s);

  const handleDurationSelect = (v: any) => {
    console.log(v, "selected setDuration");
    setDuration(v);
  };

  const handleHabitStartDate = (v: any) => {
    console.log(v, "selected start date details");
    setDate(v);
  };

  const handleReminderSelect = useCallback((v: any) => {
    setReminderAt(v);
    console.log(v, "selected reminder details");
  }, []);

  const normalizeDateValue = (value?: Date | string | null) => {
    if (!value) return undefined;
    const parsed = value instanceof Date ? value : fromApiDate(value);
    return toApiDate(parsed);
  };

  const normalizeDurationForBackend = (value: any) => {
    if (!value || value.all_day) return { all_day: true };

    const payload: any = {};
    if (value.start_time) {
      payload.start_time =
        typeof value.start_time === "string"
          ? value.start_time
          : toBackendTime(value.start_time);
    }
    if (value.end_time) {
      payload.end_time =
        typeof value.end_time === "string"
          ? value.end_time
          : toBackendTime(value.end_time);
    }

    return payload;
  };

  const normalizeFrequencyForBackend = (value?: any) => {
    const payload: any = {
      start_date: normalizeDateValue(value?.start_date) ?? toApiDate(new Date()),
    };

    const endDate = normalizeDateValue(value?.end_date);
    if (endDate) payload.end_date = endDate;

    if (value?.frequency_type) payload.frequency_type = value.frequency_type;
    if (typeof value?.interval === "number") payload.interval = value.interval;
    if (value?.days_of_week?.length) payload.days_of_week = value.days_of_week;
    if (value?.days_of_month?.length) payload.days_of_month = value.days_of_month;

    return payload;
  };

  const normalizeReminderForBackend = (value?: any) => {
    if (!value) return {};

    if (value.time) {
      return {
        time:
          typeof value.time === "string"
            ? value.time
            : toBackendTime(value.time),
      };
    }

    if (value.ten_min_before) return { ten_min_before: true };
    if (value.thirty_min_before) return { thirty_min_before: true };

    return {};
  };

  const getFormattedTag = () => {
    let value;
    if (tags) {
      const oldIds = tags?.old?.map((it) => it.id) || [];
      if (tags.new) value = { old: oldIds, new: [tags.new] };
      else value = { old: oldIds };
    } else value = {};
    return value;
  };

  const validateAndBuild = () => {
    if (!name.trim()) return { ok: false, msg: "Please enter a habit name." };
    if (!metric || !Object.keys(metric).length)
      return { ok: false, msg: "Please choose a metric." };
    if (!Object.keys(reminderAt).length)
      return { ok: false, msg: "Please set a reminder." };

    const freq = normalizeFrequencyForBackend(date);
    const durationPayload = normalizeDurationForBackend(duration);
    const reminderPayload = normalizeReminderForBackend(reminderAt);
    const payload: any = {
      name: name.trim(),
      habit_type_id: habitTypeId,
      color: colorSchema,
      habit_metric: metric,
      habit_duration: durationPayload,
      habit_frequency: freq,
      tags: getFormattedTag(),
      icon: emoji,
    };

    console.log(payload, "final payload");

    if (Object.keys(reminderPayload).length) payload.remind_at = reminderPayload;
    return { ok: true, payload };
  };

  const creatHabitApi = async (payload: any) => {
    setIsLoading(true);
    try {
      const result = await createHabit(payload);
      if (result?.success) {
        toast.show({
          variant: "success",
          title: "Habit is created",
          message: "Habit created",
        });
        setTimeout(() => {
          router.replace(ROUTES.TABS.HOME);
        }, 650);
      } else {
        toast.show({
          variant: "error",
          title: "Somthing went wrong",
          message: "Failed to create habit",
        });
      }
    } catch {
      toast.show({
        variant: "error",
        title: "Somthing went wrong",
        message: "Network error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitClick = () => {
    const { ok, payload, msg } = validateAndBuild() as any;
    if (!ok) {
      toast.show({
        variant: "error",
        title: "Validation Error",
        message: msg,
      });
      return;
    }
    creatHabitApi(payload);
  };

  // small helper UI components
  const ColorSwatch = ({
    color,
    selected,
    onPress,
  }: {
    color: (typeof COLOR_OPTIONS)[number];
    selected?: boolean;
    onPress: () => void;
  }) => {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.colorCircle,
          { backgroundColor: color },
          selected && styles.colorSelectedOuter,
        ]}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      >
        {selected && (
          <View style={styles.colorInnerCheck}>
            <Ionicons name="checkmark" size={16} color={newTheme.background} />
          </View>
        )}
      </Pressable>
    );
  };

  const isAllDayEnabled = () => {
    return duration.all_day ? true : false;
  };

  return (
    <View
      style={[
        styles.gestureContainer,
        { backgroundColor: newTheme.background },
      ]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: Math.max(24, insets.bottom + 24),
          }}
          showsVerticalScrollIndicator={false}
        >
          <ScreenView
            bgColor={newTheme.background}
            style={{
              paddingTop:
                Platform.OS === "ios"
                  ? spacing["xl"] + spacing["xl"] * 0.4
                  : spacing.xl,
              paddingHorizontal: spacing.md,
            }}
          >
            {/* Nimbus shared header */}
            <AppHeader
              title="Create New Habit"
              subtitle="Set up a habit that you can track and celebrate every day."
              onBack={() => router.back()}
            />

            {/* Appearance section */}
            <View style={[styles.sectionHeader, { marginTop: spacing.xs }]}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <Text style={styles.sectionSubtitle}>
                Choose an icon and color that matches your habit’s energy.
              </Text>
            </View>

            <View style={styles.emojiRow}>
              <EmojiSelector
                value={emoji}
                onSelect={(e) => setEmoji(e)}
                placeholder={emoji}
                size={52}
              />
              <View style={styles.underline} />
            </View>

            {/* NAME (pill input) */}
            <View style={styles.nameWrapper}>
              <TextInput
                style={[styles.pillInput]}
                placeholder="Habit name"
                placeholderTextColor={newTheme.textSecondary}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                maxLength={40}
                autoCapitalize="sentences"
                selectionColor={newTheme.accent}
              />
            </View>

            {/* Color swatches */}
            <View style={styles.swatchesRow}>
              {COLOR_OPTIONS.map((c) => (
                <ColorSwatch
                  key={c}
                  color={c}
                  selected={c === colorSchema}
                  onPress={() => handleColorSelect(c)}
                />
              ))}
            </View>

            {/* Details section */}
            <View
              style={[
                styles.sectionHeader,
                { marginTop: spacing.lg, marginBottom: spacing.xs },
              ]}
            >
              <Text style={styles.sectionTitle}>Habit details</Text>
              <Text style={styles.sectionSubtitle}>
                Set how often, how long, and how you’ll track this habit.
              </Text>
            </View>

            {/* Form rows inside a card */}
            <View style={styles.formCard}>
              <HabitTypeInput
                style={styles.rowItem}
                onSelect={handleHabitTypeSelect}
              />
              <HabitMetricInput
                style={styles.rowItem}
                onSelect={handleMetricSelect}
              />
              <HabitDurationInput
                style={styles.rowItem}
                onSelect={handleDurationSelect}
                label="Rhythm"
              />
              <HabitDateInput
                style={styles.rowItem}
                onSelect={handleHabitStartDate}
              />
              <HabitReminderInput
                style={styles.rowItem}
                isAllDayEnabled={isAllDayEnabled()}
                onSelect={handleReminderSelect}
              />
              <HabitTagsInput
                onSelect={handleHabitTagSelection}
                style={[styles.rowItem, styles.rowItemLast]}
              />
            </View>

            {/* Spacer before button */}
            <View style={{ height: spacing.lg }} />
          </ScreenView>
        </ScrollView>

        {/* Submit button anchored above safe area */}
        <View
          style={[
            styles.submitWrap,
            { paddingBottom: (insets.bottom || 16) + spacing.xs },
          ]}
        >
          <StyledButton
            label="Create habit"
            onPress={onSubmitClick}
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

/* ----- Styles ----- */
const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    gestureContainer: { flex: 1 },
    header: { color: newTheme.textPrimary },

    sectionHeader: {
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...svaTypography.bodyLarge,
      fontWeight: "600",
      color: newTheme.textPrimary,
    },
    sectionSubtitle: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textSecondary,
      marginTop: 4,
      marginBottom: spacing.sm,
    },

    emojiRow: {
      alignItems: "center",
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    underline: {
      width: 64,
      height: 4,
      backgroundColor: "rgba(255,255,255,0.12)",
      marginTop: 10,
      borderRadius: 999,
    },

    nameWrapper: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    pillInput: {
      height: 52,
      borderRadius: 26,
      backgroundColor: newTheme.surface,
      paddingHorizontal: spacing.lg,
      ...svaTypography.bodyMedium,
      color: newTheme.textPrimary,
      includeFontPadding: false,
      textAlign: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },

    swatchesRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: spacing.sm,
      paddingHorizontal: 4,
    },
    colorCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 2,
    },
    colorSelectedOuter: {
      shadowOpacity: 0.22,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 2,
      borderColor: newTheme.accent,
      transform: [{ scale: 1.04 }],
    },
    colorInnerCheck: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      alignItems: "center",
    },

    submitWrap: {
      paddingHorizontal: spacing.md,
      backgroundColor: "transparent",
    },

    formCard: {
      backgroundColor: newTheme.surface,
      borderRadius: spacing.lg,
      overflow: "hidden",

      // Add subtle shadow for premium depth
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },

    rowItem: {
      paddingVertical: spacing.md + 2, // ↑ more breathing space
      paddingHorizontal: spacing.md, // consistent left/right
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.06)",
    },

    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm + 2, // slightly more gap
    },

    rowLabel: {
      color: newTheme.textSecondary,
      fontSize: 15,
      fontWeight: "500",
    },

    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    rowValue: {
      color: newTheme.textPrimary,
      fontSize: 15,
      fontWeight: "600",
    },

    // Remove the last divider cleanly
    rowItemLast: {
      borderBottomWidth: 0,
    },
  });
