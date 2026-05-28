import React, { useContext, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";

interface ChoiceItemProps {
  choice: {
    id: string;
    label: string;
    icon?: string | null;
  };
  selected?: boolean;
  onPress: () => void;
  testID?: string;
}

const ChoiceItem = ({
  choice,
  selected = false,
  onPress,
  testID,
}: ChoiceItemProps) => {
  const { svaColors } = useContext(ThemeContext);
  const styles = useMemo(() => styling(svaColors, selected), [svaColors, selected]);

  return (
    <Pressable
      testID={testID ?? `dosha-option-${choice.id}`}
      accessibilityLabel={choice.label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceItem,
        pressed && styles.choiceItemPressed,
      ]}
    >
      <View style={styles.textBlock}>
        <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
          {choice.icon ? `${choice.icon} ` : ""}
          {choice.label}
        </Text>
      </View>

      <View style={[styles.trailing, selected && styles.trailingSelected]}>
        {selected ? (
          <Ionicons name="checkmark" size={18} color={svaColors.bg.base} />
        ) : null}
      </View>
    </Pressable>
  );
};

const styling = (svaColors: any, selected: boolean) =>
  StyleSheet.create({
    choiceItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: selected ? svaColors.brand.primary : svaColors.border.default,
      backgroundColor: selected
        ? svaColors.brand.subtle
        : svaColors.surface.raised,
      marginBottom: 14,
      shadowColor: svaColors.shadow.default,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 1,
    },
    choiceItemPressed: {
      opacity: 0.95,
      transform: [{ scale: 0.995 }],
    },
    textBlock: {
      flex: 1,
    },
    choiceText: {
      ...SVATypography.textStyle.body,
      color: svaColors.text.primary,
      lineHeight: 24,
    },
    choiceTextSelected: {
      color: svaColors.text.primary,
    },
    trailing: {
      width: 28,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: svaColors.surface.base,
      borderWidth: 1,
      borderColor: svaColors.border.muted,
    },
    trailingSelected: {
      backgroundColor: svaColors.brand.primary,
      borderColor: svaColors.brand.primary,
    },
  });

export default ChoiceItem;
