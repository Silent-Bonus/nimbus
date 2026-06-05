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
import { ROUTES } from "@/constants/routes";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { useAuth } from "@/contexts/AuthContext";
import type { ColorSet, Spacing, Typography } from "@/theme/types";

import {
  ActivityLevelCard,
  GenderTile,
  HeightSlider,
  InsightCard,
  NumericMetricTile,
  NumericMetricTileFooter,
  clampHeightCm,
  deriveArchitecture,
  parseMetricNumber,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
  stepWeight,
} from "@/features/self-care/components/body-vitals";
import type { BodyVitalsContext } from "@/features/self-care/types/bodyVitals";
import { buildBodyVitalsUpdatePayload } from "@/features/self-care/services/bodyVitalsService";
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
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(newTheme, spacing, typography, windowWidth),
    [newTheme, spacing, typography, windowWidth]
  );

  const { updateProfile } = useAuth();
  const toast = useNimbusToast();
  const [savedVitalsContext, setSavedVitalsContext] =
    useState<BodyVitalsContext | null>(null);
  const [form, setForm] = useState(DEFAULT_BODY_VITALS_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSavedVitals = async () => {
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

  const architecture = useMemo(() => {
    return deriveArchitecture({
      heightCm: numericProfile.height,
      weightKg: numericProfile.weight,
      activityLevel: numericProfile.activityLevel,
    });
  }, [
    numericProfile.activityLevel,
    numericProfile.height,
    numericProfile.weight,
  ]);

  const bannerMessage = savedVitalsContext
    ? savedVitalsContext.banner?.show && savedVitalsContext.banner.message
      ? savedVitalsContext.banner.message
      : "Prefilled from your saved vitals data."
    : null;

  const bannerMeta = useMemo(() => {
    if (!savedVitalsContext) {
      return null;
    }

    if (typeof savedVitalsContext.days_since_last_update === "number") {
      return `Last updated ${savedVitalsContext.days_since_last_update} days ago`;
    }

    if (savedVitalsContext.profile_status) {
      return `Profile status: ${savedVitalsContext.profile_status}`;
    }

    return null;
  }, [savedVitalsContext]);

  const proteinPanelData = useMemo(
    () => resolveProteinPanelDataFromContext(savedVitalsContext),
    [savedVitalsContext]
  );

  const caloriePanelData = useMemo(
    () => resolveCaloriePanelDataFromContext(savedVitalsContext),
    [savedVitalsContext]
  );

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
        value: architecture,
        icon: "body-outline" as const,
        accent: newTheme.chart5 ?? newTheme.success,
        route: ROUTES.AUTH.SELF_CARE_BODY_ARCHITECTURE,
      },
    ],
    [
      architecture,
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
      const contextForPayload =
        savedVitalsContext ?? (await getStoredBodyVitalsContext());
      const payload = buildBodyVitalsUpdatePayload(form, contextForPayload);
      const result = await updateProfile?.(payload);

      if (result?.success) {
        const refreshedContext = await getStoredBodyVitalsContext();
        setSavedVitalsContext(refreshedContext);

        if (refreshedContext) {
          setForm(resolveBodyVitalsFormState(refreshedContext));
        }

        toast.show({
          variant: "success",
          title: "Vitals saved",
          message: "Your body vitals were sent to your profile.",
        });
        return;
      }

      toast.show({
        variant: "error",
        title: "Unable to save vitals",
        message: result?.message ?? "Please try again.",
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
  }, [form, isSaving, savedVitalsContext, toast, updateProfile]);

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
            rightAction={{
              icon: "person-circle-outline",
              onPress: () => router.push(ROUTES.TABS.SETTINGS),
              accessibilityLabel: "Open profile",
            }}
          />

          {bannerMessage ? (
            <View style={styles.bannerCard}>
              <LinearGradient
                colors={["rgba(163,190,140,0.18)", "rgba(125,164,116,0.06)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                pointerEvents="none"
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.bannerLabel}>SAVED VITALS PROFILE</Text>
              <Text style={styles.bannerText}>{bannerMessage}</Text>
              {bannerMeta ? <Text style={styles.bannerMeta}>{bannerMeta}</Text> : null}
            </View>
          ) : null}

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
  typography: Typography,
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
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2.25,
    },
    bannerCard: {
      borderRadius: 20,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.surfaceMuted ?? "rgba(163,190,140,0.08)",
      marginTop: spacing.sm,
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    bannerLabel: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.6,
      fontWeight: "700",
      opacity: 0.92,
    },
    bannerText: {
      ...typography.body,
      color: theme.textPrimary,
      lineHeight: 20,
    },
    bannerMeta: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      opacity: 0.8,
      letterSpacing: 0.4,
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
    sectionHeaderRow: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    sectionHeader: {
      ...typography.smallCaption,
      color: theme.textSecondary,
      letterSpacing: 1.7,
      fontWeight: "700",
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
      ...typography.button,
      fontWeight: "800",
      letterSpacing: 2.6,
      fontSize: 14,
    },
  });
