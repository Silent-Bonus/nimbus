import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { BodyVitalsTrendTimelinePoint } from "@/features/self-care/types/bodyVitals";
import {
  useBodyVitalsTheme,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import { formatBodyVitalsTrendSnapshotDate } from "@/features/self-care/utils/bodyVitalsTrends";
import type { ColorSet, Spacing } from "@/theme/types";

type BodyVitalsTrendTimelineCardProps = {
  timeline: BodyVitalsTrendTimelinePoint[];
};

export function BodyVitalsTrendTimelineCard({
  timeline,
}: BodyVitalsTrendTimelineCardProps) {
  const { newTheme, spacing, bodyVitalsTypography } = useBodyVitalsTheme();
  const styles = useMemo(
    () => styling(newTheme, spacing, bodyVitalsTypography),
    [newTheme, spacing, bodyVitalsTypography]
  );

  return (
    <View style={styles.timelineCard}>
      <Text style={styles.timelineTitle}>Snapshot Timeline</Text>
      {timeline.length ? (
        timeline.map((point, index) => (
          <View key={`${point.date}-${index}`} style={styles.timelineRow}>
            <View style={styles.timelineDotColumn}>
              <View style={styles.timelineDot} />
              {index < timeline.length - 1 ? (
                <View style={styles.timelineLine} />
              ) : null}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDate}>
                {formatBodyVitalsTrendSnapshotDate(point.date)}
              </Text>
              <Text style={styles.timelineMetrics}>
                {typeof point.weight_kg === "number"
                  ? `${point.weight_kg} kg`
                  : "--"}
                {" • "}
                {typeof point.waist_cm === "number"
                  ? `${point.waist_cm} cm`
                  : "--"}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          No persisted snapshots found for this filter.
        </Text>
      )}
    </View>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: BodyVitalsTypography
) =>
  StyleSheet.create({
    timelineCard: {
      borderRadius: 24,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    timelineTitle: {
      ...t.sectionTitle,
      color: theme.textPrimary,
      marginBottom: spacing.md,
    },
    timelineRow: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    timelineDotColumn: {
      width: 20,
      alignItems: "center",
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 5,
      backgroundColor: theme.accent,
    },
    timelineLine: {
      flex: 1,
      width: 1,
      backgroundColor: theme.borderMuted ?? theme.border,
      marginTop: 6,
      marginBottom: 2,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: spacing.md,
      paddingLeft: spacing.sm,
    },
    timelineDate: {
      ...t.body,
      color: theme.textPrimary,
      fontWeight: "700",
      marginBottom: 2,
    },
    timelineMetrics: {
      ...t.caption,
      color: theme.textSecondary,
    },
    emptyText: {
      ...t.body,
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
