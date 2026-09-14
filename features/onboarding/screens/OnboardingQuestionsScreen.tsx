import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

import ThemeContext from "@/contexts/ThemeContext";
import { StyledButton } from "@/components/ui/StyledButton";
import TimeInput from "@/components/ui/picker/TimeInput";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { StoreKey } from "@/constants/Constant";
import { fromHHmm, toHHmm } from "@/utils/date-time";

import OnboardingHeader from "../components/OnboardingHeader";
import ChoiceItem from "../components/ChoiceItem";
import {
  buildDoshaResponseItem,
  buildDoshaAssessmentPayload,
  buildOnboardingAnswersPayload,
  DoshaOption,
  DoshaQuestion,
  DoshaResponseItem,
  fetchPersonaQuestions,
  fetchDoshaQuestions,
  submitPersonaAnswers,
  submitDoshaAssessment,
} from "../services/onboardingService";

function normalizeTimeValue(value: unknown): string | null {
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

function getDefaultTime(
  question: DoshaQuestion,
  userProfile: ReturnType<typeof useAuth>["userProfile"]
) {
  const inputs = userProfile?.vitals_context?.inputs;
  const prefill = userProfile?.vitals_context?.prefill;
  const configuredValue =
    question.id === 2
      ? inputs?.start_of_day ?? prefill?.start_of_day
      : question.id === 3
        ? inputs?.sleep_time ?? prefill?.sleep_time
        : undefined;
  const fallback = question.id === 3 ? "22:30" : "06:30";

  return normalizeTimeValue(configuredValue) ?? fallback;
}

export const OnboardingQuestionsScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { svaColors, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, svaTypography, insets.top, insets.bottom),
    [insets.bottom, insets.top, svaColors, svaTypography]
  );

  const { resetToPublic, markOnboardingDone, getUserDetails, userProfile } =
    useAuth();

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState<DoshaQuestion[]>([]);
  const [questionSet, setQuestionSet] = useState<"profile" | "dosha">("profile");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, DoshaResponseItem>>(
    {}
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [timePickerValue, setTimePickerValue] = useState(() => new Date());

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentQuestionId = currentQuestion?.id;

  useEffect(() => {
    const answer = currentQuestionId
      ? responses[currentQuestionId]?.selected_option
      : undefined;
    const defaultTime = currentQuestion
      ? getDefaultTime(currentQuestion, userProfile)
      : "06:30";
    setTextAnswer(
      typeof answer === "string"
        ? answer
        : currentQuestion?.type === "time"
          ? defaultTime
          : ""
    );
    setTimePickerValue(
      typeof answer === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(answer)
        ? fromHHmm(answer)
        : fromHHmm(defaultTime)
    );
  }, [currentQuestion, currentQuestionId, responses, userProfile]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const loadQuestions = useCallback(async () => {
    try {
      setLoadingQuestions(true);
      setErrorMessage("");

      const res = await fetchPersonaQuestions();

      if (Array.isArray(res?.data) && res.data.length > 0) {
        setQuestionSet("profile");
        setQuestions(res.data);
        setCurrentIndex(0);
        setResponses({});
        return true;
      }

      setQuestions([]);
      setErrorMessage(
        res?.message ?? "Unable to load onboarding questions. Please try again."
      );
      return false;
    } catch (error: any) {
      setQuestions([]);
      setErrorMessage(
        typeof error?.message === "string"
          ? error.message
          : "Unable to load onboarding questions. Please try again."
      );
      return false;
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  const loadDoshaQuestions = useCallback(async () => {
    try {
      setLoadingQuestions(true);
      setErrorMessage("");

      const res = await fetchDoshaQuestions();

      if (Array.isArray(res?.data) && res.data.length > 0) {
        setQuestionSet("dosha");
        setQuestions(res.data);
        setCurrentIndex(0);
        setResponses({});
        return true;
      }

      setQuestions([]);
      setErrorMessage(
        res?.message ?? "Unable to load Dosha questions. Please try again."
      );
      return false;
    } catch (error: any) {
      setQuestions([]);
      setErrorMessage(
        typeof error?.message === "string"
          ? error.message
          : "Unable to load Dosha questions. Please try again."
      );
      return false;
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    void loadDoshaQuestions();
  }, [loadDoshaQuestions]);

  const handleBack = useCallback(async () => {
    setErrorMessage("");

    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
      setAdvancing(false);
    }

    if (currentIndex > 0) {
      setCurrentIndex((value) => Math.max(0, value - 1));
      return;
    }

    await resetToPublic?.();
  }, [currentIndex, resetToPublic]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      void handleBack();
      return true;
    });

    return () => sub.remove();
  }, [handleBack]);

  const finishOnboarding = useCallback(
    async (finalResponses: Record<number, DoshaResponseItem>) => {
      try {
        setSubmitting(true);
        setAdvancing(false);
        setErrorMessage("");

        const res =
          questionSet === "profile"
            ? await submitPersonaAnswers(
                buildOnboardingAnswersPayload(questions, finalResponses)
              )
            : await submitDoshaAssessment(
                buildDoshaAssessmentPayload(questions, finalResponses)
              );

        if (!res?.success) {
          setErrorMessage(
            res?.message ?? "Unable to submit your answers. Please try again."
          );
          return;
        }

        if (questionSet === "dosha") {
          await SecureStore.setItemAsync(
            StoreKey.DOSHA_ASSESSMENT_RESULT_KEY,
            JSON.stringify(res?.data?.result ?? res?.data ?? {})
          );
          const profileLoaded = await loadQuestions();
          if (!profileLoaded) return;
          return;
        }

        await SecureStore.setItemAsync(StoreKey.TUTORIAL_PENDING_KEY, "true");

        try {
          await getUserDetails?.();
        } catch {
          // Non-blocking: the questionnaire result is already saved.
        }

        await markOnboardingDone?.();
        router.replace(ROUTES.AUTH.SUCCESS_STATE);
      } catch (error: any) {
        setErrorMessage(
          typeof error?.message === "string"
            ? error.message
            : "Unable to submit your answers. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      getUserDetails,
      loadQuestions,
      markOnboardingDone,
      questionSet,
      questions,
      router,
    ]
  );

  const scheduleNextQuestion = useCallback((nextIndex: number) => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }

    setAdvancing(true);
    advanceTimerRef.current = setTimeout(() => {
      setCurrentIndex(nextIndex);
      setAdvancing(false);
      advanceTimerRef.current = null;
    }, 140);
  }, []);

  const handleOptionPress = useCallback(
    (option: DoshaOption) => {
      if (!currentQuestion || advancing || submitting) return;

      if (currentQuestion.type === "multiple") {
        const currentAnswer = responses[currentQuestion.id]?.selected_option;
        const selectedIds = Array.isArray(currentAnswer)
          ? currentAnswer
          : currentAnswer
            ? [currentAnswer]
            : [];
        const nextSelectedIds = selectedIds.includes(option.id)
          ? selectedIds.filter((id) => id !== option.id)
          : [...selectedIds, option.id];
        const updatedResponses = {
          ...responses,
          [currentQuestion.id]: {
            question_id: currentQuestion.id,
            selected_option: nextSelectedIds,
            score_weight: { vata: 0, pitta: 0, kapha: 0 },
          },
        };

        setResponses(updatedResponses);
        setErrorMessage("");
        return;
      }

      const nextResponse = buildDoshaResponseItem(currentQuestion, option);
      const updatedResponses = {
        ...responses,
        [currentQuestion.id]: nextResponse,
      };

      setResponses(updatedResponses);
      setErrorMessage("");

      if (currentIndex >= totalQuestions - 1) {
        return;
      }

      scheduleNextQuestion(currentIndex + 1);
    },
    [
      advancing,
      currentIndex,
      currentQuestion,
      responses,
      scheduleNextQuestion,
      submitting,
      totalQuestions,
    ]
  );

  const handleContinue = useCallback(() => {
    if (!currentQuestion || advancing || submitting) return;

    if (currentQuestion.type === "multiple") {
      const selected = responses[currentQuestion.id]?.selected_option;
      if (!Array.isArray(selected) || selected.length === 0) {
        setErrorMessage("Select at least one option to continue.");
        return;
      }

      const updatedResponses = { ...responses };
      if (currentIndex >= totalQuestions - 1) {
        void finishOnboarding(updatedResponses);
      } else {
        scheduleNextQuestion(currentIndex + 1);
      }
      return;
    }

    if (currentQuestion.type === "single") {
      const selected = responses[currentQuestion.id]?.selected_option;
      if (typeof selected !== "string" || !selected) {
        setErrorMessage("Select an option to continue.");
        return;
      }

      if (currentIndex >= totalQuestions - 1) {
        void finishOnboarding(responses);
      } else {
        scheduleNextQuestion(currentIndex + 1);
      }
      return;
    }

    const value = textAnswer.trim();
    if (currentQuestion.type === "time" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
      setErrorMessage("Enter a valid time in HH:MM format.");
      return;
    }
    if (currentQuestion.type === "number" && !/^\d+$/.test(value)) {
      setErrorMessage("Enter a whole number to continue.");
      return;
    }

    const updatedResponses = {
      ...responses,
      [currentQuestion.id]: {
        question_id: currentQuestion.id,
        selected_option: value,
        score_weight: { vata: 0, pitta: 0, kapha: 0 },
      },
    };

    setResponses(updatedResponses);
    setErrorMessage("");

    if (currentIndex >= totalQuestions - 1) {
      void finishOnboarding(updatedResponses);
    } else {
      scheduleNextQuestion(currentIndex + 1);
    }
  }, [
    advancing,
    currentIndex,
    currentQuestion,
    finishOnboarding,
    responses,
    scheduleNextQuestion,
    submitting,
    textAnswer,
    totalQuestions,
  ]);

  if (loadingQuestions) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={svaColors.brand.primary} />
          <Text style={styles.loadingTitle}>Loading your alignment</Text>
          <Text style={styles.loadingSubtitle}>
            We&apos;re preparing your 17-step dosha check-in.
          </Text>
        </View>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>No onboarding questions found.</Text>
          <Text style={styles.errorSubtitle}>
            {errorMessage || "Please retry to fetch the questionnaire."}
          </Text>

          <StyledButton label="Try again" onPress={() => void loadQuestions()} />

          <Pressable
            accessibilityRole="button"
            onPress={() => void resetToPublic?.()}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>Back to sign in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const selectedAnswer = responses[currentQuestion.id]?.selected_option;
  const selectedOptionIds = Array.isArray(selectedAnswer)
    ? selectedAnswer
    : selectedAnswer
      ? [selectedAnswer]
      : [];
  const isTextQuestion =
    currentQuestion.type === "time" || currentQuestion.type === "number";
  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.glowOne} />
      <View pointerEvents="none" style={styles.glowTwo} />

      <View style={styles.fixedHeader}>
        <OnboardingHeader
          step={currentIndex + 1}
          totalSteps={totalQuestions}
          onBack={currentIndex > 0 ? handleBack : undefined}
        />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {currentQuestion.category ??
                (questionSet === "dosha" ? "Dosha" : "Onboarding")}
            </Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {!!currentQuestion.subtitle && (
            <Text style={styles.questionSubtitle}>
              {currentQuestion.subtitle}
            </Text>
          )}

          {!currentQuestion.subtitle && (
            <Text style={styles.helperText}>
              Choose the option that feels most natural right now.
            </Text>
          )}
        </View>

        {!!errorMessage && (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{errorMessage}</Text>
          </View>
        )}

        {currentQuestion.type === "time" ? (
          <View style={styles.inputWrap}>
            <TimeInput
              label=""
              value={timePickerValue}
              title={currentQuestion.question}
              is24Hour
              onChange={(value) => {
                setTimePickerValue(value);
                setTextAnswer(toHHmm(value));
                if (errorMessage) setErrorMessage("");
              }}
            />
            <StyledButton
              label={currentIndex === totalQuestions - 1 ? "Submit" : "Continue"}
              onPress={handleContinue}
              disabled={advancing || submitting}
            />
          </View>
        ) : isTextQuestion ? (
          <View style={styles.inputWrap}>
            <TextInput
              value={textAnswer}
              onChangeText={(value) => {
                const sanitized = value.replace(/\D/g, "");
                setTextAnswer(sanitized);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Enter a number"
              placeholderTextColor={svaColors.text.secondary}
              keyboardType="numeric"
              style={styles.answerInput}
            />
            <StyledButton
              label={currentIndex === totalQuestions - 1 ? "Submit" : "Continue"}
              onPress={handleContinue}
              disabled={advancing || submitting}
            />
          </View>
        ) : (
          <View style={styles.optionsWrap}>
            {currentQuestion.options.map((option) => (
              <ChoiceItem
                key={option.id}
                choice={option}
                selected={selectedOptionIds.includes(option.id)}
                onPress={() => handleOptionPress(option)}
              />
            ))}
            {(currentQuestion.type === "multiple" ||
              currentIndex === totalQuestions - 1) && (
              <StyledButton
                label={
                  currentIndex === totalQuestions - 1 ? "Submit" : "Continue"
                }
                onPress={handleContinue}
                disabled={advancing || submitting}
              />
            )}
          </View>
        )}

        <Text style={styles.footerHint}>
          {currentQuestion.type === "single"
            ? "Tap one option and we'll automatically continue to the next question."
            : currentQuestion.type === "multiple"
              ? "Select all options that apply, then continue."
              : currentQuestion.type === "time"
                ? "Use 24-hour HH:MM format."
                : "Enter numbers only."}
        </Text>
      </ScrollView>

      {submitting && (
        <View style={styles.submittingOverlay}>
          <View style={styles.submittingCard}>
            <ActivityIndicator color={svaColors.brand.primary} />
            <Text style={styles.submittingTitle}>Saving your responses</Text>
            <Text style={styles.submittingSubtitle}>
              {questionSet === "profile"
                ? "Preparing your Dosha questions."
                : "We&apos;re creating your Dosha profile."}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styling = (
  svaColors: any,
  svaTypography: any,
  safeTop: number,
  safeBottom: number
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: svaColors.bg.base,
    },
    glowOne: {
      position: "absolute",
      top: safeTop - 16,
      right: -72,
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: svaColors.brand.subtle,
      opacity: 0.7,
    },
    glowTwo: {
      position: "absolute",
      bottom: safeBottom + 40,
      left: -88,
      width: 240,
      height: 240,
      borderRadius: 999,
      backgroundColor: svaColors.surface.raised,
      opacity: 0.45,
    },
    fixedHeader: {
      paddingTop: safeTop + 12,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: svaColors.bg.base,
      zIndex: 2,
      elevation: 2,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: safeBottom + 28,
    },
    scrollArea: {
      flex: 1,
    },
    heroBlock: {
      marginTop: 28,
      marginBottom: 22,
      padding: 20,
      borderRadius: 28,
      backgroundColor: svaColors.surface.raised,
      borderWidth: 1,
      borderColor: svaColors.border.muted,
    },
    categoryPill: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: svaColors.brand.subtle,
      borderWidth: 1,
      borderColor: svaColors.border.subtle,
      marginBottom: 16,
    },
    categoryText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: svaColors.brand.primary,
      textTransform: "uppercase",
    },
    questionText: {
      ...svaTypography.textStyle.authTitle,
      color: svaColors.text.primary,
      marginBottom: 8,
      lineHeight: 36,
    },
    questionSubtitle: {
      ...svaTypography.textStyle.authSubtitle,
      color: svaColors.text.secondary,
      marginBottom: 10,
    },
    helperText: {
      ...svaTypography.textStyle.authSubtitle,
      color: svaColors.text.secondary,
    },
    optionsWrap: {
      marginTop: 2,
    },
    inputWrap: {
      gap: 16,
      marginTop: 2,
    },
    answerInput: {
      ...svaTypography.textStyle.authBody,
      color: svaColors.text.primary,
      minHeight: 58,
      paddingHorizontal: 18,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: svaColors.border.default,
      backgroundColor: svaColors.surface.raised,
    },
    footerHint: {
      ...svaTypography.textStyle.authFootnote,
      color: svaColors.text.secondary,
      textAlign: "center",
      marginTop: 12,
      paddingHorizontal: 18,
      paddingBottom: 10,
    },
    inlineError: {
      marginBottom: 12,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: "rgba(191, 97, 106, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(191, 97, 106, 0.28)",
    },
    inlineErrorText: {
      ...svaTypography.textStyle.authBody,
      color: svaColors.state.error,
    },
    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    loadingTitle: {
      ...svaTypography.textStyle.heading2,
      color: svaColors.text.primary,
      marginTop: 14,
      textAlign: "center",
    },
    loadingSubtitle: {
      ...svaTypography.textStyle.authSubtitle,
      color: svaColors.text.secondary,
      textAlign: "center",
      marginTop: 8,
    },
    errorState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 12,
    },
    errorTitle: {
      ...svaTypography.textStyle.heading2,
      color: svaColors.text.primary,
      textAlign: "center",
    },
    errorSubtitle: {
      ...svaTypography.textStyle.authSubtitle,
      color: svaColors.text.secondary,
      textAlign: "center",
      marginBottom: 8,
    },
    secondaryAction: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    secondaryActionText: {
      ...svaTypography.textStyle.authLabelStrong,
      color: svaColors.brand.primary,
    },
    submittingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: svaColors.overlay.strong,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    submittingCard: {
      width: "100%",
      maxWidth: 340,
      borderRadius: 28,
      paddingHorizontal: 24,
      paddingVertical: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: svaColors.surface.raised,
      borderWidth: 1,
      borderColor: svaColors.border.muted,
    },
    submittingTitle: {
      ...svaTypography.textStyle.heading2,
      color: svaColors.text.primary,
      marginTop: 14,
      textAlign: "center",
    },
    submittingSubtitle: {
      ...svaTypography.textStyle.authSubtitle,
      color: svaColors.text.secondary,
      textAlign: "center",
      marginTop: 8,
    },
  });

export default OnboardingQuestionsScreen;
