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
import type { Spacing, SvaColorSet } from "@/theme/types";

export type ActionModalButton = {
  label: string;
  onPress?: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "outline";
  accessibilityLabel?: string;
  testID?: string;
  loading?: boolean;
  disabled?: boolean;
  closeOnPress?: boolean;
};

type ActionModalFonts = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type ActionModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  body?: string;
  eyebrow?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  primaryAction: ActionModalButton;
  secondaryAction?: ActionModalButton;
  dismissOnBackdropPress?: boolean;
  showCloseButton?: boolean;
  isBusy?: boolean;
};

export default function ActionModal({
  visible,
  onClose,
  title,
  body,
  eyebrow = "Attention",
  iconName = "sparkles-outline",
  primaryAction,
  secondaryAction,
  dismissOnBackdropPress = true,
  showCloseButton = true,
  isBusy = false,
}: ActionModalProps) {
  const { svaColors, svaTypography, typography, spacing } =
    useContext(ThemeContext);

  const styles = useMemo(
    () =>
      createStyles(
        {
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
        },
        spacing,
        svaColors
      ),
    [spacing, svaColors, svaTypography, typography]
  );

  const canDismiss = !isBusy;

  const pressAction = async (action: ActionModalButton) => {
    if (isBusy || action.disabled || action.loading) {
      return;
    }

    if (action.closeOnPress ?? true) {
      onClose();
    }

    await action.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={canDismiss ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal"
          onPress={dismissOnBackdropPress && canDismiss ? onClose : undefined}
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
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                style={styles.contentScroll}
                contentContainerStyle={styles.contentScrollContent}
              >
                <View style={styles.handleRow}>
                  <View style={styles.handle} />
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.eyebrow}>{eyebrow}</Text>

                  {showCloseButton ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Close modal"
                      disabled={!canDismiss}
                      onPress={canDismiss ? onClose : undefined}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.closeButton,
                        !canDismiss && styles.closeButtonDisabled,
                        pressed && canDismiss && styles.closeButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={18}
                        color={svaColors.text.secondary}
                      />
                    </Pressable>
                  ) : null}
                </View>

                <View style={styles.heroRow}>
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={iconName}
                      size={18}
                      color={svaColors.brand.primary}
                    />
                  </View>

                  <View style={styles.heroCopy}>
                    <Text style={styles.title}>{title}</Text>
                    {!!body && <Text style={styles.body}>{body}</Text>}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                {secondaryAction ? (
                  <NimbusButton
                    label={secondaryAction.label}
                    onPress={() => pressAction(secondaryAction)}
                    variant={secondaryAction.variant ?? "outline"}
                    loading={secondaryAction.loading}
                    disabled={secondaryAction.disabled || isBusy}
                    accessibilityLabel={
                      secondaryAction.accessibilityLabel ??
                      secondaryAction.label
                    }
                    testID={secondaryAction.testID}
                  />
                ) : null}

                <NimbusButton
                  label={primaryAction.label}
                  onPress={() => pressAction(primaryAction)}
                  variant={primaryAction.variant ?? "primary"}
                  loading={primaryAction.loading}
                  disabled={primaryAction.disabled || isBusy}
                  accessibilityLabel={
                    primaryAction.accessibilityLabel ?? primaryAction.label
                  }
                  testID={primaryAction.testID}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(
  fonts: ActionModalFonts,
  spacing: Spacing,
  colors: SvaColorSet
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
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
    card: {
      borderRadius: 31,
      maxHeight: "86%",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    contentScroll: {
      flexGrow: 0,
    },
    contentScrollContent: {
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
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
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    eyebrow: {
      flex: 1,
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    closeButtonPressed: {
      opacity: 0.84,
    },
    closeButtonDisabled: {
      opacity: 0.45,
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
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
      minWidth: 0,
    },
    title: {
      fontFamily: fonts.titleFamily,
      color: colors.text.primary,
      fontSize: 28,
      lineHeight: 32,
      letterSpacing: -0.45,
    },
    body: {
      marginTop: spacing.xs,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 21,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.sm,
    },
  });
}
