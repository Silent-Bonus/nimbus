import React, { useContext, useMemo } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet } from "@/theme/types";

type SocialActionTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type SocialActionStyles = ReturnType<typeof createStyles>;

type ActionRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
  onPress: () => void;
  colors: SvaColorSet;
  styles: SocialActionStyles;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  appDeepLink?: string;
  webUrl: string;
};

function ActionRow({
  icon,
  title,
  description,
  onPress,
  colors,
  styles,
}: ActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.actionCardPressed,
      ]}
    >
      <View style={styles.actionIconWrap}>
        <Ionicons name={icon} size={18} color={colors.text.primary} />
      </View>

      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionText}>{description}</Text>
      </View>
    </Pressable>
  );
}

export default function SocialActionModal({
  visible,
  onClose,
  title = "SVA Social",
  appDeepLink,
  webUrl,
}: Props) {
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

  const styles: SocialActionStyles = useMemo(
    () => createStyles(svaColors, fonts, insets.bottom),
    [svaColors, fonts, insets.bottom]
  );

  const showToast = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
      return;
    }

    Alert.alert("SVA", msg);
  };

  const openInApp = async () => {
    try {
      if (appDeepLink) {
        const canOpen = await Linking.canOpenURL(appDeepLink);
        if (canOpen) {
          await Linking.openURL(appDeepLink);
          onClose();
          return;
        }
      }

      await Linking.openURL(webUrl);
      onClose();
    } catch (error) {
      console.warn("openInApp error", error);
      showToast("Unable to open link");
    }
  };

  const openInBrowser = async () => {
    try {
      await Linking.openURL(webUrl);
      onClose();
    } catch (error) {
      console.warn("openInBrowser error", error);
      showToast("Unable to open link");
    }
  };

  const copyLink = async () => {
    try {
      await Clipboard.setStringAsync(webUrl);
      showToast("Link copied to clipboard");
      onClose();
    } catch (error) {
      console.warn("copyLink error", error);
      showToast("Unable to copy link");
    }
  };

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
                    name="share-social-outline"
                    size={14}
                    color={svaColors.brand.primary}
                  />
                  <Text style={styles.headerBadgeText} numberOfLines={1}>
                    SVA social
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close social links"
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
                  {title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Open the link in app, browser, or copy it for later.
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
                    name="sparkles-outline"
                    size={20}
                    color={svaColors.brand.primary}
                  />
                </View>

                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryTitle}>Connect with SVA</Text>
                  <Text style={styles.summaryText}>
                    Choose the fastest way to open the social profile or keep
                    the link handy for sharing.
                  </Text>
                </View>
              </View>

              <View style={styles.actionList}>
                <ActionRow
                  icon="open-outline"
                  title="Open in app"
                  description="Jump straight into the native app if it is installed."
                  onPress={openInApp}
                  colors={svaColors}
                  styles={styles}
                />

                <ActionRow
                  icon="globe-outline"
                  title="Open in browser"
                  description="Use the web profile as a clean fallback."
                  onPress={openInBrowser}
                  colors={svaColors}
                  styles={styles}
                />

                <ActionRow
                  icon="copy-outline"
                  title="Copy link"
                  description="Copy the profile link to paste or share later."
                  onPress={copyLink}
                  colors={svaColors}
                  styles={styles}
                />
              </View>

              <View style={styles.footerCard}>
                <View style={styles.footerCopy}>
                  <Text style={styles.footerTitle}>Need another route?</Text>
                  <Text style={styles.footerText}>
                    You can copy the SVA link and share it anywhere without
                    leaving the sheet.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close social links"
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.footerButton,
                    pressed && styles.footerButtonPressed,
                  ]}
                >
                  <Text style={styles.footerButtonText}>Done</Text>
                </Pressable>
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
  fonts: SocialActionTypography,
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
          shadowOpacity: 0.32,
          shadowRadius: 24,
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
    actionList: {
      gap: 10,
    },
    actionCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      borderRadius: 18,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      padding: 14,
    },
    actionCardPressed: {
      backgroundColor: colors.interaction.hover,
    },
    actionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      marginTop: 1,
    },
    actionCopy: {
      flex: 1,
      paddingRight: 4,
    },
    actionTitle: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 15,
      lineHeight: 21,
      color: colors.text.primary,
    },
    actionText: {
      marginTop: 4,
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text.secondary,
    },
    footerCard: {
      marginTop: 14,
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
    footerButton: {
      minHeight: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.button.ghost.bg,
      borderWidth: 1,
      borderColor: colors.button.ghost.border,
    },
    footerButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    footerButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 15,
      lineHeight: 19,
      letterSpacing: 0.2,
      color: colors.button.ghost.text,
    },
  });
