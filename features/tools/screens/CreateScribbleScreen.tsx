import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/Themed";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import { scribbleService } from "@/features/tools/services/scribbleService";
import { toApiDate } from "@/utils/date-time";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

export const CreateScribbleScreen = () => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    if (!title || !content) return;
    try {
      setIsSaving(true);
      // Clean tags: remove '#' prefix and enforce lowercase before sending
      const tagList = tags.map((t) => t.replace("#", "").toLowerCase());

      // Enforce lowercase on hashtags WITHIN the content string
      const lowercasedContent = content.replace(/#(\w+)/g, (match) =>
        match.toLowerCase()
      );

      await scribbleService.saveScribble({
        title,
        content: lowercasedContent,
        tag_list: tagList,
        date: toApiDate(new Date()),
      });
      router.back();
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setIsSaving(false);
    }
  };

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
            <Text style={styles.headerTitle}>New Scribble</Text>
            <View style={{ width: 40 }} />
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
              label={isSaving ? "Saving..." : "Save Scribble"}
              onPress={handleSave}
              disabled={!title || !content || isSaving}
              variant="primary"
              labelStyle={svaTypography?.textStyle.button}
              fullWidth
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenView>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) =>
  StyleSheet.create({
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
  });
