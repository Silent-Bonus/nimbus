import React, { useContext, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import type { SvaColorSet, Spacing } from "@/theme/types";

type PremiumGateModalTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type PremiumGateModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title: string;
  subtitle: string;
  highlights: string[];
  primaryLabel?: string;
  secondaryLabel?: string;
};

export default function PremiumGateModal({
  visible,
  onClose,
  onUpgrade,
  title,
  subtitle,
  highlights,
  primaryLabel = "Upgrade to Plus",
  secondaryLabel = "Keep previewing",
}: PremiumGateModalProps) {
  const { svaColors, svaTypography, typography, spacing } =
    useContext(ThemeContext);

  const fonts = useMemo<PremiumGateModalTypography>(
    () => ({
      titleFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        typography.h2.fontFamily ??
        "CormorantGaramond_500Medium",
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Outfit_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Outfit_600SemiBold",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () => createStyles(svaColors, fonts, spacing),
    [svaColors, fonts, spacing]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss premium preview"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.cardShell} pointerEvents="box-none">
          <LinearGradient
            colors={[
              svaColors.brand.primary,
              svaColors.surface.raised,
              svaColors.surface.base,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.card}>
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              <View style={styles.heroRow}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color={svaColors.brand.primary}
                  />
                </View>

                <View style={styles.heroCopy}>
                  <Text style={styles.eyebrow}>Premium preview</Text>
                  <Text style={styles.title} numberOfLines={2}>
                    {title}
                  </Text>
                  <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>What unlocks</Text>
                  <Text style={styles.sectionMeta}>
                    {String(highlights.length).padStart(2, "0")}
                  </Text>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.highlightList}
                >
                  {highlights.map((item) => (
                    <View key={item} style={styles.highlightRow}>
                      <View style={styles.checkBubble}>
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={svaColors.bg.base}
                        />
                      </View>
                      <Text style={styles.highlightText}>{item}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.footer}>
                <NimbusButton
                  label={primaryLabel}
                  onPress={onUpgrade}
                  accessibilityLabel={primaryLabel}
                  rightIcon={
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={svaColors.button.primary.text}
                    />
                  }
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={secondaryLabel}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                  ]}
                >
                  <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(
  colors: SvaColorSet,
  fonts: PremiumGateModalTypography,
  spacing: Spacing
) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor: colors.overlay.strong,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    cardShell: {
      width: "100%",
      maxWidth: 440,
    },
    cardBorder: {
      borderRadius: 32,
      padding: 1.5,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.3,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
    card: {
      borderRadius: 31,
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    handleRow: {
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    handle: {
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.border.muted,
    },
    heroRow: {
      flexDirection: "row",
      gap: spacing.md,
      alignItems: "flex-start",
      marginBottom: spacing.md,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    heroCopy: {
      flex: 1,
    },
    eyebrow: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    title: {
      marginTop: 4,
      fontFamily: fonts.titleFamily,
      color: colors.text.primary,
      fontSize: 26,
      lineHeight: 30,
      letterSpacing: -0.4,
    },
    subtitle: {
      marginTop: 6,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 18,
    },
    section: {
      marginBottom: spacing.md,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      padding: spacing.md,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    sectionLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 19,
    },
    sectionMeta: {
      fontFamily: fonts.monoFamily,
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    highlightList: {
      gap: spacing.sm,
    },
    highlightRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    checkBubble: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.primary,
    },
    highlightText: {
      flex: 1,
      fontFamily: fonts.bodyFamily,
      color: colors.text.primary,
      fontSize: 13,
      lineHeight: 18,
    },
    footer: {
      gap: spacing.sm,
    },
    secondaryButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.base,
    },
    secondaryButtonPressed: {
      opacity: 0.84,
    },
    secondaryLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 14,
      lineHeight: 18,
    },
  });
}
