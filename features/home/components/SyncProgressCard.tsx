import React, { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, Typography } from "@/theme/types";

interface SyncProgressCardProps {
  percentage: number; // 0 to 100
  currentPhase?: string;
  nextPhase?: string;
}

const SyncProgressCard: React.FC<SyncProgressCardProps> = ({
  percentage,
  currentPhase = "Flow State",
  nextPhase = "Master Healer",
}) => {
  const { newTheme, typography, spacing } = useContext(ThemeContext);

  // Animation for the progress bar
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false, // width is not supported by native driver
    }).start();
  }, [percentage, widthAnim]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const styles = styling(newTheme, spacing, typography);

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.sectionTitle}>SYNCHRONIZATION PATH</Text>
            <View style={styles.titleRule} />
          </View>

          <View style={styles.percentWrapper}>
            <Text style={styles.percentValue}>{percentage}%</Text>
            <Text style={styles.percentLabel}> Sync</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: widthInterpolated }]}
          >
            <LinearGradient
              colors={[newTheme.accent, newTheme.accentPressed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            >
              <View style={styles.progressSheen} />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Footer Info Row */}
        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>CURRENT</Text>
            <Text style={styles.footerValue}>{currentPhase.toUpperCase()}</Text>
          </View>
          <View style={styles.footerItemRight}>
            <Text style={[styles.footerLabel, styles.footerLabelRight]}>
              NEXT
            </Text>
            <Text style={[styles.footerValue, styles.footerValueRight]}>
              {nextPhase.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styling = (theme: ColorSet, spacing: Spacing, typography: Typography) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    card: {
      position: "relative",
      backgroundColor: theme.cardRaised ?? theme.surface ?? "#262A22",
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      shadowColor: "#000",
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      elevation: 8,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    titleWrap: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.smallCaption,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.8,
      color: theme.textSecondary,
      opacity: 0.78,
    },
    titleRule: {
      width: 48,
      height: 1,
      borderRadius: 999,
      marginTop: spacing.xs,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    percentWrapper: {
      flexDirection: "row",
      alignItems: "baseline",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    percentValue: {
      ...typography.h3,
      fontSize: 18,
      fontWeight: "800",
      lineHeight: 22,
      color: theme.textPrimary,
      letterSpacing: -0.2,
    },
    percentLabel: {
      ...typography.caption,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 16,
      color: theme.textSecondary,
      opacity: 0.86,
    },
    progressTrack: {
      height: 8,
      backgroundColor: theme.surfaceMuted ?? "rgba(255,255,255,0.1)",
      borderRadius: 99,
      overflow: "hidden",
      marginBottom: spacing.md,
    },
    progressFill: {
      height: "100%",
      borderRadius: 99,
      overflow: "hidden",
    },
    progressGradient: {
      flex: 1,
      borderRadius: 99,
      position: "relative",
    },
    progressSheen: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: spacing.md,
    },
    footerItem: {
      flex: 1,
    },
    footerItemRight: {
      flex: 1,
      alignItems: "flex-end",
    },
    footerLabel: {
      ...typography.smallCaption,
      fontSize: 9,
      fontWeight: "600",
      lineHeight: 13,
      color: theme.textSecondary,
      opacity: 0.58,
      letterSpacing: 1.1,
      marginBottom: 2,
    },
    footerValue: {
      ...typography.caption,
      color: theme.textSecondary,
      opacity: 0.9,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 15,
      letterSpacing: 0.4,
    },
    footerLabelRight: {
      textAlign: "right",
    },
    footerValueRight: {
      textAlign: "right",
    },
  });

export default SyncProgressCard;
