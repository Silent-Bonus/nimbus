import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import RecipeDetailSection from "./RecipeDetailSection";
import type { Spacing, SvaColorSet } from "@/theme/types";

const RecipeDetailLoadingSections: React.FC = () => {
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);

  return (
    <>
      <RecipeDetailSection eyebrow="Elements">
        <View style={styles.stack}>
          {[0, 1, 2, 3].map((index) => (
            <View key={`ingredient-${index}`} style={styles.inlineRow}>
              <View style={styles.inlineDot} />
              <View
                style={[
                  styles.line,
                  index === 3 ? styles.lineShort : styles.lineLong,
                ]}
              />
            </View>
          ))}
        </View>
      </RecipeDetailSection>

      <RecipeDetailSection eyebrow="The Process">
        <View style={styles.stack}>
          {[0, 1, 2].map((index) => (
            <View key={`process-${index}`} style={styles.processRow}>
              <View style={styles.stepIndex} />
              <View style={styles.processLines}>
                <View style={styles.lineLong} />
                <View style={styles.lineMedium} />
              </View>
            </View>
          ))}
        </View>
      </RecipeDetailSection>

      <RecipeDetailSection eyebrow="Tips">
        <View style={styles.stack}>
          {[0, 1].map((index) => (
            <View key={`tip-${index}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconChip} />
                <View style={styles.labelLine} />
              </View>
              <View style={styles.lineLong} />
              <View style={styles.lineMedium} />
            </View>
          ))}
        </View>
      </RecipeDetailSection>

      <View style={styles.wisdomCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconChip} />
          <View style={styles.labelLine} />
        </View>
        <View style={styles.lineLong} />
        <View style={styles.lineMedium} />
        <View style={styles.lineShort} />
      </View>

      <View style={styles.ctaSkeleton} />
    </>
  );
};

const styling = (colors: SvaColorSet, spacing: Spacing) =>
  StyleSheet.create({
    stack: {
      gap: spacing.sm,
    },
    inlineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    inlineDot: {
      width: 18,
      height: 18,
      borderRadius: 999,
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: "rgba(163, 190, 140, 0.1)",
    },
    processRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    processLines: {
      flex: 1,
      gap: spacing.xs,
    },
    stepIndex: {
      width: 28,
      height: 20,
      borderRadius: 8,
      backgroundColor: colors.brand.subtle,
      marginTop: 2,
    },
    card: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
      padding: spacing.md,
      gap: spacing.sm,
    },
    wisdomCard: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
      padding: spacing.md,
      gap: spacing.sm,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    iconChip: {
      width: 28,
      height: 28,
      borderRadius: 10,
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: "rgba(163, 190, 140, 0.12)",
    },
    labelLine: {
      width: 112,
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.surface.elevated,
    },
    line: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.surface.elevated,
    },
    lineLong: {
      height: 10,
      width: "100%",
      borderRadius: 999,
      backgroundColor: colors.surface.elevated,
    },
    lineMedium: {
      height: 10,
      width: "78%",
      borderRadius: 999,
      backgroundColor: colors.surface.elevated,
    },
    lineShort: {
      height: 10,
      width: "56%",
      borderRadius: 999,
      backgroundColor: colors.surface.elevated,
    },
    ctaSkeleton: {
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      marginBottom: spacing.xxl,
    },
  });

export default RecipeDetailLoadingSections;
