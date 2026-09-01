import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import AppHeader from "@/components/layout/AppHeader";
import PremiumBanner from "@/components/ui/PremiumBanner";
import { ROUTES } from "@/constants/routes";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { useAuth } from "@/contexts/AuthContext";
import { resolveBodyVitalsTypography } from "@/features/self-care/utils/bodyVitalsTheme";
import {
  calculateCalorieVitals,
  calculateProteinVitals,
  patchBodyVitalsProfile,
} from "@/features/auth/services/loginService";
import type { ColorSet, Spacing } from "@/theme/types";

import {
  ActivityLevelCard,
  GenderTile,
  HeightSlider,
  InsightCard,
  NumericMetricTile,
  NumericMetricTileFooter,
  clampHeightCm,
  parseMetricNumber,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
  stepWeight,
} from "@/features/self-care/components/body-vitals";
import type { BodyVitalsContext } from "@/features/self-care/types/bodyVitals";
import {
  buildBodyVitalsCalculatorPayload,
  buildBodyVitalsProfilePatchPayload,
  mergeBodyVitalsCalculationResponses,
  normalizeBodyVitalsCalculationResponse,
} from "@/features/self-care/services/bodyVitalsService";
import {
  DEFAULT_BODY_VITALS_FORM,
  getStoredBodyVitalsContext,
  resolveBodyVitalsFormState,
} from "@/features/self-care/services/bodyVitalsStorage";
import {
  buildCaloriePanelRouteParams,
  resolveCaloriePanelDataFromContext,
} from "@/features/self-care/services/caloriePanelService";
import {
  buildProteinPanelRouteParams,
  resolveProteinPanelDataFromContext,
} from "@/features/self-care/services/proteinPanelService";

