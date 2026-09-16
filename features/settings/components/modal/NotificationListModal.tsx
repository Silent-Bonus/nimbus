import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import SettingsBottomSheet from "./SettingsBottomSheet";
import { NOTIFICATION_TYPES } from "@/constants/data/notificationType";
import {
  formatBackendTime,
  mergeReminders,
} from "@/utils/notificationHelper";
import type { SvaColorSet, Spacing } from "@/theme/types";
import type { NotificationReminderItem } from "./notificationModalTypes";

type NotificationListTypography = {
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type NotificationListStyles = ReturnType<typeof createStyles>;

const NOTIFICATION_ICON_MAP: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  morning_review: "sunny-outline",
  night_review: "moon-outline",
  mood_logger: "happy-outline",
  streak_saver: "flame-outline",
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectReminder: (item: NotificationReminderItem) => void;
};

function getNotificationStatus(item: NotificationReminderItem) {
  if (!item?.enabled) return "Off";

  const timeText = formatBackendTime(item.time, "");
  const repeatText = getRepeatLabel(item.days_of_week ?? []);

  return timeText ? `${timeText} · ${repeatText}` : repeatText;
}

type NotificationDays = NonNullable<NotificationReminderItem["days_of_week"]>;

function getRepeatLabel(days: NotificationDays = []) {
  if (!days.length) return "Daily";
  if (days.length === 7) return "Every day";

  const weekdays: NotificationDays = ["mon", "tue", "wed", "thu", "fri"];
  const weekends: NotificationDays = ["sat", "sun"];
  const isWeekdays = weekdays.every((day) => days.includes(day)) && days.length === 5;
  const isWeekends = weekends.every((day) => days.includes(day)) && days.length === 2;

  if (isWeekdays) return "Weekdays";
  if (isWeekends) return "Weekends";
  return "Custom";
}

function getNotificationIcon(item: NotificationReminderItem) {
  return NOTIFICATION_ICON_MAP[item.key] ?? "notifications-outline";
}

function NotificationRow({
  item,
  colors,
  styles,
  onPress,
}: {
  item: NotificationReminderItem;
  colors: SvaColorSet;
  styles: NotificationListStyles;
  onPress: () => void;
}) {
  const status = getNotificationStatus(item);
  const active = !!item.enabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${status}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.reminderCard,
        pressed && styles.reminderCardPressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={getNotificationIcon(item)}
          size={18}
          color={colors.brand.primary}
        />
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.label} numberOfLines={1}>
          {item.label}
        </Text>
        {item.desc ? (
          <Text style={styles.desc} numberOfLines={2}>
            {item.desc}
          </Text>
        ) : null}
      </View>

      <View style={styles.metaBlock}>
        <View style={[styles.statusPill, active ? styles.statusPillOn : styles.statusPillOff]}>
          <Text
            style={[
              styles.statusText,
              active ? styles.statusTextOn : styles.statusTextOff,
            ]}
            numberOfLines={1}
          >
            {status}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.text.secondary}
        />
      </View>
    </Pressable>
  );
}

export default function NotificationListModal({
  visible,
  onClose,
  onSelectReminder,
}: Props) {
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const { loadUserFromStorage } = useAuth();

  const [notifications, setNotifications] = useState<NotificationReminderItem[]>(
    () => NOTIFICATION_TYPES as NotificationReminderItem[]
  );
  const [loading, setLoading] = useState(false);

  const fonts = useMemo<NotificationListTypography>(
    () => ({
      bodyFamily:
        svaTypography.fontFamily.body,
      bodyStrongFamily:
        svaTypography.fontFamily.bodyMedium,
      monoFamily:
        svaTypography.fontFamily.mono,
    }),
    [svaTypography]
  );

  const styles: NotificationListStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing),
    [svaColors, fonts, spacing]
  );

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const cached = await loadUserFromStorage?.();
      const merged = mergeReminders(
        NOTIFICATION_TYPES,
        cached?.notifications ?? []
      ) as NotificationReminderItem[];
      setNotifications(merged);
    } catch (error) {
      console.warn("notification refresh failed", error);
      setNotifications(NOTIFICATION_TYPES as NotificationReminderItem[]);
    } finally {
      setLoading(false);
    }
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (visible) {
      refreshAll();
      return;
    }
  }, [refreshAll, visible]);

  const activeCount = useMemo(
    () => notifications.filter((item) => item.enabled).length,
    [notifications]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      <SettingsBottomSheet
        visible={visible}
        onClose={handleClose}
        eyebrow="Notification hub"
        title="Notifications"
        subtitle="Review and edit your reminders from one solid SVA sheet."
        badgeLabel={`${activeCount} active`}
        badgeIcon="notifications-outline"
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            {loading ? (
              <ActivityIndicator size="small" color={svaColors.brand.primary} />
            ) : (
              <Ionicons
                name="alarm-outline"
                size={18}
                color={svaColors.brand.primary}
              />
            )}
          </View>

          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Reminder overview</Text>
            <Text style={styles.summaryValue}>
              {activeCount} of {notifications.length} active
            </Text>
            <Text style={styles.summaryText}>
              Open any row to adjust time, repeat, or weekday behavior.
            </Text>
          </View>
        </View>

        <View style={styles.listBlock}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>Reminder types</Text>
            <Text style={styles.listMeta}>Tap to edit</Text>
          </View>

          <View style={styles.listGroup}>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={svaColors.brand.primary} />
              </View>
            ) : (
              notifications.map((item) => (
                <NotificationRow
                  key={item.key}
                  item={item}
                  colors={svaColors}
                  styles={styles}
                  onPress={() => onSelectReminder(item)}
                />
              ))
            )}
          </View>
        </View>
      </SettingsBottomSheet>
    </>
  );
}

function createStyles(
  colors: SvaColorSet,
  fonts: NotificationListTypography,
  spacing: Spacing
) {
  return StyleSheet.create({
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      marginBottom: spacing.md,
    },
    summaryIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 16,
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
      letterSpacing: 1.5,
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
    listBlock: {
      marginBottom: spacing.xs,
    },
    listHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    listTitle: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 16.5,
      lineHeight: 20,
    },
    listMeta: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    listGroup: {
      gap: 10,
    },
    reminderCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: 14,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    reminderCardPressed: {
      backgroundColor: colors.bg.subtle,
      borderColor: colors.brand.primary,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    copyBlock: {
      flex: 1,
      gap: 3,
    },
    label: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 15.5,
      lineHeight: 19,
    },
    desc: {
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
    },
    metaBlock: {
      alignItems: "flex-end",
      gap: 8,
    },
    statusPill: {
      maxWidth: 140,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
    },
    statusPillOn: {
      backgroundColor: colors.brand.subtle,
      borderColor: colors.brand.primary,
    },
    statusPillOff: {
      backgroundColor: colors.surface.base,
      borderColor: colors.border.muted,
    },
    statusText: {
      fontFamily: fonts.monoFamily,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    statusTextOn: {
      color: colors.brand.primary,
    },
    statusTextOff: {
      color: colors.text.secondary,
    },
    loadingWrap: {
      minHeight: 120,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
  });
}
