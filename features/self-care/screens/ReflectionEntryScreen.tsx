import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import PillFilters from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import {
  getReflectionSession,
  completeReflectionSession,
  saveReflectionSessionStep,
} from "@/features/self-care/services/selfCareService";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import type {
  ReflectionSessionCompleteResponse,
  ReflectionSessionState,
  ReflectionStepSaveResponse,
} from "@/features/self-care/types/reflectionTypes";
import {
  parseReflectionQuestions,
  parseReflectionRouteParam,
  parseReflectionTagList,
  type ReflectionRouteParams,
} from "@/features/self-care/utils/reflections";

const DEFAULT_TAGS = ["gratitude", "mindfulness", "reflection", "dreamscape"];

type ReflectionAnswerState = {
  id: number;
  answer: string;
};

export default function ReflectionEntryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ReflectionRouteParams>();

  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const toast = useNimbusToast();

  const journalTitle =
    parseReflectionRouteParam(params.journalTitle) ?? "Guided Reflection";
  const journalDescription = parseReflectionRouteParam(params.journalDescription) ?? "";
  const journalTemplateId = useMemo(() => {
    const rawId = parseReflectionRouteParam(params.journalId)?.trim();
    return rawId || null;
  }, [params.journalId]);
  const journalSessionId = useMemo(() => {
    const rawId = parseReflectionRouteParam(params.journalSessionId)?.trim();
    if (!rawId) return null;
    const parsed = Number(rawId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.journalSessionId]);
  const journalTags = useMemo(
    () => parseReflectionTagList(params.journalTags),
    [params.journalTags]
  );
  const journalQuestions = useMemo(
    () => parseReflectionQuestions(params.journalQuestions),
    [params.journalQuestions]
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>(
    journalTags[0] ?? DEFAULT_TAGS[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<ReflectionAnswerState[]>([]);
  const [sessionState, setSessionState] = useState<ReflectionSessionState | null>(
    null
  );
  const [hydratingSession, setHydratingSession] = useState(
    Boolean(journalSessionId)
  );

  const styles = useMemo(
    () => styling(theme, spacing, typography),
    [theme, spacing, typography]
  );

  const presetTags = useMemo(
    () => Array.from(new Set([...journalTags, ...DEFAULT_TAGS])),
    [journalTags]
  );

  const currentStep =
    journalQuestions[stepIndex] ?? sessionState?.current_question;
  const activeStepNumber =
    sessionState?.current_question?.step_number ??
    sessionState?.current_step ??
    currentStep?.step_number ??
    stepIndex + 1;
  const hasSavedResponseForCurrentStep = Boolean(
    sessionState?.responses.some(
      (response) => response.step_number === currentStep?.step_number
    )
  );
  // Resumed sessions intentionally replay from question 1 so earlier answers
  // stay reviewable. Only steps before the current unanswered step are locked.
  const isReviewingSavedStep = Boolean(
    journalSessionId &&
      sessionState &&
      currentStep?.step_number != null &&
      currentStep.step_number < activeStepNumber &&
      hasSavedResponseForCurrentStep
  );
  const currentResponse =
    responses.find((entry) => entry.id === currentStep?.id)?.answer ??
    responses[stepIndex]?.answer ??
    "";
  const resolvedStepNumber = currentStep?.step_number ?? stepIndex + 1;
  const resolvedTotalSteps =
    sessionState?.total_steps ?? Math.max(journalQuestions.length, 1);
  const isLastStep = resolvedStepNumber >= resolvedTotalSteps;
  const canAdvance = isReviewingSavedStep || currentResponse.trim().length > 0;
  const isCurrentStepEditable = !isReviewingSavedStep && !submitting;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    // Reset local form state whenever a new template/session payload is pushed
    // into this screen.
    setStepIndex(0);
    setSelectedTag(journalTags[0] ?? DEFAULT_TAGS[0]);
    setSessionState(null);
    setHydratingSession(Boolean(journalSessionId));
    setResponses(
      journalQuestions.map((question) => ({
        id: question.id,
        answer: "",
      }))
    );
  }, [journalQuestions, journalSessionId, journalTags]);

  const syncResponsesFromSession = useCallback(
    (state: ReflectionSessionState) => {
      setResponses((prev) =>
        prev.map((entry) => {
          const matchingQuestion = journalQuestions.find(
            (question) => question.id === entry.id
          );
          const savedResponse = state.responses.find(
            (response) =>
              response.step_number === matchingQuestion?.step_number
          );

          return savedResponse
            ? { ...entry, answer: savedResponse.answer }
            : entry;
        })
      );
    },
    [journalQuestions]
  );

  const syncPromptFromSession = useCallback(
    (state: ReflectionSessionState) => {
      // After each save, trust the backend's current_question/current_step to
      // decide which prompt should become editable next.
      if (state.current_question) {
        const nextQuestionIndex = journalQuestions.findIndex(
          (question) =>
            question.id === state.current_question?.id ||
            question.step_number === state.current_question?.step_number
        );

        if (nextQuestionIndex >= 0) {
          setStepIndex(nextQuestionIndex);
          return;
        }
      }

      const fallbackIndex = Math.max(0, (state.current_step ?? 1) - 1);
      setStepIndex(Math.min(fallbackIndex, journalQuestions.length - 1));
    },
    [journalQuestions]
  );

  useEffect(() => {
    if (!journalSessionId || !journalQuestions.length) {
      setHydratingSession(false);
      return;
    }

    let active = true;

    const hydrateSession = async () => {
      setHydratingSession(true);
      try {
        const response = await getReflectionSession(journalSessionId);
        if (!active || !response?.data) {
          return;
        }

        // Resume starts by restoring all saved answers, then intentionally
        // returns the user to the first question instead of jumping straight to
        // the current editable step.
        setSessionState(response.data);
        syncResponsesFromSession(response.data);
        setStepIndex(0);
      } catch (error) {
        console.log("Failed to hydrate reflection session:", error);
        toast.show({
          variant: "error",
          title: "Unable to resume reflection",
          message: "We couldn’t restore your saved session right now.",
        });
      } finally {
        if (active) {
          setHydratingSession(false);
        }
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, [
    journalQuestions.length,
    journalSessionId,
    syncResponsesFromSession,
    toast,
  ]);

  const updateResponse = (value: string) => {
    if (!isCurrentStepEditable) {
      return;
    }

    setResponses((prev) =>
      prev.map((entry, index) =>
        entry.id === currentStep?.id || (!currentStep && index === stepIndex)
          ? { ...entry, answer: value }
          : entry
      )
    );
  };

  const buildSummary = () =>
    responses
      .map((response) => response.answer.trim())
      .filter(Boolean)
      .join(" · ");

  // Completion forwards a lightweight fallback summary, but the review screen
  // can still refresh itself from session detail after navigation.
  const handleCompletionSuccess = (
    result: ReflectionSessionCompleteResponse,
    fallbackQuestionCount: number
  ) => {
    router.replace({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_SUBMISSION,
      params: {
        journalId: String(journalTemplateId),
        journalSessionId: String(result.data?.id ?? journalSessionId ?? ""),
        journalTitle,
        journalSummary:
          buildSummary() || "This reflection has been saved to your archive.",
        journalTags: journalTags.join(","),
        journalThemeTag: selectedTag,
        questionCount: String(
          result.data?.total_steps ?? fallbackQuestionCount
        ),
        sealedAtLabel: format(new Date(), "MMM dd, yyyy").toUpperCase(),
      },
    });
  };

  const handleCompleteSession = async (
    fallbackQuestionCount: number
  ) => {
    if (!journalSessionId) {
      toast.show({
        variant: "error",
        title: "Session unavailable",
        message: "We couldn’t complete this reflection session.",
      });
      return;
    }

    const result = await completeReflectionSession(journalSessionId);
    if (result?.success === false || result?.status === "error") {
      toast.show({
        variant: "error",
        title: "Unable to complete reflection",
        message: result?.message || "Please try again in a moment.",
      });
      return;
    }

    handleCompletionSuccess(result, fallbackQuestionCount);
  };

  const handleStepSaveSuccess = (result: ReflectionStepSaveResponse) => {
    if (result.data) {
      setSessionState(result.data);
      syncResponsesFromSession(result.data);
      syncPromptFromSession(result.data);
    }
  };

  const handleSaveCurrentStep = async () => {
    if (submitting) return;

    if (!journalTemplateId || !journalSessionId) {
      toast.show({
        variant: "error",
        title: "Reflection not ready",
        message: "We couldn’t start this reflection session correctly.",
      });
      return;
    }

    if (!currentStep) {
      toast.show({
        variant: "error",
        title: "Step unavailable",
        message: "This reflection step could not be loaded.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await saveReflectionSessionStep(
        journalSessionId,
        currentStep.step_number,
        {
          answer: currentResponse.trim(),
        }
      );

      if (result?.success === false || result?.status === "error") {
        toast.show({
          variant: "error",
          title: "Unable to save reflection",
          message: result?.message || "Please try again in a moment.",
        });
        return;
      }

      // Every successful save refreshes server-driven session state so the next
      // prompt and resume metadata stay aligned with the backend.
      handleStepSaveSuccess(result);
      if (isLastStep) {
        await handleCompleteSession(
          result.data?.total_steps ?? journalQuestions.length
        );
      }
    } catch (error) {
      console.log("Reflection session request failed:", error);
      toast.show({
        variant: "error",
        title: "Network error",
        message: isLastStep
          ? "We couldn’t complete this reflection right now."
          : "We couldn’t save this reflection step right now.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isReviewingSavedStep) {
      // Saved review steps do not post again; they only advance until the first
      // editable question is reached.
      setStepIndex((prev) =>
        Math.min(prev + 1, Math.max(journalQuestions.length - 1, 0))
      );
      return;
    }

    if (!canAdvance) return;
    await handleSaveCurrentStep();
  };

  const handleJumpToList = () => {
    router.replace(ROUTES.AUTH.SELF_CARE_REFLECTIONS);
  };

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.root}>
            <AppHeader
              title={journalTitle}
              subtitle="Follow the prompt, then complete the reflection."
              onBack={() => router.back()}
              rightAction={{
                icon: "list-outline",
                accessibilityLabel: "Back to reflection library",
                onPress: handleJumpToList,
              }}
              containerStyle={styles.header}
            />

            {hydratingSession ? (
              <View style={styles.hydrationState}>
                <ActivityIndicator size="large" color={theme.accent} />
                <Text style={styles.hydrationTitle}>Restoring your session...</Text>
                <Text style={styles.hydrationText}>
                  Loading your saved answers and returning you to the current step.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: insets.bottom + spacing.xl * 2.5 },
                ]}
              >
                <View style={styles.progressBlock}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>
                      QUESTION {String(resolvedStepNumber).padStart(2, "0")}
                    </Text>
                    <Text style={styles.progressValue}>
                      {Math.round(
                        (resolvedStepNumber / Math.max(resolvedTotalSteps, 1)) * 100
                      )}
                      %
                    </Text>
                  </View>
                  <ProgressBar
                    progress={resolvedStepNumber / Math.max(resolvedTotalSteps, 1)}
                    color={theme.accent}
                    style={styles.progressBar}
                  />
                </View>

                <View style={styles.promptCard}>
                  <View style={styles.promptHeaderRow}>
                    <Text style={styles.promptEyebrow}>GUIDED REFLECTION</Text>
                    <Ionicons
                      name="sparkles-outline"
                      size={18}
                      color={theme.accent}
                    />
                  </View>

                  <Text style={styles.promptQuestion}>
                    {currentStep?.text ?? "This reflection step is unavailable."}
                  </Text>

                  {!!journalDescription && resolvedStepNumber === 1 && (
                    <Text style={styles.promptContext} numberOfLines={2}>
                      {journalDescription}
                    </Text>
                  )}

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>WRITE YOUR REFLECTION</Text>
                    {isReviewingSavedStep ? (
                      <Text style={styles.reviewHint}>
                        Saved answer from this session. Continue to reach the next
                        editable step.
                      </Text>
                    ) : null}
                    <TextInput
                      value={currentResponse}
                      onChangeText={updateResponse}
                      placeholder="Let the thought arrive in its own words..."
                      placeholderTextColor={theme.textSecondary}
                      style={[
                        styles.bodyInput,
                        isReviewingSavedStep && styles.bodyInputReadonly,
                      ]}
                      multiline
                      textAlignVertical="top"
                      editable={isCurrentStepEditable}
                    />
                  </View>
                </View>

                <View style={styles.tagsBlock}>
                  <PillFilters
                    options={presetTags.map((tag) => ({
                      label: `#${tag}`,
                      value: tag,
                    }))}
                    selectedValue={selectedTag}
                    onChange={setSelectedTag}
                    scrollable={false}
                    contentContainerStyle={styles.tagsWrap}
                    selectedPillStyle={styles.tagActive}
                    inactivePillStyle={styles.tagInactive}
                    selectedLabelStyle={styles.tagLabelActive}
                    inactiveLabelStyle={styles.tagLabelInactive}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isLastStep ? "Complete Reflection" : "Next Question"
                  }
                  onPress={handleNext}
                  disabled={!canAdvance || submitting}
                  style={({ pressed }) => [
                    styles.actionButton,
                    (!canAdvance || submitting) && styles.actionButtonDisabled,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  {submitting ? (
                    <>
                      <ActivityIndicator color={theme.background} />
                      <Text style={styles.actionButtonText}>
                        {isLastStep ? "Completing Reflection" : "Saving Reflection"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name={isLastStep ? "bookmark-outline" : "arrow-forward"}
                        size={18}
                        color={theme.background}
                      />
                      <Text style={styles.actionButtonText}>
                        {isLastStep ? "Complete Reflection" : "Next Question"}
                      </Text>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenView>
  );
}

const styling = (theme: any, spacing: any, typography: any) =>
  StyleSheet.create({
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    safeArea: {
      flex: 1,
    },
    keyboard: {
      flex: 1,
    },
    root: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.md,
    },
    hydrationState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    hydrationTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      textAlign: "center",
    },
    hydrationText: {
      ...typography.body,
      color: theme.textSecondary,
      textAlign: "center",
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    progressBlock: {
      marginBottom: spacing.md,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressLabel: {
      ...typography.smallCaption,
      letterSpacing: 2.4,
      color: theme.textSecondary,
    },
    progressValue: {
      ...typography.caption,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    progressBar: {
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
    },
    promptCard: {
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    promptHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    promptEyebrow: {
      ...typography.smallCaption,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color: theme.textSecondary,
    },
    promptQuestion: {
      ...typography.h2,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: theme.textPrimary,
    },
    promptContext: {
      marginTop: 10,
      ...typography.body,
      color: theme.textSecondary,
    },
    fieldBlock: {
      marginTop: 18,
    },
    fieldLabel: {
      ...typography.smallCaption,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      marginBottom: 10,
      textTransform: "uppercase",
    },
    bodyInput: {
      minHeight: 180,
      borderRadius: 22,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 16,
      paddingVertical: 14,
      ...typography.body,
      lineHeight: 25,
      color: theme.textPrimary,
    },
    bodyInputReadonly: {
      opacity: 0.8,
      backgroundColor: theme.surface,
    },
    reviewHint: {
      ...typography.caption,
      color: theme.textSecondary,
      marginBottom: 10,
    },
    tagsBlock: {
      marginTop: spacing.lg,
    },
    tagsWrap: {
      gap: 10,
    },
    tagInactive: {
      backgroundColor: theme.surface,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    tagActive: {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.accent,
    },
    tagLabelInactive: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.1,
    },
    tagLabelActive: {
      ...typography.smallCaption,
      color: theme.textPrimary,
      letterSpacing: 1.1,
    },
    actionButton: {
      marginTop: spacing.xl,
      minHeight: 58,
      borderRadius: 18,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 12,
      shadowColor: theme.accent,
      shadowOpacity: 0.22,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    actionButtonPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    actionButtonDisabled: {
      opacity: 0.55,
    },
    actionButtonText: {
      ...typography.button,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: theme.background,
    },
  });
