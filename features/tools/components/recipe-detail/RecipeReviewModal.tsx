import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { submitRecipeReview } from "@/features/tools/services/toolService";
import type { RecipeReviewPayload } from "@/features/tools/types/toolsTypes";

type ReviewFormState = {
  reviewText: string;
  clarityScore: number;
  energyScore: number;
  satietyScore: number;
  digestibilityScore: number;
  wouldRepeat: boolean;
  madeAsIs: boolean;
};

type FeedbackState =
  | {
      variant: "success" | "error";
      message: string;
    }
  | null;

type RecipeReviewModalProps = {
  visible: boolean;
  recipeId?: number | string | null;
  recipeTitle?: string;
  onClose: () => void;
};

const INITIAL_FORM: ReviewFormState = {
  reviewText: "",
  clarityScore: 0,
  energyScore: 0,
  satietyScore: 0,
  digestibilityScore: 0,
  wouldRepeat: false,
  madeAsIs: false,
};

const SCORE_FIELDS: {
  key: keyof Pick<
    ReviewFormState,
    "clarityScore" | "energyScore" | "satietyScore" | "digestibilityScore"
  >;
  label: string;
  hint: string;
}[] = [
  {
    key: "clarityScore",
    label: "Clarity",
    hint: "How clear and focused did it feel?",
  },
  {
    key: "energyScore",
    label: "Energy",
    hint: "How did your energy feel after eating?",
  },
  {
    key: "satietyScore",
    label: "Satiety",
    hint: "How satisfied did you feel?",
  },
  {
    key: "digestibilityScore",
    label: "Digestibility",
    hint: "How easy was it to digest?",
  },
];

const buildErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      detail?: unknown;
      error?: unknown;
      non_field_errors?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.detail === "string" && candidate.detail.trim()) {
      return candidate.detail;
    }

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }

    if (Array.isArray(candidate.non_field_errors)) {
      const firstMessage = candidate.non_field_errors.find(
        (item) => typeof item === "string" && item.trim()
      );

      if (typeof firstMessage === "string") {
        return firstMessage;
      }
    }
  }

  return "Unable to submit your review right now.";
};

