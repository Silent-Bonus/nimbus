import React, { useMemo } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import { router } from "expo-router";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

interface HabitItemProps {
  selectedDate: string;
  id: string;
  name: string;
  icon?: any; // emoji string is fine
  time?: string;
  done: boolean;
  currentStreak?: number;
  lastCompleted?: string | null;
  description?: string;
  frequency: string;
  color?: string;
  actual_count: any;
  habit_type_tracking?: "boolean" | "incremental" | string;
  // onHabitDelete:() => {};
  onToggle: (id: string, actual_count: any) => void;
}

const isEmojiIcon = (value: string) =>
  value.length <= 2 || /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(value);

const formatMetric = (metric: any) => {
  const count = metric?.count ?? "--";
  const unit = metric?.unit ? String(metric.unit).trim() : "";

  return {
    count: String(count),
    unit,
  };
};

/**
 * Legacy HabitItemCard - kept as per user request "do not remove the old one"
 */
export const HabitItemCardLegacy: React.FC<HabitItemProps> = ({
  id,
  name,
  selectedDate,
  icon,
  time,
  done,
  frequency,
  description,
  actual_count,
  color,
  onToggle,
}) => {
  const { newTheme, spacing, svaTypography } = React.useContext(ThemeContext);
  const styles = useMemo(
    () => legacyStyling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  const handleToggle = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onToggle(id, actual_count);
  };

  const handleHabitClick = () => {
    router.push({
      pathname: "/(auth)/habit/habitDetail",
      params: { id, date: selectedDate },
    });
  };

  const subtitle = time ? `${frequency} • ${time}` : frequency;
  const iconBgStyle = color ? { backgroundColor: `${color}33` } : null;
  const accentBorderStyle = color ? { borderColor: color } : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleHabitClick}
      activeOpacity={0.9}
    >
      <View style={[styles.iconContainer, iconBgStyle]}>
        {icon ? (
          <Text style={styles.iconText}>{icon}</Text>
        ) : (
          <Ionicons
            name="leaf-outline"
            size={18}
            color={newTheme.textSecondary}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {!!description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.statusTouchable}
      >
        <View
          style={[
            styles.circle,
            accentBorderStyle,
            done ? styles.circleDone : styles.circleEmpty,
          ]}
        >
          {done && (
            <Ionicons name="checkmark" size={14} color={newTheme.surface} />
          )}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

/**
 * New HabitItemCard - Fine-tuned to match Nimbus standard and screenshot 1.png
 */
const HabitItemCard: React.FC<HabitItemProps> = ({
  id,
  name,
  selectedDate,
  icon,
  done,
  currentStreak,
  lastCompleted,
  frequency,
  description,
  actual_count,
  habit_type_tracking,
  color,
  onToggle,
}) => {
  const { newTheme, spacing, svaTypography } = React.useContext(ThemeContext);
  const styles = useMemo(
    () => protocolStyling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  const handleToggle = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (isDoneForSelectedDate) return;
    onToggle(id, actual_count);
  };

  const handleHabitClick = () => {
    router.push({
      pathname: "/(auth)/habit/habitDetail",
      params: { id, date: selectedDate },
    });
  };

  const accentColor = color || newTheme.accent;
  const metric = formatMetric(actual_count);
  const metricText = [metric.count, metric.unit].filter(Boolean).join(" ");
  const isBooleanHabit = habit_type_tracking?.toLowerCase() === "boolean";
  const isDoneForSelectedDate =
    Boolean(done) ||
    (isBooleanHabit &&
      typeof lastCompleted === "string" &&
      lastCompleted.slice(0, 10) === selectedDate.slice(0, 10));

  const renderIcon = () => {
    if (typeof icon === "string") {
      if (/^https?:\/\//i.test(icon)) {
        return (
          <Image
            source={{ uri: icon }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        );
      }

      if (isEmojiIcon(icon)) {
        return <Text style={styles.iconEmoji}>{icon}</Text>;
      }

      return (
        <Ionicons
          name={icon as any}
          size={24}
          color={accentColor}
        />
      );
    }

    if (typeof icon === "number") {
      return (
        <Image
          source={icon}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      );
    }

    if (icon?.uri) {
      return (
        <Image
          source={icon}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      );
    }

    return <Ionicons name="leaf-outline" size={24} color={accentColor} />;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleHabitClick}
      activeOpacity={0.92}
    >
      <LinearGradient
        colors={[
          newTheme.cardRaised ?? "#262A22",
          newTheme.surface ?? "#20231D",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <View
              style={[
                styles.iconInner,
                {
                  backgroundColor: `${accentColor}16`,
                  borderColor: `${accentColor}24`,
                },
              ]}
            >
              {renderIcon()}
            </View>
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {name}
            </Text>
            {!!frequency && (
              <Text style={styles.subtitle} numberOfLines={1}>
                <Text style={styles.subtitleMetric}>{metricText}</Text>
                <Text style={styles.subtitleDivider}> | </Text>
                <Text style={styles.subtitleFrequency}>{frequency}</Text>
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleToggle}
            disabled={isDoneForSelectedDate}
            style={styles.statusIconButton}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              isDoneForSelectedDate
                ? `${name} completed`
                : `Mark ${name} as complete`
            }
          >
            <Ionicons
              name={
                isDoneForSelectedDate
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={26}
              color={
                isDoneForSelectedDate ? newTheme.textSecondary : accentColor
              }
            />
          </TouchableOpacity>
        </View>

      </View>
    </TouchableOpacity>
  );
};

const protocolStyling = (theme: ColorSet, spacing: Spacing, svaTypography: TypographyTokens) =>
  StyleSheet.create({
    card: {
      position: "relative",
      backgroundColor: theme.cardRaised || "#262A22",
      borderRadius: 22,
      marginVertical: spacing.sm,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 6,
      minHeight: 92,
    },
    inner: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconWrap: {
      marginRight: spacing.md,
    },
    iconInner: {
      width: 50,
      height: 50,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      overflow: "hidden",
    },
    thumbnailImage: {
      width: "100%",
      height: "100%",
      borderRadius: 14,
    },
    iconEmoji: {
      fontSize: 22,
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    title: {
      ...svaTypography.textStyle.title,
      fontSize: 17,
      lineHeight: 21,
      fontWeight: "800",
      color: theme.textPrimary,
      letterSpacing: 0.1,
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      fontSize: 11,
      lineHeight: 15,
      color: theme.textSecondary,
      letterSpacing: 0.2,
    },
    subtitleMetric: {
      color: theme.textPrimary,
      fontWeight: "800",
    },
    subtitleDivider: {
      color: theme.textSecondary,
      opacity: 0.42,
      fontWeight: "600",
    },
    subtitleFrequency: {
      color: theme.textSecondary,
      opacity: 0.82,
      fontWeight: "600",
    },
    statusIconButton: {
      marginLeft: spacing.md,
    },
  });

const legacyStyling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.surface,
      borderRadius: spacing.lg,
      marginVertical: spacing.sm,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    iconText: {
      fontSize: 22,
      color: theme.textPrimary,
    },
    textContainer: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      ...svaTypography.textStyle.body,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 2,
    },
    description: {
      ...svaTypography.textStyle.caption,
      color: theme.textMuted ?? theme.textSecondary,
      marginTop: 2,
    },
    statusTouchable: {
      marginLeft: spacing.md,
    },
    circle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    circleDone: {
      borderWidth: 1,
      borderColor: theme.accent,
      backgroundColor: theme.accent,
    },
    circleEmpty: {
      borderWidth: 1,
      backgroundColor: "transparent",
    },
  });

export default HabitItemCard;
