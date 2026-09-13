import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

interface DailySutraCardProps {
  quote?: string;
  ritualLabel?: string;
  sectionLabel?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_QUOTE = "Your breath is the bridge between body and consciousness.";
const DEFAULT_RITUAL_LABEL = "RITUAL IV";
const DEFAULT_SECTION_LABEL = "DAILY SUTRA";

const DailySutraCard: React.FC<DailySutraCardProps> = ({
  quote = DEFAULT_QUOTE,
  ritualLabel = DEFAULT_RITUAL_LABEL,
  sectionLabel = DEFAULT_SECTION_LABEL,
  iconName = "leaf-outline",
  style,
}) => {
  const { newTheme, spacing, typography, svaTypography } = useContext(ThemeContext);
  const styles = makeStyles(newTheme, spacing, typography, svaTypography);

  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", "rgba(134,109,45,0.18)"]}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.leafWrap}>
        <Ionicons name={iconName} size={34} color="rgba(255,255,255,0.14)" />
      </View>

      <Text style={styles.sectionLabel}>{sectionLabel}</Text>

      <Text style={styles.quote} numberOfLines={3}>
        {quote}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.ritualLabel}>{ritualLabel}</Text>
    </View>
  );
};

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography?: TypographyTokens
) =>
  StyleSheet.create({
    card: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 24,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      minHeight: 228,
      justifyContent: "center",
      shadowColor: theme.shadow ?? "#000",
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      elevation: 8,
    },
    leafWrap: {
      position: "absolute",
      top: spacing.lg,
      right: spacing.lg,
      opacity: 1,
      transform: [{ rotate: "-10deg" }],
    },
    sectionLabel: {
      ...(svaTypography?.textStyle?.authTinyLabel ?? typography.smallCaption),
      color: theme.textSecondary,
      opacity: 0.74,
      letterSpacing: 4,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    quote: {
      ...(svaTypography?.textStyle?.displayMedium ?? typography.h2),
      color: theme.textPrimary,
      textAlign: "center",
      fontSize: 22,
      lineHeight: 30,
      letterSpacing: 0,
      fontStyle: "italic",
      paddingHorizontal: spacing.sm,
    },
    divider: {
      width: 38,
      height: 2,
      borderRadius: 99,
      backgroundColor: "rgba(255,255,255,0.10)",
      alignSelf: "center",
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    ritualLabel: {
      ...(svaTypography?.textStyle?.authTinyLabel ?? typography.smallCaption),
      color: theme.textSecondary,
      opacity: 0.82,
      letterSpacing: 3.6,
      textAlign: "center",
    },
  });

export default DailySutraCard;
