import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { StyledButton } from "@/components/ui/StyledButton";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";

import OnboardingHeader from "../components/OnboardingHeader";
import ChoiceItem from "../components/ChoiceItem";
import {
  buildDoshaResponseItem,
  buildDoshaSubmissionPayload,
  DoshaOption,
  DoshaQuestion,
  DoshaResponseItem,
  fetchPersonaQuestions,
  submitPersonaAnswers,
} from "../services/onboardingService";

export const OnboardingQuestionsScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { svaColors, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(svaColors, svaTypography, insets.top, insets.bottom),
    [insets.bottom, insets.top, svaColors, svaTypography]
  );

  const { resetToPublic, markOnboardingDone, getUserDetails } = useAuth();

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState<DoshaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, DoshaResponseItem>>(
    {}
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

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
        setQuestions(res.data);
        setCurrentIndex(0);
        setResponses({});
        return;
      }

      setQuestions([]);
      setErrorMessage(
        res?.message ?? "Unable to load onboarding questions. Please try again."
      );
    } catch (error: any) {
      setQuestions([]);
      setErrorMessage(
        typeof error?.message === "string"
          ? error.message
          : "Unable to load onboarding questions. Please try again."
      );
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

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

        const orderedResponses = Object.values(finalResponses).sort(
          (left, right) => left.question_id - right.question_id
        );
        const payload = buildDoshaSubmissionPayload(orderedResponses);
        const res = await submitPersonaAnswers(payload);

        if (!res?.success) {
          setErrorMessage(
            res?.message ?? "Unable to submit your answers. Please try again."
          );
          return;
        }

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
    [getUserDetails, markOnboardingDone, router]
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

      const nextResponse = buildDoshaResponseItem(currentQuestion, option);
      const updatedResponses = {
        ...responses,
        [currentQuestion.id]: nextResponse,
      };

      setResponses(updatedResponses);
      setErrorMessage("");

      if (currentIndex >= totalQuestions - 1) {
        void finishOnboarding(updatedResponses);
        return;
      }

      scheduleNextQuestion(currentIndex + 1);
    },
    [
      advancing,
      currentIndex,
      currentQuestion,
      finishOnboarding,
      responses,
      scheduleNextQuestion,
      submitting,
      totalQuestions,
    ]
  );

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

  const selectedOptionId = responses[currentQuestion.id]?.selected_option;
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
              {currentQuestion.category ?? "Dosha alignment"}
            </Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <Text style={styles.helperText}>
            Choose the option that feels most natural right now.
          </Text>
        </View>

        {!!errorMessage && (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.optionsWrap}>
          {currentQuestion.options.map((option) => (
            <ChoiceItem
              key={option.id}
              choice={option}
              selected={selectedOptionId === option.id}
              onPress={() => handleOptionPress(option)}
            />
          ))}
        </View>

        <Text style={styles.footerHint}>
          Tap one option and we&apos;ll automatically continue to the next question.
        </Text>
      </ScrollView>

      {submitting && (
        <View style={styles.submittingOverlay}>
          <View style={styles.submittingCard}>
            <ActivityIndicator color={svaColors.brand.primary} />
            <Text style={styles.submittingTitle}>Saving your responses</Text>
            <Text style={styles.submittingSubtitle}>
              We&apos;re sending your dosha profile to the backend.
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
      marginBottom: 10,
      lineHeight: 36,
    },
    helperText: {
      ...svaTypography.textStyle.authSubtitle,
      color: svaColors.text.secondary,
    },
    optionsWrap: {
      marginTop: 2,
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
