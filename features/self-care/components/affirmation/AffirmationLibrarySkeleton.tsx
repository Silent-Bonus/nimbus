import React, { useContext, useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import { getAffirmationRecommendationCardWidth } from "@/features/self-care/components/affirmation/AffirmationRecommendationCard";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

const AffirmationLibrarySkeleton = () => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const cardWidth = getAffirmationRecommendationCardWidth(
    Dimensions.get("window").width
  );

  const styles = useMemo(
    () =>
      styling(newTheme, spacing, typography, svaTypography, cardWidth),
    [newTheme, spacing, typography, svaTypography, cardWidth]
  );

  return (
    <ScrollView
      testID="affirmation-library-skeleton"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <View style={styles.eyebrow} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendationRow}
        >
          {[0, 1].map((index) => (
            <View key={`recommendation-${index}`} style={styles.featureCard}>
              <View style={styles.featureTopRow}>
                <View style={styles.pill} />
                <View style={styles.iconBubble} />
              </View>
              <View style={styles.featureBody}>
                <View style={styles.titleLineWide} />
                <View style={styles.titleLineNarrow} />
                <View style={styles.bodyLineWide} />
                <View style={styles.bodyLineNarrow} />
              </View>
              <View style={styles.footerRow}>
                <View style={styles.footerLine} />
                <View style={styles.chevronBubble} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterRow}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={`filter-${index}`}
            style={[
              styles.filterPill,
              index === 0 && styles.filterPillShort,
              index === 1 && styles.filterPillMedium,
            ]}
          />
        ))}
      </View>

      <View style={styles.libraryHeader}>
        <View>
          <View style={styles.libraryEyebrow} />
          <View style={styles.libraryTitle} />
        </View>
        <View style={styles.countPill} />
      </View>

      {[0, 1, 2].map((index) => (
        <View key={`card-${index}`} style={styles.libraryCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.pill} />
            <View style={styles.iconBubble} />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.titleLineWide} />
            <View style={styles.titleLineNarrow} />
            <View style={styles.bodyLineWide} />
            <View style={styles.bodyLineNarrow} />
          </View>

          <View style={styles.footerRow}>
            <View style={styles.footerLine} />
            <View style={styles.chevronBubble} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined,
  cardWidth: number
) =>
  StyleSheet.create({
    content: {
      paddingBottom: spacing.xl * 3,
    },
    section: {
      marginBottom: spacing.lg,
    },
    eyebrow: {
      width: 132,
      height: 12,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      marginBottom: spacing.sm,
    },
    recommendationRow: {
      paddingRight: spacing.md,
      paddingVertical: spacing.xs,
    },
    featureCard: {
      width: cardWidth,
      minHeight: 232,
      marginRight: spacing.md,
      marginVertical: spacing.sm,
      borderRadius: 30,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      padding: spacing.lg,
      justifyContent: "space-between",
      gap: spacing.md,
      overflow: "hidden",
    },
    featureTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.lg,
      paddingRight: spacing.md,
    },
    filterPill: {
      width: 104,
      height: 40,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
    },
    filterPillShort: {
      width: 64,
    },
    filterPillMedium: {
      width: 88,
    },
    libraryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    libraryEyebrow: {
      width: 58,
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      marginBottom: 6,
    },
    libraryTitle: {
      width: 164,
      height: typography.h3.lineHeight ?? 28,
      borderRadius: 12,
      backgroundColor: theme.surfaceMuted,
    },
    countPill: {
      width: 108,
      height: 32,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
    },
    libraryCard: {
      minHeight: 168,
      marginBottom: spacing.md,
      borderRadius: 28,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      padding: spacing.lg,
      justifyContent: "space-between",
      gap: spacing.md,
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    cardBody: {
      gap: 8,
    },
    featureBody: {
      gap: 10,
    },
    pill: {
      width: 92,
      height: 26,
      borderRadius: 999,
      backgroundColor: theme.surface,
      opacity: 0.9,
    },
    iconBubble: {
      width: 38,
      height: 38,
      borderRadius: 14,
      backgroundColor: theme.surface,
      opacity: 0.9,
    },
    titleLineWide: {
      width: "78%",
      height:
        svaTypography?.textStyle.authBody?.fontSize ??
        typography.h3.fontSize ??
        24,
      borderRadius: 12,
      backgroundColor: theme.surface,
    },
    titleLineNarrow: {
      width: "56%",
      height: 16,
      borderRadius: 999,
      backgroundColor: theme.surface,
    },
    bodyLineWide: {
      width: "100%",
      height: 14,
      borderRadius: 999,
      backgroundColor: theme.surface,
    },
    bodyLineNarrow: {
      width: "72%",
      height: 14,
      borderRadius: 999,
      backgroundColor: theme.surface,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    footerLine: {
      width: 88,
      height: 14,
      borderRadius: 999,
      backgroundColor: theme.surface,
    },
    chevronBubble: {
      width: 34,
      height: 34,
      borderRadius: 999,
      backgroundColor: theme.surface,
    },
  });

export default AffirmationLibrarySkeleton;
