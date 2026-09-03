import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { submitNewsletterReview } from "@/features/tools/services/newsletterService";
import type {
  NewsletterReviewCreateResponse,
  NewsletterReviewPayload,
} from "@/features/tools/types/newsletterTypes";
import type {
  FontSet,
  Spacing,
  SvaColorSet,
  TypographyTokens,
} from "@/theme/types";

type ReviewFormState = {
  rating: number;
  reviewText: string;
  clarityScore: number;
  helpfulnessScore: number;
  wouldRecommend: boolean;
};

type FeedbackState =
  | {
      variant: "success" | "error";
      message: string;
      response?: NewsletterReviewCreateResponse["data"];
    }
  | null;

type ArticleReviewModalProps = {
  visible: boolean;
  newsletterSlug?: string | null;
  articleTitle?: string;
  onClose: () => void;
  onSubmitSuccess?: (response: NewsletterReviewCreateResponse) => void;
};

const INITIAL_FORM: ReviewFormState = {
  rating: 0,
  reviewText: "",
  clarityScore: 0,
  helpfulnessScore: 0,
  wouldRecommend: false,
};

const SCORE_FIELDS: {
  key: keyof Pick<ReviewFormState, "rating" | "clarityScore" | "helpfulnessScore">;
  label: string;
  hint: string;
}[] = [
  {
    key: "rating",
    label: "Overall rating",
    hint: "How strong was this article overall?",
  },
  {
    key: "clarityScore",
    label: "Clarity",
    hint: "Was the guidance clear and easy to follow?",
  },
  {
    key: "helpfulnessScore",
    label: "Helpfulness",
    hint: "Did this feel genuinely useful for your day?",
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

const ArticleReviewModal: React.FC<ArticleReviewModalProps> = ({
  visible,
  newsletterSlug,
  articleTitle,
  onClose,
  onSubmitSuccess,
}) => {
  const { spacing, svaColors, svaTypography, typography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<ReviewFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const bodyTextStyle = svaTypography?.textStyle?.body ?? typography.body;

  const styles = useMemo(
    () =>
      makeStyles(
        svaColors,
        spacing,
        bodyTextStyle,
        svaTypography,
        insets.bottom
      ),
    [bodyTextStyle, insets.bottom, spacing, svaColors, svaTypography]
  );

  useEffect(() => {
    if (!visible) {
      setLoading(false);
      setFeedback(null);
      setForm(INITIAL_FORM);
      return;
    }

    setLoading(false);
    setFeedback(null);
    setForm(INITIAL_FORM);
  }, [visible, newsletterSlug]);

  const submitted = feedback?.variant === "success";
  const busy = loading || submitted;
  const requiredScoresFilled =
    form.rating > 0 && form.clarityScore > 0 && form.helpfulnessScore > 0;
  const canSubmit = requiredScoresFilled && !loading && !submitted;

  const closeModal = () => {
    if (loading) {
      return;
    }

    onClose();
    setFeedback(null);
    setForm(INITIAL_FORM);
    setLoading(false);
  };

  const updateScore = (
    key: keyof Pick<ReviewFormState, "rating" | "clarityScore" | "helpfulnessScore">,
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
    if (!newsletterSlug) {
      setFeedback({
        variant: "error",
        message:
          "Newsletter slug is missing. Please go back and open the article again.",
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
        message:
          "Please complete the overall, clarity, and helpfulness ratings before sending your review.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const payload: NewsletterReviewPayload = {
      rating: form.rating,
      review_text: form.reviewText.trim(),
      clarity_score: form.clarityScore,
      helpfulness_score: form.helpfulnessScore,
      would_recommend: form.wouldRecommend,
    };

    try {
      const response = await submitNewsletterReview(newsletterSlug, payload);
      onSubmitSuccess?.(response);
      setFeedback({
        variant: "success",
        message:
          response?.message?.trim() || "Your review was sent successfully.",
        response: response?.data ?? null,
      });
    } catch (error) {
      setFeedback({
        variant: "error",
        message: buildErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (
    key: keyof Pick<ReviewFormState, "rating" | "clarityScore" | "helpfulnessScore">,
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
                  color={active ? svaColors.state.warning : svaColors.text.secondary}
                />
          </Pressable>
        );
      })}
    </View>
  );

  const responseData = feedback?.variant === "success" ? feedback.response : null;

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
                <Text style={styles.kicker}>NEWSLETTER REVIEW</Text>
                <Text style={styles.title} numberOfLines={2}>
                  {articleTitle || "Share your reading review"}
                </Text>
                <Text style={styles.subtitle}>
                  Rate the article and leave a short note for the editorial team.
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
                  color={svaColors.text.primary}
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
                          ? svaColors.state.success
                          : svaColors.state.error
                      }
                    />
                    <Text style={styles.feedbackText}>{feedback.message}</Text>
                  </View>
                ) : null}

                {responseData ? (
                  <View style={styles.responseCard}>
                    <Text style={styles.responseTitle}>Submitted response</Text>
                    <Text style={styles.responseMeta}>
                      {responseData.reviewer_display_name} · {responseData.moderation_status}
                    </Text>
                    <View style={styles.responsePillRow}>
                      <View style={styles.responsePill}>
                        <Text style={styles.responsePillText}>
                          Rating {responseData.rating}/5
                        </Text>
                      </View>
                      <View style={styles.responsePill}>
                        <Text style={styles.responsePillText}>
                          Clarity {responseData.clarity_score}/5
                        </Text>
                      </View>
                      <View style={styles.responsePill}>
                        <Text style={styles.responsePillText}>
                          Helpful {responseData.helpfulness_score}/5
                        </Text>
                      </View>
                    </View>
                    {responseData.review_text ? (
                      <Text style={styles.responseBody}>{responseData.review_text}</Text>
                    ) : null}
                    <Text style={styles.responseMeta}>
                      {responseData.would_recommend
                        ? "Would recommend"
                        : "Would not recommend"}
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
                    placeholder="Tell us what stood out, what felt useful, or what could be stronger."
                    placeholderTextColor={svaColors.text.secondary}
                    multiline
                    editable={!busy}
                    style={[styles.textInput, busy && styles.inputDisabled]}
                    textAlignVertical="top"
                  />
                </View>

                <Pressable
                  onPress={() =>
                    !busy &&
                    setForm((current) => ({
                      ...current,
                      wouldRecommend: !current.wouldRecommend,
                    }))
                  }
                  style={({ pressed }) => [
                    styles.togglePill,
                    form.wouldRecommend && styles.togglePillActive,
                    pressed && !busy && styles.togglePillPressed,
                    busy && styles.togglePillDisabled,
                  ]}
                >
                  <Ionicons
                    name={
                      form.wouldRecommend
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={16}
                    color={
                      form.wouldRecommend
                        ? svaColors.brand.primary
                        : svaColors.text.secondary
                    }
                  />
                  <Text style={styles.toggleLabel}>Would recommend</Text>
                </Pressable>
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
                    color={svaColors.button.primary.text}
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
  colors: SvaColorSet,
  spacing: Spacing,
  bodyTextStyle: FontSet,
  svaTypography: TypographyTokens | undefined,
  safeBottomInset: number
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay.strong,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
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
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      overflow: "hidden",
      zIndex: 1,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.default,
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
      backgroundColor: colors.border.muted,
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
      color: colors.brand.primary,
      letterSpacing: 2,
      fontSize: 10,
      lineHeight: 12,
      marginBottom: 6,
    },
    title: {
      ...(svaTypography?.textStyle?.authTitle ?? {}),
      fontSize: 24,
      lineHeight: 28,
      color: colors.text.primary,
      textAlign: "left",
    },
    subtitle: {
      ...bodyTextStyle,
      marginTop: 8,
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 18,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.interaction.pressed,
      borderWidth: 1,
      borderColor: colors.border.muted,
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
      backgroundColor: `${colors.state.success}14`,
      borderColor: `${colors.state.success}24`,
    },
    feedbackError: {
      backgroundColor: `${colors.state.error}14`,
      borderColor: `${colors.state.error}24`,
    },
    feedbackText: {
      flex: 1,
      ...bodyTextStyle,
      color: colors.text.primary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
    },
    responseCard: {
      borderRadius: 22,
      padding: spacing.md,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      gap: spacing.sm,
    },
    responseTitle: {
      ...(svaTypography?.textStyle?.bodyMedium ?? {}),
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },
    responseMeta: {
      ...bodyTextStyle,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
    },
    responsePillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    responsePill: {
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: `${colors.brand.primary}24`,
    },
    responsePillText: {
      ...bodyTextStyle,
      color: colors.brand.primary,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "700",
    },
    responseBody: {
      ...bodyTextStyle,
      color: colors.text.primary,
      fontSize: 14,
      lineHeight: 20,
    },
    scoreCard: {
      borderRadius: 22,
      padding: spacing.md,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      gap: spacing.sm,
    },
    scoreHeader: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    scoreLabel: {
      ...(svaTypography?.textStyle?.bodyMedium ?? {}),
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },
    scoreHint: {
      ...bodyTextStyle,
      marginTop: 4,
      color: colors.text.secondary,
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
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
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
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
    },
    textInput: {
      minHeight: 110,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border.muted,
      backgroundColor: colors.bg.base,
      color: colors.text.primary,
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
    togglePill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 52,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    togglePillActive: {
      backgroundColor: colors.brand.subtle,
      borderColor: `${colors.brand.primary}40`,
    },
    togglePillPressed: {
      opacity: 0.9,
    },
    togglePillDisabled: {
      opacity: 0.7,
    },
    toggleLabel: {
      ...bodyTextStyle,
      color: colors.text.primary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl + safeBottomInset,
      borderTopWidth: 1,
      borderTopColor: colors.border.muted,
      backgroundColor: colors.surface.raised,
    },
    submitButton: {
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.button.primary.bg,
    },
    submitButtonSuccess: {
      backgroundColor: colors.state.success,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonPressed: {
      transform: [{ scale: 0.99 }],
    },
    submitText: {
      color: colors.button.primary.text,
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
  });

export default ArticleReviewModal;
