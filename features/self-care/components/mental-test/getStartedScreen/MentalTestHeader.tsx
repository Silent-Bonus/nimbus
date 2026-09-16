// src/components/selfCare/mentalTest/getStartedScreen/MentalTestHeader.tsx
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
};

const MedicalTestHeader: React.FC<Props> = ({ title, subtitle, onBack }) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = getStyles(newTheme, spacing, svaTypography);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={newTheme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {title} klk
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const getStyles = (t: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      // backgroundColor: t.background,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    textBlock: {
      paddingRight: spacing.lg,
    },
    title: {
      ...svaTypography.textStyle.heading2,
      color: t.textPrimary,
    },
    subtitle: {
      ...svaTypography.textStyle.body,
      color: t.textSecondary,
      marginTop: spacing.xs,
    },
  });

export default MedicalTestHeader;
