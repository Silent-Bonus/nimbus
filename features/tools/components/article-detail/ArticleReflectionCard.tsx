import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type ArticleReflectionCardProps = {
  eyebrow: string;
  title: string;
  prompt: string;
  helper: string;
  actionLabel: string;
  onActionPress: () => void;
};

const ArticleReflectionCard: React.FC<ArticleReflectionCardProps> = ({
  eyebrow,
  title,
  prompt,
  helper,
  actionLabel,
  onActionPress,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="flash-outline" size={20} color={svaColors.brand.primary} />
      </View>

      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.prompt}>{prompt}</Text>
      <Text style={styles.helper}>{helper}</Text>

      <NimbusButton
        label={actionLabel}
        onPress={onActionPress}
        variant="primary"
        style={styles.button}
      />
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    card: {
      borderRadius: 26,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      alignItems: "center",
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 7,
    },
    iconWrap: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border.default,
      borderStyle: "dashed",
      backgroundColor: colors.bg.subtle,
      marginBottom: spacing.md,
    },
    eyebrow: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_600SemiBold",
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.8,
      marginBottom: spacing.xs,
    },
    title: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 26,
      lineHeight: 30,
      color: colors.text.primary,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    prompt: {
      fontFamily:
        typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
      fontSize: 15,
      lineHeight: 24,
      color: colors.text.secondary,
      textAlign: "center",
    },
    helper: {
      fontFamily:
        typography?.textStyle?.authTinyLabel?.fontFamily ??
        "Outfit_400Regular",
      fontSize: 12,
      lineHeight: 18,
      color: colors.text.secondary,
      textAlign: "center",
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    button: {
      minWidth: 176,
      alignSelf: "center",
    },
  });

export default ArticleReflectionCard;
