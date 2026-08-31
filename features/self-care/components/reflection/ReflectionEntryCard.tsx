import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { ReflectionCard } from "@/features/self-care/utils/reflections";

interface ReflectionEntryCardProps {
  item: ReflectionCard;
  onPress: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
  variant?: "default" | "session";
}

const ReflectionEntryCard: React.FC<ReflectionEntryCardProps> = ({
  item,
  onPress,
  actionLabel,
  onActionPress,
  variant = "default",
}) => {
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );
  const isSessionVariant = variant === "session";
  const resolvedTotalSteps = Math.max(item.questionCount ?? 1, 1);
  const resolvedCurrentStep = Math.max(item.currentStep ?? 1, 1);
  const answeredStepCount =
    item.status === "completed"
      ? resolvedTotalSteps
      : Math.min(Math.max(resolvedCurrentStep - 1, 0), resolvedTotalSteps);
  const progressValue =
    resolvedTotalSteps > 0 ? answeredStepCount / resolvedTotalSteps : 0;
  const progressPercent = Math.round(progressValue * 100);

  const renderCardContent = () => (
    <>
      {isSessionVariant && (
        <View style={styles.sessionHeroShell}>
          <View style={styles.sessionTopRow}>
            <Text style={styles.sessionKicker}>In Progress</Text>
            {!!item.dateLabel && (
              <Text style={styles.sessionDate} numberOfLines={1}>
                {item.dateLabel}
              </Text>
            )}
          </View>

          <Text style={[styles.cardTitle, styles.sessionTitle]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.sessionInfoRow}>
            <View style={styles.sessionStepPill}>
              <Text style={styles.sessionStepText}>
                Answered {answeredStepCount} of {resolvedTotalSteps}
              </Text>
            </View>
          </View>

          <View style={styles.progressPanel}>
            <View style={styles.progressPanelRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{progressPercent}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(progressPercent, 0)}%` },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {!isSessionVariant && (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.cardChevronWrap}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.textSecondary}
              />
            </View>
          </View>
        </View>
      )}

      {!isSessionVariant && (
        <View style={styles.cardMetaRow}>
          {!!item.statusLabel && (
            <View style={styles.statusChip}>
              <Text style={styles.statusText}>{item.statusLabel}</Text>
            </View>
          )}

          <View style={styles.cardMetaWrap}>
            {!!item.dateLabel && (
              <Text style={styles.cardDate} numberOfLines={1}>
                {item.dateLabel}
              </Text>
            )}
          </View>
        </View>
      )}

      {!!item.description && !isSessionVariant && (
        <Text style={styles.cardDescription} numberOfLines={5}>
          {item.description}
        </Text>
      )}

      {!!item.tags.length && !isSessionVariant && (
        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <View key={`${item.id}-${tag}`} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  if (!actionLabel) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          isSessionVariant && styles.sessionCard,
          pressed && styles.cardPressed,
        ]}
      >
        {renderCardContent()}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, isSessionVariant && styles.sessionCard]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardContent,
          isSessionVariant && styles.sessionCardContent,
          pressed && styles.cardPressed,
        ]}
      >
        {renderCardContent()}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${item.title}`}
        onPress={onActionPress ?? onPress}
        style={({ pressed }) => [
          styles.actionButton,
          isSessionVariant && styles.sessionActionButton,
          pressed && styles.actionButtonPressed,
        ]}
      >
        <Text
          style={[
            styles.actionButtonText,
            isSessionVariant && styles.sessionActionButtonText,
          ]}
        >
          {actionLabel}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={isSessionVariant ? theme.accent : theme.buttonPrimaryText}
        />
      </Pressable>
    </View>
  );
};

const styling = (theme: any, svaTypography: any, spacing: any, typography: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 26,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    sessionCard: {
      backgroundColor: theme.surface,
      borderColor: "rgba(188, 208, 176, 0.16)",
      shadowOpacity: 0.1,
      shadowRadius: 14,
    },
    cardPressed: {
      transform: [{ scale: 0.99 }],
      backgroundColor: theme.surfaceMuted,
    },
    cardContent: {
      borderRadius: 26,
    },
    sessionCardContent: {
      paddingBottom: 8,
    },
    sessionHeroShell: {
      borderRadius: 18,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    sessionTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 14,
    },
    sessionKicker: {
      ...typography.smallCaption,
      color: theme.accent,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    sessionDate: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      flexShrink: 1,
      textAlign: "right",
    },
    sessionInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 14,
      marginBottom: 14,
    },
    sessionStepPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
    },
    sessionStepText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 0.3,
    },
    progressPanel: {
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    progressPanelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 8,
    },
    progressLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    progressValue: {
      ...typography.smallCaption,
      color: theme.accent,
      fontWeight: "700",
    },
    progressTrack: {
      height: 6,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.accent,
    },
    cardHeader: {
      marginBottom: 14,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    cardChevronWrap: {
      marginTop: 4,
    },
    cardMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    cardMetaWrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      flexShrink: 1,
      gap: 8,
    },
    cardTitle: {
      flex: 1,
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 26,
      lineHeight: 30,
      color: theme.accent,
      fontStyle: "italic",
      letterSpacing: -0.3,
    },
    sessionTitle: {
      color: theme.textPrimary,
      fontSize: 28,
      lineHeight: 31,
      letterSpacing: -0.35,
    },
    statusChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
      backgroundColor: theme.surfaceMuted,
    },
    statusText: {
      ...typography.smallCaption,
      color: theme.accent,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    cardDate: {
      ...typography.smallCaption,
      flexShrink: 1,
      color: theme.textSecondary,
      textTransform: "uppercase",
      textAlign: "right",
    },
    cardDescription: {
      ...typography.body,
      color: theme.textSecondary,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 18,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.16)",
    },
    tagText: {
      ...typography.smallCaption,
      color: theme.chart2 ?? theme.accent,
      letterSpacing: 1.1,
    },
    actionButton: {
      marginTop: 4,
      borderRadius: 18,
      backgroundColor: theme.accent,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    sessionActionButton: {
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      justifyContent: "space-between",
      paddingHorizontal: 18,
    },
    actionButtonPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.99 }],
    },
    actionButtonText: {
      ...typography.body,
      color: theme.buttonPrimaryText,
      fontWeight: "700",
    },
    sessionActionButtonText: {
      color: theme.textPrimary,
    },
  });

export default ReflectionEntryCard;
