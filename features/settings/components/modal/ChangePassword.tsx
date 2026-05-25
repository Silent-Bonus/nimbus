import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { changePassword } from "@/features/settings/services/settingService";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import type { SvaColorSet } from "@/theme/types";

type ChangePasswordTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type ChangePasswordStyles = ReturnType<typeof createStyles>;

type PasswordFieldProps = {
  label: string;
  helperText: string;
  value: string;
  placeholder: string;
  secure: boolean;
  focused: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onToggleSecure: () => void;
  styles: ChangePasswordStyles;
  colors: SvaColorSet;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

function PasswordField({
  label,
  helperText,
  value,
  placeholder,
  secure,
  focused,
  onChangeText,
  onFocus,
  onBlur,
  onToggleSecure,
  styles,
  colors,
}: PasswordFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldHeaderRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldMeta}>{helperText}</Text>
      </View>

      <View style={[styles.fieldShell, focused && styles.fieldShellFocused]}>
        <View style={styles.fieldIconWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={colors.text.secondary}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secure}
          onFocus={onFocus}
          onBlur={onBlur}
          selectionColor={colors.brand.primary}
          cursorColor={colors.brand.primary}
          style={styles.fieldInput}
          textContentType="password"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={secure ? "Show password" : "Hide password"}
          onPress={onToggleSecure}
          hitSlop={8}
          style={({ pressed }) => [
            styles.fieldToggle,
            pressed && styles.fieldTogglePressed,
          ]}
        >
          <Ionicons
            name={secure ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={colors.text.secondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const { svaColors, svaTypography, typography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oldFocused, setOldFocused] = useState(false);
  const [newFocused, setNewFocused] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fonts = useMemo<ChangePasswordTypography>(
    () => ({
      titleFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        typography.h2.fontFamily ??
        "CormorantGaramond_500Medium",
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Inter_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Inter_600SemiBold",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () => createStyles(svaColors, fonts, insets.bottom),
    [svaColors, fonts, insets.bottom]
  );

  const clearForm = () => {
    setNewPassword("");
    setOldPassword("");
    setLoading(false);
    setErrorMsg(null);
    setOldFocused(false);
    setNewFocused(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  useEffect(() => {
    if (!visible) {
      clearForm();
    }
  }, [visible]);

  const oldValue = oldPassword.trim();
  const nextValue = newPassword.trim();
  const hasChanges = oldValue.length > 0 || nextValue.length > 0 || loading;
  const canSubmit =
    oldValue.length > 0 && nextValue.length >= 6 && !loading && oldValue !== nextValue;

  const validate = (): boolean => {
    setErrorMsg(null);

    if (oldValue.length === 0 || nextValue.length === 0) {
      setErrorMsg("Both current and new password are required.");
      return false;
    }

    if (oldValue === nextValue) {
      setErrorMsg("New password cannot be the same as the current password.");
      return false;
    }

    if (nextValue.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleClose = () => {
    if (loading) return;

    if (hasChanges) {
      Alert.alert(
        "Discard changes?",
        "You have unsaved password changes. Discard them?",
        [
          { text: "Keep editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              clearForm();
              onClose();
            },
          },
        ]
      );
      return;
    }

    onClose();
  };

  const submitPassword = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const result = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (result?.success) {
        clearForm();
        onClose();
        return;
      }

      setErrorMsg(result?.message || "Incorrect current password. Try again.");
    } catch (error) {
      console.warn("change password error", error);
      setErrorMsg("Something went wrong. Please try again later.");
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
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

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
                <View style={styles.headerTopRow}>
                  <View style={styles.headerBadge}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={14}
                      color={svaColors.brand.primary}
                    />
                    <Text style={styles.headerBadgeText} numberOfLines={1}>
                      Account security
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close change password"
                    onPress={handleClose}
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
                    Change Password
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    Update the password you use to sign in to SVA.
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
                      name="lock-closed-outline"
                      size={20}
                      color={svaColors.brand.primary}
                    />
                  </View>

                  <View style={styles.summaryCopy}>
                    <Text style={styles.summaryTitle}>
                      Keep your account protected
                    </Text>
                    <Text style={styles.summaryText}>
                      Choose a strong password that you do not reuse across
                      other apps or websites.
                    </Text>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <PasswordField
                    label="Current password"
                    helperText="Required"
                    value={oldPassword}
                    placeholder="Enter current password"
                    secure={!showOldPassword}
                    focused={oldFocused}
                    onChangeText={(text) => {
                      setOldPassword(text);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onFocus={() => setOldFocused(true)}
                    onBlur={() => setOldFocused(false)}
                    onToggleSecure={() => setShowOldPassword((current) => !current)}
                    styles={styles}
                    colors={svaColors}
                  />

                  <PasswordField
                    label="New password"
                    helperText="Min 6 characters"
                    value={newPassword}
                    placeholder="Enter new password"
                    secure={!showNewPassword}
                    focused={newFocused}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onFocus={() => setNewFocused(true)}
                    onBlur={() => setNewFocused(false)}
                    onToggleSecure={() =>
                      setShowNewPassword((current) => !current)
                    }
                    styles={styles}
                    colors={svaColors}
                  />
                </View>

                {errorMsg ? (
                  <View style={styles.errorCard}>
                    <View style={styles.errorIconWrap}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={18}
                        color={svaColors.state.error}
                      />
                    </View>

                    <Text style={styles.errorText}>{errorMsg}</Text>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Dismiss error"
                      onPress={() => setErrorMsg(null)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.errorDismiss,
                        pressed && styles.errorDismissPressed,
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={svaColors.text.secondary}
                      />
                    </Pressable>
                  </View>
                ) : null}

                <View style={styles.footerCard}>
                  <View style={styles.footerCopy}>
                    <Text style={styles.footerTitle}>Ready to update?</Text>
                    <Text style={styles.footerText}>
                      Your session remains active until you save the new
                      password.
                    </Text>
                  </View>

                  <View style={styles.buttonStack}>
                    <StyledButton
                      label="Cancel"
                      variant="secondary"
                      fullWidth
                      onPress={() => {
                        handleClose();
                      }}
                      disabled={loading}
                      style={styles.footerButton}
                    />

                    <StyledButton
                      label="Save Password"
                      variant="primary"
                      fullWidth
                      onPress={() => {
                        void submitPassword();
                      }}
                      loading={loading}
                      disabled={!canSubmit}
                    />
                  </View>
                </View>
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
  fonts: ChangePasswordTypography,
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
    formSection: {
      gap: 14,
    },
    fieldGroup: {
      gap: 8,
    },
    fieldHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      paddingHorizontal: 4,
    },
    fieldLabel: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text.primary,
    },
    fieldMeta: {
      fontFamily: fonts.monoFamily,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: colors.text.secondary,
    },
    fieldShell: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 54,
      borderRadius: 18,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.muted,
      paddingHorizontal: 12,
    },
    fieldShellFocused: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.bg.subtle,
    },
    fieldIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    fieldInput: {
      flex: 1,
      fontFamily: fonts.bodyFamily,
      fontSize: 15,
      lineHeight: 20,
      color: colors.text.primary,
      paddingVertical: 0,
    },
    fieldToggle: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    fieldTogglePressed: {
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
      marginTop: 2,
    },
    errorIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(191, 97, 106, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(191, 97, 106, 0.26)",
      marginTop: 1,
    },
    errorText: {
      flex: 1,
      fontFamily: fonts.bodyFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.text.primary,
    },
    errorDismiss: {
      width: 28,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    errorDismissPressed: {
      backgroundColor: colors.interaction.hover,
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
    buttonStack: {
      gap: 10,
    },
    footerButton: {
      marginBottom: 2,
    },
  });
