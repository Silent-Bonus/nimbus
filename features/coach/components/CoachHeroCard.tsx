// src/components/coach/CoachHeroCard.tsx
import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

type Props = {
  summary?: string;
  isPremium?: boolean;
  onAsk?: () => void;
  onUpgrade?: () => void;
};

export default function CoachHeroCard({
  summary = "Building your personal guidance ✨",
  isPremium = false,
  onAsk,
  onUpgrade,
}: Props) {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const s = styles(newTheme, spacing, svaTypography);

  const secondaryLabel = useMemo(
    () => (isPremium ? "Notify me" : "Get Premium"),
    [isPremium]
  );

  return (
    <View style={s.card}>
      {/* Depth */}
      <View style={s.glow} pointerEvents="none" />
      <View style={s.stroke} pointerEvents="none" />
      <View style={s.topHaze} pointerEvents="none" />

      {/* Header row (badge + chip) */}
      <View style={s.headerRow}>
        <View style={s.badge}>
          <Ionicons name="sparkles-outline" size={18} color={newTheme.accent} />
        </View>

        <View style={s.chip}>
          <View style={s.chipDot} />
          <Text style={s.chipText}>Nimbus Coach</Text>
          <View style={s.chipDivider} />
          <Text style={s.chipMeta}>Preview</Text>
        </View>
      </View>

      {/* Copy */}
      <Text style={s.title} numberOfLines={2}>
        Coach is learning your rhythm
      </Text>

      <Text style={s.body}>
        We’re quietly observing your habits, focus patterns, and consistency —
        so your guidance feels timely, personal, and supportive.
      </Text>

      <View style={s.metaRow}>
        <Ionicons
          name="pulse-outline"
          size={14}
          color="rgba(255,255,255,0.6)"
        />
        <Text style={s.metaText}>{summary}</Text>
      </View>

      {/* Inset */}
      <View style={s.inset}>
        <View style={s.insetBar} />
        <Text style={s.insetTitle}>Coach insight</Text>
        <Text style={s.insetText}>
          Coach will soon suggest lighter days, better routines, and habit
          tweaks — based on when you usually struggle or succeed.
        </Text>
      </View>

      {/* CTA Dock */}
      <View style={s.ctaDock}>
        <Pressable onPress={onAsk} style={s.primaryBtn}>
          <Text style={s.primaryText}>Ask Coach</Text>
          <Text style={s.primarySub}>anything</Text>
        </Pressable>

        <Pressable onPress={onUpgrade} style={s.ghostBtn}>
          <Text style={s.ghostText}>{secondaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 28,
      padding: spacing.lg,
      backgroundColor: "rgba(255,255,255,0.045)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.45,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
      elevation: 14,
    },

    glow: {
      position: "absolute",
      top: -120,
      left: -120,
      right: -120,
      height: 220,
      borderRadius: 999,
      backgroundColor: "rgba(167, 201, 180, 0.18)", // Nimbus sage glow
    },
    topHaze: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 70,
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    stroke: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    badge: {
      width: 46,
      height: 46,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.22)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
    },

    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    chipDot: {
      width: 8,
      height: 8,
      borderRadius: 99,
      backgroundColor: "rgba(167, 201, 180, 0.85)",
    },
    chipText: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.72)",
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    chipDivider: {
      width: 1,
      height: 12,
      backgroundColor: "rgba(255,255,255,0.14)",
      marginHorizontal: 2,
    },
    chipMeta: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.55)",
      fontWeight: "800",
    },

    title: {
      ...svaTypography.textStyle.heading2,
      color: newTheme.textPrimary,
      fontWeight: "900",
      marginTop: spacing.md,
      lineHeight: 34,
    },
    body: {
      ...svaTypography.textStyle.body,
      color: "rgba(255,255,255,0.70)",
      marginTop: 10,
      lineHeight: 20,
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: spacing.sm,
    },
    metaText: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.60)",
      fontWeight: "800",
    },

    inset: {
      marginTop: spacing.md,
      borderRadius: 20,
      padding: spacing.md,
      backgroundColor: "rgba(0,0,0,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
    },
    insetBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: "rgba(167, 201, 180, 0.40)",
    },
    insetTitle: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.65)",
      fontWeight: "900",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    insetText: {
      ...svaTypography.textStyle.body,
      color: "rgba(255,255,255,0.78)",
      lineHeight: 20,
    },

    ctaDock: {
      flexDirection: "row",
      gap: 12,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.06)",
    },
    primaryBtn: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: newTheme.accent,
    },
    primaryText: {
      ...svaTypography.textStyle.body,
      color: "#0B0B0C",
      fontWeight: "900",
      lineHeight: 18,
    },
    primarySub: {
      ...svaTypography.textStyle.caption,
      color: "#0B0B0C",
      fontWeight: "900",
      opacity: 0.9,
      marginTop: 2,
    },

    ghostBtn: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
    },
    ghostText: {
      ...svaTypography.textStyle.body,
      color: "rgba(255,255,255,0.90)",
      fontWeight: "900",
    },
  });
