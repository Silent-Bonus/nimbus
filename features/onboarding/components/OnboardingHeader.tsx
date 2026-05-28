import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";

type OnboardingHeaderProps = {
  step: number;
  totalSteps: number;
  onBack?: () => void;
};

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  step,
  totalSteps,
  onBack,
}) => {
  const { svaColors } = useContext(ThemeContext);
  const styles = useMemo(() => styling(svaColors), [svaColors]);

  const progress = totalSteps > 0 ? Math.min(Math.max(step / totalSteps, 0), 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.stepCluster}>
          {onBack ? (
            <Pressable
              testID="onboarding-back-button"
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={svaColors.text.primary}
              />
            </Pressable>
          ) : null}

          <Text style={styles.stepText}>{`${step}/${totalSteps}`}</Text>
        </View>
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
  );
};

const styling = (svaColors: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
      gap: 14,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    stepCluster: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: svaColors.surface.raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: svaColors.border.default,
    },
    backButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    stepText: {
      ...SVATypography.textStyle.authMonoLabel,
      color: svaColors.text.secondary,
    },
    progressTrack: {
      height: 4,
      borderRadius: 999,
      backgroundColor: svaColors.surface.base,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: svaColors.border.muted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: svaColors.brand.primary,
    },
  });

export default OnboardingHeader;
