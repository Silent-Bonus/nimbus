import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "@/components/layout/AppHeader";
import ThemeContext from "@/contexts/ThemeContext";
import PillFilters from "@/components/ui/PillFilters";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import {
  getReflectionList,
  getReflectionSessionList,
} from "@/features/self-care/services/selfCareService";
import ReflectionEntryCard from "@/features/self-care/components/reflection/ReflectionEntryCard";
import {
  buildReflectionTemplateRouteParams,
  formatTagLabel,
  mapReflectionSessionToCard,
  mapReflectionTemplateToCard,
  normalizeTag,
  type ReflectionCard,
} from "@/features/self-care/utils/reflections";
import type {
  ReflectionSessionState,
  ReflectionTemplateItem,
} from "@/features/self-care/types/reflectionTypes";

export const ReflectionsScreen = () => {
  const navigation = useNavigation();
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState<ReflectionCard[]>([]);
  const [inProgressSessions, setInProgressSessions] = useState<ReflectionCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const styles = useMemo(
    () => styling(theme, spacing, typography),
    [theme, spacing, typography]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadReflections = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Re-enable `/api/v1/reflect/categories/` once the endpoint is live.
      // The category fetch is intentionally disabled for now so template loading
      // does not fail while the API is unavailable.
      const [templateResponse, sessionResponse] = await Promise.all([
        getReflectionList(),
        getReflectionSessionList({
          status: "in_progress",
        }),
      ]);
      const templates: ReflectionTemplateItem[] = Array.isArray(
        templateResponse?.data
      )
        ? templateResponse.data
        : [];
      const sessions: ReflectionSessionState[] = Array.isArray(sessionResponse?.data)
        ? sessionResponse.data
        : [];

      const templateCards = templates.map(mapReflectionTemplateToCard);
      // Use slug as the shared key between template exploration and session resume
      // so active sessions can inherit the richer template card metadata.
      const templateBySlug = new Map(
        templateCards
          .map((template) => [template.slug ?? template.templateId ?? template.id, template] as const)
          .filter(([slug]) => Boolean(slug))
      );

      const mappedSessions = sessions
        .map((session) => {
          const sessionCard = mapReflectionSessionToCard(session);
          const matchingTemplate = templateBySlug.get(
            session.template_slug.trim()
          );

          // If the backend returns a session for a template we do not currently
          // have in the library response, still surface the session so it can
          // be opened instead of silently disappearing.
          if (!matchingTemplate) {
            return {
              ...sessionCard,
              sessionId: undefined,
              isResumable: false,
            };
          }

          return {
            ...matchingTemplate,
            id: sessionCard.id,
            sessionId: sessionCard.sessionId,
            status: sessionCard.status,
            statusLabel: sessionCard.statusLabel,
            dateLabel: sessionCard.dateLabel,
            createdAt: sessionCard.createdAt,
            currentStep: sessionCard.currentStep,
            questionCount: sessionCard.questionCount ?? matchingTemplate.questionCount,
            isResumable: true,
          };
        })
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

      setReflections(templateCards);
      setInProgressSessions(mappedSessions);
    } catch (error) {
      console.log("Failed to load reflection templates:", error);
      setReflections([]);
      setInProgressSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReflections();
  }, [loadReflections]);

  const filterOptions = useMemo(() => {
    // Category pills are derived from the live template payload until the
    // dedicated categories endpoint is available again.
    const categoryOptions = Array.from(
      new Map(
        reflections
          .map((reflection) => normalizeTag(reflection.category ?? ""))
          .filter(Boolean)
          .map((category) => [
            category,
            {
              label: formatTagLabel(category),
              value: category,
            },
          ])
      ).values()
    );

    return [{ label: "All Echoes", value: "all" }, ...categoryOptions];
  }, [reflections]);

  const visibleReflections = useMemo(() => {
    if (selectedCategory === "all") return reflections;

    return reflections.filter((reflection) =>
      normalizeTag(reflection.category ?? reflection.tags[0] ?? "") ===
      selectedCategory
    );
  }, [reflections, selectedCategory]);

  const handleOpenArchive = () => {
    router.push(ROUTES.AUTH.SELF_CARE_REFLECTION_ARCHIVE);
  };

  const handleOpenReflection = (item: ReflectionCard) => {
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_DETAIL,
      params: buildReflectionTemplateRouteParams(item),
    });
  };

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Guided Reflections"
          subtitle="Choose a prompt and explore what is present."
          onBack={() => router.back()}
          rightAction={{
            icon: "archive-outline",
            accessibilityLabel: "Open reflection archive",
            onPress: handleOpenArchive,
          }}
          containerStyle={styles.header}
        />

        <FlatList
          data={visibleReflections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.accent} />
                  <Text style={styles.loadingText}>
                    Gathering reflections...
                  </Text>
                </View>
              ) : (
                <>
                  {!!inProgressSessions.length && (
                    <View style={styles.sessionSection}>
                      <View style={styles.sessionHeaderRow}>
                        <View style={styles.sessionTitleGroup}>
                          <Text style={styles.sectionEyebrow}>Resume</Text>
                          <Text style={styles.sectionTitle}>In Progress Sessions</Text>
                        </View>
                        <View style={styles.sessionCountPill}>
                          <Text style={styles.sessionCountText}>
                            {inProgressSessions.length}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.sectionSubtitle}>
                        Continue your active reflection threads before starting a new
                        one.
                      </Text>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.sessionScrollContent}
                      >
                        {inProgressSessions.map((item) => (
                          <View
                            key={`session-${item.sessionId ?? item.id}`}
                            style={styles.sessionCardWrap}
                          >
                            <ReflectionEntryCard
                              item={item}
                              onPress={() => handleOpenReflection(item)}
                              actionLabel={
                                item.isResumable ? "Continue Session" : "Open"
                              }
                              onActionPress={() => handleOpenReflection(item)}
                              variant="session"
                            />
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}

              <View style={styles.librarySectionHeader}>
                <Text style={styles.libraryEyebrow}>Explore</Text>
                <Text style={styles.libraryTitle}>Reflection Library</Text>
              </View>

              <PillFilters
                options={filterOptions}
                selectedValue={selectedCategory}
                onChange={setSelectedCategory}
                scrollable
                contentContainerStyle={styles.filterRow}
                selectedPillStyle={styles.filterPillActive}
                inactivePillStyle={styles.filterPillInactive}
                selectedLabelStyle={styles.filterTextActive}
                inactiveLabelStyle={styles.filterTextInactive}
              />
            </>
          }
          renderItem={({ item }) => (
            <ReflectionEntryCard
              item={item}
              onPress={() => handleOpenReflection(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={40}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyTitle}>No reflections found.</Text>
              <Text style={styles.emptyText}>
                New reflection templates will appear here once they are available.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenView>
  );
};

const styling = (theme: any, spacing: any, typography: any) =>
  StyleSheet.create({
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    root: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.md,
    },
    listContent: {
      paddingBottom: spacing.xl * 3,
    },
    filterRow: {
      paddingVertical: spacing.xs,
      paddingRight: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    filterPillInactive: {
      backgroundColor: theme.surface,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    filterPillActive: {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    filterTextInactive: {
      ...typography.smallCaption,
      letterSpacing: 1.1,
      color: theme.textSecondary,
    },
    filterTextActive: {
      color: theme.textPrimary,
    },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: spacing.md,
    },
    loadingText: {
      ...typography.caption,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    sessionSection: {
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      borderRadius: 30,
      backgroundColor: "rgba(163,190,140,0.08)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.16)",
    },
    sessionHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
      gap: spacing.md,
    },
    sessionTitleGroup: {
      flex: 1,
      gap: 2,
    },
    sectionEyebrow: {
      ...typography.smallCaption,
      color: theme.accent,
      textTransform: "uppercase",
      letterSpacing: 1.4,
    },
    sectionTitle: {
      ...typography.h3,
      color: theme.textPrimary,
    },
    sessionCountPill: {
      minWidth: 34,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
    },
    sessionCountText: {
      ...typography.caption,
      color: theme.textPrimary,
      fontWeight: "700",
    },
    sectionSubtitle: {
      ...typography.caption,
      color: theme.textSecondary,
      marginBottom: spacing.md,
    },
    sessionScrollContent: {
      paddingRight: spacing.sm,
      gap: spacing.md,
    },
    sessionCardWrap: {
      width: 312,
      maxWidth: 312,
    },
    librarySectionHeader: {
      marginBottom: spacing.sm,
    },
    libraryEyebrow: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1.4,
      marginBottom: spacing.xs * 0.5,
    },
    libraryTitle: {
      ...typography.h3,
      color: theme.textPrimary,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      marginTop: spacing.md,
    },
    emptyText: {
      ...typography.body,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
  });

export default ReflectionsScreen;
