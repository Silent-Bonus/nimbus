import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { NewsletterReviewSummary } from "@/features/tools/types/newsletterTypes";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type ArticleReviewPanelProps = {
  summary?: NewsletterReviewSummary | null;
};

const formatMetric = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "—";

const ArticleReviewPanel: React.FC<ArticleReviewPanelProps> = ({
  summary,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);
  const summaryLabel = useMemo(() => {
    const total = Number(summary?.reviews_count ?? 0);
    return `${total} review${total === 1 ? "" : "s"}`;
  }, [summary?.reviews_count]);

  if (!summary || summary.reviews_count === 0) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>No reviews yet</Text>
        <Text style={styles.placeholderBody}>
          Review insights will appear here once readers start rating this article.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryMetric}>
          <Text style={styles.summaryLabel}>Average rating</Text>
          <Text style={styles.summaryValue}>{formatMetric(summary.avg_rating)}</Text>
        </View>
        <View style={styles.summaryMetric}>
          <Text style={styles.summaryLabel}>Reviews</Text>
          <Text style={styles.summaryValue}>{summaryLabel}</Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewer}>Reader insight snapshot</Text>
        <Text style={styles.reviewText}>
          This panel is driven from the newsletter detail response summary.
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Clarity {formatMetric(summary.avg_clarity_score)}/5
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Helpful {formatMetric(summary.avg_helpfulness_score)}/5
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Recommends {summary.recommendation_count}/{summary.reviews_count}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Rate {Math.round(summary.recommendation_rate * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    wrap: {
      gap: spacing.md,
    },
    summaryCard: {
      flexDirection: "row",
      gap: spacing.md,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    summaryMetric: {
      flex: 1,
    },
    summaryLabel: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_600SemiBold",
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
      textTransform: "uppercase",
    },
    summaryValue: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 24,
      lineHeight: 28,
      color: colors.text.primary,
    },
    reviewCard: {
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      gap: spacing.sm,
    },
    reviewer: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 20,
      lineHeight: 24,
      color: colors.text.primary,
    },
    reviewText: {
      fontFamily:
        typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.secondary,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    badgeText: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_600SemiBold",
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1,
      color: colors.brand.primary,
      textTransform: "uppercase",
    },
    placeholderCard: {
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      gap: spacing.sm,
    },
    placeholderTitle: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 22,
      lineHeight: 26,
      color: colors.text.primary,
    },
    placeholderBody: {
      fontFamily:
        typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.secondary,
    },
  });

export default ArticleReviewPanel;
