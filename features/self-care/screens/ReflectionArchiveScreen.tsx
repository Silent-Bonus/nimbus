import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
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
  getReflectionSessionList,
} from "@/features/self-care/services/selfCareService";
import ReflectionEntryCard from "@/features/self-care/components/reflection/ReflectionEntryCard";
import type {
  ReflectionSessionState,
} from "@/features/self-care/types/reflectionTypes";
import {
  buildReflectionSessionStatusQuery,
  type ReflectionSessionFilter,
} from "@/features/self-care/utils/reflectionArchive";
import {
  mapReflectionSessionToCard,
  normalizeReflectionSessionStatus,
  type ReflectionCard,
} from "@/features/self-care/utils/reflections";

const REFLECTION_SESSION_FILTERS: readonly {
  label: string;
  value: ReflectionSessionFilter;
}[] = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

export const ReflectionArchiveScreen = () => {
  const navigation = useNavigation();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState<ReflectionCard[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<ReflectionSessionFilter>("all");

  const styles = useMemo(
    () => styling(theme, svaTypography, spacing, typography),
    [theme, svaTypography, spacing, typography]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadReflectionSessions = useCallback(async () => {
    setLoading(true);
    try {
      // The archive filter drives the server query so completed and active
      // buckets stay aligned with backend session state instead of relying
      // only on client-side filtering.
      const response = await getReflectionSessionList(
        selectedFilter === "all"
          ? undefined
          : {
              status: buildReflectionSessionStatusQuery(selectedFilter),
            }
      );
      const sessions: ReflectionSessionState[] = Array.isArray(response?.data)
        ? response.data
        : [];

      const mapped = sessions
        .map(mapReflectionSessionToCard)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

      setReflections(mapped);
    } catch (error) {
      console.log("Failed to load reflection sessions:", error);
      setReflections([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadReflectionSessions();
  }, [loadReflectionSessions]);

  const visibleReflections = useMemo(() => {
    if (selectedFilter === "all") {
      return reflections;
    }

    return reflections.filter((reflection) => {
      return normalizeReflectionSessionStatus(reflection.status) === selectedFilter;
    });
  }, [reflections, selectedFilter]);

  const handleOpenReflection = (item: ReflectionCard) => {
    // Completed sessions are fully review-driven now, so the review screen
    // only needs the session id and can fetch the latest summary/responses.
    if (normalizeReflectionSessionStatus(item.status) === "completed") {
      router.push({
        pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_SUBMISSION,
        params: {
          journalSessionId: item.id,
        },
      });
      return;
    }

    // Active archive items still go through detail first so the template
    // context is restored before resuming the session entry flow.
    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_DETAIL,
      params: {
        journalSlug: item.slug ?? item.templateId ?? item.id,
        journalSessionId: item.id,
      },
    });
  };

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Reflection Archive"
          subtitle="Resume active sessions or revisit completed ones."
          onBack={() => router.back()}
          rightAction={{
            icon: "journal-outline",
            accessibilityLabel: "Open reflection library",
            onPress: () => router.push(ROUTES.AUTH.SELF_CARE_REFLECTIONS),
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
              <PillFilters
                options={REFLECTION_SESSION_FILTERS}
                selectedValue={selectedFilter}
                onChange={setSelectedFilter}
                scrollable
                contentContainerStyle={styles.filterRow}
                selectedPillStyle={styles.filterPillActive}
                inactivePillStyle={styles.filterPillInactive}
                selectedLabelStyle={styles.filterTextActive}
                inactiveLabelStyle={styles.filterTextInactive}
              />

              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.accent} />
                  <Text style={styles.loadingText}>
                    Loading reflection sessions...
                  </Text>
                </View>
              ) : (
                <View style={styles.countRow}>
                  <Ionicons
                    name="archive-outline"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.countText}>
                    {visibleReflections.length} session
                    {visibleReflections.length === 1 ? "" : "s"} in this view
                  </Text>
                </View>
              )}
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
                name="archive-outline"
                size={40}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyTitle}>No reflection sessions here.</Text>
              <Text style={styles.emptyText}>
                Try a different status or start a new reflection.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenView>
  );
};

const styling = (theme: any, svaTypography: any, spacing: any, typography: any) =>
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
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ?? "Inter_600SemiBold",
      fontSize: 11,
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
    countRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: spacing.md,
    },
    countText: {
      ...typography.caption,
      color: theme.textSecondary,
      fontWeight: "700",
      letterSpacing: 0.2,
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

export default ReflectionArchiveScreen;
