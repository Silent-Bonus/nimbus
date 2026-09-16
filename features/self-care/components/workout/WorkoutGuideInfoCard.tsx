import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

interface WorkoutGuideInfoCardProps {
  title: string;
  description: string;
  items: readonly string[];
  testID?: string;
}

const WorkoutGuideInfoCard: React.FC<WorkoutGuideInfoCardProps> = ({
  title,
  description,
  items,
  testID,
}) => {
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );

  return (
    <View testID={testID} style={styles.card}>
      <Text style={styles.eyebrow}>{title.toUpperCase()}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item} style={styles.listItem}>
            <View style={styles.dot}>
              <Ionicons
                name="ellipse"
                size={6}
                color={theme.chart2 ?? theme.buttonPrimary}
              />
            </View>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing,

) =>
  StyleSheet.create({
    card: {
      borderRadius: 22,
      backgroundColor: theme.cardRaised,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      padding: spacing.md,
      marginTop: spacing.md,
      shadowColor: theme.shadow,
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    eyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.chart2 ?? theme.buttonPrimary,
      fontSize: 11,
      letterSpacing: 1.6,
      marginBottom: spacing.sm,
    },
    description: {
      ...svaTypography.textStyle.body,
      color: theme.textPrimary,
      lineHeight: 22,
    },
    list: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    dot: {
      width: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 8,
    },
    listText: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      flex: 1,
      lineHeight: 22,
    },
  });

export default WorkoutGuideInfoCard;
