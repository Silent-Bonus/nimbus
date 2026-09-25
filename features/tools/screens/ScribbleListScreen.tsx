import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/Themed";
import FilterPill from "@/features/self-care/components/workout/FilterPill";
import {
  scribbleService,
  Scribble,
} from "@/features/tools/services/scribbleService";

import { useFocusEffect } from "expo-router";
import { ROUTES } from "@/constants/routes";
import AppHeader from "@/components/layout/AppHeader";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";

export const ScribbleListScreen = () => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);
  const headerTitleStyle = {
    ...(svaTypography?.textStyle.authTitle ?? {}),
    fontSize: 26,
    lineHeight: 28,
    fontStyle: "italic" as const,
  };
  const headerSubtitleStyle = {
    ...(svaTypography?.textStyle.body ?? {}),
    fontSize: 14,
    lineHeight: 20,
  };
  const filterLabelStyle = {
    ...(svaTypography?.textStyle.authTinyLabel ?? {}),
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
  };

  const [scribbles, setScribbles] = useState<Scribble[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [allTagsList, setAllTagsList] = useState<string[]>(["All"]);

  const fetchScribbles = async (tag?: string) => {
    try {
      setLoading(true);
      const params: {
        ordering: string;
        tag?: string;
      } = {
        ordering: "-date", // "todays ordering" - latest first
      };

      // If a specific tag is selected (not "All"), add it to the filter params in lowercase
      if (tag && tag !== "All") {
        params.tag = tag.replace("#", "").toLowerCase();
      }

      const data = await scribbleService.getScribbles(params);
      setScribbles(data);
    } catch (e) {
      console.error("Fetch scribbles failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTags = async () => {
    try {
      const tags = await scribbleService.getRecentTags();
      setAllTagsList(["All", ...tags]);
    } catch (e) {
      console.error("Fetch recent tags failed:", e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchScribbles(selectedTag);
      fetchRecentTags();
    }, [selectedTag])
  );

  const handleTagPress = (tag: string) => {
    setSelectedTag(tag);
  };

  const renderScribbleItem = ({ item }: { item: Scribble }) => (
    <TouchableOpacity
      style={styles.scribbleCard}
      onPress={() =>
        router.push({
          pathname: ROUTES.AUTH.TOOLS_SCRIBBLE_DETAIL,
          params: { id: item.id },
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
      <Text style={styles.cardContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.tagsRow}>
        {item.tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.tagBadge}
            onPress={() => handleTagPress(tag.replace("#", "").toLowerCase())}
          >
            <Text style={styles.tagText}>
              {tag.startsWith("#")
                ? tag.toLowerCase()
                : `#${tag.toLowerCase()}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenView
      style={{
        paddingTop:
          Platform.OS === "ios"
            ? spacing["xxl"] + spacing["xxl"] * 0.2
            : spacing.xl,
        paddingHorizontal: spacing.md,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <AppHeader
          title="Scribbles"
          subtitle="Jot down your thoughts and ideas."
          onBack={() => router.back()}
          titleStyle={headerTitleStyle}
          subtitleStyle={headerSubtitleStyle}
        />

        {/* Filter Row */}
        <View style={{ marginBottom: spacing.md }}>
          <FlatList
            data={allTagsList}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item }) => (
              <FilterPill
                label={item === "All" ? "All" : `#${item}`}
                isActive={selectedTag === item}
                onPress={() => handleTagPress(item)}
                labelStyle={filterLabelStyle}
              />
            )}
          />
        </View>

        {/* List content */}
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={newTheme.accent} />
          </View>
        ) : (
          <FlatList
            data={scribbles}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderScribbleItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="pencil-off-outline"
                  size={64}
                  color={newTheme.textSecondary}
                />
                <Text style={styles.emptyText}>No scribbles found.</Text>
              </View>
            }
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(ROUTES.AUTH.TOOLS_CREATE_SCRIBBLE)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={newTheme.background} />
        </TouchableOpacity>
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
    filterRow: {
      paddingVertical: spacing.xs,
    },
    scribbleCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.divider,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.xs,
    },
    cardTitle: {
      ...(svaTypography?.textStyle.authTitle ?? {}),
      fontSize: 26,
      lineHeight: 28,
      fontStyle: "italic",
      color: theme.accent,
      flex: 1,
    },
    cardDate: {
      ...(svaTypography?.textStyle.authTinyLabel ?? {}),
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.1,
      color: theme.textSecondary,
      marginLeft: spacing.sm,
    },
    cardContent: {
      ...(svaTypography?.textStyle.body ?? {}),
      color: theme.textSecondary,
      marginBottom: spacing.md,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    tagBadge: {
      backgroundColor: theme.surfaceMuted,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    tagText: {
      ...(svaTypography?.textStyle.authTinyLabel ?? {}),
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.1,
      color: theme.accent,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 100,
    },
    emptyText: {
      ...(svaTypography?.textStyle.body ?? {}),
      color: theme.textSecondary,
      marginTop: spacing.md,
    },
    fab: {
      position: "absolute",
      bottom: spacing.xl,
      right: spacing.md,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  });
