// components/Settings/NotificationSettingRow.tsx
import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Switch,
  Platform,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import ThemeContext from "@/contexts/ThemeContext";

export type OptionItem = { key: string; label: string };

interface NotificationSettingRowProps {
  label: string;
  subtitle?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  valueKey?: string | null;
  options?: OptionItem[];
  onOptionSelect?: (item: OptionItem) => void;
  helpText?: string;
  disabled?: boolean;
}

export const NotificationSettingRow: React.FC<NotificationSettingRowProps> = ({
  label,
  subtitle,
  enabled,
  onToggle,
  valueKey,
  options = [],
  onOptionSelect,
  helpText,
  disabled = false,
}) => {
  const { newTheme } = useContext(ThemeContext);
  const colors = newTheme;
  const styles = styling(colors);

  const [open, setOpen] = useState(false);

  // ----- Custom time picker state -----
  const [showCustom, setShowCustom] = useState(false);
  const [customTime, setCustomTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0); // default 8:00 PM
    return d;
  });

  const selectedLabel =
    options.find((o) => o.key === valueKey)?.label ??
    // if valueKey is a custom payload like "custom:HH:MM"
    (valueKey?.startsWith("custom:") ? humanizeCustom(valueKey) : "Select");

  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      setShowCustom(false);
    }
  }, [enabled]);

  const handleItemPress = (item: OptionItem) => {
    if (item.key === "custom") {
      // open inline time picker area
      setShowCustom(true);
      return;
    }
    onOptionSelect?.(item);
    setOpen(false);
  };

  const onCustomChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setCustomTime(d);
  };

  const saveCustom = () => {
    const hh = customTime.getHours().toString().padStart(2, "0");
    const mm = customTime.getMinutes().toString().padStart(2, "0");
    const key = `custom:${hh}:${mm}`;
    const label = `Every day at ${formatHM(customTime)}`;
    onOptionSelect?.({ key, label });
    setShowCustom(false);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* top row: label + switch */}
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>{label}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>

        <Switch
          value={enabled && !disabled}
          onValueChange={(v) => {
            if (!disabled) onToggle(v);
          }}
          thumbColor={colors.surface}
          trackColor={{ true: colors.accent, false: colors.divider }}
          ios_backgroundColor={colors.divider}
          disabled={disabled}
        />
      </View>

      {helpText ? <Text style={styles.help}>{helpText}</Text> : null}

      {/* selector */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => enabled && !disabled && setOpen(true)}
        style={[
          styles.selector,
          { backgroundColor: enabled ? colors.surface : colors.background },
        ]}
      >
        <Text
          style={[
            styles.selectorText,
            { color: valueKey ? colors.textPrimary : colors.textSecondary },
          ]}
        >
          {selectedLabel}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={enabled ? colors.textSecondary : colors.textSecondary}
        />
      </TouchableOpacity>

      {/* modal list */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setOpen(false);
          setShowCustom(false);
        }}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setOpen(false);
            setShowCustom(false);
          }}
        >
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <SafeAreaView pointerEvents="box-none" style={styles.centering}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            {/* header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose an option</Text>
              <TouchableOpacity
                onPress={() => {
                  setOpen(false);
                  setShowCustom(false);
                }}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* list of options */}
            <FlatList
              data={options}
              keyExtractor={(i) => i.key}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => {
                const isCustomRow = item.key === "custom";
                const selected =
                  item.key === valueKey ||
                  (valueKey?.startsWith("custom:") && isCustomRow);

                return (
                  <>
                    <TouchableOpacity
                      onPress={() => handleItemPress(item)}
                      style={[
                        styles.modalItem,
                        selected && { backgroundColor: colors.accentPressed },
                      ]}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          selected && { color: colors.background },
                        ]}
                      >
                        {isCustomRow && valueKey?.startsWith("custom:")
                          ? humanizeCustom(valueKey)
                          : item.label}
                      </Text>
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={
                            selected ? colors.background : colors.textPrimary
                          }
                        />
                      ) : null}
                    </TouchableOpacity>

                    {/* Inline custom time picker */}
                    {isCustomRow && showCustom && (
                      <View style={styles.customBox}>
                        <DateTimePicker
                          mode="time"
                          value={customTime}
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={onCustomChange}
                          themeVariant="dark"
                          // iOS only; Android ignores
                          //@ts-ignore
                          textColor={colors.textPrimary}
                        />
                        <View style={{ height: 10 }} />
                        <View style={styles.customActions}>
                          <TouchableOpacity
                            style={styles.ghostBtn}
                            onPress={() => setShowCustom(false)}
                          >
                            <Text style={styles.ghostBtnText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={saveCustom}
                          >
                            <Text style={styles.primaryBtnText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: colors.divider },
                  ]}
                />
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default NotificationSettingRow;

/* ───────── helpers ───────── */
const formatHM = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function humanizeCustom(key: string) {
  // key format: "custom:HH:MM"
  try {
    const [, hm] =
      key.split(":custom:").length > 1 ? key.split(":custom:") : [null, null]; // not used
    const parts = key.replace("custom:", "").split(":");
    const d = new Date();
    d.setHours(+parts[0], +parts[1], 0, 0);
    return `Every day at ${formatHM(d)}`;
  } catch {
    return "Custom";
  }
}

/* ───────── styles ───────── */
const styling = (colors: any) =>
  StyleSheet.create({
    wrapper: { marginVertical: 12 },
    rowTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    heading: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    help: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
    selector: {
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.divider,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectorText: { fontSize: 15 },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    centering: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
    modalCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 12 },
      }),
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    modalItem: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalItemText: { fontSize: 15, color: colors.textPrimary },
    separator: { height: 1, width: "100%" },

    customBox: {
      // marginHorizontal: 8,
      marginTop: 20,
      marginBottom: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 10,
      backgroundColor: colors.background,
    },
    customActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    primaryBtn: {
      height: 40,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: colors.buttonPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: {
      color: colors.buttonPrimaryText,
      fontSize: 14,
      fontWeight: "800",
    },
    ghostBtn: {
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    ghostBtnText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
  });
