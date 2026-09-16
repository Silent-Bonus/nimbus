// components/selfCare/mentalTest/MentalHealthQuestion.tsx
import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { ProgressBar } from "react-native-paper";

import ThemeContext from "@/contexts/ThemeContext";
import StyledButton from "@/components/ui/theme-components/StyledButton";

// Keep this aligned with your parent type
export type ScoreOption =
  | "Never"
  | "Rarely"
  | "Sometimes"
  | "Often"
  | "VeryOften";

type QuestionData = {
  id: string | number;
  question: string;
  options: string[];
  category: string;
  image?: any;
};

type Props = {
  questionData: QuestionData;
  totalSteps: number;
  currentStep: number;
  color?: string;
  onAnswerSelect: (
    questionId: number,
    category: string,
    selectedOption: ScoreOption
  ) => void;
  onNext: () => void;
};

const MentalHealthQuestion: React.FC<Props> = ({
  questionData,
  totalSteps,
  currentStep,
  color,
  onAnswerSelect,
  onNext,
}) => {
  const [selectedOption, setSelectedOption] = useState<ScoreOption | null>(
    null
  );

  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  const isLast = currentStep === totalSteps;

  const handleOptionSelect = (option: string) => {
    const asScore = option as ScoreOption; // you control the options list
    setSelectedOption(asScore);

    const numericId =
      typeof questionData.id === "string"
        ? parseInt(questionData.id, 10)
        : questionData.id;

    onAnswerSelect(numericId, questionData.category, asScore);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    onNext();
    // optional: clear local selection if you recreate component each step
    setSelectedOption(null);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          {/* Progress header */}
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Question {currentStep}/{totalSteps}
            </Text>
            <ProgressBar
              progress={currentStep / totalSteps}
              color={color || newTheme.accent}
              style={styles.progressBar}
            />
          </View>

          {/* Question */}
          <View style={styles.questionBlock}>
            <Text style={styles.helperText}>
              Select the option that feels most true for you.
            </Text>

            <Text style={styles.questionText}>{questionData.question}</Text>

            {questionData.image && (
              <Image
                source={questionData.image}
                style={styles.questionImage}
                resizeMode="cover"
              />
            )}

            {/* Options */}
            <View style={styles.optionsWrapper}>
              {questionData.options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => handleOptionSelect(option)}
                  android_ripple={{ color: newTheme.pressed }}
                  style={({ pressed }) => [
                    styles.optionButton,
                    selectedOption === option && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* spacer so last option doesn’t hide under CTA */}
        <View style={{ height: spacing["2xl"] * 3 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <StyledButton
          label={isLast ? "Finish" : "Next"}
          variant="primary"
          size="large"
          fullWidth
          disabled={!selectedOption}
          onPress={handleNext}
        />
        <View style={styles.bottomBarAccent} />
      </View>
    </View>
  );
};

export default MentalHealthQuestion;

// ───────────────────────── styles ─────────────────────────

const styling = (t: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.xs,
      paddingTop: spacing.xs,
    },
    card: {
      backgroundColor: t.surface,
      borderRadius: 28,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      shadowColor: t.shadow,
      shadowOpacity: 0.35,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 18 },
      borderWidth: 1,
      borderColor: t.borderMuted,
    },
    progressHeader: {
      marginBottom: spacing.lg,
    },
    progressLabel: {
      ...svaTypography.textStyle.caption,
      color: t.textSecondary,
      marginBottom: spacing.xs,
    },
    progressBar: {
      height: 6,
      borderRadius: 999,
      backgroundColor: t.divider,
    },
    questionBlock: {
      marginTop: spacing.md,
    },
    helperText: {
      ...svaTypography.textStyle.caption,
      color: t.textSecondary,
      marginBottom: spacing.sm,
    },
    questionText: {
      ...svaTypography.textStyle.title,
      color: t.textPrimary,
      marginBottom: spacing.lg,
      lineHeight: 28,
    },
    questionImage: {
      width: "100%",
      height: 160,
      borderRadius: 20,
      marginBottom: spacing.lg,
    },
    optionsWrapper: {
      marginTop: spacing.sm,
    },
    optionButton: {
      backgroundColor: t.surfaceMuted,
      borderRadius: 999,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.borderMuted,
    },
    optionPressed: {
      backgroundColor: t.pressed,
    },
    optionSelected: {
      backgroundColor: t.selected,
      borderColor: t.accent,
      shadowColor: t.accent,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    optionText: {
      ...svaTypography.textStyle.body,
      fontSize: 17,
      color: t.textPrimary,
    },
    optionTextSelected: {
      color: t.buttonPrimaryText,
      fontWeight: "600",
    },
    bottomBar: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.lg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: 24,
      backgroundColor: "rgba(16,18,14,0.9)",
      shadowColor: t.shadow,
      shadowOpacity: 0.4,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 14 },
    },
    bottomBarAccent: {
      height: 3,
      width: "40%",
      alignSelf: "center",
      borderRadius: 999,
      marginTop: spacing.xs,
      backgroundColor: t.divider,
    },
  });
