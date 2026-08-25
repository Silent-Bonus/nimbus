import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { submitJournalEntry } from "@/features/self-care/services/selfCareService";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import type { JournalSubmitRequest } from "@/features/self-care/types/journalTypes";

type JournalStep = {
  id: string;
  question: string;
  focusLabel: string;
  focusPlaceholder: string;
  bodyLabel: string;
  bodyPlaceholder: string;
};

type JournalResponse = {
  focus: string;
  body: string;
};

const DEFAULT_TAGS = ["gratitude", "mindfulness", "reflection", "dreamscape"];

const createSteps = (journalTitle: string): JournalStep[] => [
  {
    id: "intention",
    question: `What is ${journalTitle} asking you to notice today?`,
    focusLabel: "DEFINE YOUR INTENTION OR EMOTION",
    focusPlaceholder: "e.g. Seeking stillness in movement",
    bodyLabel: "WRITE ABOUT IT",
    bodyPlaceholder: "Let the feeling unfold here...",
  },
  {
    id: "emotion",
    question: "What emotion is moving beneath the surface?",
    focusLabel: "NAME THE EMOTION",
    focusPlaceholder: "e.g. Tender, guarded, open",
    bodyLabel: "WHAT DOES IT NEED?",
    bodyPlaceholder: "Describe what this emotion is asking for...",
  },
  {
    id: "seal",
    question: "What do you want to seal into this chronicle?",
    focusLabel: "THE THREAD YOU WANT TO KEEP",
    focusPlaceholder: "e.g. A quieter morning ritual",
    bodyLabel: "WRITE THE LAST IMPRESSION",
    bodyPlaceholder: "Leave the trace you want to carry forward...",
  },
];

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

