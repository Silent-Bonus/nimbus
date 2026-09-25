// src/components/coach/CoachPlaceholder.tsx
import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import CoachHeroCard from "./CoachHeroCard";

type Props = {
  onBack?: () => void;
  onAsk?: () => void;
  stats?: { daysTracked?: number; habitsActive?: number };
  isPremium?: boolean;
  onUpgrade?: () => void;
};

function TopicTile({
  title,
  icon,
  locked = true,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  locked?: boolean;
}) {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const s = tileStyles(newTheme, spacing, svaTypography);

  return (
    <View style={s.tile}>
      <View style={s.topRow}>
        <View style={s.lockChip}>
          <Ionicons
            name={locked ? "lock-closed" : "sparkles-outline"}
            size={12}
            color="rgba(255,255,255,0.75)"
          />
          <Text style={s.lockText}>{locked ? "Locked" : "Ready"}</Text>
        </View>
        <Ionicons name={icon} size={18} color={newTheme.accent} />
      </View>

      <Text style={s.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={s.meta}>Unlocks automatically</Text>
    </View>
  );
}

export default function CoachPlaceholder({
  onBack,
  onAsk,
  stats,
  isPremium = false,
  onUpgrade,
}: Props) {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const s = styles(newTheme, spacing, svaTypography);

  const summary = useMemo(() => {
    const days = stats?.daysTracked ?? 0;
    const habits = stats?.habitsActive ?? 0;
    if (days > 0 && habits > 0)
      return `Tracking ${habits} habits · ${days} days`;
    if (days > 0) return `${days} days of signals captured`;
    return "Building your personal guidance ✨";
  }, [stats]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: newTheme.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      >
        <View style={s.screen}>
          {/* Header */}
          <View style={s.headerRow}>
            <Pressable onPress={onBack} hitSlop={12} style={s.backBtn}>
              <Ionicons
                name="chevron-back"
                size={22}
                color={newTheme.textPrimary}
              />
            </Pressable>

            <Text style={s.headerTitle}>Coach</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Premium hero */}
          <CoachHeroCard
            summary={summary}
            isPremium={isPremium}
            onAsk={onAsk}
            onUpgrade={onUpgrade}
          />

          {/* Topics */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Explore Coach Topics</Text>
            <Text style={s.sectionHint}>Unlocks as Coach learns you</Text>
          </View>

          <View style={s.grid}>
            <TopicTile title="Consistency tips" icon="arrow-forward" />
            <TopicTile title="Habit stacking" icon="link-outline" />
            <TopicTile title="Identity-based habits" icon="sparkles-outline" />
            <TopicTile title="Morning routines" icon="sunny-outline" />
          </View>

          {/* Advice */}
          <View style={[s.sectionHeader, { marginTop: spacing.xl }]}>
            <Text style={s.sectionTitle}>Advice of the Day</Text>
            <Text style={s.sectionHint}>Daily prompts — personalised soon</Text>
          </View>

          <View style={s.adviceStack}>
            {[
              "What should I focus on today?",
              "Give me motivation",
              "Suggest 1 new habit",
            ].map((t, i) => (
              <View key={i} style={s.adviceRow}>
                <View style={s.adviceAccent} />
                <Text style={s.adviceText}>{t}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={newTheme.textSecondary}
                />
              </View>
            ))}
          </View>

          <Text style={s.footerHint}>
            Keep logging — clarity grows with consistency.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    screen: {
      paddingHorizontal: spacing.xs,
      paddingTop: spacing.lg,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    headerTitle: {
      ...svaTypography.textStyle.heading2,
      color: newTheme.textPrimary,
      fontWeight: "900",
      letterSpacing: 0.2,
    },

    sectionHeader: {
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
      fontWeight: "900",
    },
    sectionHint: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.55)",
      marginTop: 4,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    adviceStack: { gap: spacing.sm },
    adviceRow: {
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    adviceAccent: {
      width: 4,
      height: 20,
      borderRadius: 99,
      backgroundColor: "rgba(167, 201, 180, 0.55)",
    },
    adviceText: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
      fontWeight: "800",
      flex: 1,
    },

    footerHint: {
      marginTop: spacing.xl,
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.55)",
      textAlign: "center",
    },
  });

const tileStyles = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    tile: {
      width: "48%",
      borderRadius: 18,
      padding: spacing.md,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      marginBottom: spacing.md,
      overflow: "hidden",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    lockChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
    },
    lockText: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.70)",
      fontWeight: "800",
    },
    title: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
      fontWeight: "900",
      lineHeight: 20,
    },
    meta: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.55)",
      marginTop: spacing.sm,
    },
  });
