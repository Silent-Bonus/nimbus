import React, { useContext, useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import {
  View,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Text,
  TouchableWithoutFeedback,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import ModalHeader from "@/components/ui/modal/ModalHeader";
import { StyledButton } from "@/components/ui/StyledButton";
import StyledSwitch from "@/components/ui/theme-components/StyledSwitch";
import { HabitDateType } from "@/features/habit/types/habitTypes";
import { fromApiDate } from "@/utils/date-time";

// ✅ Nimbus-style date input (should open DatePickerSheet like TimeInput opens TimePickerSheet)
import DateInput from "@/components/ui/picker/DateInput";

type UIFreq = "Daily" | "Weekly" | "Monthly" | "";
const toUIFreq = (f?: string | null): UIFreq => {
  if (!f) return "";
  const v = f.toLowerCase();
  if (v === "daily") return "Daily";
  if (v === "weekly") return "Weekly";
  if (v === "monthly") return "Monthly";
  // if someone accidentally stored UI casing
  if (f === "Daily" || f === "Weekly" || f === "Monthly") return f as UIFreq;
  return "";
};

/* Helper to convert day abbreviations (UI => backend) */
const convertDayAbbreviation = (day: string) => {
  const map: Record<string, string> = {
    Mo: "mon",
    Tu: "tue",
    We: "wed",
    Th: "thu",
    Fr: "fri",
    Sa: "sat",
    Su: "sun",
  };
  return map[day] ?? day.toLowerCase();
};

interface HabitDateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habitDate: HabitDateType) => void;
  isEditMode?: HabitDateType | null;
  title?: string;
  subtitle?: string;
}