const RecipeReviewModal: React.FC<RecipeReviewModalProps> = ({
  visible,
  recipeId,
  recipeTitle,
  onClose,
}) => {
  const { newTheme, spacing, svaColors, svaTypography, typography } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<ReviewFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bodyTextStyle = svaTypography?.textStyle?.body ?? typography.body;

  const styles = useMemo(
    () =>
      makeStyles(
        newTheme,
        svaColors,
        spacing,
        bodyTextStyle,
        svaTypography,
        insets.bottom
      ),
    [bodyTextStyle, insets.bottom, newTheme, spacing, svaColors, svaTypography]
  );

  useEffect(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (!visible) {
      setLoading(false);
      setFeedback(null);
      setForm(INITIAL_FORM);
      return;
    }

    setLoading(false);
    setFeedback(null);
    setForm(INITIAL_FORM);
  }, [visible, recipeId]);

  const submitted = feedback?.variant === "success";
  const busy = loading || submitted;

  const requiredScoresFilled =
    form.clarityScore > 0 &&
    form.energyScore > 0 &&
    form.satietyScore > 0 &&
    form.digestibilityScore > 0;

  const canSubmit = requiredScoresFilled && !loading && !submitted;

  const closeModal = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (loading) {
      return;
    }

    onClose();
    setFeedback(null);
    setForm(INITIAL_FORM);
    setLoading(false);
  };

  const updateScore = (
    key: keyof Pick<
      ReviewFormState,
      "clarityScore" | "energyScore" | "satietyScore" | "digestibilityScore"
    >,
    value: number
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (feedback?.variant === "error") {
      setFeedback(null);
    }
  };

  const submit = async () => {
    if (!recipeId) {
      setFeedback({
        variant: "error",
        message: "Recipe id is missing. Please go back and open the recipe again.",
      });
      return;
    }

    if (submitted) {
      closeModal();
      return;
    }

    if (!requiredScoresFilled) {
      setFeedback({
        variant: "error",
        message: "Please select all star ratings before sending your review.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);
    let submittedSuccessfully = false;

    const payload: RecipeReviewPayload = {
      rating: Math.round(
        (form.clarityScore +
          form.energyScore +
          form.satietyScore +
          form.digestibilityScore) /
          4
      ),
      review_text: form.reviewText.trim(),
      clarity_score: form.clarityScore,
      energy_score: form.energyScore,
      satiety_score: form.satietyScore,
      digestibility_score: form.digestibilityScore,
      would_repeat: form.wouldRepeat,
      made_as_is: form.madeAsIs,
    };

    try {
      const response = await submitRecipeReview(recipeId, payload);
      submittedSuccessfully = true;
      setFeedback({
        variant: "success",
        message:
          response?.message?.trim() || "Your review was sent successfully.",
      });
    } catch (error) {
      setFeedback({
        variant: "error",
        message: buildErrorMessage(error),
      });
    } finally {
      setLoading(false);

      if (submittedSuccessfully) {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
        }

        closeTimerRef.current = setTimeout(() => {
          closeTimerRef.current = null;
          closeModal();
        }, 650);
      }
    }
  };

  const renderStars = (
    key: keyof Pick<
      ReviewFormState,
      "clarityScore" | "energyScore" | "satietyScore" | "digestibilityScore"
    >,
    value: number
  ) => (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;

        return (
          <Pressable
            key={`${String(key)}-${starValue}`}
            onPress={() => {
              if (!busy) {
                updateScore(key, starValue);
              }
            }}
            hitSlop={10}
            style={styles.starButton}
          >
            <Ionicons
              name={active ? "star" : "star-outline"}
              size={24}
              color={
                active
                  ? newTheme.warning ?? newTheme.accent
                  : newTheme.textSecondary
              }
            />
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeModal} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.center}
        >
          <View style={styles.card}>
            <View style={styles.topAccent} />

            <View style={styles.header}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.kicker}>RECIPE REVIEW</Text>
                <Text style={styles.title} numberOfLines={2}>
                  {recipeTitle || "Tell us what you thought"}
                </Text>
                <Text style={styles.subtitle}>
                  Rate the meal and leave a quick note for the kitchen.
                </Text>
              </View>

              <Pressable
                onPress={closeModal}
                disabled={loading}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && !loading && styles.closeButtonPressed,
                  loading && styles.closeButtonDisabled,
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={newTheme.textPrimary}
                />
              </Pressable>
            </View>

            <View style={styles.bodyWrap}>
              <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.body}
              >
                {feedback ? (
                  <View
                    style={[
                      styles.feedbackCard,
                      feedback.variant === "success"
                        ? styles.feedbackSuccess
                        : styles.feedbackError,
                    ]}
                  >
                    <Ionicons
                      name={
                        feedback.variant === "success"
                          ? "checkmark-circle-outline"
                          : "alert-circle-outline"
                      }
                      size={18}
                      color={
                        feedback.variant === "success"
                          ? newTheme.success ?? newTheme.accent
                          : newTheme.error ?? newTheme.accent
                      }
                    />
                    <Text
                      style={[
                        styles.feedbackText,
                        feedback.variant === "success"
                          ? styles.feedbackTextSuccess
                          : styles.feedbackTextError,
                      ]}
                    >
                      {feedback.message}
                    </Text>
                  </View>
                ) : null}

                {SCORE_FIELDS.map((field) => (
                  <View key={field.key} style={styles.scoreCard}>
                    <View style={styles.scoreHeader}>
                      <View>
                        <Text style={styles.scoreLabel}>{field.label}</Text>
                        <Text style={styles.scoreHint}>{field.hint}</Text>
                      </View>
                    </View>

                    {renderStars(field.key, form[field.key])}
                  </View>
                ))}

                <View style={styles.inputCard}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.scoreLabel}>Review text</Text>
                    <Text style={styles.optionalLabel}>Optional</Text>
                  </View>
                  <TextInput
                    value={form.reviewText}
                    onChangeText={(text) =>
                      setForm((current) => ({ ...current, reviewText: text }))
                    }
                    placeholder="Tell us what stood out, what changed for you, or what you'd tweak next time."
                    placeholderTextColor={newTheme.textSecondary}
                    multiline
                    editable={!busy}
                    style={[
                      styles.textInput,
                      busy && styles.inputDisabled,
                    ]}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.toggleGrid}>
                  <Pressable
                    onPress={() =>
                      !busy &&
                      setForm((current) => ({
                        ...current,
                        wouldRepeat: !current.wouldRepeat,
                      }))
                    }
                    style={({ pressed }) => [
                      styles.togglePill,
                      form.wouldRepeat && styles.togglePillActive,
                      pressed && !busy && styles.togglePillPressed,
                      busy && styles.togglePillDisabled,
                    ]}
                  >
                    <Ionicons
                      name={form.wouldRepeat ? "checkmark-circle" : "ellipse-outline"}
                      size={16}
                      color={
                        form.wouldRepeat
                          ? svaColors.brand.primary ?? newTheme.accent
                          : newTheme.textSecondary
                      }
                    />
                    <Text style={styles.toggleLabel}>Would repeat</Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      !busy &&
                      setForm((current) => ({
                        ...current,
                        madeAsIs: !current.madeAsIs,
                      }))
                    }
                    style={({ pressed }) => [
                      styles.togglePill,
                      form.madeAsIs && styles.togglePillActive,
                      pressed && !busy && styles.togglePillPressed,
                      busy && styles.togglePillDisabled,
                    ]}
                  >
                    <Ionicons
                      name={form.madeAsIs ? "checkmark-circle" : "ellipse-outline"}
                      size={16}
                      color={
                        form.madeAsIs
                          ? svaColors.brand.primary ?? newTheme.accent
                          : newTheme.textSecondary
                      }
                    />
                    <Text style={styles.toggleLabel}>Made as is</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>

            <View style={styles.footer}>
              <Pressable
                onPress={submit}
                disabled={loading || (!submitted && !canSubmit)}
                style={({ pressed }) => [
                  styles.submitButton,
                  submitted
                    ? styles.submitButtonSuccess
                    : loading || !canSubmit
                      ? styles.submitButtonDisabled
                      : null,
                  pressed && !loading && !submitted && canSubmit
                    ? styles.submitButtonPressed
                    : null,
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={newTheme.buttonPrimaryText ?? "#10120E"}
                  />
                ) : (
                  <Text style={styles.submitText}>
                    {submitted ? "Done" : "Submit review"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const makeStyles = (
  theme: any,
  colors: any,
  spacing: any,
  bodyTextStyle: any,
  svaTypography: any,
  safeBottomInset: number
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.overlayStrong ?? "rgba(12,14,11,0.72)",
      zIndex: 0,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      zIndex: 1,
    },
    card: {
      flex: 1,
      width: "100%",
      maxWidth: 440,
      maxHeight: "92%",
      alignSelf: "center",
      borderRadius: 30,
      backgroundColor: theme.cardRaised ?? theme.surfaceMuted ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      overflow: "hidden",
      zIndex: 1,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 28,
        },
        android: { elevation: 18 },
      }),
    },
    topAccent: {
      width: 58,
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.borderMuted ?? theme.border,
      marginTop: spacing.md,
      alignSelf: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    headerTextBlock: {
      flex: 1,
    },
    kicker: {
      ...svaTypography?.textStyle?.authTinyLabel,
      color: colors.brand.primary ?? theme.accent,
      letterSpacing: 2,
      fontSize: 10,
      lineHeight: 12,
      marginBottom: 6,
    },
    title: {
      ...(svaTypography?.textStyle?.displayMedium ?? {}),
      fontSize: 24,
      lineHeight: 28,
      color: theme.textPrimary,
      textAlign: "left",
    },
    subtitle: {
      ...bodyTextStyle,
      marginTop: 8,
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.pressed ?? "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      marginTop: 2,
    },
    closeButtonPressed: {
      opacity: 0.85,
    },
    closeButtonDisabled: {
      opacity: 0.65,
    },
    bodyWrap: {
      flex: 1,
      minHeight: 0,
    },
    scroll: {
      flex: 1,
      minHeight: 0,
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl + safeBottomInset,
      gap: spacing.md,
    },
    feedbackCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderWidth: 1,
    },
    feedbackSuccess: {
      backgroundColor: `${theme.success ?? colors.state.success}14`,
      borderColor: `${theme.success ?? colors.state.success}24`,
    },
    feedbackError: {
      backgroundColor: `${theme.error ?? colors.state.error}14`,
      borderColor: `${theme.error ?? colors.state.error}24`,
    },
    feedbackText: {
      flex: 1,
      ...bodyTextStyle,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
    },
    feedbackTextSuccess: {
      color: theme.textPrimary,
    },
    feedbackTextError: {
      color: theme.textPrimary,
    },
    scoreCard: {
      borderRadius: 22,
      padding: spacing.md,
      backgroundColor: theme.surfaceMuted ?? theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      gap: spacing.sm,
    },
    scoreHeader: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 0,
    },
    scoreLabel: {
      ...(svaTypography?.textStyle?.bodyMedium ?? {}),
      color: theme.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },
    scoreHint: {
      ...bodyTextStyle,
      marginTop: 4,
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    starRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 4,
    },
    starButton: {
      paddingVertical: 2,
      paddingHorizontal: 2,
    },
    inputCard: {
      borderRadius: 22,
      padding: spacing.md,
      backgroundColor: theme.surfaceMuted ?? theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      gap: spacing.sm,
    },
    inputHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    optionalLabel: {
      ...bodyTextStyle,
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
    },
    textInput: {
      minHeight: 110,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.surface ?? theme.background,
      color: theme.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      ...bodyTextStyle,
      fontSize: 14,
      lineHeight: 20,
      textAlignVertical: "top",
    },
    inputDisabled: {
      opacity: 0.8,
    },
    toggleGrid: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    togglePill: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 52,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.surfaceMuted ?? theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
    },
    togglePillActive: {
      backgroundColor: colors.brand.subtle,
      borderColor: `${colors.brand.primary ?? theme.accent}40`,
    },
    togglePillPressed: {
      opacity: 0.9,
    },
    togglePillDisabled: {
      opacity: 0.7,
    },
    toggleLabel: {
      ...bodyTextStyle,
      color: theme.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl + safeBottomInset,
      borderTopWidth: 1,
      borderTopColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surfaceMuted ?? theme.surface,
    },
    submitButton: {
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    submitButtonSuccess: {
      backgroundColor: theme.success ?? colors.state.success,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonPressed: {
      transform: [{ scale: 0.99 }],
    },
    submitText: {
      color: theme.buttonPrimaryText ?? "#10120E",
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
  });

export default RecipeReviewModal;
