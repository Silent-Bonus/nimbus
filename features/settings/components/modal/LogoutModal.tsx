import React, { useContext, useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet } from "@/theme/types";

type LogoutTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type LogoutStyles = ReturnType<typeof createStyles>;

type FooterButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  variant: "ghost" | "destructive";
  styles: LogoutStyles;
};

type Props = {
  visible: boolean;
  onLogout: () => void | Promise<void>;
  onClose: () => void;
};

function FooterButton({ label, onPress, variant, styles }: FooterButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        void onPress();
      }}
      style={({ pressed }) => [
        styles.footerButton,
        variant === "destructive"
          ? styles.footerButtonDestructive
          : styles.footerButtonGhost,
        pressed &&
          (variant === "destructive"
            ? styles.footerButtonDestructivePressed
            : styles.footerButtonGhostPressed),
      ]}
    >
      <Text
        style={[
          styles.footerButtonText,
          variant === "destructive" && styles.footerButtonTextDestructive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function LogoutModal({ visible, onLogout, onClose }: Props) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const fonts = useMemo(
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

  const styles: LogoutStyles = useMemo(
    () => createStyles(svaColors, fonts, insets.bottom),
    [svaColors, fonts, insets.bottom]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetShell} pointerEvents="box-none">
          <View style={styles.sheet}>
            <View style={styles.sheetAccent} />

            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View style={styles.headerBadge}>
                  <Ionicons
                    name="log-out-outline"
                    size={14}
                    color={svaColors.brand.primary}
                  />
                  <Text style={styles.headerBadgeText} numberOfLines={1}>
                    Account action
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close logout dialog"
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={svaColors.text.primary}
                  />
                </Pressable>
              </View>

              <View style={styles.headerCopy}>
                <Text style={styles.title} numberOfLines={1}>
                  Logout
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  You’ll need to sign in again to continue using your account.
                </Text>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.summaryCard}>
                <View style={styles.summaryIconWrap}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={svaColors.brand.primary}
                  />
                </View>

                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryTitle}>
                    Ready to end this session?
                  </Text>
                  <Text style={styles.summaryText}>
                    This will sign you out of SVA on this device. You can come
                    back anytime with your usual sign-in method.
                  </Text>
                </View>
              </View>

              <View style={styles.footerCard}>
                <View style={styles.footerCopy}>
                  <Text style={styles.footerTitle}>Confirm logout</Text>
                  <Text style={styles.footerText}>
                    Use Cancel if you want to stay signed in and return to the
                    settings screen.
                  </Text>
                </View>

                <View style={styles.buttonStack}>
                  <FooterButton
                    label="Cancel"
                    onPress={onClose}
                    variant="ghost"
                    styles={styles}
                  />

                  <FooterButton
                    label="Logout"
                    onPress={onLogout}
                    variant="destructive"
                    styles={styles}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (
  colors: SvaColorSet,
  fonts: LogoutTypography,
  bottomInset: number
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay.strong,
    },
    sheetShell: {
      marginHorizontal: 12,
      marginBottom: bottomInset + 10,
      borderRadius: 28,
      backgroundColor: colors.surface.base,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.default,
          shadowOpacity: 0.34,
          shadowRadius: 26,
          shadowOffset: { width: 0, height: 12 },
        },
        android: {
          elevation: 18,
        },
      }),
    },
    sheet: {
      borderRadius: 28,
      maxHeight: "88%",
      overflow: "hidden",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    sheetAccent: {
      height: 2,
      backgroundColor: colors.brand.primary,
      opacity: 0.9,
    },
    sheetHandleWrap: {
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 2,
    },
    sheetHandle: {
      width: 42,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.border.default,
      opacity: 0.95,
    },
    header: {
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 14,
    },
    headerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    headerCopy: {
      marginTop: 14,
    },
    headerBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: colors.brand.primary,
    },
    headerBadgeText: {
      fontFamily: fonts.monoFamily,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      color: colors.brand.primary,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    closeButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    title: {
      fontFamily: fonts.titleFamily,
      fontSize: 25,
      lineHeight: 29,
      letterSpacing: -0.3,
      color: colors.text.primary,
    },
    subtitle: {
      marginTop: 6,
      fontFamily: fonts.bodyFamily,
      fontSize: 12.5,
      lineHeight: 17,
      color: colors.text.secondary,
    },
    scrollContent: {
      paddingHorizontal: 14,
      paddingBottom: 18,
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      borderRadius: 20,
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.brand.primary,
      padding: 16,
      marginBottom: 14,
    },
    summaryIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      marginTop: 1,
    },
    summaryCopy: {
      flex: 1,
      paddingRight: 6,
    },
    summaryTitle: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 16,
      lineHeight: 22,
      color: colors.text.primary,
    },
    summaryText: {
      marginTop: 6,
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text.secondary,
    },
    footerCard: {
      borderRadius: 20,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      padding: 16,
      gap: 12,
    },
    footerCopy: {
      gap: 4,
    },
    footerTitle: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 16,
      lineHeight: 22,
      color: colors.text.primary,
    },
    footerText: {
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text.secondary,
    },
    buttonStack: {
      gap: 10,
    },
    footerButton: {
      minHeight: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    footerButtonGhost: {
      backgroundColor: colors.button.ghost.bg,
      borderColor: colors.button.ghost.border,
    },
    footerButtonGhostPressed: {
      backgroundColor: colors.interaction.hover,
    },
    footerButtonDestructive: {
      backgroundColor: colors.state.error,
      borderColor: colors.state.error,
    },
    footerButtonDestructivePressed: {
      opacity: 0.92,
    },
    footerButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 15,
      lineHeight: 19,
      letterSpacing: 0.2,
      color: colors.button.ghost.text,
    },
    footerButtonTextDestructive: {
      color: colors.text.inverse,
    },
  });
