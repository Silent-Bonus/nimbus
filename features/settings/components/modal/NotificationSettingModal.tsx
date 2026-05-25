import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import ThemeContext from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import SettingsBottomSheet from "./SettingsBottomSheet";
import {
  arraysEqual,
  deriveHHmmss,
} from "@/utils/helper";
import {
  daysShortToNums,
  formatToAmPm,
  inferRepeatFromWeekdays,
  numsToDaysShort,
  repeatLabelFromDays,
  timeStringToISO,
} from "@/utils/notificationHelper";
import type { SvaColorSet, Spacing } from "@/theme/types";
import type {
  NotificationReminderItem,
  ReminderDraft,
  ReminderPatch,
} from "./notificationModalTypes";

type NotificationDetailTypography = {
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type NotificationDetailStyles = ReturnType<typeof createStyles>;

type Props = {
  detail: NotificationReminderItem;
  categoryKey: string;
  title?: string;
  description?: string;
  visible?: boolean;
  onSaved?: () => void;
  onClose?: () => void;
};

const RECOMMENDED_TIMES = ["05:00", "06:00", "07:00", "08:00", "09:00"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildDraft(detail: NotificationReminderItem): ReminderDraft {
  const weekdays = daysShortToNums(detail.days_of_week ?? []);
  const repeat = detail.repeat || inferRepeatFromWeekdays(weekdays);
  const time = detail.time ?? null;
  const timeISO = timeStringToISO(time);
  const displayTime = time
    ? formatToAmPm(time, formatTime(timeISO))
    : formatTime(timeISO);

  return {
    enabled: !!detail.enabled,
    time,
    timeISO,
    weekdays,
    days_of_week: detail.days_of_week ?? [],
    repeat,
    displayTime,
  };
}

function normalizeTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const [hh = "0", mm = "0"] = trimmed.split(":");
  return `${String(Number(hh)).padStart(2, "0")}:${String(Number(mm)).padStart(2, "0")}`;
}

function normalizeWeekdaySet(value: number[]) {
  return [...new Set(value)].sort((a, b) => a - b);
}

function buildPayload(
  categoryKey: string,
  original: ReminderDraft,
  draft: ReminderDraft
): ReminderPatch | null {
  const patch: Record<string, unknown> = {};

  if (original.enabled !== draft.enabled) {
    patch.enabled = draft.enabled;
  }

  const originalTime = deriveHHmmss(original);
  const nextTime = deriveHHmmss(draft);
  if (originalTime !== nextTime) {
    patch.time = nextTime;
  }

  if (!arraysEqual(original.weekdays ?? [], draft.weekdays ?? [])) {
    patch.days_of_week = numsToDaysShort(draft.weekdays);
  }

  if (!Object.keys(patch).length) return null;

  return {
    notifications: [
      {
        notification_type: categoryKey,
        ...(patch as {
          enabled?: boolean;
          time?: string;
          days_of_week?: NonNullable<ReminderPatch["notifications"]>[number]["days_of_week"];
        }),
      },
    ],
  };
}

function RepeatChip({
  label,
  active,
  colors,
  styles,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: SvaColorSet;
  styles: NotificationDetailStyles;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.repeatChip,
        active && styles.repeatChipActive,
        pressed && styles.repeatChipPressed,
      ]}
    >
      <Text style={[styles.repeatChipText, active && styles.repeatChipTextActive]}>
        {label}
      </Text>
      {active ? <Ionicons name="checkmark" size={14} color={colors.bg.base} /> : null}
    </Pressable>
  );
}

function DayChip({
  label,
  active,
  colors,
  styles,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: SvaColorSet;
  styles: NotificationDetailStyles;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayChip,
        active && styles.dayChipActive,
        pressed && styles.dayChipPressed,
      ]}
    >
      <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
        {label}
      </Text>
      {active ? <Ionicons name="checkmark" size={12} color={colors.bg.base} /> : null}
    </Pressable>
  );
}

