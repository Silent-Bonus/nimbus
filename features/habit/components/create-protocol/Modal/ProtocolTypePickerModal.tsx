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
import { HabitType } from "@/features/habit/types/habitTypes";

type ProtocolTypePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  types: HabitType[];
  selectedTypeId: number | null;
  onSelect: (type: HabitType) => void;
  title?: string;
};

export default function ProtocolTypePickerModal({
  visible,
  onClose,
  types,
  selectedTypeId,
  onSelect,
  title = "Select Protocol Type",
}: ProtocolTypePickerModalProps) {
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

  const filteredTypes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return types;
    return types.filter((type) => {
      const name = type.name?.toLowerCase() ?? "";
      const description = type.description?.toLowerCase() ?? "";
      return name.includes(query) || description.includes(query);
    });
  }, [search, types]);

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
              placeholder="Search protocol types..."
              placeholderTextColor={newTheme.textDisabled}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredTypes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedTypeId === item.id;

              return (
                <TouchableOpacity
                  style={styles.typeOption}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      isSelected && styles.selectedTypeText,
                    ]}
                    numberOfLines={1}
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
            style={styles.typeList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyState}>No protocol types found.</Text>
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
    typeList: {
      flex: 1,
    },
    typeOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
    },
    typeOptionText: {
      ...bodyTextStyle,
      color: colors.textSecondary,
      flex: 1,
      paddingRight: spacing.md,
    },
    selectedTypeText: {
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
