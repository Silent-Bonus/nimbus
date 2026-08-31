import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/components/layout/AppHeader";
import ThemeContext from "@/contexts/ThemeContext";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import ActionModal from "@/components/ui/modal/ActionModal";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import {
  abandonReflectionSession,
  getReflectionDetail,
  getReflectionSessionList,
  startReflectionSession,
} from "@/features/self-care/services/selfCareService";
import type { ReflectionSessionState } from "@/features/self-care/types/reflectionTypes";
import {
  mapReflectionTemplateToCard,
  parseReflectionRouteParam,
  type ReflectionCard,
  type ReflectionRouteParams,
} from "@/features/self-care/utils/reflections";

const HERO_IMAGE = require("../../../assets/images/mt.jpg");

const formatTagLabel = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function ReflectionDetailScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ReflectionRouteParams>();
  const { newTheme: theme, spacing, typography } = useContext(ThemeContext);
  const toast = useNimbusToast();

  const reflectionSlug = parseReflectionRouteParam(params.journalSlug) ?? "";
  const reflectionSessionId = parseReflectionRouteParam(params.journalSessionId) ?? "";
  const [detail, setDetail] = useState<ReflectionCard | null>(null);
  const [loading, setLoading] = useState(Boolean(reflectionSlug));
  const [startingReflection, setStartingReflection] = useState(false);
  const [existingSession, setExistingSession] = useState<ReflectionSessionState | null>(
    null
  );
  const [showExistingSessionAlert, setShowExistingSessionAlert] = useState(false);

  const styles = useMemo(
    () => styling(theme, spacing, typography),
    [theme, spacing, typography]
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      // The detail view is template-driven, so without a slug there is nothing
      // useful to fetch or render beyond the fallback empty state.
      if (!reflectionSlug) {
        if (active) {
          setLoading(false);
          setDetail(null);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await getReflectionDetail(reflectionSlug);
        if (!active) {
          return;
        }

        if (response?.data) {
          setDetail(mapReflectionTemplateToCard(response.data));
        } else {
          setDetail(null);
        }
      } catch (error) {
        console.log("Failed to load reflection detail:", error);
        if (active) {
          setDetail(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      active = false;
    };
  }, [reflectionSlug]);

  useEffect(() => {
    if (!reflectionSlug || reflectionSessionId) {
      setExistingSession(null);
      return;
    }

    let active = true;

    const loadExistingSession = async () => {
      try {
        // Explore opens detail without a session id, so we proactively check
        // whether this template already has an active session before creating a
        // new one.
        const response = await getReflectionSessionList({
          status: "in_progress",
        });
        if (!active) {
          return;
        }

        const sessions = Array.isArray(response?.data) ? response.data : [];
        const matchingSession =
          sessions.find((session) => session.template_slug === reflectionSlug) ?? null;

        setExistingSession(matchingSession);
      } catch (error) {
        console.log("Failed to load existing reflection sessions:", error);
        if (active) {
          setExistingSession(null);
        }
      }
    };

    loadExistingSession();

    return () => {
      active = false;
    };
  }, [reflectionSessionId, reflectionSlug]);

  const journalTitle = detail?.title ?? "Untitled Reflection";
  const journalDescription =
    detail?.description ?? "A quiet threshold before the first question.";
  const journalDateLabel = detail?.dateLabel ?? "";
  const journalTags = detail?.tags ?? [];
  const journalBenefits = detail?.benefits ?? [];
  const journalQuestions = detail?.questions ?? [];
  const journalEstimatedMinutes = detail?.estimatedMinutes ?? 0;
  const journalTotalSteps =
    detail?.totalSteps ?? detail?.questionCount ?? journalQuestions.length;
  const primaryTag = detail?.category ?? journalTags[0] ?? "reflection";
  const isResumingSession = Boolean(reflectionSessionId);

  // Keep the entry route payload in one place so fresh-start and resume paths
  // always hand off the same template context.
  const buildEntryParams = (sessionId: string) => ({
    journalId: detail?.templateId ?? detail?.id ?? reflectionSlug,
    journalSessionId: sessionId,
    journalTitle: detail?.title ?? journalTitle,
    journalDescription: detail?.description ?? journalDescription,
    journalTags: journalTags.join(","),
    journalDateLabel,
    journalBenefits: JSON.stringify(journalBenefits),
    journalQuestions: JSON.stringify(journalQuestions),
    journalEstimatedMinutes: String(journalEstimatedMinutes),
    journalTotalSteps: String(journalTotalSteps),
    journalCategory: primaryTag,
  });

  const handleContinueExistingSession = () => {
    if (!detail || !existingSession) {
      return;
    }

    router.push({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_ENTRY,
      params: buildEntryParams(String(existingSession.id)),
    });
  };

  const handleCreateNewSession = async () => {
    if (!detail) {
      return;
    }

    if (startingReflection) {
      return;
    }

    setStartingReflection(true);
    try {
      // Replacing an existing same-template session is a two-step backend flow:
      // abandon the previous session first, then create the new one.
      if (existingSession) {
        const abandonResult = await abandonReflectionSession(existingSession.id);

        if (abandonResult?.success === false || abandonResult?.status === "error") {
          toast.show({
            variant: "error",
            title: "Unable to start new session",
            message:
              abandonResult?.message ||
              "We couldn’t close the previous session right now.",
          });
          return;
        }
      }

      const result = await startReflectionSession({
        template_slug: detail.templateId ?? detail.id,
        trigger_source: "manual",
        trigger_metadata: {
          entry_point: "reflection_detail",
        },
      });

      if (result?.success === false || result?.status === "error") {
        toast.show({
          variant: "error",
          title: "Unable to start reflection",
          message: result?.message || "Please try again in a moment.",
        });
        return;
      }

      router.push({
        pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_ENTRY,
        params: buildEntryParams(String(result.data?.id ?? "")),
      });
      setShowExistingSessionAlert(false);
      setExistingSession(null);
    } catch (error: any) {
      toast.show({
        variant: "error",
        title: "Unable to start reflection",
        message:
          error?.message ||
          error?.detail ||
          "We couldn’t start this reflection right now.",
      });
    } finally {
      setStartingReflection(false);
    }
  };

  const handleStartReflection = async () => {
    if (!detail) {
      return;
    }

    if (startingReflection) {
      return;
    }

    // Archive/existing-session routes already know which session to resume, so
    // they bypass the conflict check and open entry directly.
    if (isResumingSession) {
      router.push({
        pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_ENTRY,
        params: buildEntryParams(reflectionSessionId),
      });
      return;
    }

    if (existingSession) {
      setShowExistingSessionAlert(true);
      return;
    }

    await handleCreateNewSession();
  };

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Reflection Prelude"
          subtitle="A quiet threshold before the first question."
          onBack={() => router.back()}
          containerStyle={styles.header}
        />

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={styles.loadingText}>Loading reflection details...</Text>
          </View>
        ) : !detail ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="journal-outline"
              size={40}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyTitle}>Unable to load this reflection.</Text>
            <Text style={styles.emptyText}>
              Please go back and try opening the template again.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + spacing.xl * 2.5 },
            ]}
          >
            <View style={styles.heroCard}>
              <Image source={HERO_IMAGE} style={styles.heroImage} contentFit="cover" />
              <LinearGradient
                colors={["rgba(9, 11, 8, 0.02)", "rgba(9, 11, 8, 0.84)"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.heroGlowTop} />
              <View style={styles.heroGlowBottom} />

              <View style={styles.heroTextBlock}>
                <Text style={styles.heroKicker}>GUIDED REFLECTION</Text>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {journalTitle}
                </Text>
                <Text style={styles.heroSubtext}>
                  {`${Math.max(journalTotalSteps, journalQuestions.length || 0)} guided prompts${
                    journalEstimatedMinutes > 0
                      ? ` · ${journalEstimatedMinutes} min`
                      : ""
                  }`}
                </Text>
              </View>
            </View>

            <View style={styles.descriptionCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>ABOUT THIS REFLECTION</Text>
                {!!journalDateLabel && (
                  <Text style={styles.cardMeta}>{journalDateLabel}</Text>
                )}
              </View>

              <Text style={styles.descriptionText}>{journalDescription}</Text>

              {!!journalTags.length && (
                <View style={styles.tagsRow}>
                  {journalTags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>
                        #{formatTagLabel(tag).toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>WHY IT HELPS</Text>
                <View style={styles.miniPill}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.miniPillText}>{primaryTag.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.benefitList}>
                {(journalBenefits.length
                  ? journalBenefits
                  : [
                      "Move through each prompt at your own pace.",
                      "Name the truth clearly before you leave the page.",
                      "Return later and keep the same reflection thread alive.",
                    ]).map((benefit) => (
                  <View key={benefit} style={styles.benefitRow}>
                    <View style={styles.benefitIcon}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={theme.background}
                      />
                    </View>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>

            <NimbusButton
              label={isResumingSession ? "Continue Session" : "Start Reflection"}
              onPress={handleStartReflection}
              loading={startingReflection}
              disabled={startingReflection}
              rightIcon={
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={theme.buttonPrimaryText}
                />
              }
              style={styles.ctaButton}
            />
          </ScrollView>
        )}

        <ActionModal
          visible={showExistingSessionAlert}
          isBusy={startingReflection}
          eyebrow="Active Reflection"
          iconName="time-outline"
          title="You already started this reflection"
          body="Continue where you left off with your saved answers, or start a fresh session after closing the current one."
          onClose={() => setShowExistingSessionAlert(false)}
          primaryAction={{
            label: "Continue Previous Session",
            onPress: handleContinueExistingSession,
          }}
          secondaryAction={{
            label: "Start New Session",
            onPress: handleCreateNewSession,
            loading: startingReflection,
            closeOnPress: false,
            variant: "outline",
          }}
        />
      </View>
    </ScreenView>
  );
}

const styling = (
  theme: any,
  spacing: any,
  typography: any
) =>
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
    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
    },
    loadingText: {
      ...typography.body,
      color: theme.textSecondary,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      marginTop: spacing.md,
      textAlign: "center",
    },
    emptyText: {
      ...typography.body,
      color: theme.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
    header: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    heroCard: {
      height: 320,
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroGlowTop: {
      position: "absolute",
      top: -46,
      right: -24,
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: "rgba(163, 190, 140, 0.16)",
    },
    heroGlowBottom: {
      position: "absolute",
      bottom: -56,
      left: -30,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(163, 190, 140, 0.08)",
    },
    heroTextBlock: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.lg,
    },
    heroKicker: {
      ...typography.smallCaption,
      letterSpacing: 2.4,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    heroTitle: {
      ...typography.h2,
      letterSpacing: -0.8,
      color: theme.textPrimary,
    },
    heroSubtext: {
      ...typography.caption,
      color: theme.textSecondary,
      marginTop: 10,
      letterSpacing: 0.3,
    },
    descriptionCard: {
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    benefitCard: {
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingHorizontal: 18,
      paddingVertical: 18,
      marginBottom: spacing.xl,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    cardLabel: {
      ...typography.smallCaption,
      letterSpacing: 2.2,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    cardMeta: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      textTransform: "uppercase",
    },
    descriptionText: {
      ...typography.body,
      color: theme.textPrimary,
      lineHeight: 26,
      opacity: 0.96,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 18,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(163,190,140,0.12)",
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.16)",
    },
    tagText: {
      ...typography.smallCaption,
      color: theme.chart2 ?? theme.accent,
      letterSpacing: 1.1,
    },
    miniPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    miniPillText: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    benefitList: {
      gap: 12,
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    benefitIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
      marginTop: 2,
    },
    benefitText: {
      flex: 1,
      ...typography.body,
      color: theme.textPrimary,
      lineHeight: 24,
    },
    ctaButton: {
      width: "100%",
    },
  });
