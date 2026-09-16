import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

interface Props {
  title: string;
  accentColor?: string;
  onSelect?: (value: string) => void;
  type?: "weekly" | "monthly" | "default";
}

export default function HeaderPanel({
  title,
  type = "default",
  accentColor,
  onSelect,
}: Props) {
  const [selected, setSelected] = useState("Today");
  const [open, setOpen] = useState(false);
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const weekly = ["Current week", "Previous week", "Future weeks"];
  const monthly = ["Current month", "Previous month", "Future month"];

  const handleSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
    onSelect?.(value);
  };

  return (
    <View style={styles.container}>
      {/* Left side title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right side dropdown */}

      {(type === "monthly" || type === "weekly") && (
        <View style={{ position: "relative", zIndex: 100 }}>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              { backgroundColor: accentColor ?? newTheme.surfaceMuted },
            ]}
            onPress={() => setOpen(!open)}
          >
            <Text style={styles.dropdownText}>{selected}</Text>
            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={16}
              color={newTheme.textPrimary}
            />
          </TouchableOpacity>

          {open && (
            <View style={styles.dropdownMenu}>
              {type &&
                type === "monthly" &&
                monthly.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(opt)}
                  >
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              {type &&
                type === "weekly" &&
                weekly.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(opt)}
                  >
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styling = (newTheme: ColorSet, spacing: Spacing, svaTypography: TypographyTokens) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    title: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
    },
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 20,
    },
    dropdownText: {
      color: newTheme.textSecondary,
      ...svaTypography.textStyle.caption,
      marginRight: spacing.xs,
    },
    dropdownMenu: {
      position: "absolute",
      top: 40,
      right: 0,
      backgroundColor: newTheme.surfaceElevated ?? newTheme.surface,
      elevation: 10, // ✅ Android shadow
      zIndex: 100,
      borderRadius: spacing.sm,
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    dropdownItem: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    dropdownItemText: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textPrimary,
    },
  });
