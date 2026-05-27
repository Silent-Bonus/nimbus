import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import ProcessingModal from "@/components/ui/modal/ProcessingModal";

import { FALLBACK_SESSION_FEEDBACK_QUESTIONS } from "../data/mockQuestions";
import {
  serializeSessionFeedbackAnswers,
  submitSessionFeedbackAnswers,
} from "../services/sessionFeedbackService";
import type {
  SessionFeedbackAnswersMap,
  SessionFeedbackQuestion,
} from "../types";
import SessionFeedbackOptionCard from "./SessionFeedbackOptionCard";

type SessionFeedbackModalProps = {
  visible: boolean;
  source: string;
  onClose: () => void;
  onComplete?: () => void;
  sessionTitle?: string;
};

const TOTAL_STEPS = FALLBACK_SESSION_FEEDBACK_QUESTIONS.length;

export default function SessionFeedbackModal({
  visible,
  source,
  onClose,
  onComplete,
  sessionTitle,
}: SessionFeedbackModalProps) {
  const insets = useSafeAreaInsets();
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);

  const accentColor = svaColors.brand.primary;
  const styles = useMemo(
    () =>
      makeStyles(
        svaColors,
        svaTypography,
        spacing,
        insets.top,
        insets.bottom
      ),
    [insets.bottom, insets.top, spacing, svaColors, svaTypography]
  );

  const [questions, setQuestions] = useState<SessionFeedbackQuestion[]>(
    FALLBACK_SESSION_FEEDBACK_QUESTIONS
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SessionFeedbackAnswersMap>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentAnim = useRef(new Animated.Value(1)).current;
  const hasRequestedCloseRef = useRef(false);

  const resetFlow = useCallback(() => {
    setQuestions(FALLBACK_SESSION_FEEDBACK_QUESTIONS);
    setCurrentStep(0);
    setAnswers({});
    setSubmitError("");
    setIsSubmitting(false);
    hasRequestedCloseRef.current = false;
    contentAnim.setValue(1);
  }, [contentAnim]);

  useEffect(() => {
    if (!visible) {
      resetFlow();
      return;
    }

    setQuestions(FALLBACK_SESSION_FEEDBACK_QUESTIONS);
    setCurrentStep(0);
    setAnswers({});
    setSubmitError("");
    setIsSubmitting(false);
    hasRequestedCloseRef.current = false;
    contentAnim.setValue(1);
  }, [contentAnim, resetFlow, visible]);

  useEffect(() => {
    if (!visible) return;

    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [contentAnim, currentStep, visible]);

  const currentQuestion = questions[currentStep];
  const stepNumber = currentStep + 1;
  const totalSteps = questions.length || TOTAL_STEPS;
  const progress = Math.min(stepNumber / totalSteps, 1);
  const progressLabel = `${Math.round(progress * 100)}%`;
  const isLastStep = currentStep === totalSteps - 1;

  const setSingleAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSubmitError("");
  }, []);

  const toggleMultiAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      const list = Array.isArray(current) ? current : [];
      const next = list.includes(value)
        ? list.filter((entry) => entry !== value)
        : [...list, value];

      return { ...prev, [questionId]: next };
    });

    setSubmitError("");
  }, []);

  const isQuestionValid = useCallback(
    (question: SessionFeedbackQuestion) => {
      const value = answers[question.id];

      if (question.selectionMode === "multiple") {
        return Array.isArray(value) && value.length > 0;
      }

      return typeof value === "string" && value.trim().length > 0;
    },
    [answers]
  );

  const currentQuestionValid = currentQuestion
    ? isQuestionValid(currentQuestion)
    : false;
  const currentQuestionAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const goBack = useCallback(() => {
    if (isSubmitting) return;

    if (currentStep > 0) {
      setSubmitError("");
      setCurrentStep((value) => Math.max(0, value - 1));
      return;
    }

    if (hasRequestedCloseRef.current) return;
    hasRequestedCloseRef.current = true;
    onClose();
  }, [currentStep, isSubmitting, onClose]);

  const submit = useCallback(async () => {
    if (isSubmitting) return;

    const payload = serializeSessionFeedbackAnswers(answers);
    if (!Object.keys(payload).length) {
      setSubmitError("Please answer at least one question before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await submitSessionFeedbackAnswers(source, payload);
      if (response && response.success === false) {
        throw new Error(
          response?.message ?? "Unable to submit your reflection right now."
        );
      }

      setIsSubmitting(false);
      onClose();
      onComplete?.();
    } catch (error: any) {
      setIsSubmitting(false);
      setSubmitError(
        error?.message ??
          error?.response?.data?.message ??
          "Unable to submit your reflection right now."
      );
    }
  }, [answers, isSubmitting, onClose, onComplete, source]);

  const goNext = useCallback(() => {
    if (!currentQuestion) return;

    if (!isQuestionValid(currentQuestion)) {
      setSubmitError("Please select at least one option to continue.");
      return;
    }

    setSubmitError("");

    if (currentStep < totalSteps - 1) {
      setCurrentStep((value) => value + 1);
      return;
    }

    void submit();
  }, [currentQuestion, currentStep, isQuestionValid, submit, totalSteps]);

  const handleOptionPress = useCallback(
    (questionId: number, value: string) => {
      if (!currentQuestion) return;

      if (currentQuestion.selectionMode === "multiple") {
        toggleMultiAnswer(questionId, value);
        return;
      }

      setSingleAnswer(questionId, value);
    },
    [currentQuestion, setSingleAnswer, toggleMultiAnswer]
  );

  const renderHeadline = (question: SessionFeedbackQuestion) => (
    <Text style={styles.questionTitle}>
      {question.prefix}
      {question.accent ? (
        <>
          {"\n"}
          <Text style={styles.questionAccent}>{question.accent}</Text>
        </>
      ) : null}
    </Text>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={goBack}
    >
      <View style={styles.root}>
        <View style={styles.backdrop} />
        <View style={styles.glowTopLeft} />
        <View style={styles.glowBottomRight} />

        <View style={styles.contentShell}>
          {currentQuestion ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <Animated.View
                  style={[
                    styles.inner,
                    {
                      opacity: contentAnim,
                      transform: [
                        {
                          translateY: contentAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.topRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={currentStep > 0 ? "Previous question" : "Close feedback"}
                      onPress={goBack}
                      style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.backButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color={svaColors.text.primary}
                      />
                    </Pressable>

                    <View style={styles.stepMeta}>
                      <View style={styles.stepLabelRow}>
                        <Text style={styles.stepLabel}>
                          STEP {stepNumber} OF {totalSteps}
                        </Text>
                        <Text style={styles.percentLabel}>{progressLabel}</Text>
                      </View>

                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress * 100}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.titleBlock}>
                    {renderHeadline(currentQuestion)}
                    {!!currentQuestion.subtitle ? (
                      <Text style={styles.subtitle}>
                        {currentQuestion.subtitle}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.optionsBlock,
                      currentQuestion.layout === "grid" && styles.gridOptionsBlock,
                    ]}
                  >
                    {currentQuestion.options.map((option) => {
                      const isSelected = Array.isArray(currentQuestionAnswer)
                        ? currentQuestionAnswer.includes(option.id)
                        : currentQuestionAnswer === option.id;

                      return (
                        <View
                          key={option.id}
                          style={
                            currentQuestion.layout === "grid"
                              ? styles.gridOptionWrap
                              : styles.listOptionWrap
                          }
                        >
                          <SessionFeedbackOptionCard
                            option={option}
                            selected={isSelected}
                            layout={currentQuestion.layout}
                            accentColor={accentColor}
                            onPress={() =>
                              handleOptionPress(currentQuestion.id, option.id)
                            }
                          />
                        </View>
                      );
                    })}
                  </View>

                  {!!submitError ? (
                    <View style={styles.errorPill}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={svaColors.state.error}
                      />
                      <Text style={styles.errorText}>{submitError}</Text>
                    </View>
                  ) : null}
                </Animated.View>
              </ScrollView>

              <View style={styles.ctaShell} pointerEvents="box-none">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isLastStep ? "Complete discovery" : "Continue discovery"
                  }
                  disabled={!currentQuestionValid || isSubmitting}
                  onPress={goNext}
                  style={({ pressed }) => [
                    styles.ctaButton,
                    (!currentQuestionValid || isSubmitting) && styles.ctaDisabled,
                    pressed && currentQuestionValid && !isSubmitting && styles.ctaPressed,
                  ]}
                >
                  <Text style={styles.ctaText}>
                    {isLastStep ? "Complete Discovery" : "Continue Discovery"}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={svaColors.text.primary}
                  />
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyOrb}>
                <Ionicons
                  name="sparkles-outline"
                  size={28}
                  color={accentColor}
                />
              </View>
              <Text style={styles.emptyTitle}>No questions available</Text>
              <Text style={styles.emptySubtitle}>
                We could not load a reflection set for this session right now.
              </Text>
            </View>
          )}

          <ProcessingModal
            visible={isSubmitting}
            titlePrefix="Crafting your"
            titleAccent="unique rhythm..."
            subtitle="Our AI is aligning your intentions with our soulful tools"
            iconName="cloud-outline"
            accentColor={accentColor}
          />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (
  t: any,
  svaTypography: any,
  spacing: any,
  topInset: number,
  bottomInset: number
) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg.base,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(6, 8, 12, 0.90)",
    },
    glowTopLeft: {
      position: "absolute",
      top: topInset - 24,
      left: -100,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: "rgba(163,190,140,0.10)",
    },
    glowBottomRight: {
      position: "absolute",
      right: -120,
      bottom: bottomInset - 44,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: "rgba(163,190,140,0.06)",
    },
    contentShell: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: topInset + 12,
      paddingBottom: bottomInset + 16,
      justifyContent: "space-between",
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 118,
    },
    inner: {
      flex: 1,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.03)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    backButtonPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.92,
    },
    stepMeta: {
      flex: 1,
      paddingTop: 2,
    },
    stepLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    stepLabel: {
      fontFamily:
        svaTypography?.textStyle?.authTinyLabel?.fontFamily ?? "Inter_600SemiBold",
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 2.8,
      color: t.brand.primary,
      textTransform: "uppercase",
    },
    percentLabel: {
      fontFamily:
        svaTypography?.textStyle?.authTinyLabel?.fontFamily ?? "Inter_600SemiBold",
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.4,
      color: t.text.secondary,
    },
    progressTrack: {
      width: "100%",
      height: 3,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: t.brand.primary,
    },
    titleBlock: {
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
    questionTitle: {
      fontFamily:
        svaTypography?.textStyle?.displayMedium?.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 36,
      lineHeight: 38,
      letterSpacing: -0.4,
      color: t.text.primary,
    },
    questionAccent: {
      color: t.brand.primary,
      fontStyle: "italic",
    },
    subtitle: {
      fontFamily:
        svaTypography?.textStyle?.authSubtitle?.fontFamily ??
        "Inter_400Regular",
      fontSize: 14,
      lineHeight: 22,
      color: t.text.secondary,
      marginTop: 12,
      maxWidth: 310,
    },
    optionsBlock: {
      gap: spacing.md,
    },
    listOptionWrap: {
      width: "100%",
    },
    gridOptionsBlock: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "stretch",
      gap: 0,
    },
    gridOptionWrap: {
      width: "47%",
      flexBasis: "47%",
      maxWidth: "47%",
      flexGrow: 0,
      flexShrink: 0,
      marginBottom: spacing.md,
    },
    errorPill: {
      marginTop: spacing.lg,
      borderRadius: 18,
      backgroundColor: "rgba(191,97,106,0.10)",
      borderWidth: 1,
      borderColor: "rgba(191,97,106,0.18)",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    errorText: {
      fontFamily:
        svaTypography?.textStyle?.authBody?.fontFamily ?? "Inter_400Regular",
      fontSize: 13,
      lineHeight: 18,
      color: t.state.error,
      flex: 1,
    },
    ctaShell: {
      position: "absolute",
      left: 18,
      right: 18,
      bottom: bottomInset + 14,
      borderRadius: 24,
    },
    ctaButton: {
      minHeight: 58,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.18)",
      backgroundColor: "rgba(163,190,140,0.10)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 22,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 3,
    },
    ctaDisabled: {
      opacity: 0.42,
    },
    ctaPressed: {
      transform: [{ scale: 0.99 }],
    },
    ctaText: {
      fontFamily:
        svaTypography?.textStyle?.button?.fontFamily ?? "Inter_600SemiBold",
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0.4,
      color: t.text.primary,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    emptyOrb: {
      width: 108,
      height: 108,
      borderRadius: 54,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(163,190,140,0.08)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.16)",
    },
    emptyTitle: {
      fontFamily:
        svaTypography?.textStyle?.displayMedium?.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 28,
      lineHeight: 32,
      color: t.text.primary,
      textAlign: "center",
      marginTop: 20,
    },
    emptySubtitle: {
      fontFamily:
        svaTypography?.textStyle?.authSubtitle?.fontFamily ??
        "Inter_400Regular",
      fontSize: 14,
      lineHeight: 20,
      color: t.text.secondary,
      textAlign: "center",
      marginTop: 10,
      maxWidth: 280,
    },
  });
