import React, { useContext } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

type Props = {
  label?: string;
  value: Date; // controlled value (time portion used)
  onChange: (d: Date) => void; // fire with updated Date
  minuteStep?: number; // default 5
  use12h?: boolean; // default true
  disabled?: boolean;
  error?: string;
};

type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
// Allowed minute intervals per iOS spec
const ALLOWED_MINUTES = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30] as const;

export default function InlineTimePicker({
  label,
  value,
  onChange,
  minuteStep = 5,
  use12h = true,
  disabled = false,
  error,
}: Props) {
  const { newTheme } = useContext(ThemeContext);
  const styles = styling(newTheme);
  const [showAndroidPicker, setShowAndroidPicker] = React.useState(false);

  // iOS needs the union type MinuteInterval
  const minuteInterval: MinuteInterval = (ALLOWED_MINUTES.find(
    (v) => v === minuteStep
  ) ?? 5) as MinuteInterval;

  /**
   * iOS — native spinner
   */
  if (Platform.OS === "ios") {
    return (
      <View style={styles.wrapper}>
        {!!label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.card, disabled && { opacity: 0.5 }]}>
          <DateTimePicker
            mode="time"
            value={value}
            textColor={newTheme.textPrimary}
            onChange={(_: DateTimePickerEvent, d?: Date) => {
              if (d) onChange(d);
            }}
            minuteInterval={minuteInterval}
            display="spinner"
            disabled={disabled}
            style={{ alignSelf: "stretch" }}
          />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  /**
   * Android — standard system picker (via pressable)
   */
  const onAndroidChange = (event: DateTimePickerEvent, d?: Date) => {
    setShowAndroidPicker(false);
    if (event.type === "set" && d) {
      onChange(d);
    }
  };

  const timeString = value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: use12h,
  });

  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setShowAndroidPicker(true)}
        style={[styles.card, disabled && { opacity: 0.5 }]}
      >
        <View style={styles.androidContent}>
          <Text style={styles.androidValueText}>{timeString}</Text>
          <Ionicons
            name="time-outline"
            size={22}
            color={newTheme.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {showAndroidPicker && (
        <DateTimePicker
          mode="time"
          value={value}
          is24Hour={!use12h}
          display="default"
          onChange={onAndroidChange}
        />
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styling = (t: any) =>
  StyleSheet.create({
    wrapper: { marginTop: 8 },
    label: {
      color: t.textSecondary,
      fontSize: 13,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      borderRadius: 16,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.borderMuted ?? t.divider,
      padding: 16,
      justifyContent: "center",
    },
    androidContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    androidValueText: {
      fontSize: 18,
      fontWeight: "700",
      color: t.textPrimary,
    },
    error: { color: "#ff6b6b", marginTop: 8, fontSize: 12 },
  });
