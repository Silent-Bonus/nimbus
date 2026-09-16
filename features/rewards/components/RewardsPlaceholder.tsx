// src/components/rewards/RewardsPlaceholder.tsx
import React, { useContext } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

type Props = {
  isPremium?: boolean;
  onUpgrade?: () => void;
  onPreview?: () => void;
};

export default function RewardsPlaceholder({
  isPremium = false,
  onUpgrade,
  onPreview,
}: Props) {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const s = styles(newTheme, spacing, svaTypography);

  return (
    <View style={s.wrap}>
      {/* Ultra glass hero */}
      <View style={s.heroCard}>
        <View style={s.heroGlow} />

        <View style={s.heroTop}>
          <View style={s.iconPill}>
            <Ionicons name="trophy-outline" size={18} color={newTheme.accent} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.heroTitle}>
              {isPremium ? "Rewards are arriving" : "Unlock Rewards"}
            </Text>
            <Text style={s.heroSubtitle}>
              {isPremium
                ? "You’ll get early access as soon as we launch this feature."
                : "Badges, streaks, and achievements are coming soon — Premium members get early access."}
            </Text>
          </View>
        </View>

        {/* CTA row */}
        <View style={s.ctaRow}>
          <Pressable style={s.primaryBtn} onPress={onUpgrade}>
            <Text style={s.primaryText}>
              {isPremium ? "Notify me" : "Get Premium"}
            </Text>
          </Pressable>

          <Pressable style={s.secondaryBtn} onPress={onPreview}>
            <Text style={s.secondaryText}>Preview</Text>
          </Pressable>
        </View>

        <Text style={s.footnote}>
          Keep building habits — your progress will turn into badges.
        </Text>
      </View>

      {/* Ghost achievements */}
      <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>
        My Achievements
      </Text>
      <View style={s.achGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={s.ghostCard}>
            <View style={s.ghostIcon} />
            <View style={{ flex: 1 }}>
              <View style={s.ghostLineLong} />
              <View style={s.ghostLineShort} />
            </View>
          </View>
        ))}
      </View>

      {/* Locked badges */}
      <Text style={[s.sectionTitle, { marginTop: spacing.xl }]}>My Badges</Text>

      <View style={s.badgeGrid}>
        {[
          "Consistency",
          "Streak 7d",
          "Mindful",
          "Starter",
          "Explorer",
          "Secret",
        ].map((label, idx) => (
          <View key={idx} style={s.badgeWrap}>
            <View style={s.hex}>
              <View style={s.hexInner}>
                <Ionicons
                  name={label === "Secret" ? "lock-closed" : "ribbon-outline"}
                  size={18}
                  color="rgba(255,255,255,0.55)"
                />
              </View>
            </View>

            <Text style={s.badgeLabel} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    wrap: {
      marginTop: spacing.md,
    },

    heroCard: {
      borderRadius: 24,
      padding: spacing.lg,
      backgroundColor: newTheme.cardRaised ?? "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
      marginBottom: spacing.lg,
    },
    heroGlow: {
      position: "absolute",
      top: -80,
      left: -80,
      right: -80,
      height: 160,
      borderRadius: 999,
      backgroundColor: "rgba(167, 201, 180, 0.16)",
    },
    heroTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    iconPill: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
    },
    heroTitle: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
      fontWeight: "900",
    },
    heroSubtitle: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
      marginTop: 6,
      lineHeight: 19,
    },

    ctaRow: {
      flexDirection: "row",
      marginTop: spacing.md,
      justifyContent: "space-between",
    },
    primaryBtn: {
      width: "48%",
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: newTheme.accent,
    },
    primaryText: {
      ...svaTypography.textStyle.body,
      color: "#0B0B0C",
      fontWeight: "900",
    },
    secondaryBtn: {
      width: "48%",
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
    },
    secondaryText: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
      fontWeight: "800",
    },
    footnote: {
      marginTop: spacing.md,
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.55)",
    },

    sectionTitle: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
      marginBottom: spacing.md,
    },

    // ✅ Achievements: strict 2-column grid
    achGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    ghostCard: {
      width: "48%",
      borderRadius: 18,
      padding: spacing.md,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    ghostIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.06)",
      marginRight: spacing.md,
    },
    ghostLineLong: {
      height: 10,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.08)",
      marginBottom: 8,
      width: "85%",
    },
    ghostLineShort: {
      height: 10,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.06)",
      width: "55%",
    },

    // ✅ Badges: strict 3-column grid
    badgeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    badgeWrap: {
      width: "32%",
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    hex: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "45deg" }],
    },
    hexInner: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: "rgba(0,0,0,0.18)",
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "-45deg" }],
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
    },

    // ✅ baseline alignment for labels (prevents “wobble”)
    badgeLabel: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textSecondary,
      marginTop: 12,
      textAlign: "center",
      minHeight: 16,
    },
  });
