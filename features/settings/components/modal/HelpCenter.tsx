import React, { useContext, useEffect, useMemo, useState } from "react";
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

type HelpCenterFaq = {
  topic: string;
  question: string;
  answer: string;
};

type HelpCenterTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type HelpCenterStyles = ReturnType<typeof createStyles>;

type FaqItemProps = {
  item: HelpCenterFaq;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  colors: SvaColorSet;
  styles: HelpCenterStyles;
};

const FAQS: HelpCenterFaq[] = [
  {
    topic: "Getting started",
    question: "How do I create a new habit?",
    answer:
      "Open the Habits tab, tap Add Habit, then set the name, frequency, and reminder time to start tracking.",
  },
  {
    topic: "Reminders",
    question: "Can I set reminders for my habits?",
    answer:
      "Yes. When you create or edit a habit, turn on reminders and choose a time that fits your routine.",
  },
  {
    topic: "Weekly planning",
    question: "How do I change the day my week starts?",
    answer:
      "You can change the start day of the week from Settings under Week Start On.",
  },
  {
    topic: "Privacy",
    question: "Are my personal details secure?",
    answer:
      "Yes. Your data is encrypted and stored securely. We do not share or sell your personal information.",
  },
  {
    topic: "Offline use",
    question: "Can I access the app offline?",
    answer:
      "Basic features like habit tracking work offline. Sync and backup still need an internet connection.",
  },
];

function FaqItem({
  item,
  index,
  isOpen,
  onToggle,
  colors,
  styles,
}: FaqItemProps) {
  return (
    <View style={[styles.faqCard, isOpen && styles.faqCardActive]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.question}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.faqQuestionRow,
          pressed && styles.faqQuestionRowPressed,
        ]}
      >
        <View style={[styles.indexBadge, isOpen && styles.indexBadgeActive]}>
          <Text style={[styles.indexText, isOpen && styles.indexTextActive]}>
            {String(index + 1).padStart(2, "0")}
          </Text>
        </View>

        <View style={styles.questionCopy}>
          <Text style={styles.questionTopic} numberOfLines={1}>
            {item.topic}
          </Text>
          <Text style={styles.questionText}>{item.question}</Text>
        </View>

        <View style={styles.chevronWrap}>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={isOpen ? colors.brand.primary : colors.text.secondary}
          />
        </View>
      </Pressable>

      {isOpen ? (
        <View style={styles.answerWrap}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      ) : null}
    </View>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function FAQModal({ visible, onClose }: Props) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) {
      setOpenIndex(null);
    }
  }, [visible]);

  const titleFamily =
    svaTypography?.textStyle.authTitle.fontFamily ??
    typography.h2.fontFamily ??
    "CormorantGaramond_500Medium";
  const bodyFamily =
    svaTypography?.textStyle.body.fontFamily ??
    typography.body.fontFamily ??
    "Outfit_400Regular";
  const bodyStrongFamily =
    svaTypography?.textStyle.bodyMedium.fontFamily ??
    typography.bodyStrong.fontFamily ??
    "Outfit_600SemiBold";
  const monoFamily =
    svaTypography?.textStyle.authMonoLabel.fontFamily ?? "SpaceMono-Regular";

  const styles = useMemo(
    () =>
      createStyles(
        svaColors,
        {
          titleFamily,
          bodyFamily,
          bodyStrongFamily,
          monoFamily,
        },
        insets.bottom
      ),
    [
      svaColors,
      titleFamily,
      bodyFamily,
      bodyStrongFamily,
      monoFamily,
      insets.bottom,
    ]
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
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>Help Center</Text>
                <Text style={styles.title}>Frequently asked questions</Text>
                <Text style={styles.subtitle}>
                  Quick answers before you reach out.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close help center"
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.faqList}>
                {FAQS.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    item={item}
                    index={index}
                    isOpen={openIndex === index}
                    colors={svaColors}
                    onToggle={() =>
                      setOpenIndex((current) => (current === index ? null : index))
                    }
                    styles={styles}
                  />
                ))}
              </View>

              <View style={styles.footerCard}>
                <View style={styles.footerCopy}>
                  <Text style={styles.footerTitle}>Need something else?</Text>
                  <Text style={styles.footerText}>
                    Use Contact Us from Settings for account, feedback, or bug
                    reports.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close help center"
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
  fonts: HelpCenterTypography,
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
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 14,
    },
    headerCopy: {
      flex: 1,
      paddingRight: 12,
    },
    eyebrow: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: colors.brand.primary,
    },
    title: {
      marginTop: 8,
      fontFamily: fonts.titleFamily,
      fontSize: 26,
      lineHeight: 30,
      letterSpacing: -0.4,
      color: colors.text.primary,
    },
    subtitle: {
      marginTop: 7,
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text.secondary,
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
    faqList: {
      gap: 12,
    },
    faqCard: {
      borderRadius: 20,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      overflow: "hidden",
    },
    faqCardActive: {
      backgroundColor: colors.bg.subtle,
      borderColor: colors.brand.primary,
    },
    faqQuestionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    faqQuestionRowPressed: {
      backgroundColor: colors.interaction.hover,
    },
    indexBadge: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      marginTop: 1,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    indexBadgeActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    indexText: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      color: colors.text.secondary,
    },
    indexTextActive: {
      color: colors.bg.base,
    },
    questionCopy: {
      flex: 1,
      paddingRight: 10,
    },
    questionTopic: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 2.1,
      textTransform: "uppercase",
      color: colors.brand.primary,
      marginBottom: 5,
    },
    questionText: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 15,
      lineHeight: 21,
      color: colors.text.primary,
    },
    chevronWrap: {
      width: 28,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    answerWrap: {
      paddingHorizontal: 14,
      paddingTop: 0,
      paddingBottom: 14,
      paddingLeft: 56,
    },
    answerText: {
      fontFamily: fonts.bodyFamily,
      fontSize: 14,
      lineHeight: 21,
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
