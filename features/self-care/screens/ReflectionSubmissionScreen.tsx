import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import { getReflectionSession } from "@/features/self-care/services/selfCareService";
import type { ReflectionSessionState } from "@/features/self-care/types/reflectionTypes";
import { buildReflectionLastSavedLabel } from "@/features/self-care/utils/reflections";

type ReflectionSubmissionParams = {
  journalId?: string | string[];
  journalSessionId?: string | string[];
  journalTitle?: string | string[];
  journalSummary?: string | string[];
  journalTags?: string | string[];
  journalThemeTag?: string | string[];
  questionCount?: string | string[];
  sealedAtLabel?: string | string[];
};

const parseParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseTagList = (value?: string | string[]) => {
  const raw = parseParam(value);
  if (!raw) return [];

  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/^#+/, "").toLowerCase());
};

export default function ReflectionSubmissionScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ReflectionSubmissionParams>();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const [sessionState, setSessionState] = useState<ReflectionSessionState | null>(
    null
  );
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const reflectionSessionId = useMemo(() => {
    const raw = parseParam(params.journalSessionId);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.journalSessionId]);
  const reflectionSummary = parseParam(params.journalSummary) ?? "";
  const fallbackTags = useMemo(
    () => parseTagList(params.journalTags),
    [params.journalTags]
  );
  const fallbackQuestionCount = useMemo(() => {
    const parsed = Number.parseInt(parseParam(params.questionCount) ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
  }, [params.questionCount]);

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (!reflectionSessionId) {
      return;
    }

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 20;

    const hasSummary = (state: ReflectionSessionState | null) =>
      Boolean(state?.summary_text?.trim());

    const pollSession = async () => {
      if (!active) {
        return;
      }

      setIsSummaryLoading(true);
      try {
        const response = await getReflectionSession(reflectionSessionId);
        if (!active) {
          return;
        }

        const nextState = response?.data ?? null;
        setSessionState(nextState);

        if (hasSummary(nextState) || attempts >= maxAttempts) {
          return;
        }
      } catch {
        if (!active) {
          return;
        }
      } finally {
        if (active) {
          setIsSummaryLoading(false);
        }
      }

      attempts += 1;
      timeoutId = setTimeout(pollSession, 2500);
    };

    pollSession();

    return () => {
      active = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [reflectionSessionId]);

  const handleReturnToArchive = () => {
    router.replace(ROUTES.AUTH.SELF_CARE_REFLECTION_ARCHIVE);
  };

  const reflectionTitle =
    sessionState?.template_title?.trim() ||
    parseParam(params.journalTitle) ||
    "Untitled Reflection";
  const reflectionTags = useMemo(() => {
    const sessionCategory = sessionState?.category?.trim().toLowerCase();

    if (sessionCategory) {
      return [sessionCategory];
    }

    return fallbackTags;
  }, [fallbackTags, sessionState?.category]);
  const reflectionThemeTag =
    sessionState?.category?.trim().toLowerCase() ||
    parseParam(params.journalThemeTag) ||
    reflectionTags[0] ||
    "reflection";
  const sealedAtLabel =
    buildReflectionLastSavedLabel(
      sessionState?.completed_at ??
        sessionState?.last_saved_at ??
        sessionState?.started_at
    ) ||
    parseParam(params.sealedAtLabel) ||
    format(new Date(), "MMM dd, yyyy").toUpperCase();
  const answeredQuestions = sessionState?.total_steps || fallbackQuestionCount;
  const summaryText =
    sessionState?.summary_text?.trim() ||
    reflectionSummary ||
    "Your guided reflection has been saved to the archive.";
  const hasResolvedSummary = Boolean(sessionState?.summary_text?.trim());
  const reviewResponses = useMemo(() => {
    return [...(sessionState?.responses ?? [])].sort(
      (a, b) => a.step_number - b.step_number
    );
  }, [sessionState?.responses]);
  const summaryStatusLabel = sessionState?.summary_status?.replace(/_/g, " ");
  const isSummaryPending =
    isSummaryLoading &&
    !sessionState?.summary_text?.trim() &&
    reflectionSessionId != null;
  const showSummaryPlaceholder =
    !isSummaryPending && !hasResolvedSummary && reflectionSessionId != null;
  const isCompletedReview =
    sessionState?.status === "completed" || reviewResponses.length > 0;
  const heroEyebrow = isCompletedReview ? "ARCHIVED REVIEW" : "SAVED REFLECTION";
  const heroTitle = isCompletedReview ? "Reflection review" : "Reflection saved";
  const heroDescription = isCompletedReview
    ? "Revisit the full thread, including each prompt and the answer you gave it."
    : "Your reflection has been added to the SVA archive.";
  const summaryLabel = isCompletedReview
    ? "REFLECTION SUMMARY"
    : "LATEST REFLECTION";
  const responseCount = reviewResponses.filter((response) =>
    response.answer.trim().length > 0
  ).length;
  const stats = [
    {
      label: "Questions",
      value: String(answeredQuestions).padStart(2, "0"),
    },
    {
      label: reviewResponses.length > 0 ? "Answers" : "Tags",
      value: String(
        reviewResponses.length > 0
          ? Math.max(responseCount, 1)
          : Math.max(reflectionTags.length, 1)
      ).padStart(2, "0"),
    },
    {
      label: "State",
      value: isCompletedReview ? "DONE" : "SAVED",
    },
  ];

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.root}>
        <AppHeader
          title="Reflection Archive"
          subtitle="Saved and ready when you return."
          onBack={handleReturnToArchive}
          rightAction={{
            icon: "archive-outline",
            accessibilityLabel: "Back to archive",
            onPress: handleReturnToArchive,
          }}
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl * 2.5 },
          ]}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroSealRow}>
              <View style={styles.heroSealOuter}>
                <View style={styles.heroSealInner}>
                  <Ionicons name="checkmark" size={34} color={theme.accent} />
                </View>
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>{heroEyebrow}</Text>
                <Text style={styles.heroTitle}>{heroTitle}</Text>
                <Text style={styles.heroDescription}>
                  {heroDescription}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>{summaryLabel}</Text>
              <Text style={styles.summaryDate}>{sealedAtLabel}</Text>
            </View>

            <Text style={styles.summaryTitle} numberOfLines={2}>
              {reflectionTitle}
            </Text>

            {isSummaryPending ? (
              <View style={styles.summaryLoadingWrap}>
                <ActivityIndicator size="small" color={theme.accent} />
                <Text style={styles.summaryLoadingTitle}>
                  Generating your reflection summary...
                </Text>
                <Text style={styles.summaryLoadingText}>
                  Check back later. We will show your full summary here once it
                  is ready.
                </Text>
              </View>
            ) : showSummaryPlaceholder ? (
              <View style={styles.summaryPlaceholderWrap}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={theme.textSecondary}
                />
                <Text style={styles.summaryPlaceholderTitle}>
                  Summary not ready yet
                </Text>
                <Text style={styles.summaryPlaceholderText}>
                  Check back later from the archive to see the completed
                  reflection summary.
                </Text>
              </View>
            ) : (
              <Text style={styles.summaryText}>{summaryText}</Text>
            )}

            <View style={styles.summaryFooter}>
              <View style={styles.tagChip}>
                <Text style={styles.tagText}>
                  #{reflectionThemeTag.toUpperCase()}
                </Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.metaText}>
                  {summaryStatusLabel
                    ? summaryStatusLabel.toUpperCase()
                    : `${answeredQuestions} QUESTIONS`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsRow}>
            {stats.map((item) => (
              <View key={item.label} style={styles.metricCard}>
                <Text style={styles.metricValue}>{item.value}</Text>
                <Text style={styles.metricLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {!!reviewResponses.length && (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewLabel}>RESPONSE REVIEW</Text>
                <View style={styles.reviewPill}>
                  <Ionicons
                    name="reader-outline"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.reviewPillText}>
                    {reviewResponses.length} ANSWER
                    {reviewResponses.length === 1 ? "" : "S"}
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewTitle}>Your Reflection Thread</Text>
              <Text style={styles.reviewDescription}>
                Revisit each prompt and the answer you left with it.
              </Text>

              <View style={styles.responseList}>
                {reviewResponses.map((response) => (
                  <View
                    key={`${reflectionSessionId ?? "session"}-${response.step_number}`}
                    style={styles.responseCard}
                  >
                    <View style={styles.responseHeader}>
                      <View style={styles.responseIndexPill}>
                        <Text style={styles.responseIndexText}>
                          {String(response.step_number).padStart(2, "0")}
                        </Text>
                      </View>

                      <Text style={styles.responsePrompt}>
                        {response.question_text_snapshot}
                      </Text>
                    </View>

                    <Text style={styles.responseAnswer}>{response.answer}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>ARCHIVE NOTE</Text>
            <Text style={styles.noteText}>
              {isCompletedReview
                ? "Each answer is preserved here so the full reflection stays easy to revisit whenever you return."
                : "Return whenever you want to revisit this thread or begin a new one from the same quiet place."}
            </Text>
          </View>

          <StyledButton
            label="Return to Archive"
            onPress={handleReturnToArchive}
            variant="primary"
            fullWidth
          />
        </ScrollView>
      </View>
    </ScreenView>
  );
}

const styling = (
  theme: any,
  svaTypography: any,
  spacing: any,
  typography: any
) =>
  StyleSheet.create({
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    root: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    heroCard: {
      borderRadius: 30,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      padding: 20,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    heroSealRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 18,
    },
    heroSealOuter: {
      width: 132,
      height: 132,
      borderRadius: 66,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    heroSealInner: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 1,
      borderColor: theme.accent,
      backgroundColor: theme.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    heroCopy: {
      flex: 1,
    },
    heroEyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    heroTitle: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 34,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: theme.textPrimary,
    },
    heroDescription: {
      ...typography.body,
      color: theme.textSecondary,
      marginTop: 10,
    },
    summaryCard: {
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    summaryLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    summaryDate: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    summaryTitle: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 28,
      lineHeight: 30,
      color: theme.accent,
      fontStyle: "italic",
      marginBottom: 12,
      letterSpacing: -0.2,
    },
    summaryText: {
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 16,
      lineHeight: 26,
      color: theme.textPrimary,
      opacity: 0.96,
    },
    summaryLoadingWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      minHeight: 52,
      flexWrap: "wrap",
    },
    summaryLoadingTitle: {
      ...typography.body,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    summaryLoadingText: {
      ...typography.caption,
      color: theme.textSecondary,
      width: "100%",
      marginLeft: 28,
      marginTop: 2,
      lineHeight: 20,
    },
    summaryPlaceholderWrap: {
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      gap: spacing.xs,
    },
    summaryPlaceholderTitle: {
      ...typography.body,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    summaryPlaceholderText: {
      ...typography.caption,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    summaryFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 18,
    },
    tagChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
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
    metaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    metaText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.1,
    },
    metricsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: spacing.lg,
    },
    metricCard: {
      flex: 1,
      borderRadius: 22,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingVertical: 16,
      paddingHorizontal: 14,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    metricValue: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 24,
      lineHeight: 26,
      color: theme.textPrimary,
      marginBottom: 6,
    },
    metricLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2,
      color: theme.textSecondary,
      textTransform: "uppercase",
      textAlign: "center",
    },
    reviewCard: {
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },
    reviewLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    reviewPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    reviewPillText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    reviewTitle: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 30,
      lineHeight: 32,
      color: theme.textPrimary,
      letterSpacing: -0.25,
      marginBottom: 10,
    },
    reviewDescription: {
      ...typography.body,
      color: theme.textSecondary,
      marginBottom: spacing.lg,
    },
    responseList: {
      gap: spacing.md,
    },
    responseCard: {
      borderRadius: 22,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    responseHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 14,
    },
    responseIndexPill: {
      minWidth: 36,
      height: 36,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    responseIndexText: {
      ...typography.smallCaption,
      color: theme.accent,
      fontWeight: "700",
      letterSpacing: 1,
    },
    responsePrompt: {
      flex: 1,
      ...typography.body,
      color: theme.textPrimary,
      fontWeight: "700",
      lineHeight: 22,
    },
    responseAnswer: {
      ...typography.body,
      color: theme.textSecondary,
      lineHeight: 24,
    },
    noteCard: {
      borderRadius: 24,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.xl,
    },
    noteLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.1,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    noteText: {
      ...typography.body,
      color: theme.textPrimary,
      lineHeight: 26,
    },
  });
