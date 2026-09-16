import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import ModalHeader from "@/components/ui/modal/ModalHeader";
import { HabitUnit } from "@/features/habit/types/habitTypes";

type ProtocolUnitPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  units: HabitUnit[];
  selectedUnitId: number;
  onSelect: (unit: HabitUnit) => void;
  title?: string;
};

export default function ProtocolUnitPickerModal({
  visible,
  onClose,
  units,
  selectedUnitId,
  onSelect,
  title = "Select Metric",
}: ProtocolUnitPickerModalProps) {
  const { newTheme, spacing, svaTypography } =
    useContext(ThemeContext);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      setSearch("");
    }
  }, [visible]);

  const bodyTextStyle = svaTypography?.textStyle?.body ?? svaTypography.textStyle.body;

  const styles = useMemo(
    () => makeStyles(newTheme, spacing, bodyTextStyle),
    [newTheme, spacing, bodyTextStyle]
  );

  const filteredUnits = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return units;
    return units.filter((unit) =>
      unit.name.toLowerCase().includes(query)
    );
  }, [search, units]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          <ModalHeader
            title={title}
            onClose={onClose}
            style={styles.headerCompact}
          />

          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={newTheme.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search units..."
              placeholderTextColor={newTheme.textDisabled}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredUnits}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedUnitId === item.id;

              return (
                <TouchableOpacity
                  style={styles.unitOption}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.unitOptionText,
                      isSelected && styles.selectedUnitText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={newTheme.accent}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
            style={styles.unitList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyState}>No units found.</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: any, spacing: any, bodyTextStyle: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlayStrong,
    },
    container: {
      width: "100%",
      height: "75%",
      backgroundColor: colors.surfaceMuted,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    headerCompact: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 12,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: spacing.md,
      height: 52,
      marginBottom: spacing.lg,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.textPrimary,
      ...bodyTextStyle,
    },
    unitList: {
      flex: 1,
    },
    unitOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
    },
    unitOptionText: {
      ...bodyTextStyle,
      color: colors.textSecondary,
    },
    selectedUnitText: {
      color: colors.textPrimary,
      fontWeight: "700",
    },
    emptyState: {
      ...bodyTextStyle,
      color: colors.textSecondary,
      textAlign: "center",
      paddingVertical: spacing.xl,
    },
  });