export default function JournalEntryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    journalId?: string | string[];
    journalTitle?: string | string[];
    journalDescription?: string | string[];
    journalTags?: string | string[];
    journalDateLabel?: string | string[];
  }>();

  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const toast = useNimbusToast();

  const journalTitle = parseParam(params.journalTitle) ?? "Guided Journal";
  const journalDescription = parseParam(params.journalDescription) ?? "";
  const journalTemplateId = useMemo(() => {
    const rawId = parseParam(params.journalId);
    if (!rawId) return null;
    const parsed = Number(rawId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.journalId]);
  const journalTagsKey = Array.isArray(params.journalTags)
    ? params.journalTags.join(",")
    : params.journalTags ?? "";
  const journalTags = useMemo(
    () => parseTagList(journalTagsKey),
    [journalTagsKey]
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>(
    journalTags[0] ?? DEFAULT_TAGS[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<JournalResponse[]>(() =>
    createSteps(journalTitle).map(() => ({
      focus: "",
      body: "",
    }))
  );

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  const journalSteps = useMemo(() => createSteps(journalTitle), [journalTitle]);

  const presetTags = useMemo(
    () => Array.from(new Set([...journalTags, ...DEFAULT_TAGS])),
    [journalTags]
  );

  const currentStep = journalSteps[stepIndex];
  const currentResponse = responses[stepIndex] ?? { focus: "", body: "" };
  const isLastStep = stepIndex === journalSteps.length - 1;
  const canAdvance =
    currentResponse.focus.trim().length > 0 &&
    currentResponse.body.trim().length > 0;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    setStepIndex(0);
    setSelectedTag(journalTags[0] ?? DEFAULT_TAGS[0]);
    setResponses(
      createSteps(journalTitle).map(() => ({
        focus: "",
        body: "",
      }))
    );
  }, [journalTitle, journalTags]);

  const updateResponse = (field: keyof JournalResponse, value: string) => {
    setResponses((prev) =>
      prev.map((entry, index) =>
        index === stepIndex ? { ...entry, [field]: value } : entry
      )
    );
  };

  const buildSubmissionAnswers = () =>
    journalSteps.map((step, index) => {
      const response = responses[index] ?? { focus: "", body: "" };
      const combined = [response.focus.trim(), response.body.trim()]
        .filter(Boolean)
        .join("\n\n");

      return {
        id: index + 1,
        answer: combined || step.question,
      };
    });

  const buildSummary = () =>
    responses
      .map((response) =>
        [response.focus.trim(), response.body.trim()].filter(Boolean).join(" ")
      )
      .filter(Boolean)
      .join(" · ");

  const handleSubmitChronicle = async () => {
    if (submitting) return;

    if (!journalTemplateId) {
      toast.show({
        variant: "error",
        title: "Chronicle not ready",
        message: "We couldn’t identify this journal template.",
      });
      return;
    }

    let didNavigate = false;
    const hasEmpty = responses.some(
      (entry) => entry.focus.trim().length === 0 || entry.body.trim().length === 0
    );
    if (hasEmpty) return;

    const payload: JournalSubmitRequest = {
      template_id: journalTemplateId,
      answers: buildSubmissionAnswers(),
    };

    setSubmitting(true);
    try {
      const result = await submitJournalEntry(payload);
      if (result?.status === "success") {
        didNavigate = true;
        setSubmitting(false);
        router.replace({
          pathname: ROUTES.AUTH.SELF_CARE_JOURNAL_SUBMISSION,
          params: {
            journalId: String(journalTemplateId),
            journalTitle,
            journalSummary:
              buildSummary() ||
              "Three guided reflections have been preserved in the archive.",
            journalTags: journalTags.join(","),
            journalThemeTag: selectedTag,
            questionCount: String(journalSteps.length),
            sealedAtLabel: format(new Date(), "MMM dd, yyyy").toUpperCase(),
          },
        });
        return;
      }

      toast.show({
        variant: "error",
        title: "Unable to seal chronicle",
        message: result?.message || "Please try again in a moment.",
      });
    } catch (error) {
      console.log("Journal submission failed:", error);
        toast.show({
          variant: "error",
          title: "Network error",
          message: "We couldn’t submit this chronicle right now.",
        });
    } finally {
      if (!didNavigate) {
        setSubmitting(false);
      }
    }
  };

  const handleNext = () => {
    if (!canAdvance) return;

    if (!isLastStep) {
      setStepIndex((prev) => Math.min(prev + 1, journalSteps.length - 1));
      return;
    }

    handleSubmitChronicle();
  };

  const handleJumpToList = () => {
    router.replace(ROUTES.AUTH.SELF_CARE_JOURNALING);
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
              subtitle="Follow the prompt, then seal the chronicle."
              onBack={() => router.back()}
              rightAction={{
                icon: "list-outline",
                accessibilityLabel: "Back to journal list",
                onPress: handleJumpToList,
              }}
              containerStyle={styles.header}
            />

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
                    QUESTION {String(stepIndex + 1).padStart(2, "0")}
                  </Text>
                  <Text style={styles.progressValue}>
                    {Math.round(((stepIndex + 1) / journalSteps.length) * 100)}
                    %
                  </Text>
                </View>
                <ProgressBar
                  progress={(stepIndex + 1) / journalSteps.length}
                  color={theme.accent}
                  style={styles.progressBar}
                />
              </View>

              <View style={styles.promptCard}>
                <View style={styles.promptHeaderRow}>
                  <Text style={styles.promptEyebrow}>GUIDED CHRONICLE</Text>
                  <Ionicons
                    name="sparkles-outline"
                    size={18}
                    color={theme.accent}
                  />
                </View>

                <Text style={styles.promptQuestion}>{currentStep.question}</Text>

                {!!journalDescription && stepIndex === 0 && (
                  <Text style={styles.promptContext} numberOfLines={2}>
                    {journalDescription}
                  </Text>
                )}

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>{currentStep.focusLabel}</Text>
                  <TextInput
                    value={currentResponse.focus}
                    onChangeText={(text) => updateResponse("focus", text)}
                    placeholder={currentStep.focusPlaceholder}
                    placeholderTextColor={theme.textSecondary}
                    style={styles.focusInput}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>{currentStep.bodyLabel}</Text>
                  <TextInput
                    value={currentResponse.body}
                    onChangeText={(text) => updateResponse("body", text)}
                    placeholder={currentStep.bodyPlaceholder}
                    placeholderTextColor={theme.textSecondary}
                    style={styles.bodyInput}
                    multiline
                    textAlignVertical="top"
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
                  isLastStep ? "Seal Chronicle" : "Next Question"
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
                      Sealing Chronicle
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
                      {isLastStep ? "Seal Chronicle" : "Next Question"}
                    </Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenView>
  );
}

const styling = (theme: any, svaTypography: any, spacing: any, typography: any) =>
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
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
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
      fontFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ?? "SpaceMono-Regular",
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color: theme.textSecondary,
    },
    promptQuestion: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 34,
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
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      marginBottom: 10,
      textTransform: "uppercase",
    },
    focusInput: {
      borderBottomWidth: 1,
      borderBottomColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      paddingVertical: 10,
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 17,
      lineHeight: 22,
      color: theme.textPrimary,
    },
    bodyInput: {
      minHeight: 180,
      borderRadius: 22,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily:
        svaTypography?.textStyle.body.fontFamily ?? "Inter_400Regular",
      fontSize: 16,
      lineHeight: 25,
      color: theme.textPrimary,
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
      color: theme.textSecondary,
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
      letterSpacing: 1.1,
    },
    tagLabelActive: {
      color: theme.textPrimary,
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 10,
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
      fontFamily:
        svaTypography?.textStyle.button.fontFamily ?? "Inter_700Bold",
      fontSize: 14,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: theme.background,
    },
  });
