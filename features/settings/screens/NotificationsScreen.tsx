import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenHeader from "@/components/layout/ScreenHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { NOTIFICATION_TYPES } from "@/constants/data/notificationType";
import {
  formatBackendTime,
  mergeReminders,
} from "@/utils/notificationHelper";
import type { SvaColorSet, Spacing } from "@/theme/types";
import type { NotificationReminderItem } from "@/features/settings/components/modal/notificationModalTypes";
import ReminderDetail from "@/features/settings/components/modal/NotificationSettingModal";

type NotificationsTypography = {
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type NotificationsStyles = ReturnType<typeof createStyles>;

const NOTIFICATION_ICON_MAP: Record<
  string,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  morning_review: "sunny-outline",
  night_review: "moon-outline",
  mood_logger: "happy-outline",
  streak_saver: "flame-outline",
};

type NotificationDays = NonNullable<NotificationReminderItem["days_of_week"]>;

function getRepeatLabel(days: NotificationDays = []) {
  if (!days.length) return "Daily";
  if (days.length === 7) return "Every day";

  const weekdays: NotificationDays = ["mon", "tue", "wed", "thu", "fri"];
  const weekends: NotificationDays = ["sat", "sun"];
  const isWeekdays =
    weekdays.every((day) => days.includes(day)) && days.length === 5;
  const isWeekends =
    weekends.every((day) => days.includes(day)) && days.length === 2;

  if (isWeekdays) return "Weekdays";
  if (isWeekends) return "Weekends";
  return "Custom";
}

function getNotificationStatus(item: NotificationReminderItem) {
  if (!item?.enabled) return "Off";

  const timeText = formatBackendTime(item.time, "");
  const repeatText = getRepeatLabel(item.days_of_week ?? []);

  return timeText ? `${timeText} · ${repeatText}` : repeatText;
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
  styles: NotificationsStyles;
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
        <View
          style={[styles.statusPill, active ? styles.statusPillOn : styles.statusPillOff]}
        >
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

export const NotificationsScreen = () => {
  const { newTheme, svaColors, svaTypography, typography, spacing } =
    useContext(ThemeContext);
  const { loadUserFromStorage } = useAuth();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationReminderItem[]>(
    () => NOTIFICATION_TYPES as NotificationReminderItem[]
  );
  const [loading, setLoading] = useState(false);
  const [selectedReminder, setSelectedReminder] =
    useState<NotificationReminderItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fonts = useMemo<NotificationsTypography>(
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

  const styles: NotificationsStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing),
    [svaColors, fonts, spacing]
  );

  const refreshNotifications = useCallback(async () => {
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

  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

  useEffect(() => {
    if (!detailVisible) {
      setSelectedReminder(null);
    }
  }, [detailVisible]);

  const activeCount = useMemo(
    () => notifications.filter((item) => item.enabled).length,
    [notifications]
  );

  const totalCount = notifications.length;
  const activePercent = totalCount
    ? Math.round((activeCount / totalCount) * 100)
    : 0;

  const handleOpenReminder = useCallback((item: NotificationReminderItem) => {
    setSelectedReminder(item);
    setDetailVisible(true);
  }, []);

  const handleCloseReminder = useCallback(() => {
    setDetailVisible(false);
  }, []);

  return (
    <ScreenView bgColor={newTheme.background} padding={0} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScreenHeader
        title="Notifications"
        subtitle="Tap a reminder to tune the time, cadence, and active days."
        onBack={() => router.back()}
        containerStyle={styles.headerContainer}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 126 },
        ]}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryEyebrow}>Reminder center</Text>
              <Text style={styles.summaryTitle}>Keep your cadence alive</Text>
            </View>

            <View style={styles.summaryIconWrap}>
              {loading ? (
                <ActivityIndicator size="small" color={svaColors.brand.primary} />
              ) : (
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={svaColors.brand.primary}
                />
              )}
            </View>
          </View>

          <Text style={styles.summaryText}>
            A single place to review each reminder and adjust its timing.
          </Text>

          <View style={styles.summaryStatsRow}>
            <Text style={styles.summaryStatLabel}>{activeCount} active</Text>
            <Text style={styles.summaryStatValue}>{totalCount} reminders</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${activePercent}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.listBlock}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>Reminder types</Text>
            <Text style={styles.listMeta}>Tap to edit</Text>
          </View>

          <View style={styles.listGroup}>
            {notifications.map((item) => (
              <NotificationRow
                key={item.key}
                item={item}
                colors={svaColors}
                styles={styles}
                onPress={() => handleOpenReminder(item)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {selectedReminder ? (
        <ReminderDetail
          detail={selectedReminder}
          categoryKey={selectedReminder.key}
          title={selectedReminder.label}
          description={selectedReminder.desc}
          visible={detailVisible}
          onSaved={refreshNotifications}
          onClose={handleCloseReminder}
        />
      ) : null}
    </ScreenView>
  );
};

const createStyles = (
  colors: SvaColorSet,
  fonts: NotificationsTypography,
  spacing: Spacing
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    headerContainer: {
      marginBottom: 12,
      paddingBottom: 0,
      paddingHorizontal: 12,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 6,
    },
    summaryCard: {
      marginBottom: spacing.lg,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      padding: spacing.md,
    },
    summaryTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    summaryCopy: {
      flex: 1,
    },
    summaryEyebrow: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    summaryTitle: {
      marginTop: 6,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 20,
      lineHeight: 24,
    },
    summaryText: {
      marginTop: spacing.sm,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 18,
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
    summaryStatsRow: {
      marginTop: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    summaryStatLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 14.5,
      lineHeight: 18,
    },
    summaryStatValue: {
      fontFamily: fonts.monoFamily,
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      textTransform: "uppercase",
    },
    progressTrack: {
      marginTop: spacing.sm,
      height: 7,
      borderRadius: 999,
      backgroundColor: colors.surface.base,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.brand.primary,
    },
    listBlock: {
      marginBottom: spacing.xs,
    },
    listHeaderRow: {
      marginBottom: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
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
  });
