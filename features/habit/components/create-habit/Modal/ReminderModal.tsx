import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import { StyledButton } from "@/components/ui/StyledButton";
import TimeInput from "@/components/ui/picker/TimeInput";
import { formatTimeUI, toBackendTime } from "@/utils/date-time";

export interface ReminderAt {
  time?: string;
  ten_min_before?: boolean;
  thirty_min_before?: boolean;
}

type EditData = {
  time?: Date | undefined | null;
  ten_min_before?: boolean;
  thirty_min_before?: boolean;
} | null;

interface ReminderAtModalProps {
  visible: boolean;
  isAllDayEnabled: boolean;
  onClose: () => void;
  onSave: (payload: ReminderAt) => void;
  isEditMode?: EditData;
}

const PRESET_10 = "ten_min_before";
const PRESET_30 = "thirty_min_before";

const HabitReminderModal: React.FC<ReminderAtModalProps> = ({
  visible,
  onClose,
  isAllDayEnabled,
  onSave,
  isEditMode,
}) => {
  const { newTheme } = useContext(ThemeContext);
  const styles = useMemo(() => styling(newTheme), [newTheme]);

  const [reminderAt, setReminderAt] = useState<Date>(new Date());
  const [preset, setPreset] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // ✅ initialize every time modal opens (from CURRENT selection)
  useEffect(() => {
    if (!visible) return;

    setError("");

    if (isAllDayEnabled) {
      // prefer explicit time; if edit has a time, use it; else keep current time (now)
      if (isEditMode?.time) setReminderAt(new Date(isEditMode.time));
      setPreset(null);
      return;
    }

    // preset mode
    if (isEditMode?.ten_min_before) setPreset(PRESET_10);
    else if (isEditMode?.thirty_min_before) setPreset(PRESET_30);
    else setPreset(null);
  }, [visible, isAllDayEnabled, isEditMode]);

  const handlePresetPress = (p: string) => {
    setPreset((prev) => (prev === p ? null : p));
    setError("");
  };

  const selectedLabel = useMemo(() => {
    if (isAllDayEnabled) return `Selected: ${formatTimeUI(reminderAt)}`;
    if (preset === PRESET_10) return "Selected: 10 min before";
    if (preset === PRESET_30) return "Selected: 30 min before";
    return "Select a preset";
  }, [isAllDayEnabled, reminderAt, preset]);

  const canSave = useMemo(() => {
    return isAllDayEnabled ? true : !!preset;
  }, [isAllDayEnabled, preset]);

  const handleSave = () => {
    setError("");

    if (isAllDayEnabled) {
      const payload: ReminderAt = { time: toBackendTime(reminderAt) };
      onSave(payload);
      onClose();
      return;
    }

    if (preset === PRESET_10) {
      onSave({ ten_min_before: true });
      onClose();
      return;
    }
    if (preset === PRESET_30) {
      onSave({ thirty_min_before: true });
      onClose();
      return;
    }

    setError("Please choose a preset before saving.");
  };

  const microcopy = isAllDayEnabled
    ? "Pick a specific time — this reminder triggers on the habit day at that time."
    : "Choose a preset — the reminder triggers relative to your habit time.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.centering}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.title}>Reminder</Text>
                <Text style={styles.subtitle}>{microcopy}</Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={newTheme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {/* ✅ Summary for both modes */}
              <View style={styles.summaryRow}>
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={newTheme.textSecondary}
                />
                <Text style={styles.summaryText}>{selectedLabel}</Text>
              </View>

              {isAllDayEnabled ? (
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Pick a time</Text>
                  <Text style={styles.blockHint}>
                    This will trigger on the habit day at your chosen time.
                  </Text>

                  <View style={{ marginTop: 12 }}>
                    <TimeInput
                      label="Reminder at"
                      title="Reminder at"
                      value={reminderAt}
                      onChange={(d) => {
                        setReminderAt(d);
                        setError("");
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Quick presets</Text>
                  <Text style={styles.blockHint}>
                    These trigger relative to the habit time you set.
                  </Text>

                  {/* ✅ removed “No reminder selected” row in preset mode */}
                  <View style={styles.pillsRow}>
                    <PresetPill
                      label="10 min before"
                      selected={preset === PRESET_10}
                      onPress={() => handlePresetPress(PRESET_10)}
                      theme={newTheme}
                    />
                    <PresetPill
                      label="30 min before"
                      selected={preset === PRESET_30}
                      onPress={() => handlePresetPress(PRESET_30)}
                      theme={newTheme}
                    />
                  </View>
                </View>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            <View style={styles.footer}>
              <StyledButton
                label="Cancel"
                onPress={onClose}
                variant="outline"
                style={styles.footerBtn}
              />
              <StyledButton
                label="Save"
                onPress={handleSave}
                disabled={!canSave}
                style={styles.footerBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default HabitReminderModal;

function PresetPill({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        pillStyles.pill,
        {
          backgroundColor: selected ? theme.accent : "rgba(255,255,255,0.06)",
          borderColor: selected ? theme.accent : "rgba(255,255,255,0.08)",
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons
          name={selected ? "checkmark-circle" : "time-outline"}
          size={16}
          color={selected ? theme.background : theme.textSecondary}
        />
        <Text
          style={{
            color: selected ? theme.background : theme.textPrimary,
            fontWeight: "800",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});

const styling = (t: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.52)",
    },
    centering: { flex: 1, justifyContent: "center", paddingHorizontal: 18 },
    safe: { width: "100%" },

    card: {
      backgroundColor: t.surface,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.divider,
      overflow: "hidden",
      maxWidth: 720,
      alignSelf: "center",
      width: "100%",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.26,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 28,
        },
        android: { elevation: 14 },
      }),
    },

    header: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.06)",
    },
    title: {
      fontSize: 20,
      fontWeight: "900",
      color: t.textPrimary,
      letterSpacing: 0.2,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: t.textSecondary,
      lineHeight: 18,
    },

    content: { paddingHorizontal: 18, paddingBottom: 14 },

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.06)",
    } as any,
    summaryText: { color: t.textSecondary, fontSize: 13, fontWeight: "700" },

    block: {
      marginTop: 14,
      padding: 12,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.06)",
    },
    blockTitle: { fontSize: 14, fontWeight: "900", color: t.textPrimary },
    blockHint: {
      marginTop: 4,
      fontSize: 12,
      color: t.textSecondary,
      lineHeight: 16,
    },

    pillsRow: { flexDirection: "row", gap: 10, marginTop: 12 } as any,

    error: {
      marginTop: 10,
      color: t.error ?? "#FF7A7A",
      textAlign: "center",
      fontWeight: "700",
    },

    footer: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 16,
      flexDirection: "row",
      gap: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(255,255,255,0.06)",
    } as any,
    footerBtn: { flex: 1 },
  });
