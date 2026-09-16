import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import ThemeContext from "@/contexts/ThemeContext";
import ModalHeader from "@/components/ui/modal/ModalHeader";
import { StyledButton } from "@/components/ui/StyledButton";
import StyledSwitch from "@/components/ui/theme-components/StyledSwitch";
import TimeInput from "@/components/ui/picker/TimeInput";
import { Duration } from "@/features/habit/types/habitTypes";

type DurationPreset = {
  id: "morning" | "evening" | "work";
  label: string;
  start: { h: number; m: number };
  end?: { h: number; m: number } | null;
};

const PRESETS: DurationPreset[] = [
  {
    id: "morning",
    label: "Morning",
    start: { h: 7, m: 0 },
    end: null,
  },
  {
    id: "evening",
    label: "Evening",
    start: { h: 19, m: 0 },
    end: null,
  },
  {
    id: "work",
    label: "Work",
    start: { h: 9, m: 0 },
    end: { h: 17, m: 0 },
  },
];

interface DurationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (duration: Duration) => void;
  isEditMode?: Duration;
  title?: string;
  subtitle?: string;
}

const sameClockTime = (date: Date, hours: number, minutes: number) =>
  date.getHours() === hours && date.getMinutes() === minutes;

export default function DurationModal({
  visible,
  onClose,
  onSave,
  isEditMode,
  title = "Rhythm",
  subtitle = "Choose whether this habit runs all day or within a focused window.",
}: DurationModalProps) {
  const { newTheme, spacing, svaTypography } =
    useContext(ThemeContext);
  const bodyTextStyle = svaTypography?.textStyle?.body ?? svaTypography.textStyle.body;
  const styles = useMemo(
    () => styling(newTheme, spacing, bodyTextStyle, svaTypography),
    [newTheme, spacing, bodyTextStyle, svaTypography]
  );

  const [allDayEnabled, setAllDayEnabled] = useState<boolean>(true);
  const [mode, setMode] = useState<"point" | "period">("point");
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!visible) return;

    if (isEditMode) {
      if (isEditMode.all_day) {
        setAllDayEnabled(true);
        setMode("point");
      } else if (isEditMode.start_time && isEditMode.end_time) {
        setAllDayEnabled(false);
        setStart(new Date(isEditMode.start_time));
        setEnd(new Date(isEditMode.end_time));
        setMode("period");
      } else if (isEditMode.start_time) {
        setAllDayEnabled(false);
        setStart(new Date(isEditMode.start_time));
        setMode("point");
      }
    } else {
      setAllDayEnabled(true);
      setMode("point");
      const now = new Date();
      now.setMinutes(0, 0, 0);
      setStart(now);
      setEnd(new Date(now.getTime() + 60 * 60 * 1000));
    }

    setError("");
  }, [isEditMode, visible]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const applyPreset = (preset: DurationPreset) => {
    const today = new Date();
    const nextStart = new Date(today);
    nextStart.setHours(preset.start.h, preset.start.m, 0, 0);
    setStart(nextStart);

    if (preset.end) {
      const nextEnd = new Date(today);
      nextEnd.setHours(preset.end.h, preset.end.m, 0, 0);
      setEnd(nextEnd);
      setMode("period");
      setAllDayEnabled(false);
    } else {
      setMode("point");
      setAllDayEnabled(false);
    }

    setError("");
  };

  const handleSave = () => {
    if (allDayEnabled) {
      onSave({ all_day: true });
      handleClose();
      return;
    }

    if (mode === "point") {
      onSave({ start_time: start });
      handleClose();
      return;
    }

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    onSave({ start_time: start, end_time: end });
    handleClose();
  };

  const isPresetSelected = (preset: DurationPreset) => {
    if (allDayEnabled) return false;

    if (preset.id === "morning") {
      return mode === "point" && sameClockTime(start, 7, 0);
    }

    if (preset.id === "evening") {
      return mode === "point" && sameClockTime(start, 19, 0);
    }

    return (
      mode === "period" &&
      sameClockTime(start, 9, 0) &&
      sameClockTime(end, 17, 0)
    );
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
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centering}
        >
          <SafeAreaView style={styles.safe}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />

              <ModalHeader
                title={title}
                subtitle={subtitle}
                onClose={handleClose}
                style={styles.modalHeaderCompact}
                titleStyle={styles.headerTitle}
                subtitleStyle={styles.headerSubtitle}
              />

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.section}>
                  <View style={styles.rowBetween}>
                    <View style={styles.sectionCopy}>
                      <Text style={styles.sectionLabel}>All day</Text>
                      <Text style={styles.sectionHint}>
                        Keep it continuous or define a focused window.
                      </Text>
                    </View>

                    <StyledSwitch
                      value={allDayEnabled}
                      onValueChange={() => {
                        setAllDayEnabled((current) => {
                          const next = !current;
                          if (!next) setError("");
                          return next;
                        });
                      }}
                      size="medium"
                    />
                  </View>
                </View>

                {!allDayEnabled ? (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Quick windows</Text>
                      <Text style={styles.sectionHint}>
                        Tap a preset or set your own span.
                      </Text>

                      <View style={styles.pillsRow}>
                        {PRESETS.map((preset) => {
                          const selected = isPresetSelected(preset);
                          return (
                            <TouchableOpacity
                              key={preset.id}
                              onPress={() => applyPreset(preset)}
                              style={[
                                styles.pill,
                                selected && styles.pillSelected,
                              ]}
                              activeOpacity={0.9}
                            >
                              <Text
                                style={[
                                  styles.pillText,
                                  selected && styles.pillTextSelected,
                                ]}
                                numberOfLines={1}
                              >
                                {preset.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Window mode</Text>
                      <Text style={styles.sectionHint}>
                        Choose a point in time or a time span.
                      </Text>

                      <View style={styles.pillsRow}>
                        <TouchableOpacity
                          style={[
                            styles.pill,
                            mode === "point" && styles.pillSelected,
                          ]}
                          onPress={() => {
                            setMode("point");
                            setError("");
                          }}
                          activeOpacity={0.9}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              mode === "point" && styles.pillTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            Point time
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.pill,
                            mode === "period" && styles.pillSelected,
                          ]}
                          onPress={() => {
                            setMode("period");
                            setAllDayEnabled(false);
                            setError("");
                          }}
                          activeOpacity={0.9}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              mode === "period" && styles.pillTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            Time period
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{ marginTop: 14 }}>
                        <TimeInput
                          label="Start"
                          value={start}
                          onChange={(next) => {
                            setStart(next);
                            setError("");
                            if (mode === "period" && next >= end) {
                              setEnd(new Date(next.getTime() + 60 * 60 * 1000));
                            }
                          }}
                          title="Start time"
                        />

                        {mode === "period" ? (
                          <View style={{ marginTop: 12 }}>
                            <TimeInput
                              label="End"
                              value={end}
                              onChange={(next) => {
                                setEnd(next);
                                if (next <= start) {
                                  setError("End time must be after start time.");
                                } else {
                                  setError("");
                                }
                              }}
                              title="End time"
                            />
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </>
                ) : null}

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.error}>{error}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.footer}>
                <StyledButton
                  label="Cancel"
                  onPress={handleClose}
                  variant="outline"
                  style={styles.footerBtn}
                />
                <StyledButton
                  label="Save"
                  onPress={handleSave}
                  disabled={!allDayEnabled && mode === "period" && end <= start}
                  style={styles.footerBtn}
                />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styling = (t: any, spacing: any, bodyTextStyle: any, svaTypography: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.overlayStrong ?? "rgba(12,14,11,0.62)",
    },
    centering: {
      flex: 1,
      justifyContent: "flex-end",
    },
    safe: {
      width: "100%",
      paddingHorizontal: 14,
      paddingBottom: 12,
    },
    sheet: {
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      maxHeight: "94%",
      overflow: "hidden",
      backgroundColor: t.surfaceMuted ?? t.surface,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      borderWidth: 1,
      borderColor: t.borderMuted ?? t.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.24,
          shadowOffset: { width: 0, height: 16 },
          shadowRadius: 30,
        },
        android: { elevation: 16 },
      }),
    },
    sheetHandle: {
      alignSelf: "center",
      width: 54,
      height: 5,
      borderRadius: 999,
      backgroundColor: t.borderMuted ?? t.border,
      marginTop: 10,
      marginBottom: 10,
    },
    modalHeaderCompact: {
      paddingHorizontal: spacing.xl,
      paddingTop: 0,
      paddingBottom: 8,
    },
    headerTitle: {
      ...(svaTypography?.textStyle?.displayMedium ?? {}),
      fontSize: 28,
      lineHeight: 32,
      color: t.textPrimary,
      fontStyle: "normal",
    },
    headerSubtitle: {
      ...bodyTextStyle,
      fontSize: 13,
      lineHeight: 18,
      color: t.textSecondary,
    },
    content: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
    section: {
      padding: spacing.lg,
      borderRadius: 24,
      backgroundColor: t.surface ?? t.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted ?? t.border,
      marginBottom: spacing.lg,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 18,
        },
        android: { elevation: 3 },
      }),
    },
    sectionCopy: {
      flex: 1,
      paddingRight: 12,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: t.textSecondary,
      marginBottom: 8,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    sectionHint: {
      marginTop: 4,
      fontSize: 12,
      color: t.textSecondary,
      lineHeight: 16,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    pillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    } as any,
    pill: {
      flexGrow: 1,
      flexBasis: 0,
      minHeight: 42,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.cardRaised ?? t.surfaceMuted ?? t.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted ?? t.border,
    },
    pillSelected: {
      backgroundColor: "rgba(163,190,140,0.14)",
      borderColor: "rgba(163,190,140,0.32)",
    },
    pillText: {
      color: t.textSecondary,
      fontWeight: "700",
      fontSize: 13,
      letterSpacing: 0.2,
      textAlign: "center",
    },
    pillTextSelected: {
      color: t.accent,
      fontWeight: "800",
    },
    errorBox: {
      marginTop: 4,
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: "rgba(255, 99, 99, 0.08)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255, 99, 99, 0.22)",
    },
    error: {
      color: t.error ?? "#FF6B6B",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      paddingTop: 2,
    } as any,
    footerBtn: {
      flex: 1,
    },
  });
