import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/Themed";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import {
  scribbleService,
} from "@/features/tools/services/scribbleService";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

export const ScribbleDetailScreen = () => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);
  const params = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    const fetchScribble = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        const data = await scribbleService.getScribbleById(params.id);
        if (data) {
          setTitle(data.title);
          setContent(data.content);
        }
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchScribble();
  }, [params.id]);

  // Function to extract tags from content
  const tags = useMemo(() => {
    const regex = /#(\w+)/g;
    const found = content.match(regex);
    // Enforce lowercase on tags
    return found ? Array.from(new Set(found.map((t) => t.toLowerCase()))) : [];
  }, [content]);

  // Function to render highlighted content
  const renderHighlightedContent = () => {
    if (!content)
      return (
        <Text style={styles.placeholder}>Start typing your thoughts...</Text>
      );

    const parts = content.split(/(#\w+)/g);
    return (
      <Text style={styles.contentDisplay}>
        {parts.map((part, index) => {
          if (part.startsWith("#")) {
            return (
              <Text key={index} style={styles.highlightedTag}>
                {part.toLowerCase()}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const handleUpdate = async () => {
    if (!title || !content || !params.id) return;
    try {
      setIsSaving(true);
      // Clean tags: remove '#' prefix and enforce lowercase before sending
      const tagList = tags.map((t) => t.replace("#", "").toLowerCase());

      // Enforce lowercase on hashtags WITHIN the content string
      const lowercasedContent = content.replace(/#(\w+)/g, (match) =>
        match.toLowerCase()
      );

      await scribbleService.updateScribble(params.id, {
        title,
        content: lowercasedContent,
        tag_list: tagList,
      });
      router.back();
    } catch (e) {
      console.error("Update failed", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!params.id) return;
    try {
      setIsDeleting(true);
      await scribbleService.deleteScribble(params.id);
      setIsDeleteModalVisible(false);
      router.back();
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <ScreenView style={styles.center}>
        <ActivityIndicator size="large" color={newTheme.accent} />
      </ScreenView>
    );
  }

  return (
    <ScreenView
      style={{
        flex: 1,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingHorizontal: spacing.md,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={newTheme.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Scribble</Text>
            <TouchableOpacity
              onPress={() => setIsDeleteModalVisible(true)}
              style={styles.deleteBtn}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={newTheme.error || "#FF7A7A"}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Title Input */}
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor={newTheme.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />

            {/* Tags Preview Area */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Note Area */}
            <View style={styles.inputContainer}>
              {/* Highlighted display (rendered behind or above) */}
              <View style={styles.displayArea}>
                {renderHighlightedContent()}
              </View>

              {/* Hidden Actual Input */}
              <TextInput
                style={styles.contentInput}
                placeholder="Notes"
                placeholderTextColor="transparent" // Keep text transparent to show highlighted version below
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Bottom Action */}
          <View style={styles.footer}>
            <StyledButton
              label={isSaving ? "Saving..." : "Update Scribble"}
              onPress={handleUpdate}
              disabled={!title || !content || isSaving || isDeleting}
              variant="primary"
              labelStyle={svaTypography?.textStyle.button}
              fullWidth
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconBg}>
                    <Ionicons
                      name="trash"
                      size={28}
                      color={newTheme.error || "#FF7A7A"}
                    />
                  </View>
                  <Text style={styles.modalTitle}>Delete Scribble?</Text>
                  <Text style={styles.modalSubtitle}>
                    This action cannot be undone. Are you sure you want to
                    remove this note?
                  </Text>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setIsDeleteModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.deleteConfirmBtn,
                      { backgroundColor: newTheme.error || "#FF7A7A" },
                    ]}
                    onPress={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.deleteConfirmBtnText}>Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScreenView>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
    },
    deleteBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
    },
    headerTitle: {
      ...(svaTypography?.textStyle.authTitle ?? {}),
      fontSize: 26,
      lineHeight: 28,
      fontStyle: "italic",
      color: theme.textPrimary,
    },
    titleInput: {
      ...(svaTypography?.textStyle.authTitle ?? {}),
      fontSize: 31,
      lineHeight: 34,
      fontStyle: "italic",
      color: theme.textPrimary,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      marginBottom: spacing.md,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: spacing.md,
    },
    tagBadge: {
      backgroundColor: "rgba(109, 255, 140, 0.15)",
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(109, 255, 140, 0.3)",
    },
    tagText: {
      ...(svaTypography?.textStyle.authTinyLabel ?? {}),
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.1,
      color: "#6DFF8C",
    },
    inputContainer: {
      minHeight: 300,
      position: "relative",
    },
    displayArea: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 0,
    },
    contentDisplay: {
      ...(svaTypography?.textStyle.body ?? {}),
      color: theme.textPrimary,
    },
    highlightedTag: {
      ...(svaTypography?.textStyle.bodyMedium ?? {}),
      color: "#6DFF8C",
    },
    placeholder: {
      ...(svaTypography?.textStyle.body ?? {}),
      color: theme.textSecondary,
    },
    contentInput: {
      ...(svaTypography?.textStyle.body ?? {}),
      color: "transparent", // Hide the actual text
      minHeight: 300,
      textAlignVertical: "top",
      padding: 0,
    },
    footer: {
      paddingVertical: spacing.lg,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    modalContent: {
      width: "100%",
      backgroundColor: theme.surface,
      borderRadius: 28,
      padding: spacing.xl,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.divider,
    },
    modalHeader: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    modalIconBg: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "rgba(255, 122, 122, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    modalTitle: {
      ...(svaTypography?.textStyle.heading2 ?? {}),
      color: theme.textPrimary,
      marginBottom: spacing.xs,
    },
    modalSubtitle: {
      ...(svaTypography?.textStyle.body ?? {}),
      lineHeight: 20,
      color: theme.textSecondary,
      textAlign: "center",
    },
    modalFooter: {
      flexDirection: "row",
      gap: spacing.md,
      width: "100%",
    },
    modalBtn: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    cancelBtn: {
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.divider,
    },
    cancelBtnText: {
      ...(svaTypography?.textStyle.button ?? {}),
      color: theme.textPrimary,
    },
    deleteConfirmBtn: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    deleteConfirmBtnText: {
      ...(svaTypography?.textStyle.button ?? {}),
      color: "#FFF",
    },
  });
