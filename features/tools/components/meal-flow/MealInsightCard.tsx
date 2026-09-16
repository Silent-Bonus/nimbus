import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { MealCardSurface } from "./MealCardSurface";
import type {
  SvaColorSet,
  Spacing,
  TypographyTokens,
  SvaTokens,
} from "@/theme/types";

export type MealInsightCardProps = {
  title: string;
  eyebrow?: string;
  caption?: string;
  insights: readonly unknown[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function MealInsightCard({
  title,
  eyebrow = "Insight Feed",
  caption,
  insights,
  style,
  testID,
}: MealInsightCardProps) {
  const { svaColors, spacing, svaTypography, tokens } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, spacing, svaTypography, tokens),
    [svaColors, spacing, svaTypography, tokens]
  );

  const displayInsights = insights
    .map((insight) => {
      if (typeof insight === "string") return insight;
      if (insight && typeof insight === "object" && "message" in insight) {
        const message = (insight as { message?: unknown }).message;
        return typeof message === "string" ? message : null;
      }
      return null;
    })
    .filter((insight): insight is string => Boolean(insight));
  const leadInsight = displayInsights[0] ?? "Keep logging your meals to unlock stronger nutrition insights.";
  const supportingInsights = displayInsights.slice(1, 3);

  return (
    <MealCardSurface
      testID={testID}
      tone="raised"
      radius={28}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons
            name="sparkles-outline"
            size={14}
            color={svaColors.brand.primary}
          />
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>

      <View style={styles.heroPanel}>
        <View style={styles.heroHalo} />
        <View style={styles.heroCopy}>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons
                name="sparkles-outline"
                size={16}
                color={svaColors.brand.primary}
              />
            </View>
            <Text style={styles.heroLabel}>Lead insight</Text>
          </View>
          <Text style={styles.heroInsight}>{leadInsight}</Text>
        </View>
      </View>

      {supportingInsights.length > 0 ? (
        <View style={styles.supportPanel}>
          {supportingInsights.map((insight, index) => (
            <View
              key={insight}
              style={[
                styles.listItem,
                index < supportingInsights.length - 1 && styles.listItemBorder,
              ]}
            >
              <View style={styles.listMarker} />
              <View style={styles.listCopy}>
                <Text style={styles.listLabel}>Supporting signal</Text>
                <Text style={styles.listText}>{insight}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </MealCardSurface>
  );
}

const styling = (
  theme: SvaColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens,
  tokens: SvaTokens
) =>
  StyleSheet.create({
    card: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      marginBottom: spacing.xl,
      gap: spacing.md,
      overflow: "hidden",
    },
    header: {
      gap: spacing.sm + 2,
    },
    headerBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs + 2,
      alignSelf: "flex-start",
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 2,
      borderRadius: tokens.radius.chip,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    eyebrow: {
      ...(svaTypography?.textStyle.authTinyLabel ?? svaTypography.textStyle.authTinyLabel),
      color: theme.text.primary,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    title: {
      ...(svaTypography?.textStyle.title ?? svaTypography.textStyle.title),
      color: theme.text.primary,
    },
    caption: {
      ...(svaTypography?.textStyle.body ?? svaTypography.textStyle.body),
      color: theme.text.secondary,
      maxWidth: "92%",
    },
    heroPanel: {
      position: "relative",
      overflow: "hidden",
      borderRadius: tokens.radius.card,
      backgroundColor: theme.bg.subtle,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md + 2,
    },
    heroHalo: {
      position: "absolute",
      right: -18,
      top: -24,
      width: 84,
      height: 84,
      borderRadius: 999,
      backgroundColor: theme.brand.primary,
      opacity: 0.08,
    },
    heroCopy: {
      flex: 1,
      gap: 8,
    },
    heroMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    heroIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
    },
    heroLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? svaTypography.textStyle.authTinyLabel),
      color: theme.text.secondary,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    heroInsight: {
      ...(svaTypography?.textStyle.heading2 ?? svaTypography.textStyle.title),
      color: theme.text.primary,
    },
    supportPanel: {
      borderRadius: tokens.radius.card,
      backgroundColor: theme.surface.base,
      borderWidth: tokens.border.hairline,
      borderColor: theme.border.default,
      overflow: "hidden",
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md - 2,
    },
    listItemBorder: {
      borderBottomWidth: tokens.border.hairline,
      borderBottomColor: theme.border.default,
    },
    listMarker: {
      width: 6,
      height: 6,
      borderRadius: 999,
      marginTop: 7,
      color: theme.brand.primary,
      backgroundColor: theme.brand.primary,
    },
    listCopy: {
      flex: 1,
      gap: 4,
    },
    listLabel: {
      ...(svaTypography?.textStyle.authTinyLabel ?? svaTypography.textStyle.authTinyLabel),
      color: theme.text.secondary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    listText: {
      flex: 1,
      ...(svaTypography?.textStyle.body ?? svaTypography.textStyle.body),
      color: theme.text.primary,
    },
  });
