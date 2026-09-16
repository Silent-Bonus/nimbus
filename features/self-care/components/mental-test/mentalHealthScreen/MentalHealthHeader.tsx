// components/selfCare/mentalTest/MentalHealthHeader.tsx
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

type Props = {
  onBack: () => void;
};

const MentalHealthHeader: React.FC<Props> = ({ onBack }) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={newTheme.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.title}>Mental Health Test</Text>
      <Text style={styles.subtitle}>
        Short science-backed checks to understand your mind better.
      </Text>
    </View>
  );
};

export default MentalHealthHeader;

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    backButton: {
      marginBottom: spacing.md,
    },
    title: {
      ...svaTypography.textStyle.heading2,
      color: theme.textPrimary,
    },
    subtitle: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
  });