export default function ReminderDetail({
  detail,
  categoryKey,
  title = "Reminder",
  description = "",
  visible = true,
  onSaved,
  onClose,
}: Props) {
  const { svaColors, svaTypography, typography, spacing } =
    useContext(ThemeContext);
  const { updateProfile } = useAuth();
  const toast = useNimbusToast();

  const [draft, setDraft] = useState<ReminderDraft | null>(() => buildDraft(detail));
  const [original, setOriginal] = useState<ReminderDraft | null>(() => buildDraft(detail));
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const fonts = useMemo<NotificationDetailTypography>(
    () => ({
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Outfit_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Outfit_600SemiBold",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles: NotificationDetailStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing),
    [svaColors, fonts, spacing]
  );

  useEffect(() => {
    if (!visible) {
      setShowPicker(false);
      return;
    }

    const nextDraft = buildDraft(detail);
    setDraft(nextDraft);
    setOriginal(nextDraft);
  }, [detail, visible]);

  const dirty = useMemo(() => {
    if (!original || !draft) return false;
    if (original.enabled !== draft.enabled) return true;
    if (deriveHHmmss(original) !== deriveHHmmss(draft)) return true;
    if (!arraysEqual(original.weekdays ?? [], draft.weekdays ?? [])) return true;
    return false;
  }, [draft, original]);

  const previewText = useMemo(() => {
    if (!draft) return "Loading...";
    if (!draft.enabled) return "Reminders are off";
    return `${draft.displayTime} · ${repeatLabelFromDays({
      days_of_week: numsToDaysShort(draft.weekdays),
    })}`;
  }, [draft]);

  const saveDisabled = !draft || !original || saving || !dirty;

  const onChangeTime = useCallback((event: any, picked?: Date) => {
    if (Platform.OS === "android") {
      if (event?.type !== "set") return;
    }

    if (!picked) return;

    const now = new Date();
    const next = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      picked.getHours(),
      picked.getMinutes(),
      0,
      0
    );

    const hh = String(next.getHours()).padStart(2, "0");
    const mm = String(next.getMinutes()).padStart(2, "0");
    const nextTime = `${hh}:${mm}:00`;

    setDraft((current) =>
      current
        ? {
            ...current,
            timeISO: next.toISOString(),
            time: nextTime,
            displayTime: format(next, "h:mm a"),
          }
        : current
    );
  }, []);

  const setRepeat = useCallback((nextRepeat: ReminderDraft["repeat"]) => {
    setDraft((current) => {
      if (!current) return current;

      if (nextRepeat === "daily") {
        return {
          ...current,
          repeat: nextRepeat,
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          days_of_week: numsToDaysShort([0, 1, 2, 3, 4, 5, 6]),
        };
      }

      if (nextRepeat === "weekdays") {
        return {
          ...current,
          repeat: nextRepeat,
          weekdays: [1, 2, 3, 4, 5],
          days_of_week: numsToDaysShort([1, 2, 3, 4, 5]),
        };
      }

      if (nextRepeat === "weekends") {
        return {
          ...current,
          repeat: nextRepeat,
          weekdays: [0, 6],
          days_of_week: numsToDaysShort([0, 6]),
        };
      }

      return current;
    });
  }, []);

  const toggleWeekday = useCallback((day: number) => {
    setDraft((current) => {
      if (!current) return current;

      const next = new Set(current.weekdays ?? []);
      if (next.has(day)) next.delete(day);
      else next.add(day);

      return {
        ...current,
        repeat: "custom",
        weekdays: normalizeWeekdaySet(Array.from(next)),
        days_of_week: numsToDaysShort(normalizeWeekdaySet(Array.from(next))),
      };
    });
  }, []);

  const cancel = useCallback(() => {
    if (!dirty) {
      onClose?.();
      return;
    }

    Alert.alert("Discard changes?", "You have unsaved changes. Discard?", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => onClose?.() },
    ]);
  }, [dirty, onClose]);

  const doSave = useCallback(async () => {
    if (!draft || !original) return;

    const payload = buildPayload(categoryKey, original, draft);
    if (!payload) {
      toast.show({
        variant: "info",
        title: "No changes to save",
        message: "No changes to save",
      });
      return;
    }

    setSaving(true);
    try {
      const saved = await updateProfile?.(payload);

      if (saved?.success) {
        toast.show({
          variant: "success",
          title: "Reminder updated",
          message: "Reminder updated",
        });
        onSaved?.();
        onClose?.();
        return;
      }

      toast.show({
        variant: "error",
        title: "Could not save reminder",
        message: saved?.message ?? "Could not save reminder",
      });
    } catch (error) {
      console.warn("save reminder failed", error);
      toast.show({
        variant: "error",
        title: "Could not save reminder",
        message: "Could not save reminder",
      });
    } finally {
      setSaving(false);
    }
  }, [categoryKey, draft, onClose, onSaved, original, toast, updateProfile]);

  const timePickerTitle = draft?.displayTime ?? "Select time";

  return (
    <>
      <SettingsBottomSheet
        visible={visible}
        onClose={cancel}
        eyebrow="Notification detail"
        title={title}
        subtitle={
          description || "Adjust the reminder timing, cadence, and active days."
        }
        badgeLabel={draft?.enabled ? "Active" : "Off"}
        badgeIcon="alarm-outline"
        closeLabel={`Close ${title}`}
        footer={
          <View style={styles.footerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel changes"
              onPress={cancel}
              style={({ pressed }) => [
                styles.footerButton,
                styles.footerButtonSecondary,
                pressed && styles.footerButtonPressed,
              ]}
            >
              <Text style={styles.footerSecondaryLabel}>Cancel</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save reminder"
              onPress={doSave}
              disabled={saveDisabled}
              style={({ pressed }) => [
                styles.footerButton,
                styles.footerButtonPrimary,
                pressed && !saveDisabled && styles.footerButtonPressed,
                saveDisabled && styles.footerButtonDisabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={svaColors.bg.base} />
              ) : (
                <Text style={styles.footerPrimaryLabel}>Save changes</Text>
              )}
            </Pressable>
          </View>
        }
      >
        {!draft ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={svaColors.brand.primary} />
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconWrap}>
                <Ionicons
                  name={draft.enabled ? "notifications-outline" : "notifications-off-outline"}
                  size={18}
                  color={svaColors.brand.primary}
                />
              </View>

              <View style={styles.summaryCopy}>
                <Text style={styles.summaryTitle}>Current selection</Text>
                <Text style={styles.summaryValue}>{draft.displayTime}</Text>
                <Text style={styles.summaryText}>{previewText}</Text>
              </View>

              <Switch
                value={draft.enabled}
                onValueChange={(next) =>
                  setDraft((current) => (current ? { ...current, enabled: next } : current))
                }
                trackColor={{
                  false: svaColors.border.default,
                  true: svaColors.brand.primary,
                }}
                thumbColor={svaColors.bg.base}
                ios_backgroundColor={svaColors.border.default}
              />
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Reminder time</Text>
                <Text style={styles.sectionMeta}>Schedule</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose reminder time"
                onPress={() => setShowPicker(true)}
                style={({ pressed }) => [
                  styles.timeCard,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.timeCopy}>
                  <Text style={styles.timeLabel}>Select time</Text>
                  <Text style={styles.timeValue}>{draft.displayTime}</Text>
                </View>
                <View style={styles.timeMeta}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={svaColors.text.secondary}
                  />
                  <Text style={styles.timeMetaText}>
                    {draft.enabled ? "Active" : "Paused"}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Repeat pattern</Text>
                <Text style={styles.sectionMeta}>{draft.repeat}</Text>
              </View>

              <View style={styles.repeatRow}>
                {(["daily", "weekdays", "weekends"] as const).map((item) => (
                  <RepeatChip
                    key={item}
                    label={item === "daily" ? "Every day" : item === "weekdays" ? "Weekdays" : "Weekends"}
                    active={draft.repeat === item}
                    colors={svaColors}
                    styles={styles}
                    onPress={() => setRepeat(item)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Weekdays</Text>
                <Text style={styles.sectionMeta}>Custom</Text>
              </View>

              <View style={styles.dayRow}>
                {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => {
                  const active = (draft.weekdays ?? []).includes(index);
                  return (
                    <DayChip
                      key={`${label}-${index}`}
                      label={label}
                      active={active}
                      colors={svaColors}
                      styles={styles}
                      onPress={() => toggleWeekday(index)}
                    />
                  );
                })}
              </View>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Preview</Text>
              <Text style={styles.previewText}>{previewText}</Text>
            </View>
          </>
        )}
      </SettingsBottomSheet>

      <SettingsBottomSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        eyebrow="Reminder time"
        title={timePickerTitle}
        subtitle="Adjust the notification time with the picker below."
        badgeLabel="Time picker"
        badgeIcon="time-outline"
        closeLabel={`Close time picker for ${title}`}
        footer={
          <View style={styles.footerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel time selection"
              onPress={() => setShowPicker(false)}
              style={({ pressed }) => [
                styles.footerButton,
                styles.footerButtonSecondary,
                pressed && styles.footerButtonPressed,
              ]}
            >
              <Text style={styles.footerSecondaryLabel}>Cancel</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done"
              onPress={() => setShowPicker(false)}
              style={({ pressed }) => [
                styles.footerButton,
                styles.footerButtonPrimary,
                pressed && styles.footerButtonPressed,
              ]}
            >
              <Text style={styles.footerPrimaryLabel}>Done</Text>
            </Pressable>
          </View>
        }
      >
        <View style={styles.pickerCard}>
          <View style={styles.quickPickRow}>
            {RECOMMENDED_TIMES.map((option) => {
              const active = normalizeTime(option) === normalizeTime(draft?.time ?? "");
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={option}
                  onPress={() =>
                    setDraft((current) => {
                      if (!current) return current;
                      const nextTime = `${normalizeTime(option)}:00`;
                      const [hh, mm] = normalizeTime(option).split(":");
                      const nextDate = new Date();
                      nextDate.setHours(Number(hh), Number(mm), 0, 0);
                      return {
                        ...current,
                        timeISO: nextDate.toISOString(),
                        time: nextTime,
                        displayTime: format(nextDate, "h:mm a"),
                      };
                    })
                  }
                  style={({ pressed }) => [
                    styles.quickPickChip,
                    active && styles.quickPickChipActive,
                    pressed && styles.quickPickChipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.quickPickText,
                      active && styles.quickPickTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <DateTimePicker
            mode="time"
            value={new Date(draft?.timeISO ?? new Date().toISOString())}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeTime}
          />
          <Text style={styles.pickerHint}>
            The selected time is shown using your local device timezone.
          </Text>
        </View>
      </SettingsBottomSheet>
    </>
  );
}

function createStyles(
  colors: SvaColorSet,
  fonts: NotificationDetailTypography,
  spacing: Spacing
) {
  return StyleSheet.create({
    loadingWrap: {
      minHeight: 140,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    summaryIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    summaryCopy: {
      flex: 1,
    },
    summaryTitle: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    summaryValue: {
      marginTop: 4,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 18,
      lineHeight: 22,
    },
    summaryText: {
      marginTop: 4,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
    sectionBlock: {
      marginBottom: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 16,
      lineHeight: 20,
    },
    sectionMeta: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      textTransform: "uppercase",
    },
    timeCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      padding: 14,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    cardPressed: {
      backgroundColor: colors.bg.subtle,
      borderColor: colors.brand.primary,
    },
    timeCopy: {
      flex: 1,
    },
    timeLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    timeValue: {
      marginTop: 4,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 18,
      lineHeight: 22,
    },
    timeMeta: {
      alignItems: "flex-end",
      gap: 4,
    },
    timeMetaText: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    repeatRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    repeatChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    repeatChipActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    repeatChipPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.98 }],
    },
    repeatChipText: {
      fontFamily: fonts.monoFamily,
      color: colors.text.primary,
      fontSize: 10.5,
      lineHeight: 12,
      letterSpacing: 1.1,
    },
    repeatChipTextActive: {
      color: colors.bg.base,
    },
    dayRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    dayChip: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      alignItems: "center",
      justifyContent: "center",
    },
    dayChipActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    dayChipPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.98 }],
    },
    dayChipText: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 13,
      lineHeight: 16,
    },
    dayChipTextActive: {
      color: colors.bg.base,
    },
    previewCard: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      padding: 14,
    },
    previewLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    previewText: {
      marginTop: 4,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 14.5,
      lineHeight: 18,
    },
    pickerCard: {
      padding: spacing.md,
      gap: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    quickPickRow: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    quickPickChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    quickPickChipActive: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.brand.primary,
    },
    quickPickChipPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.98 }],
    },
    quickPickText: {
      fontFamily: fonts.monoFamily,
      color: colors.text.primary,
      fontSize: 10.5,
      lineHeight: 12,
      letterSpacing: 1,
    },
    quickPickTextActive: {
      color: colors.bg.base,
    },
    pickerHint: {
      marginTop: 4,
      textAlign: "center",
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingBottom: spacing.xs,
    },
    footerButton: {
      flex: 1,
      height: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
    },
    footerButtonSecondary: {
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    footerButtonPrimary: {
      backgroundColor: colors.brand.primary,
    },
    footerButtonPressed: {
      opacity: 0.92,
    },
    footerButtonDisabled: {
      opacity: 0.5,
    },
    footerSecondaryLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 14.5,
      lineHeight: 18,
    },
    footerPrimaryLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.bg.base,
      fontSize: 14.5,
      lineHeight: 18,
    },
  });
}