export default function StartDateModal({
  visible,
  onClose,
  onSave,
  isEditMode,
  title = "Start date",
  subtitle = "Choose when this habit begins — and optionally repeats.",
}: HabitDateModalProps) {
  const { newTheme, spacing, svaTypography } =
    useContext(ThemeContext);
  const bodyTextStyle = svaTypography?.textStyle?.body ?? svaTypography.textStyle.body;
  const styles = useMemo(
    () => styling(newTheme, spacing, bodyTextStyle, svaTypography),
    [newTheme, spacing, bodyTextStyle, svaTypography]
  );

  // modal fields (LOGIC UNCHANGED)
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isEndDateEnabled, setIsEndDateEnabled] = useState<boolean>(false);

  const [isRepeatEnabled, setIsRepeatEnabled] = useState<boolean>(false);
  const [selectedFrequency, setSelectedFrequency] = useState<
    "Daily" | "Weekly" | "Monthly" | ""
  >("");

  const [dailyCount, setDailyCount] = useState<string>("1");
  const [weeklyInterval, setWeeklyInterval] = useState<string>("1");
  const [monthlyInterval, setMonthlyInterval] = useState<string>("1");

  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [monthlyDates, setMonthlyDates] = useState<number[]>([]);

  const [error, setError] = useState<string>("");

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const handleClose = () => {
    setError("");
    onClose();
  };

  const asDate = (value?: Date | string | null) => {
    if (!value) return undefined;
    return value instanceof Date ? value : fromApiDate(value);
  };

  // init from edit mode (LOGIC UNCHANGED)
  useEffect(() => {
    if (!visible) return;

    if (isEditMode) {
      const sd = asDate(isEditMode.start_date) ?? new Date();
      const ed = asDate(isEditMode.end_date);

      setStartDate(sd);

      if (ed) {
        setEndDate(ed);
        setIsEndDateEnabled(true);
      } else {
        setEndDate(sd);
        setIsEndDateEnabled(false);
      }

      // ✅ map backend -> UI
      const uiFreq = toUIFreq(isEditMode.frequency_type as any);

      if (uiFreq) {
        setIsRepeatEnabled(true);
        setSelectedFrequency(uiFreq);

        const int = String(isEditMode.interval ?? 1);
        if (uiFreq === "Daily") setDailyCount(int);
        if (uiFreq === "Weekly") setWeeklyInterval(int);
        if (uiFreq === "Monthly") setMonthlyInterval(int);

        // days_of_week backend -> UI
        if (isEditMode.days_of_week) {
          const revMap: Record<string, string> = {
            mon: "Mo",
            tue: "Tu",
            wed: "We",
            thu: "Th",
            fri: "Fr",
            sat: "Sa",
            sun: "Su",
          };
          setWeeklyDays(
            (isEditMode.days_of_week || []).map((d) => revMap[d] ?? d)
          );
        } else {
          setWeeklyDays([]);
        }

        setMonthlyDates(isEditMode.days_of_month || []);
      } else {
        setIsRepeatEnabled(false);
        setSelectedFrequency("");
        setWeeklyDays([]);
        setMonthlyDates([]);
      }

      setError("");
      return;
    }

    // fresh open defaults
    const now = new Date();
    setStartDate(now);
    setEndDate(now);
    setIsEndDateEnabled(false);

    setIsRepeatEnabled(false);
    setSelectedFrequency("");

    setDailyCount("1");
    setWeeklyInterval("1");
    setMonthlyInterval("1");

    setWeeklyDays([]);
    setMonthlyDates([]);
    setError("");
  }, [isEditMode, visible]);

  // toggle utilities (LOGIC UNCHANGED)
  const toggleWeeklyDay = (day: string) =>
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((p) => p !== day) : [...prev, day]
    );

  const toggleMonthlyDate = (n: number) =>
    setMonthlyDates((prev) =>
      prev.includes(n) ? prev.filter((p) => p !== n) : [...prev, n]
    );

  const switchFrequency = (next: UIFreq) => {
    setSelectedFrequency(next);
    setError("");

    // Reset OTHER mode selections so UI never carries over
    if (next === "Daily") {
      setWeeklyDays([]);
      setMonthlyDates([]);
      // optional: reset intervals if you want
      // setWeeklyInterval("1");
      // setMonthlyInterval("1");
      return;
    }

    if (next === "Weekly") {
      setMonthlyDates([]);
      // optional: reset interval for monthly
      // setMonthlyInterval("1");
      return;
    }

    if (next === "Monthly") {
      setWeeklyDays([]);
      // optional: reset interval for weekly
      // setWeeklyInterval("1");
      return;
    }
  };

  const getMinimumEndDate = () => {
    // If complex recurrence (Weekly >= 3 weeks OR Monthly), enforce 30 days
    const isLongCycle =
      (selectedFrequency === "Weekly" && Number(weeklyInterval) >= 3) ||
      selectedFrequency === "Monthly";

    if (isLongCycle) {
      return addDays(startDate, 30);
    }

    // Standard Weekly: Minimum 7 days
    if (selectedFrequency === "Weekly") {
      return addDays(startDate, 7);
    }

    return startDate;
  };

  const minEndDate = getMinimumEndDate();
  const isLongCycleRestricted = minEndDate > startDate;
  const restrictionMessage =
    selectedFrequency === "Weekly" && Number(weeklyInterval) < 3
      ? "Weekly habits require a minimum 7-day duration."
      : "Long cycles require a minimum 30-day duration.";

  // validation and conversion (LOGIC UNCHANGED)
  const convertToHabitDate = (): HabitDateType | null => {
    const daily = Math.max(1, Number(dailyCount || 1));
    const weekly = Math.max(1, Number(weeklyInterval || 1));
    const monthly = Math.max(1, Number(monthlyInterval || 1));

    if (isEndDateEnabled && endDate < startDate) {
      setError("End date cannot be before start date.");
      return null;
    }

    // Check minimum duration constraint
    if (isEndDateEnabled && endDate < minEndDate) {
      setError(restrictionMessage);
      return null;
    }

    if (!isRepeatEnabled) {
      return {
        start_date: startDate,
        end_date: isEndDateEnabled ? endDate : undefined,
      };
    }

    if (selectedFrequency === "Daily") {
      return {
        start_date: startDate,
        end_date: isEndDateEnabled ? endDate : undefined,
        frequency_type: "daily",
        interval: daily,
      };
    }

    if (selectedFrequency === "Weekly") {
      if (weeklyDays.length === 0) {
        setError("Select at least one day.");
        return null;
      }
      return {
        start_date: startDate,
        end_date: isEndDateEnabled ? endDate : undefined,
        frequency_type: "weekly",
        interval: weekly,
        days_of_week: weeklyDays.map(convertDayAbbreviation),
      };
    }

    if (selectedFrequency === "Monthly") {
      if (monthlyDates.length === 0) {
        setError("Select at least one date.");
        return null;
      }
      return {
        start_date: startDate,
        end_date: isEndDateEnabled ? endDate : undefined,
        frequency_type: "monthly",
        interval: monthly,
        days_of_month: monthlyDates,
      };
    }

    setError("Select a repeat frequency.");
    return null;
  };

  const handleSave = () => {
    setError("");
    const parsed = convertToHabitDate();
    if (!parsed) return;
    onSave(parsed);
    onClose();
  };

  const isPillSelected = (p: "Daily" | "Weekly" | "Monthly") =>
    selectedFrequency === p;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
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
              {/* Start */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Start</Text>

                <DateInput
                  label=""
                  title="Start date"
                  value={startDate}
                  minimumDate={new Date()}
                  onChange={(d: Date) => {
                    setStartDate(d);
                    setError("");
                    if (isEndDateEnabled && endDate < d) setEndDate(d);
                  }}
                  // optional: remove year in display if your DateInput supports it
                  showYear={true}
                />
              </View>

              {/* Repeat */}
              <View style={styles.section}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.sectionLabel}>Repeat</Text>
                    <Text style={styles.sectionHint}>
                      Turn on to set a schedule.
                    </Text>
                  </View>

                  {/* ✅ StyledSwitch (same as Duration modal) */}
                  <StyledSwitch
                    value={isRepeatEnabled}
                    onValueChange={() => {
                      setIsRepeatEnabled((s) => {
                        const next = !s;

                        if (!next) {
                          setSelectedFrequency("");
                          setWeeklyDays([]);
                          setMonthlyDates([]);
                          setError("");
                          return next;
                        }

                        // default to Daily but reset others properly
                        switchFrequency("Daily");
                        return next;
                      });
                    }}
                    size="medium"
                  />
                </View>

                {isRepeatEnabled && (
                  <>
                    {/* Frequency chips */}
                    <View style={styles.pillsRow}>
                      {(["Daily", "Weekly", "Monthly"] as const).map((p) => {
                        const selected = isPillSelected(p);
                        return (
                          <TouchableOpacity
                            key={p}
                            style={[
                              styles.pill,
                              selected && styles.pillSelected,
                            ]}
                            onPress={() => switchFrequency(p)}
                            // onPress={() => {
                            //   setSelectedFrequency(p);
                            //   setError("");
                            // }}
                            activeOpacity={0.9}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                selected && styles.pillTextSelected,
                              ]}
                            >
                              {p}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Daily */}
                    {selectedFrequency === "Daily" && (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Daily rhythm</Text>

                        <View style={styles.inlineRow}>
                          <Text style={styles.smallLabel}>Every</Text>
                          <TextInput
                            keyboardType="numeric"
                            value={dailyCount}
                            onChangeText={(t) =>
                              setDailyCount(t.replace(/[^0-9]/g, ""))
                            }
                            style={[
                              styles.numberInput,
                              { color: newTheme.textPrimary },
                            ]}
                            placeholder="1"
                            placeholderTextColor={newTheme.textSecondary}
                          />
                          <Text style={styles.smallLabel}>
                            {Number(dailyCount || 1) === 1 ? "day" : "days"}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Weekly */}
                    {selectedFrequency === "Weekly" && (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Weekly rhythm</Text>
                        <Text style={styles.smallHint}>Choose days</Text>

                        <View style={styles.daysRow}>
                          {daysOfWeek.map((d) => {
                            const selected = weeklyDays.includes(d);
                            return (
                              <TouchableOpacity
                                key={d}
                                onPress={() => toggleWeeklyDay(d)}
                                style={[
                                  styles.dayPill,
                                  selected && styles.dayPillSelected,
                                ]}
                                activeOpacity={0.9}
                              >
                                <Text
                                  style={[
                                    styles.dayText,
                                    selected && styles.dayTextSelected,
                                  ]}
                                >
                                  {d}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <View style={styles.inlineRow}>
                          <Text style={styles.smallLabel}>Every</Text>
                          <TextInput
                            value={weeklyInterval}
                            onChangeText={(t) =>
                              setWeeklyInterval(t.replace(/[^0-9]/g, ""))
                            }
                            keyboardType="numeric"
                            style={[
                              styles.numberInput,
                              { color: newTheme.textPrimary },
                            ]}
                            placeholder="1"
                            placeholderTextColor={newTheme.textSecondary}
                          />
                          <Text style={styles.smallLabel}>
                            {Number(weeklyInterval || 1) === 1
                              ? "week"
                              : "weeks"}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Monthly */}
                    {selectedFrequency === "Monthly" && (
                      <View style={styles.block}>
                        <Text style={styles.blockTitle}>Monthly rhythm</Text>
                        <Text style={styles.smallHint}>Choose dates</Text>

                        <View style={styles.monthGrid}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (n) => {
                              const selected = monthlyDates.includes(n);
                              return (
                                <TouchableOpacity
                                  key={n}
                                  onPress={() => toggleMonthlyDate(n)}
                                  style={[
                                    styles.monthDay,
                                    selected && styles.monthDaySelected,
                                  ]}
                                  activeOpacity={0.9}
                                >
                                  <Text
                                    style={[
                                      styles.monthDayText,
                                      selected && styles.monthDayTextSelected,
                                    ]}
                                  >
                                    {n}
                                  </Text>
                                </TouchableOpacity>
                              );
                            }
                          )}
                        </View>

                        <View style={styles.inlineRow}>
                          <Text style={styles.smallLabel}>Every</Text>
                          <TextInput
                            value={monthlyInterval}
                            onChangeText={(t) =>
                              setMonthlyInterval(t.replace(/[^0-9]/g, ""))
                            }
                            keyboardType="numeric"
                            style={[
                              styles.numberInput,
                              { color: newTheme.textPrimary },
                            ]}
                            placeholder="1"
                            placeholderTextColor={newTheme.textSecondary}
                          />
                          <Text style={styles.smallLabel}>
                            {Number(monthlyInterval || 1) === 1
                              ? "month"
                              : "months"}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* End date */}
                    <View style={[styles.block, { marginTop: 8 }]}>
                      <View style={styles.rowBetween}>
                        <View>
                          <Text style={styles.blockTitle}>End date</Text>
                          <Text style={styles.smallHint}>
                            Leave off to continue indefinitely.
                          </Text>
                        </View>

                        {/* ✅ StyledSwitch (same as Duration modal) */}
                        <StyledSwitch
                          value={isEndDateEnabled}
                          onValueChange={() => {
                            setIsEndDateEnabled((s) => {
                              const next = !s;
                              if (!next) setEndDate(startDate);
                              return next;
                            });
                          }}
                          size="medium"
                        />
                      </View>

                      {isEndDateEnabled && (
                        <View style={{ marginTop: 10 }}>
                          <DateInput
                            label=""
                            title="End date"
                            value={endDate < minEndDate ? minEndDate : endDate}
                            minimumDate={minEndDate}
                            onChange={(d: Date) => {
                              setEndDate(d);
                              setError("");
                            }}
                            showYear={true}
                          />
                          {isLongCycleRestricted && (
                            <Text style={styles.sectionHint}>
                              Note: {restrictionMessage}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Sticky footer */}
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
                disabled={isRepeatEnabled && selectedFrequency === ""}
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
      backgroundColor: "rgba(0,0,0,0.62)",
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
      backgroundColor: t.surfaceMuted,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      borderWidth: 1,
      borderColor: t.borderMuted,
      overflow: "hidden",
      maxWidth: 720,
      alignSelf: "center",
      width: "100%",
      maxHeight: "94%",
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
      backgroundColor: t.borderMuted,
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
      backgroundColor: t.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted,
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
      gap: 10,
      marginTop: 14,
    } as any,
    pill: {
      flex: 1,
      height: 44,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted,
    },
    pillSelected: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },
    pillText: {
      color: t.textSecondary,
      fontWeight: "700",
      fontSize: 14,
    },
    pillTextSelected: {
      color: t.background,
    },
    block: {
      marginTop: 14,
      padding: 14,
      borderRadius: 20,
      backgroundColor: t.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted,
    },
    blockTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: t.textPrimary,
    },
    smallHint: {
      marginTop: 4,
      fontSize: 12,
      color: t.textSecondary,
      lineHeight: 16,
    },
    inlineRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },
    smallLabel: {
      color: t.textSecondary,
      fontSize: 13,
      marginRight: 10,
      fontWeight: "600",
    },
    numberInput: {
      width: 72,
      minHeight: 44,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted,
      backgroundColor: t.background,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      paddingHorizontal: 10,
      marginRight: 10,
    },
    daysRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 12,
    } as any,
    dayPill: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted,
    },
    dayPillSelected: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },
    dayText: {
      color: t.textPrimary,
      fontWeight: "700",
    },
    dayTextSelected: {
      color: t.background,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 12,
    } as any,
    monthDay: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.borderMuted,
    },
    monthDaySelected: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },
    monthDayText: {
      color: t.textPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    monthDayTextSelected: {
      color: t.background,
    },
    errorBox: {
      marginBottom: spacing.lg,
      padding: 12,
      borderRadius: 18,
      backgroundColor: "rgba(228,104,104,0.08)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(228,104,104,0.25)",
    },
    error: {
      color: t.error ?? "#FF7A7A",
      textAlign: "center",
      fontWeight: "600",
      lineHeight: 18,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      flexDirection: "row",
      gap: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.borderMuted,
      backgroundColor: t.surfaceMuted,
    } as any,
    footerBtn: {
      flex: 1,
      minHeight: 52,
    },
  });
