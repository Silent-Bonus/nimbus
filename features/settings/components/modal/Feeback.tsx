// ReportFeedbackModal.tsx
import React, { useContext, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeContext from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import InputField from "@/components/ui/theme-components/StyledInputOld";
import { logFeedback } from "@/features/settings/services/settingService";

export default function ReportFeedbackModal({ visible, onClose }: any) {
  const { newTheme } = useContext(ThemeContext);
  const styles = styling(newTheme);

  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setText("");
    setSubmitted(false);
    setLoading(false);
    onClose();
  };

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);

    const res = await logFeedback({ message: text, rating: 0 });
    if (res?.success) setSubmitted(true);

    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={reset}>
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={newTheme.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.titleBlock}>
                  <Text style={styles.emoji}>💬</Text>
                  <Text style={styles.title}>Send Feedback</Text>
                  <Text style={styles.subtitle}>
                    Tell us what you love or what could be improved.
                  </Text>
                </View>

                {!submitted ? (
                  <>
                    <InputField
                      label="Feedback Details"
                      value={text}
                      onChangeText={setText}
                      placeholder="Share your feedback..."
                      multiline
                      numberOfLines={6}
                      helperText={`${text.length} / 1000`}
                      inputStyle={{ minHeight: 120, textAlignVertical: "top" }}
                    />

                    <View style={styles.btnStack}>
                      <StyledButton
                        label="Cancel"
                        variant="secondary"
                        fullWidth
                        onPress={reset}
                      />

                      <StyledButton
                        label={loading ? "Sending..." : "Submit"}
                        fullWidth
                        onPress={submit}
                        disabled={!text.trim() || loading}
                      />
                    </View>
                  </>
                ) : (
                  <View style={styles.successBlock}>
                    <Text style={styles.successEmoji}>✅</Text>
                    <Text style={styles.successTitle}>
                      Thanks — feedback sent!
                    </Text>
                    <StyledButton label="Done" onPress={reset} />
                  </View>
                )}
              </ScrollView>

              <Text style={styles.footerText}>
                Tip: Include device & OS version for faster debugging.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styling = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    card: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 30,
    },
    headerRow: {
      height: 48,
      justifyContent: "center",
    },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20 },
    titleBlock: { alignItems: "center", marginBottom: 14 },
    emoji: { fontSize: 34, marginBottom: 4 },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.textPrimary,
    },
    subtitle: {
      textAlign: "center",
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 4,
      maxWidth: 480,
    },
    btnStack: {
      marginTop: 20,
      gap: 12,
    },
    successBlock: {
      alignItems: "center",
      paddingVertical: 30,
    },
    successEmoji: { fontSize: 36, marginBottom: 6 },
    successTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textPrimary,
    },
    footerText: {
      textAlign: "center",
      marginTop: 16,
      color: theme.textSecondary,
      fontSize: 12,
    },
  });
