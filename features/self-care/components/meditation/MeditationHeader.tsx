import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";

interface MeditationHeaderProps {
  onBack: () => void;
}

const MeditationHeader: React.FC<MeditationHeaderProps> = ({ onBack }) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <View style={styles.container}>
      {/* Back icon */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={newTheme.textSecondary} />
      </TouchableOpacity>

      {/* Title + subtitle block */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>Meditation</Text>
        <Text style={styles.subtitle}>
          Immerse yourself in guided sessions that help you slow down, breathe,
          and reset.
        </Text>
      </View>
    </View>
  );
};

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    backButton: {
      marginBottom: spacing.md,
    },
    textBlock: {},
    title: {
      ...svaTypography.textStyle.heading2,
      color: newTheme.textPrimary,
    },
    subtitle: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
      marginTop: spacing.xs,
    },
  });

export default MeditationHeader;
