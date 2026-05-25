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

type PolicyBullet = {
  label: string;
  text: string;
};

type PolicySection = {
  number: string;
  title: string;
  paragraphs?: string[];
  bullets?: PolicyBullet[];
};

type PrivacyPolicyTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type PrivacyPolicyStyles = ReturnType<typeof createStyles>;

type PolicySectionCardProps = {
  section: PolicySection;
  styles: PrivacyPolicyStyles;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const POLICY_SECTIONS: PolicySection[] = [
  {
    number: "1",
    title: "Information We Collect",
    bullets: [
      {
        label: "Personal Information",
        text: "Name, email, phone number, and profile data like age or preferences.",
      },
      {
        label: "Usage Data",
        text: "Tracked habits, reminders, and audio content usage.",
      },
      {
        label: "Device Info",
        text: "Device ID, OS version, and IP address.",
      },
    ],
  },
  {
    number: "2",
    title: "How We Use Your Information",
    paragraphs: [
      "We use your data to enable features, send reminders, personalize your experience, improve services, and ensure security.",
    ],
  },
  {
    number: "3",
    title: "Data Sharing",
    paragraphs: [
      "We do not sell your data. We may share limited info with service providers or law enforcement if required.",
    ],
  },
  {
    number: "4",
    title: "Data Storage & Security",
    paragraphs: [
      "Your data is encrypted and stored securely. You can request account deletion anytime.",
    ],
  },
  {
    number: "5",
    title: "User Control",
    paragraphs: [
      "Update your profile, manage notifications, or request data deletion within the app.",
    ],
  },
  {
    number: "6",
    title: "Children’s Privacy",
    paragraphs: [
      "This app is not for children under 13. We do not knowingly collect data from minors.",
    ],
  },
  {
    number: "7",
    title: "Changes to This Policy",
    paragraphs: [
      "We may update this policy as features evolve. You will be notified of major changes in the app.",
    ],
  },
  {
    number: "8",
    title: "Contact Us",
    paragraphs: [
      "Email: support@yourdomain.com",
      "Phone: (if applicable)",
      "Settings → Support → Contact Us",
    ],
  },
];

function PolicySectionCard({ section, styles }: PolicySectionCardProps) {
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

export default function PrivacyPolicyModal({ visible, onClose }: Props) {
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

  const styles: PrivacyPolicyStyles = useMemo(
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
                    name="shield-checkmark-outline"
                    size={14}
                    color={svaColors.brand.primary}
                  />
                  <Text style={styles.headerBadgeText} numberOfLines={1}>
                    Private by design
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close privacy policy"
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
                  Privacy Policy
                </Text>
                <Text style={styles.subtitle}>Last updated May 10, 2025</Text>
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
                    name="document-text-outline"
                    size={20}
                    color={svaColors.brand.primary}
                  />
                </View>

                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryTitle}>
                    How Nimbus handles your data
                  </Text>
                  <Text style={styles.summaryText}>
                    This policy explains what we collect, how we use it, and
                    the controls you have inside the app.
                  </Text>
                </View>
              </View>

              <View style={styles.sectionList}>
                {POLICY_SECTIONS.map((section) => (
                  <PolicySectionCard
                    key={section.number}
                    section={section}
                    styles={styles}
                  />
                ))}
              </View>

              <View style={styles.footerCard}>
                <View style={styles.footerCopy}>
                  <Text style={styles.footerTitle}>Need a data request?</Text>
                  <Text style={styles.footerText}>
                    Use Contact Us from Settings if you want help with account
                    access, deletion, or policy questions.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close privacy policy"
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
  fonts: PrivacyPolicyTypography,
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
      paddingBottom: 20,
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
      flexShrink: 1,
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
