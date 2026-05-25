import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { contactUs } from "@/services/contactService";
import { getDeviceDetails } from "@/utils/helper";
import type {
  ContactAttachment,
  ContactCategory,
} from "@/types/contactTypes";
import type { SvaColorSet } from "@/theme/types";

type CategoryOption = {
  key: ContactCategory;
  label: string;
  hint: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

type ContactUsTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type ContactUsStyles = ReturnType<typeof createStyles>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CATEGORIES: CategoryOption[] = [
  {
    key: "BUG",
    label: "Report a bug",
    hint: "Something looks broken",
    icon: "bug-outline",
  },
  {
    key: "FEATURE",
    label: "Request feature",
    hint: "Suggest a new improvement",
    icon: "sparkles-outline",
  },
  {
    key: "FEEDBACK",
    label: "Share feedback",
    hint: "Tell us what feels off",
    icon: "chatbubble-ellipses-outline",
  },
  {
    key: "CONTACT",
    label: "Message us",
    hint: "General support question",
    icon: "mail-outline",
  },
];

const MAX_MB = 3.3;
const MAX_BYTES = Math.floor(MAX_MB * 1024 * 1024);

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function getMessagePlaceholder(category: ContactCategory) {
  switch (category) {
    case "BUG":
      return "What happened? Include steps to reproduce, expected vs actual, and anything that helps us trace it.";
    case "FEATURE":
      return "Describe the feature you want and why it would help your workflow.";
    case "FEEDBACK":
      return "Share what feels great, what feels rough, or what could be improved.";
    case "CONTACT":
    default:
      return "Write your message here. We will route it to the right place.";
  }
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return "Unable to send message. Please try again.";
}

export default function ContactUsModal({ visible, onClose }: Props) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState<ContactCategory>("BUG");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<ContactAttachment | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);

  useEffect(() => {
    if (!visible) {
      setLoading(false);
      setSubjectFocused(false);
      setBodyFocused(false);
    }
  }, [visible]);

  const activeCategory =
    CATEGORIES.find((item) => item.key === category) ?? CATEGORIES[0];

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

  const styles: ContactUsStyles = useMemo(
    () => createStyles(svaColors, fonts, insets.bottom),
    [svaColors, fonts, insets.bottom]
  );

  const tooLarge = !!attachment?.size && attachment.size > MAX_BYTES;
  const canSubmit =
    subject.trim().length > 0 &&
    body.trim().length > 0 &&
    !loading &&
    !tooLarge;

  const attachmentLabel = useMemo(() => {
    if (!attachment) return "";
    if (attachment.size) return formatBytes(attachment.size);
    if (attachment.mimeType) return attachment.mimeType;
    return "Ready to send";
  }, [attachment]);

  const resetAndClose = () => {
    Keyboard.dismiss();
    setCategory("BUG");
    setSubject("");
    setBody("");
    setAttachment(null);
    setLoading(false);
    setSubmitted(false);
    setErrMsg("");
    setSubjectFocused(false);
    setBodyFocused(false);
    onClose();
  };

  const pickAttachment = async () => {
    setErrMsg("");

    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ["image/*", "application/pdf", "text/plain"],
      });

      if (res.canceled) return;

      const file = res.assets?.[0];
      if (!file?.uri) return;

      const size = file.size ?? 0;
      if (size && size > MAX_BYTES) {
        setAttachment(null);
        setErrMsg(
          `File too large. Max ${MAX_MB} MB. Selected: ${formatBytes(size)}.`
        );
        return;
      }

      setAttachment({
        uri: file.uri,
        name: file.name ?? "attachment",
        mimeType: file.mimeType,
        size: file.size,
      });
    } catch (error) {
      setErrMsg(getErrorMessage(error));
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (tooLarge) {
      setErrMsg("");
    }
  };

  const submit = async () => {
    if (!canSubmit) return;

    Keyboard.dismiss();
    setLoading(true);
    setErrMsg("");

    try {
      const { os, device } = await getDeviceDetails();

      const result = await contactUs({
        category,
        subject: subject.trim(),
        message: body.trim(),
        os,
        device,
        screenshot: attachment,
      });

      if (result?.success) {
        setSubmitted(true);
        return;
      }

      setErrMsg(result?.message ?? "Unable to send message. Please try again.");
    } catch (error) {
      setErrMsg(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={resetAndClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={resetAndClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <View style={styles.sheetShell} pointerEvents="box-none">
            <View style={styles.sheet}>
              <View style={styles.sheetAccent} />

              <View style={styles.sheetHandleWrap}>
                <View style={styles.sheetHandle} />
              </View>

              <View style={styles.header}>
                <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>Support</Text>
                  <Text style={styles.title}>
                    {submitted ? "Message sent" : "Contact us"}
                  </Text>
                  <Text style={styles.subtitle}>
                    {submitted
                      ? "We have received your message and will follow up soon."
                      : "Send a note to Nimbus support. We usually reply within 24 to 48 hours."}
                  </Text>
                </View>

                <View style={styles.headerBadge}>
                  <Ionicons
                    name={activeCategory.icon}
                    size={14}
                    color={svaColors.brand.primary}
                  />
                  <Text style={styles.headerBadgeText} numberOfLines={1}>
                    {activeCategory.label}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close contact us"
                  onPress={resetAndClose}
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
                {submitted ? (
                  <View style={styles.successCard}>
                    <View style={styles.successIconWrap}>
                      <Ionicons
                        name="checkmark"
                        size={22}
                        color={svaColors.bg.base}
                      />
                    </View>

                    <Text style={styles.successTitle}>Message sent</Text>
                    <Text style={styles.successText}>
                      Thanks. We have your request and will review it as soon
                      as possible.
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Done"
                      onPress={resetAndClose}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.primaryButtonPressed,
                      ]}
                    >
                      <Text style={styles.primaryButtonText}>Done</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View style={styles.section}>
                      <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionLabel}>Category</Text>
                        <Text style={styles.sectionMeta}>Choose one</Text>
                      </View>

                      <View style={styles.categoryGrid}>
                        {CATEGORIES.map((item) => {
                          const active = item.key === category;

                          return (
                            <Pressable
                              key={item.key}
                              accessibilityRole="button"
                              accessibilityLabel={item.label}
                              onPress={() => {
                                setCategory(item.key);
                                setErrMsg("");
                              }}
                              style={({ pressed }) => [
                                styles.categoryCard,
                                active && styles.categoryCardActive,
                                pressed && styles.categoryCardPressed,
                              ]}
                            >
                              <View
                                style={[
                                  styles.categoryIconWrap,
                                  active && styles.categoryIconWrapActive,
                                ]}
                              >
                                <Ionicons
                                  name={item.icon}
                                  size={18}
                                  color={
                                    active
                                      ? svaColors.bg.base
                                      : svaColors.text.secondary
                                  }
                                />
                              </View>

                              <Text
                                style={[
                                  styles.categoryTitle,
                                  active && styles.categoryTitleActive,
                                ]}
                              >
                                {item.label}
                              </Text>

                              <Text style={styles.categoryHint}>
                                {item.hint}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.fieldHeaderRow}>
                        <Text style={styles.sectionLabel}>Subject</Text>
                        <Text style={styles.sectionMeta}>
                          {subject.length}/120
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.inputShell,
                          subjectFocused && styles.inputShellFocused,
                        ]}
                      >
                        <TextInput
                          value={subject}
                          onChangeText={(value) => {
                            setSubject(value);
                            if (errMsg) setErrMsg("");
                          }}
                          onFocus={() => setSubjectFocused(true)}
                          onBlur={() => setSubjectFocused(false)}
                          placeholder="Short summary"
                          placeholderTextColor={svaColors.text.disabled}
                          autoCapitalize="sentences"
                          autoCorrect
                          maxLength={120}
                          returnKeyType="next"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.fieldHeaderRow}>
                        <Text style={styles.sectionLabel}>Message</Text>
                        <Text style={styles.sectionMeta}>{body.length}/1000</Text>
                      </View>

                      <View
                        style={[
                          styles.inputShell,
                          styles.messageShell,
                          bodyFocused && styles.inputShellFocused,
                        ]}
                      >
                        <TextInput
                          value={body}
                          onChangeText={(value) => {
                            setBody(value);
                            if (errMsg) setErrMsg("");
                          }}
                          onFocus={() => setBodyFocused(true)}
                          onBlur={() => setBodyFocused(false)}
                          placeholder={getMessagePlaceholder(category)}
                          placeholderTextColor={svaColors.text.disabled}
                          autoCapitalize="sentences"
                          autoCorrect
                          multiline
                          numberOfLines={7}
                          maxLength={1000}
                          textAlignVertical="top"
                          style={styles.messageInput}
                        />
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionLabel}>Attachment</Text>
                        <Text style={styles.sectionMeta}>Max {MAX_MB} MB</Text>
                      </View>

                      {!attachment ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Add attachment"
                          onPress={pickAttachment}
                          style={({ pressed }) => [
                            styles.attachmentButton,
                            pressed && styles.attachmentButtonPressed,
                          ]}
                        >
                          <View style={styles.attachmentIconWrap}>
                            <Ionicons
                              name="attach-outline"
                              size={18}
                              color={svaColors.text.primary}
                            />
                          </View>

                          <View style={styles.attachmentCopy}>
                            <Text style={styles.attachmentTitle}>
                              Add file
                            </Text>
                            <Text style={styles.attachmentHint}>
                              png / jpg / pdf / txt
                            </Text>
                          </View>

                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={svaColors.text.secondary}
                          />
                        </Pressable>
                      ) : (
                        <View style={styles.attachmentCard}>
                          <View style={styles.attachmentIconWrap}>
                            <Ionicons
                              name="document-text-outline"
                              size={18}
                              color={svaColors.brand.primary}
                            />
                          </View>

                          <View style={styles.attachmentCopy}>
                            <Text style={styles.attachmentTitle} numberOfLines={1}>
                              {attachment.name}
                            </Text>
                            <Text style={styles.attachmentHint} numberOfLines={1}>
                              {attachmentLabel}
                            </Text>
                          </View>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Remove attachment"
                            onPress={removeAttachment}
                            hitSlop={10}
                            style={({ pressed }) => [
                              styles.removeAttachmentButton,
                              pressed && styles.removeAttachmentButtonPressed,
                            ]}
                          >
                            <Ionicons
                              name="close"
                              size={16}
                              color={svaColors.text.secondary}
                            />
                          </Pressable>
                        </View>
                      )}
                    </View>

                    {!!errMsg && (
                      <View style={styles.errorCard}>
                        <View style={styles.errorIconWrap}>
                          <Ionicons
                            name="warning-outline"
                            size={18}
                            color={svaColors.state.error}
                          />
                        </View>
                        <Text style={styles.errorText}>{errMsg}</Text>
                      </View>
                    )}

                    <View style={styles.tipCard}>
                      <View style={styles.tipIconWrap}>
                        <Ionicons
                          name="information-circle-outline"
                          size={18}
                          color={svaColors.brand.primary}
                        />
                      </View>
                      <Text style={styles.tipText}>
                        Tip: for bugs, include steps and a screenshot for faster
                        resolution.
                      </Text>
                    </View>

                    <View style={styles.buttonStack}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cancel"
                        onPress={resetAndClose}
                        style={({ pressed }) => [
                          styles.secondaryButton,
                          pressed && styles.secondaryButtonPressed,
                        ]}
                      >
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Send"
                        onPress={submit}
                        disabled={!canSubmit}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          !canSubmit && styles.primaryButtonDisabled,
                          pressed && canSubmit && styles.primaryButtonPressed,
                        ]}
                      >
                        {loading ? (
                          <ActivityIndicator
                            size="small"
                            color={svaColors.button.primary.text}
                          />
                        ) : (
                          <Text style={styles.primaryButtonText}>Send</Text>
                        )}
                      </Pressable>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (
  colors: SvaColorSet,
  fonts: ContactUsTypography,
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
    keyboardWrap: {
      flex: 1,
      justifyContent: "flex-end",
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
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 14,
      gap: 10,
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
      marginTop: 2,
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
      marginTop: 2,
    },
    closeButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    scrollContent: {
      paddingHorizontal: 14,
      paddingBottom: 18,
    },
    section: {
      marginTop: 2,
      marginBottom: 14,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    fieldHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    sectionLabel: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 2.2,
      textTransform: "uppercase",
      color: colors.text.secondary,
    },
    sectionMeta: {
      fontFamily: fonts.bodyFamily,
      fontSize: 11,
      lineHeight: 14,
      color: colors.text.secondary,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: 10,
    },
    categoryCard: {
      width: "48.5%",
      borderRadius: 20,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      padding: 14,
      minHeight: 124,
    },
    categoryCardActive: {
      backgroundColor: colors.bg.subtle,
      borderColor: colors.brand.primary,
    },
    categoryCardPressed: {
      backgroundColor: colors.interaction.hover,
    },
    categoryIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      marginBottom: 12,
    },
    categoryIconWrapActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    categoryTitle: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 14,
      lineHeight: 19,
      color: colors.text.primary,
    },
    categoryTitleActive: {
      color: colors.brand.primary,
    },
    categoryHint: {
      marginTop: 6,
      fontFamily: fonts.bodyFamily,
      fontSize: 11,
      lineHeight: 16,
      color: colors.text.secondary,
    },
    inputShell: {
      borderRadius: 18,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    inputShellFocused: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.bg.subtle,
    },
    messageShell: {
      minHeight: 160,
      paddingVertical: 14,
    },
    input: {
      fontFamily: fonts.bodyFamily,
      fontSize: 15,
      lineHeight: 21,
      color: colors.text.primary,
      padding: 0,
    },
    messageInput: {
      minHeight: 132,
      fontFamily: fonts.bodyFamily,
      fontSize: 15,
      lineHeight: 22,
      color: colors.text.primary,
      padding: 0,
      textAlignVertical: "top",
    },
    attachmentButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 18,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    attachmentButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    attachmentCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 18,
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.brand.primary,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    attachmentIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    attachmentCopy: {
      flex: 1,
      minWidth: 0,
    },
    attachmentTitle: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 14,
      lineHeight: 19,
      color: colors.text.primary,
    },
    attachmentHint: {
      marginTop: 3,
      fontFamily: fonts.bodyFamily,
      fontSize: 11,
      lineHeight: 15,
      color: colors.text.secondary,
    },
    removeAttachmentButton: {
      width: 30,
      height: 30,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    removeAttachmentButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    errorCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      borderRadius: 18,
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.state.error,
      padding: 14,
      marginBottom: 12,
    },
    errorIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      marginTop: 1,
    },
    errorText: {
      flex: 1,
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.state.error,
    },
    tipCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      borderRadius: 18,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      padding: 14,
      marginBottom: 14,
    },
    tipIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      marginTop: 1,
    },
    tipText: {
      flex: 1,
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text.secondary,
    },
    buttonStack: {
      gap: 10,
      paddingBottom: 2,
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.button.ghost.bg,
      borderWidth: 1,
      borderColor: colors.button.ghost.border,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    secondaryButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 15,
      lineHeight: 19,
      letterSpacing: 0.2,
      color: colors.button.ghost.text,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.button.primary.bg,
      borderWidth: 1,
      borderColor: colors.button.primary.bg,
    },
    primaryButtonPressed: {
      backgroundColor: colors.button.primary.pressed,
      borderColor: colors.button.primary.pressed,
    },
    primaryButtonDisabled: {
      opacity: 0.55,
    },
    primaryButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 15,
      lineHeight: 19,
      letterSpacing: 0.2,
      color: colors.button.primary.text,
    },
    successCard: {
      alignItems: "center",
      paddingVertical: 18,
      paddingHorizontal: 12,
    },
    successIconWrap: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.primary,
      borderWidth: 1,
      borderColor: colors.brand.primary,
      marginBottom: 14,
    },
    successTitle: {
      fontFamily: fonts.titleFamily,
      fontSize: 24,
      lineHeight: 28,
      color: colors.text.primary,
    },
    successText: {
      marginTop: 8,
      marginBottom: 16,
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text.secondary,
      textAlign: "center",
      maxWidth: 320,
    },
  });
