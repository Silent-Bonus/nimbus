import React, { useMemo, useState } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import TimePickerSheet from "@/components/ui/picker/TimePickerSheet";

type Props = {
  label?: string;
  value: Date;
  onChange: (next: Date) => void;

  // optional
  disabled?: boolean;
  title?: string; // modal title
  is24Hour?: boolean;
};

export default function TimeInput({
  label = "Time",
  value,
  onChange,
  disabled = false,
  title,
  is24Hour = false,
}: Props) {
  const { newTheme } = React.useContext(ThemeContext);
  const styles = useMemo(() => createStyles(newTheme), [newTheme]);

  const [open, setOpen] = useState(false);

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {!!label && (
        <Text style={[styles.label, { color: newTheme.textSecondary }]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={disabled ? undefined : () => setOpen(true)}
        activeOpacity={0.9}
        style={[
          styles.input,
          {
            backgroundColor: newTheme.background,
            borderColor: newTheme.divider,
          },
          disabled && { opacity: 0.5 },
        ]}
      >
        <Text style={[styles.valueText, { color: newTheme.textPrimary }]}>
          {fmt(value)}
        </Text>

        <Ionicons
          name="time-outline"
          size={18}
          color={newTheme.textSecondary}
        />
      </TouchableOpacity>

      <TimePickerSheet
        visible={open}
        value={value}
        title={title ?? label}
        onChange={onChange}
        onClose={() => setOpen(false)}
        is24Hour={is24Hour}
      />
    </>
  );
}

const createStyles = (t: any) =>
  StyleSheet.create({
    label: {
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    valueText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
