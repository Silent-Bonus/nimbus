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

type TermsBullet = {
  label: string;
  text: string;
};

type TermsSection = {
  number: string;
  title: string;
  paragraphs?: string[];
  bullets?: TermsBullet[];
};

type TermsTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type TermsStyles = ReturnType<typeof createStyles>;

type TermsSectionCardProps = {
  section: TermsSection;
  styles: TermsStyles;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const TERMS_SECTIONS: TermsSection[] = [
  {
    number: "1",
    title: "Acceptance of Terms",
    paragraphs: [
      "By using Nimbus, you agree to these Terms of Service. If you do not agree, please do not use the app.",
    ],
  },
  {
    number: "2",
    title: "Use of the App",
    paragraphs: [
      "Nimbus is intended for personal wellness and productivity use. You may not use it for unlawful, harmful, or unauthorized commercial purposes.",
    ],
  },
  {
    number: "3",
    title: "User Accounts",
    paragraphs: [
      "You are responsible for keeping your account credentials confidential and for providing accurate, current information in your profile.",
    ],
  },
  {
    number: "4",
    title: "Subscriptions and Payments",
    paragraphs: [
      "Some features may require a subscription. Fees, renewals, and refunds are governed by the plan details shown in the app and applicable law.",
    ],
  },
  {
    number: "5",
    title: "Intellectual Property",
    bullets: [
      {
        label: "Content",
        text: "Text, visuals, audio, branding, and product materials are owned by us or our licensors.",
      },
      {
        label: "Restrictions",
        text: "You may not copy, distribute, or create derivative works without written permission.",
      },
    ],
  },
  {
    number: "6",
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate access if you violate these terms or misuse the service. You can delete your account at any time through the app.",
    ],
  },
  {
    number: "7",
    title: "Limitation of Liability",
    paragraphs: [
      "Nimbus is provided as-is to the extent permitted by law. We are not liable for indirect or consequential damages from app use.",
    ],
  },
  {
    number: "8",
    title: "Changes to Terms",
    paragraphs: [
      "We may update these terms from time to time. Continued use of Nimbus after an update means you accept the revised terms.",
    ],
  },
  {
    number: "9",
    title: "Contact Us",
    bullets: [
      {
        label: "Email",
        text: "support@yourdomain.com",
      },
      {
        label: "Path",
        text: "Settings > Support > Contact Us",
      },
    ],
  },
];

function TermsSectionCard({ section, styles }: TermsSectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionNumberBadge}>
          <Text style={styles.sectionNumberText}>{section.number}</Text>
        </View>

        <View style={styles.sectionHeadingCopy}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      </View>

      {section.paragraphs?.map((paragraph, index) => (
        <Text
          key={`${section.number}-paragraph-${index}`}
          style={styles.sectionParagraph}
        >
          {paragraph}
        </Text>
      ))}

      {section.bullets?.length ? (
        <View style={styles.bulletList}>
          {section.bullets.map((bullet) => (
            <View key={bullet.label} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletLabel}>{bullet.label}</Text>
                {`: ${bullet.text}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function TermsModal({ visible, onClose }: Props) {
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

  const styles: TermsStyles = useMemo(
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
                    name="document-text-outline"
                    size={14}
                    color={svaColors.brand.primary}
                  />
                  <Text style={styles.headerBadgeText} numberOfLines={1}>
                    Legal terms
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close terms of service"
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
                  Terms of Service
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Last updated May 10, 2025
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
                    How Nimbus can be used
                  </Text>
                  <Text style={styles.summaryText}>
                    These terms explain account use, payments, intellectual
                    property, and the limits that apply when using the app.
                  </Text>
                </View>
              </View>

              <View style={styles.sectionList}>
                {TERMS_SECTIONS.map((section) => (
                  <TermsSectionCard
                    key={section.number}
                    section={section}
                    styles={styles}
                  />
                ))}
              </View>

              <View style={styles.footerCard}>
                <View style={styles.footerCopy}>
                  <Text style={styles.footerTitle}>Need clarification?</Text>
                  <Text style={styles.footerText}>
                    Use Contact Us from Settings if you need help with account
                    access, billing, or any policy question.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close terms of service"
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
  fonts: TermsTypography,
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
    sectionList: {
      gap: 12,
    },
    sectionCard: {
      borderRadius: 20,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      padding: 16,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
    sectionNumberBadge: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      marginTop: 1,
    },
    sectionNumberText: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      color: colors.text.secondary,
    },
    sectionHeadingCopy: {
      flex: 1,
      paddingRight: 4,
    },
    sectionTitle: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 15,
      lineHeight: 21,
      color: colors.text.primary,
    },
    sectionParagraph: {
      fontFamily: fonts.bodyFamily,
      fontSize: 14,
      lineHeight: 21,
      color: colors.text.secondary,
      marginBottom: 10,
    },
    bulletList: {
      gap: 10,
      marginTop: 2,
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    bulletDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      marginTop: 7,
      backgroundColor: colors.brand.primary,
      shadowColor: colors.brand.primary,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 0 },
      elevation: 2,
    },
    bulletText: {
      flex: 1,
      fontFamily: fonts.bodyFamily,
      fontSize: 14,
      lineHeight: 21,
      color: colors.text.secondary,
    },
    bulletLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
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
