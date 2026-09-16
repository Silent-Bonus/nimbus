import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { addObjectAtEnd } from "@/utils/helper";
import { HabitTag } from "@/features/habit/types/habitTypes";
import InputField from "@/components/ui/theme-components/StyledInputOld";
import ModalHeader from "@/components/ui/modal/ModalHeader";
// import styling from "../style/HabitTagModalStyle";

interface TagsType {
  id: number;
  name?: string;
}

interface TaskTagsModalProps {
  habitTagList: HabitTag[];
  visible: boolean;
  onClose: () => void;
  selectedTagData: any;
  onSelect: (tag?: any, newTag?: string) => void;
  title?: string;
  //   existingTags: TagsType[];
  //   onAddNewTag: (tag: string, id: number) => void;
}

const HabitTagsModal: React.FC<TaskTagsModalProps> = ({
  habitTagList,
  visible,
  onClose,
  onSelect,
  selectedTagData,
  title = "Select Tags",
  //   existingTags,
  //   onAddNewTag,
}) => {
  const [habitTagData, setHabitTagData] = useState<TagsType[]>([]);

  const [isAdding, setIsAdding] = useState(false);

  const [selectedTag, setSelectedTag] = useState<TagsType[]>([]);

  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  const handleAddNew = () => {
    if (newTag.trim().length === 0) {
      setError("Tag cannot be empty.");
      return;
    }
    if (newTag.trim().length > 20) {
      setError("Tag cannot exceed 20 characters.");
      return;
    }
    if (selectedTag.some((tag) => tag.name === newTag.trim())) {
      setError("Tag already exists.");
      return;
    }
    setSelectedTag([...selectedTag, { id: 0, name: newTag }]);
    onSelect({ id: 0, name: newTag });
    // setNewTag("");
    setIsAdding(false);
    setError("");
    handleClose();
  };

  const handleClose = () => {
    setIsAdding(false);
    setNewTag("");
    setError("");
    onClose();
  };

  const { newTheme, spacing, svaTypography } =
    useContext(ThemeContext);
  const bodyTextStyle = svaTypography?.textStyle?.body ?? svaTypography.textStyle.body;
  const styles = useMemo(
    () => styling(newTheme, spacing, bodyTextStyle),
    [newTheme, spacing, bodyTextStyle]
  );

  useEffect(() => {
    const modifiedArray = addObjectAtEnd(habitTagList);
    setHabitTagData(modifiedArray);
  }, [habitTagList]);

  const handleSaveClick = (tag: { id: number; name?: string }) => {
    setSelectedTag((prev) => {
      // Check if the tag already exists based on `id`
      const tagExists = prev.some((t) => t.id === tag.id);

      if (tagExists) {
        return prev; // Do nothing if tag already exists
      }

      // Otherwise, add the new tag
      return [...prev, tag];
    });
    onSelect(tag);
  };

  useEffect(() => {
    setSelectedTag(Array.isArray(selectedTagData) ? selectedTagData : []);
  }, [selectedTagData]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <ModalHeader
            title={title}
            onClose={handleClose}
            style={styles.modalHeaderCompact}
          />

          <FlatList
            data={habitTagData}
            keyExtractor={(item) =>
              item.name === "Add New"
                ? "habit-tags-add-new"
                : item.id.toString()
            }
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedTag.some((tag) => tag.id === item.id);
              const isAddNew = item.name === "Add New";

              return (
                <TouchableOpacity
                  style={[
                    styles.tagButton,
                    isSelected && styles.tagButtonSelected,
                  ]}
                  onPress={() => {
                    if (isAddNew) {
                      setIsAdding(true);
                    } else {
                      handleSaveClick(item);
                      handleClose();
                    }
                  }}
                >
                  <View style={styles.tagTextWrap}>
                    <Text
                      style={[
                        styles.tagText,
                        isSelected && styles.selectedTagText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {!isAddNew && isSelected && (
                      <Text style={styles.selectedHint}>Selected</Text>
                    )}
                  </View>

                  {isAddNew ? (
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                  ) : isSelected ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={newTheme.accent}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />

          {/* Add New Tag Section */}
          {isAdding && (
            <View style={styles.addNewContainer}>
              <InputField
                label="New Tag"
                value={newTag}
                onChangeText={(text) => {
                  setNewTag(text);
                  if (text.length <= 20) {
                    setError("");
                  }
                }}
                placeholder="Add New Tag"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default HabitTagsModal;

const styling = (newTheme: any, spacing: any, bodyTextStyle: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalContainer: {
      width: "100%",
      height: "75%",
      backgroundColor: newTheme.surfaceMuted,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: newTheme.borderMuted,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: newTheme.overlayStrong,
    },
    modalHeaderCompact: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 12,
    },
    listContainer: {
      flex: 1,
    },
    tagButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: newTheme.borderMuted,
    },
    tagButtonSelected: {
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    tagTextWrap: {
      flex: 1,
      paddingRight: spacing.md,
    },
    tagText: {
      ...bodyTextStyle,
      color: newTheme.textSecondary,
    },
    selectedTagText: {
      color: newTheme.textPrimary,
      fontWeight: "700",
    },
    selectedHint: {
      marginTop: 2,
      fontSize: 12,
      color: newTheme.textSecondary,
    },
    addNewContainer: {
      marginTop: spacing.lg,
    },
    input: {
      borderWidth: 1,
      backgroundColor: newTheme.surface,
      borderColor: newTheme.divider,
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
    },
    addButton: {
      marginTop: spacing.md,
      backgroundColor: newTheme.accent,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    addButtonText: {
      color: newTheme.background,
      fontSize: 16,
      fontWeight: "bold",
    },
    errorText: {
      color: newTheme.error,
      marginTop: 5,
      fontSize: 14,
    },
  });
