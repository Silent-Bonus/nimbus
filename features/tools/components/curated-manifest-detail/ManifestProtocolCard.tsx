import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { router } from "expo-router";

import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";
import { ROUTES } from "@/constants/routes";
import { type ManifestProtocolStep } from "@/features/tools/data/curatedManifests";

type ManifestProtocolCardProps = {
  step: ManifestProtocolStep;
  index: number;
  style?: ViewStyle;
  onAdapt?: () => void;
};

const ManifestProtocolCard: React.FC<ManifestProtocolCardProps> = ({
  step,
  index,
  style,
  onAdapt,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  const stepLabel = `PROTOCOL ${String(index + 1).padStart(2, "0")}`;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.stepPill}>
          <Text style={styles.stepText}>{stepLabel}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {step.title}
      </Text>

      <Text style={styles.description} numberOfLines={3}>
        {step.desc}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaCard}>
          <View style={styles.metaLabelRow}>
            <Ionicons
              name="hourglass-outline"
              size={14}
              color={svaColors.brand.primary}
            />
            <Text style={styles.metaLabel}>Duration</Text>
          </View>
          <Text style={styles.metaValue}>{step.duration}</Text>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaLabelRow}>
            <Ionicons
              name="alarm-outline"
              size={14}
              color={svaColors.brand.primary}
            />
            <Text style={styles.metaLabel}>Reminder</Text>
          </View>
          <Text style={styles.metaValue}>{step.reminder_time}</Text>
        </View>
      </View>

      <View style={styles.actionWrap}>
        <NimbusButton
          label="Adapt Protocol"
          onPress={() => {
            if (onAdapt) {
              onAdapt();
              return;
            }
            router.push(ROUTES.AUTH.CREATE_PROTOCOL);
          }}
          rightIcon={
            <Ionicons
              name="sparkles"
              size={16}
              color={svaColors.button.primary.text}
            />
          }
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
        />
      </View>
    </View>
  );
};

const styling = (colors: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 26,
      padding: spacing.lg,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    stepPill: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.14)",
    },
    stepText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
    },
    title: {
      fontFamily: SVATypography.fontFamily.displayStrong,
      fontSize: 24,
      lineHeight: 28,
      color: colors.text.primary,
      letterSpacing: -0.3,
      marginBottom: spacing.sm,
    },
    description: {
      ...svaTypography.textStyle.body,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    metaRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    metaCard: {
      flex: 1,
      minHeight: 88,
      borderRadius: 18,
      padding: spacing.md,
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.border.muted,
      justifyContent: "space-between",
    },
    metaLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
    },
    metaValue: {
      fontFamily: SVATypography.fontFamily.displayStrong,
      fontSize: 18,
      lineHeight: 20,
      color: colors.text.primary,
      marginTop: 10,
    },
    actionWrap: {
      marginTop: spacing.lg,
    },
    actionButton: {
      width: "100%",
      height: 52,
      borderRadius: 18,
    },
    actionButtonText: {
      letterSpacing: 1,
    },
  });

export default ManifestProtocolCard;