export default function BodyVitalScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const t = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
  const styles = useMemo(
    () => styling(newTheme, spacing, t, windowWidth),
    [newTheme, spacing, t, windowWidth]
  );

  const { getUserDetails } = useAuth();
  const toast = useNimbusToast();
  const [savedVitalsContext, setSavedVitalsContext] =
    useState<BodyVitalsContext | null>(null);
  const [form, setForm] = useState(DEFAULT_BODY_VITALS_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSavedVitals = async () => {
      // `/users/me` is mirrored into storage, so hydrate the screen from cache first
      // and let later refreshes replace it with the latest normalized backend state.
      const cachedVitals = await getStoredBodyVitalsContext();

      if (!active) {
        return;
      }

      setSavedVitalsContext(cachedVitals);

      if (cachedVitals) {
        setForm(resolveBodyVitalsFormState(cachedVitals));
      }
    };

    void loadSavedVitals();

    return () => {
      active = false;
    };
  }, []);

  const numericProfile = useMemo(() => {
    const parsedAge = parseMetricNumber(form.age, 32);
    const parsedWeight = parseMetricNumber(form.weight, 74.5);
    const parsedHeight = clampHeightCm(parseMetricNumber(form.height, 182));

    return {
      age: parsedAge,
      weight: parsedWeight,
      height: parsedHeight,
      gender: form.gender,
      activityLevel: form.activityLevel,
    };
  }, [form]);

  const bannerMessage = savedVitalsContext
    ? savedVitalsContext.banner?.show && savedVitalsContext.banner.message
      ? savedVitalsContext.banner.message
      : "Prefilled from your saved vitals data."
    : null;

  const proteinPanelData = useMemo(
    () => resolveProteinPanelDataFromContext(savedVitalsContext),
    [savedVitalsContext]
  );

  const caloriePanelData = useMemo(
    () => resolveCaloriePanelDataFromContext(savedVitalsContext),
    [savedVitalsContext]
  );
  const bmrValue =
    savedVitalsContext?.latest_snapshot?.outputs?.bmr ??
    savedVitalsContext?.profile?.bmr ??
    savedVitalsContext?.saved_summary?.bmr ??
    null;
  const metabolicInsight =
    savedVitalsContext?.latest_snapshot?.outputs?.metabolic_insight ??
    savedVitalsContext?.profile?.metabolic_insight ??
    savedVitalsContext?.saved_summary?.metabolic_insight ??
    "Generate your biological summary to unlock your metabolic insight.";

  const insights = useMemo(
    () => [
      {
        key: "protein",
        label: "Protein Intake",
        value: `${proteinPanelData.totalRequirement} ${proteinPanelData.unit} / Day`,
        icon: "flash" as const,
        accent: newTheme.chart4 ?? newTheme.error,
        route: ROUTES.AUTH.SELF_CARE_PROTEIN,
      },
      {
        key: "calorie",
        label: "Calorie Intake",
        value: `${caloriePanelData.totalCalorie} ${caloriePanelData.unit} / Day`,
        icon: "flame" as const,
        accent: newTheme.chart3 ?? newTheme.warning,
        route: ROUTES.AUTH.SELF_CARE_CALORIE_THRESHOLD,
      },
      {
        key: "architecture",
        label: "Body Architecture",
        value: "View body blueprint",
        icon: "body-outline" as const,
        accent: newTheme.chart5 ?? newTheme.success,
        route: ROUTES.AUTH.SELF_CARE_BODY_ARCHITECTURE,
      },
    ],
    [
      newTheme.chart3,
      newTheme.chart4,
      newTheme.chart5,
      newTheme.error,
      newTheme.warning,
      newTheme.success,
      proteinPanelData.totalRequirement,
      proteinPanelData.unit,
      caloriePanelData.totalCalorie,
      caloriePanelData.unit,
    ]
  );

  const handleGenerateSummary = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      // The profile patch keeps the user's core vitals in sync. The backend does not
      // support `calculation_type: "all"` yet, so keep the supported protein + calories
      // flow active for now.
      const contextForPayload =
        savedVitalsContext ?? (await getStoredBodyVitalsContext());
      const profilePayload = buildBodyVitalsProfilePatchPayload(
        form,
        contextForPayload
      );
      const proteinPayload = buildBodyVitalsCalculatorPayload(
        form,
        contextForPayload,
        "protein"
      );
      const caloriePayload = buildBodyVitalsCalculatorPayload(
        form,
        contextForPayload,
        "calories"
      );
      await patchBodyVitalsProfile(profilePayload);

      // TODO: Undo this temporary split once the backend supports
      // `calculation_type: "all"` on `/api/v1/vitals/calculate/`.
      // const calculationPayload = {
      //   calculation_type: "all",
      //   save_to_profile: true,
      // } as const;
      // const calculationResult = await calculateBodyVitals(calculationPayload);
      // const normalizedResult = normalizeBodyVitalsCalculationResponse(
      //   calculationResult,
      //   "all",
      //   contextForPayload
      // );

      const [proteinResult, calorieResult] = await Promise.all([
        calculateProteinVitals(proteinPayload),
        calculateCalorieVitals(caloriePayload),
      ]);
      const normalizedProteinResult = normalizeBodyVitalsCalculationResponse(
        proteinResult,
        "protein",
        contextForPayload
      );
      const normalizedCalorieResult = normalizeBodyVitalsCalculationResponse(
        calorieResult,
        "calories",
        contextForPayload
      );
      const normalizedResult = mergeBodyVitalsCalculationResponses(
        normalizedProteinResult,
        normalizedCalorieResult
      );

      if (normalizedResult.success) {
        // AuthContext writes the fresh `/users/me` payload into AsyncStorage and
        // keeps the vitals cache in sync for downstream screens.
        await getUserDetails?.();
        const refreshedContext = await getStoredBodyVitalsContext();
        setSavedVitalsContext(refreshedContext);

        if (refreshedContext) {
          setForm(resolveBodyVitalsFormState(refreshedContext));
        }

        toast.show({
          variant: "success",
          title: "Vitals saved",
          message: "Your biological summary has been refreshed.",
        });
        return;
      }

      toast.show({
        variant: "error",
        title: "Unable to save vitals",
        message: normalizedResult.message || "Please try again.",
      });
    } catch (error) {
      console.warn("body vitals save error", error);
      toast.show({
        variant: "error",
        title: "Unable to save vitals",
        message: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [form, getUserDetails, isSaving, savedVitalsContext, toast]);

  return (
    <ScreenView padding={0} bgColor={newTheme.background} style={styles.screen}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <AppHeader
            title="Somatic Metrics"
            subtitle="Calibrate your physical architecture"
            onBack={() => router.back()}
            titleStyle={styles.headerTitle}
            subtitleStyle={styles.headerSubtitle}
            rightActions={[
              {
                icon: "stats-chart-outline",
                onPress: () => router.push(ROUTES.AUTH.SELF_CARE_VITALS_TRENDS),
                accessibilityLabel: "Open vitals trends",
              },
            ]}
          />

          <PremiumBanner
            visible={Boolean(bannerMessage)}
            title="Your somatic profile"
            message={bannerMessage}
            icon="sparkles-outline"
            variant="info"
            layout="compact"
            messageNumberOfLines={2}
            style={styles.bannerCard}
          />

          <View style={styles.grid}>
            <GenderTile
              value={form.gender}
              onChange={(gender) =>
                setForm((current) => ({ ...current, gender }))
              }
              style={styles.gridTile}
            />

            <NumericMetricTile
              accentTint="rgba(163,190,140,0.12)"
              label="Age"
              value={form.age}
              onChangeText={(text) =>
                setForm((current) => ({
                  ...current,
                  age: sanitizeIntegerInput(text),
                }))
              }
              keyboardType="number-pad"
              maxLength={3}
              trailingIcon="ellipsis-vertical"
              style={styles.gridTile}
            />

            <NumericMetricTile
              accentTint="rgba(163,190,140,0.10)"
              label="Weight"
              value={form.weight}
              onChangeText={(text) =>
                setForm((current) => ({
                  ...current,
                  weight: sanitizeDecimalInput(text, 1),
                }))
              }
              keyboardType="decimal-pad"
              maxLength={5}
              style={styles.gridTile}
              footer={
                <NumericMetricTileFooter.StepperRow
                  onDecrement={() =>
                    setForm((current) => ({
                      ...current,
                      weight: stepWeight(current.weight, -0.5),
                    }))
                  }
                  onIncrement={() =>
                    setForm((current) => ({
                      ...current,
                      weight: stepWeight(current.weight, 0.5),
                    }))
                  }
                />
              }
            />

            <NumericMetricTile
              accentTint="rgba(125,164,116,0.12)"
              label="Height"
              value={form.height}
              onChangeText={(text) =>
                setForm((current) => ({
                  ...current,
                  height: sanitizeIntegerInput(text),
                }))
              }
              onBlur={() =>
                setForm((current) => {
                  const next = clampHeightCm(parseMetricNumber(current.height, 182));
                  return { ...current, height: String(next) };
                })
              }
              keyboardType="number-pad"
              maxLength={3}
              unit="cm"
              style={styles.gridTile}
              footer={
                <HeightSlider
                  value={numericProfile.height}
                  onChange={(next) =>
                    setForm((current) => ({
                      ...current,
                      height: String(next),
                    }))
                  }
                />
              }
            />
          </View>

          <ActivityLevelCard
            value={form.activityLevel}
            onChange={(activityLevel) =>
              setForm((current) => ({ ...current, activityLevel }))
            }
          />

          <View style={styles.metabolicCard}>
            <LinearGradient
              colors={["rgba(94,129,172,0.12)", "rgba(163,190,140,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.metabolicHeader}>
              <Text style={styles.metabolicEyebrow}>METABOLIC INSIGHT</Text>
              <View style={styles.bmrPill}>
                <Text style={styles.bmrPillLabel}>BMR</Text>
                <Text style={styles.bmrPillValue}>
                  {typeof bmrValue === "number" ? `${bmrValue} kcal` : "N/A"}
                </Text>
              </View>
            </View>

            <Text style={styles.metabolicText}>{metabolicInsight}</Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>INTELLIGENCE OUTPUT</Text>
          </View>

          <View style={styles.insightStack}>
            {insights.map((item) => (
              <InsightCard
                key={item.key}
                label={item.label}
                value={item.value}
                icon={item.icon}
                accent={item.accent}
                onPress={() =>
                  item.key === "protein"
                    ? router.push({
                        pathname: item.route ?? ROUTES.TABS.HOME,
                        params: buildProteinPanelRouteParams(proteinPanelData),
                      })
                    : item.key === "calorie"
                    ? router.push({
                        pathname: item.route ?? ROUTES.TABS.HOME,
                        params: buildCaloriePanelRouteParams(caloriePanelData),
                      })
                    : router.push(item.route ?? ROUTES.TABS.HOME)
                }
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Generate biological summary"
            onPress={() => {
              void handleGenerateSummary();
            }}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.primaryButton,
              isSaving && styles.primaryButtonDisabled,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[newTheme.buttonPrimary, newTheme.accentPressed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />
            {isSaving ? (
              <View style={styles.primaryButtonContent}>
                <ActivityIndicator color={newTheme.buttonPrimaryText} />
                <Text style={styles.primaryButtonText}>SAVING VITALS</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>
                GENERATE BIOLOGICAL SUMMARY
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  t: ReturnType<typeof resolveBodyVitalsTypography>,
  windowWidth: number
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    headerTitle: {
      ...t.screenTitle,
      color: theme.textPrimary,
    },
    headerSubtitle: {
      ...t.screenSubtitle,
      color: theme.textSecondary,
      opacity: 0.9,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2.25,
    },
    bannerCard: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
      alignItems: "stretch",
    },
    gridTile: {
      width: Math.floor((windowWidth - spacing.md * 3) / 2),
      maxWidth: Math.floor((windowWidth - spacing.md * 3) / 2),
      flexGrow: 0,
      flexShrink: 0,
    },
    metabolicCard: {
      position: "relative",
      overflow: "hidden",
      marginTop: spacing.lg,
      marginBottom: spacing.md,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surface,
      padding: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.16,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 16,
      elevation: 4,
    },
    metabolicHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    metabolicEyebrow: {
      ...t.sectionLabel,
      color: theme.chart2 ?? theme.info,
      opacity: 0.95,
      flex: 1,
    },
    bmrPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      minHeight: 40,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      alignSelf: "flex-start",
    },
    bmrPillLabel: {
      ...t.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.82,
    },
    bmrPillValue: {
      ...t.action,
      color: theme.textPrimary,
      letterSpacing: 0.2,
    },
    metabolicText: {
      ...t.body,
      color: theme.textPrimary,
      lineHeight: 24,
      opacity: 0.96,
    },
    sectionHeaderRow: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    sectionHeader: {
      ...t.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.9,
    },
    insightStack: {
      gap: spacing.md,
    },
    primaryButton: {
      marginTop: spacing.xl,
      minHeight: 54,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(0,0,0,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.28,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 6,
    },
    primaryButtonDisabled: {
      opacity: 0.86,
    },
    primaryButtonPressed: {
      opacity: 0.96,
      transform: [{ scale: 0.99 }],
    },
    primaryButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    primaryButtonText: {
      color: theme.buttonPrimaryText,
      ...t.action,
      fontWeight: "700",
      letterSpacing: 1.4,
    },
  });
