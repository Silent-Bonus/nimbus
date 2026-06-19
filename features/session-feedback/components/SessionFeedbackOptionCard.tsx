import React, { useContext, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";

import type {
  SessionFeedbackLayout,
  SessionFeedbackOption,
} from "../types";

type SessionFeedbackOptionCardProps = {
  option: SessionFeedbackOption;
  selected: boolean;
  layout: SessionFeedbackLayout;
  accentColor: string;
  onPress: () => void;
};

export default function SessionFeedbackOptionCard({
  option,
  selected,
  layout,
  accentColor,
  onPress,
}: SessionFeedbackOptionCardProps) {
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);

  const styles = useMemo(
    () => makeStyles(svaColors, svaTypography, spacing),
    [spacing, svaColors, svaTypography]
  );

  const containerStyle =
    layout === "grid" ? styles.gridCard : styles.listCard;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardBase,
        containerStyle,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      {layout === "grid" ? (
        <>
          <View
            style={[
              styles.gridTopRow,
              selected && styles.gridTopRowSelected,
            ]}
          >
            <View
              style={[
                styles.iconTile,
                selected && styles.iconTileSelected,
              ]}
            >
              <Ionicons
                name={option.icon}
                size={21}
                color={selected ? accentColor : svaColors.text.secondary}
              />
            </View>

            <View
              style={[
                styles.selectionBadge,
                selected && styles.selectionBadgeSelected,
              ]}
            >
              {selected ? (
                <Ionicons name="checkmark" size={14} color={accentColor} />
              ) : null}
            </View>
          </View>

          <View style={styles.gridTextBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {option.label}
            </Text>
            {option.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={3}>
                {option.subtitle}
              </Text>
            ) : null}
          </View>
        </>
      ) : (
        <View style={styles.listRow}>
          <View
            style={[
              styles.iconTile,
              selected && styles.iconTileSelected,
            ]}
          >
            <Ionicons
              name={option.icon}
              size={21}
              color={selected ? accentColor : svaColors.text.secondary}
            />
          </View>

          <View style={styles.listTextBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {option.label}
            </Text>
            {option.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {option.subtitle}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.selectionRing,
              selected && styles.selectionRingSelected,
            ]}
          >
            {selected ? (
              <Ionicons name="checkmark" size={14} color={accentColor} />
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = (t: any, typography: any, spacing: any) =>
  StyleSheet.create({
    cardBase: {
      backgroundColor: t.surface.base ?? t.surfaceMuted,
      borderWidth: 1,
      borderColor: t.border.muted ?? t.border.default,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 22,
        },
        android: { elevation: 2 },
      }),
    } as ViewStyle,
    listCard: {
      width: "100%",
      minHeight: 80,
      borderRadius: 24,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    } as ViewStyle,
    gridCard: {
      width: "100%",
      minHeight: 180,
      borderRadius: 24,
      padding: spacing.md,
    } as ViewStyle,
    cardSelected: {
      borderColor: "rgba(163,190,140,0.82)",
      backgroundColor: "rgba(163,190,140,0.12)",
      shadowColor: "rgba(163,190,140,0.26)",
      shadowOpacity: 0.26,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 6,
    } as ViewStyle,
    cardPressed: {
      transform: [{ scale: 0.988 }],
      opacity: 0.96,
    } as ViewStyle,
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    iconTile: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.bg.subtle ?? "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor: t.border.subtle ?? t.border.muted,
    },
    iconTileSelected: {
      backgroundColor: "rgba(163,190,140,0.18)",
      borderColor: "rgba(163,190,140,0.28)",
    } as ViewStyle,
    listTextBlock: {
      flex: 1,
      gap: 4,
    },
    gridTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    gridTopRowSelected: {
      marginBottom: 8,
    },
    gridTextBlock: {
      flex: 1,
      justifyContent: "flex-end",
      gap: 6,
      paddingTop: spacing.sm,
    },
    title: {
      ...(typography?.textStyle?.title ?? {}),
      fontSize: 18,
      lineHeight: 22,
      color: t.text.primary ?? t.textPrimary,
      fontWeight: "600",
    },
    subtitle: {
      ...(typography?.textStyle?.subtitle ?? {}),
      fontSize: 13,
      lineHeight: 18,
      color: t.text.secondary ?? t.textSecondary,
    },
    selectionRing: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.02)",
    },
    selectionRingSelected: {
      backgroundColor: "rgba(163,190,140,0.18)",
      borderColor: "rgba(163,190,140,0.80)",
    },
    selectionBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      backgroundColor: "rgba(255,255,255,0.02)",
      alignItems: "center",
      justifyContent: "center",
    },
    selectionBadgeSelected: {
      backgroundColor: "rgba(163,190,140,0.18)",
      borderColor: "rgba(163,190,140,0.80)",
    },
  });
