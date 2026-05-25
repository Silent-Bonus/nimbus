import React, { useContext, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet, Spacing } from "@/theme/types";

type SheetTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type SettingsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  subtitle: string;
  badgeLabel?: string;
  badgeIcon?: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  sheetStyle?: StyleProp<ViewStyle>;
  closeLabel?: string;
};

type SettingsBottomSheetStyles = ReturnType<typeof createStyles>;

export default function SettingsBottomSheet({
  visible,
  onClose,
  eyebrow,
  title,
  subtitle,
  badgeLabel,
  badgeIcon = "options-outline",
  children,
  footer,
  contentStyle,
  sheetStyle,
  closeLabel,
}: SettingsBottomSheetProps) {
  const { svaColors, svaTypography, typography, spacing } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const fonts = useMemo<SheetTypography>(
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

  const styles: SettingsBottomSheetStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing, insets.bottom),
    [svaColors, fonts, spacing, insets.bottom]
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
          <View style={[styles.sheet, sheetStyle]}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              <View style={styles.headerRight}>
                {badgeLabel ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name={badgeIcon}
                      size={13}
                      color={svaColors.brand.primary}
                    />
                    <Text style={styles.badgeText} numberOfLines={1}>
                      {badgeLabel}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={closeLabel ?? `Close ${title.toLowerCase()}`}
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
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.scrollContent, contentStyle]}
            >
              {children}
            </ScrollView>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(
  colors: SvaColorSet,
  fonts: SheetTypography,
  spacing: Spacing,
  bottomInset: number
) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.overlay.strong,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    sheetShell: {
      width: "100%",
      alignSelf: "stretch",
      zIndex: 1,
      elevation: 1,
    },
    sheet: {
      position: "relative",
      maxHeight: "92%",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: spacing.sm,
      paddingBottom: bottomInset + spacing.md,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      overflow: "hidden",
      zIndex: 1,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.2,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -8 },
      elevation: 16,
    },
    sheetHandleWrap: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    sheetHandle: {
      width: 42,
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.border.muted,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    headerCopy: {
      flex: 1,
    },
    eyebrow: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    title: {
      marginTop: 4,
      fontFamily: fonts.titleFamily,
      color: colors.text.primary,
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.25,
    },
    subtitle: {
      marginTop: 4,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
    headerRight: {
      alignItems: "flex-end",
      gap: 10,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      maxWidth: 150,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    badgeText: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    closeButtonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    footer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
  });
}
