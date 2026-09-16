import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    card: {
      marginTop: spacing.lg,
      borderRadius: 28,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 8,
    },
    tipHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    tipIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted,
    },
    sectionLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      fontWeight: "700",
      opacity: 0.78,
      letterSpacing: 1.7,
    },
    cardSubTitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    tipQuote: {
      marginTop: spacing.md,
      ...svaTypography.textStyle.title,
      color: theme.textPrimary,
      fontStyle: "italic",
      lineHeight: svaTypography.textStyle.title.lineHeight,
      letterSpacing: -0.2,
    },
    tipList: {
      marginTop: spacing.md,
      gap: 10,
    },
    tipRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    tipBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.borderMuted ?? "rgba(255,255,255,0.12)",
      marginTop: 8,
    },
    tipText: {
      ...svaTypography.textStyle.body,
      color: theme.textPrimary,
      opacity: 0.86,
      lineHeight: 22,
      flex: 1,
    },
  });

export const MeditationTipCard = () => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );
  const accent = theme.chart5 ?? theme.accent;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", "rgba(163,190,140,0.10)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.tipHeaderRow}>
        <View style={styles.tipIconWrap}>
          <Ionicons name="leaf-outline" size={18} color={accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.sectionLabel}>SESSION TIPS</Text>
          <Text style={styles.cardSubTitle}>
            Quiet cues that keep the ritual elegant and repeatable.
          </Text>
        </View>
      </View>

      <Text style={styles.tipQuote}>
        Begin with one long exhale. The first breath sets the room, the next
        breath deepens it.
      </Text>

      <View style={styles.tipList}>
        {[
          "Use +5m when the session feels easy, not only when it feels short.",
          "Keep your start time consistent before you try to make it longer.",
          "On busy days, keep the reminder at 15m and start earlier than you think.",
        ].map((tip, index) => (
          <View key={tip} style={styles.tipRow}>
            <View
              style={[
                styles.tipBullet,
                index === 0 && { backgroundColor: accent },
              ]}
            />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
