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
  const { svaColors, svaTypography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const fonts = useMemo(
    () => ({
      titleFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        svaTypography.textStyle.heading2.fontFamily ??
        "CormorantGaramond_500Medium",
      bodyFamily:
        svaTypography.fontFamily.body,
      bodyStrongFamily:
        svaTypography.fontFamily.bodyMedium,
      monoFamily:
        svaTypography.fontFamily.mono,
    }),
    [svaTypography]
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

  const openProfile = async () => {
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
      console.warn("openProfile error", error);
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
              <View style={styles.actionList}>
                <ActionRow
                  icon="open-outline"
                  title="Open profile"
                  description="Open the social app when available, or use the browser."
                  onPress={openProfile}
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
      justifyContent: "flex-end",
      gap: 10,
    },
    headerCopy: {
      marginTop: 8,
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
  });
