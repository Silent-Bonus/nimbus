import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { calculateBodyShapeVitals } from "@/features/auth/services/loginService";
import { MeasurementInputRow } from "@/features/self-care/components/body-vitals";
import {
  getStoredBodyVitalsContext,
  setStoredBodyVitalsContext,
} from "@/features/self-care/services/body-vitals/storage";
import {
  buildBodyShapeCalculationPayload,
  normalizeBodyVitalsCalculationResponse,
} from "@/features/self-care/services/body-vitals/calculations";
import {
  DEFAULT_MEASUREMENT_FORM,
  buildShapeResult,
  formatBodyShapeLabel,
  formatLabelForHero,
  type MeasurementFormState,
  formatPercent,
  resolveMeasurementForm,
  resolveResultStrategy,
  resolveResultWisdom,
  resolveSavedShapeResult,
  type ShapeResult,
  type StatCard,
  toMeasurementNumber,
} from "@/features/self-care/utils/bodyArchitecture";
import {
  useBodyVitalsTheme,
  type BodyVitalsTypography,
} from "@/features/self-care/utils/bodyVitalsTheme";
import {
  formatFlexibleDecimal,
  parseMetricNumber,
  sanitizeDecimalInput,
} from "@/features/self-care/utils/bodyVitalsUtils";
import type { BodyVitalsContext } from "@/features/self-care/types/bodyVitals";
import type { ColorSet, Spacing } from "@/theme/types";

// Keep the four required measurement rows data-driven so labels and ordering
// stay consistent without duplicating JSX for each field.
const MEASUREMENT_FIELDS: {
  key: keyof MeasurementFormState;
  label: string;
  helper: string;
}[] = [
  { key: "bust_cm", label: "Bust", helper: "Fullest point" },
  { key: "waist_cm", label: "Waist", helper: "Narrowest point" },
  { key: "high_hip_cm", label: "High Hip", helper: "Pelvic line" },
  { key: "low_hip_cm", label: "Low Hip", helper: "Widest point" },
];

export default function BodyArchitectureScreen() {
  const { newTheme, spacing, bodyVitalsTypography } = useBodyVitalsTheme();
  const { width } = useWindowDimensions();
  const toast = useNimbusToast();

  const [savedVitalsContext, setSavedVitalsContext] =
    useState<BodyVitalsContext | null>(null);
  const [measurementForm, setMeasurementForm] = useState<MeasurementFormState>(
    DEFAULT_MEASUREMENT_FORM
  );
  const [calculatedShape, setCalculatedShape] = useState<ShapeResult | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSavedVitals = async () => {
      // Hydrate from the cached normalized vitals context so the calculator
      // and saved shape card both start from the same persisted source.
      const cachedVitals = await getStoredBodyVitalsContext();

      if (!active) {
        return;
      }

      setSavedVitalsContext(cachedVitals);
      setMeasurementForm(resolveMeasurementForm(cachedVitals));
    };

    void loadSavedVitals();

    return () => {
      active = false;
    };
  }, []);

  const savedShape =
    savedVitalsContext?.latest_snapshot?.outputs?.body_shape ?? null;
  const savedShapeResult = useMemo(
    () => resolveSavedShapeResult(savedVitalsContext),
    [savedVitalsContext]
  );
  const activeShapeResult = calculatedShape ?? savedShapeResult;
  const movementStrategy = resolveResultStrategy(
    calculatedShape,
    savedShape,
    savedVitalsContext
  );
  const metabolicInsight = resolveResultWisdom(
    calculatedShape,
    savedVitalsContext
  );

  const structureStats = useMemo<StatCard[]>(
    () => [
      {
        label: "CONFIDENCE",
        value: formatPercent(
          calculatedShape?.confidence ??
            savedShape?.confidence ??
            savedVitalsContext?.profile?.body_shape_confidence
        ),
      },
    ],
    [
      calculatedShape?.confidence,
      savedShape?.confidence,
      savedVitalsContext?.profile?.body_shape_confidence,
    ]
  );

  const titleSize = Math.min(Math.max(width * 0.08, 30), 40);
  const measurementPayload = useMemo(() => {
    const bust = toMeasurementNumber(measurementForm.bust_cm);
    const waist = toMeasurementNumber(measurementForm.waist_cm);
    const highHip = toMeasurementNumber(measurementForm.high_hip_cm);
    const lowHip = toMeasurementNumber(measurementForm.low_hip_cm);

    if (
      bust === null ||
      waist === null ||
      highHip === null ||
      lowHip === null
    ) {
      return null;
    }

    // The API expects a fully numeric payload, so the draft form values are
    // converted only after all required measurements are present.
    return {
      bust_cm: bust,
      waist_cm: waist,
      high_hip_cm: highHip,
      low_hip_cm: lowHip,
    };
  }, [measurementForm]);

  const styles = useMemo(
    () => styling(newTheme, spacing, bodyVitalsTypography, titleSize),
    [newTheme, spacing, bodyVitalsTypography, titleSize]
  );

  const handleMeasurementChange = (
    key: keyof MeasurementFormState,
    value: string
  ) => {
    setMeasurementForm((current) => ({
      ...current,
      [key]: sanitizeDecimalInput(value, 1),
    }));
  };

  const handleMeasurementBlur = (key: keyof MeasurementFormState) => {
    setMeasurementForm((current) => {
      const nextValue = current[key].trim();

      if (!nextValue) {
        return current;
      }

      return {
        ...current,
        [key]: formatFlexibleDecimal(parseMetricNumber(nextValue, 0), 1),
      };
    });
  };

  const handleCalculateShape = async () => {
    if (isCalculating) {
      return;
    }

    if (!measurementPayload) {
      toast.show({
        variant: "error",
        title: "Missing measurements",
        message:
          "Add bust, waist, high hip, and low hip to calculate your body shape.",
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Body shape is calculated independently, then folded back into the
      // cached vitals context so downstream screens can reuse the latest shape.
      const response = await calculateBodyShapeVitals(
        buildBodyShapeCalculationPayload(measurementPayload, savedVitalsContext)
      );
      const normalizedResponse = normalizeBodyVitalsCalculationResponse(
        response,
        "body_shape",
        savedVitalsContext
      );
      const normalizedShape = normalizedResponse.data.results.body_shape;
      const normalizedInsight =
        normalizedResponse.data.results.metabolic_insight ?? null;

      setCalculatedShape(buildShapeResult(normalizedShape, normalizedInsight));

      const nextContext: BodyVitalsContext = {
        ...(savedVitalsContext ?? {}),
        inputs: {
          ...(savedVitalsContext?.inputs ?? {}),
          measurements: normalizedShape?.measurements ?? measurementPayload,
        },
        latest_snapshot: {
          ...(savedVitalsContext?.latest_snapshot ?? {}),
          outputs: {
            ...(savedVitalsContext?.latest_snapshot?.outputs ?? {}),
            body_shape: normalizedShape,
            metabolic_insight: normalizedInsight,
          },
        },
      };

      setSavedVitalsContext(nextContext);
      await setStoredBodyVitalsContext(nextContext);
      toast.show({
        variant: "success",
        title: "Shape calculated",
        message: `Your body blueprint reads as ${formatBodyShapeLabel(
          normalizedShape?.label ?? normalizedShape?.code
        )}.`,
      });
    } catch (error) {
      console.warn("body shape calculation error", error);
      toast.show({
        variant: "error",
        title: "Unable to calculate",
        message: "Please try again.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <ScreenView padding={0} bgColor={newTheme.background} style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppHeader
          title="Body Blueprint"
          subtitle="Measure your frame and calculate your current silhouette."
          onBack={() => router.back()}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
          containerStyle={styles.header}
        />

        <View style={styles.heroSection}>
          <Text style={styles.profileLabel}>CURRENT PROFILE</Text>
          <Text style={styles.profileTitle}>
            {formatLabelForHero(
              activeShapeResult?.label ?? "Awaiting Calculation"
            )}
          </Text>
        </View>

        <View style={styles.measurementCard}>
          <LinearGradient
            colors={["rgba(163,190,140,0.06)", "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />

          <Text style={styles.measurementEyebrow}>BODY SHAPE INPUTS</Text>
          <Text style={styles.measurementTitle}>
            Add the four measurements required for the calculator.
          </Text>
          <Text style={styles.measurementHint}>
            Measure with the tape level around the body and keep it relaxed, not
            tight.
          </Text>

          <View style={styles.measurementStack}>
            {MEASUREMENT_FIELDS.map((field, index) => (
              <React.Fragment key={field.key}>
                <MeasurementInputRow
                  label={field.label}
                  helper={field.helper}
                  value={measurementForm[field.key]}
                  onChangeText={(text) =>
                    handleMeasurementChange(field.key, text)
                  }
                  onBlur={() => handleMeasurementBlur(field.key)}
                />
                {index < MEASUREMENT_FIELDS.length - 1 ? (
                  <View style={styles.measurementDivider} />
                ) : null}
              </React.Fragment>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Calculate body shape"
            onPress={() => {
              void handleCalculateShape();
            }}
            disabled={isCalculating}
            style={({ pressed }) => [
              styles.calculateButton,
              isCalculating && styles.calculateButtonDisabled,
              pressed && styles.calculateButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[newTheme.buttonPrimary, newTheme.accentPressed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />
            {isCalculating ? (
              <View style={styles.calculateButtonContent}>
                <ActivityIndicator color={newTheme.buttonPrimaryText} />
                <Text style={styles.calculateButtonText}>
                  CALCULATING SHAPE
                </Text>
              </View>
            ) : (
              <Text style={styles.calculateButtonText}>
                CALCULATE BODY SHAPE
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.resultCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.03)", "rgba(163,190,140,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />

          <Text style={styles.resultEyebrow}>
            {calculatedShape ? "CALCULATED SHAPE" : "CURRENT SHAPE"}
          </Text>
          <Text style={styles.resultTitle}>
            {activeShapeResult?.label ?? "Awaiting Calculation"}
          </Text>
          <Text style={styles.resultDescription}>
            {activeShapeResult?.description ??
              "Add your measurements and calculate your body shape to unlock your current silhouette reading."}
          </Text>

          <View style={styles.statRow}>
            {structureStats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.strategyCard}>
          <LinearGradient
            colors={["rgba(163,190,140,0.07)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.strategyHeader}>
            <Ionicons
              name="body-outline"
              size={14}
              color={newTheme.chart5 ?? newTheme.success}
            />
            <Text style={styles.strategyLabel}>MOVEMENT DIRECTION</Text>
          </View>

          <Text style={styles.strategyBody}>{movementStrategy}</Text>
        </View>

        <View style={styles.wisdomCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.035)", "rgba(255,255,255,0.01)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />

          <Text style={styles.wisdomLabel}>SOMATIC WISDOM</Text>
          <Text style={styles.wisdomBody}>{metabolicInsight}</Text>
        </View>
      </ScrollView>
    </ScreenView>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  resolvedTypography: BodyVitalsTypography,
  titleSize: number
) => {
  const {
    screenTitle,
    sectionLabel,
    body,
    action,
    heroDisplayLarge,
  } = resolvedTypography;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl * 2.8,
    },
    header: {
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...screenTitle,
      color: theme.textPrimary,
    },
    headerSubtitle: {
      ...resolvedTypography.screenSubtitle,
      color: theme.textSecondary,
      opacity: 0.9,
    },
    heroSection: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
      paddingTop: spacing.sm,
    },
    profileLabel: {
      ...sectionLabel,
      color: theme.chart5 ?? theme.textSecondary,
      opacity: 0.95,
      marginBottom: spacing.xs,
      textAlign: "center",
    },
    profileTitle: {
      ...heroDisplayLarge,
      fontFamily: heroDisplayLarge.fontFamily,
      fontSize: titleSize,
      lineHeight: Math.round(titleSize * 1.06),
      color: theme.textPrimary,
      letterSpacing: heroDisplayLarge.letterSpacing ?? -0.03 * titleSize,
      textTransform: "uppercase",
      textAlign: "center",
      fontWeight: heroDisplayLarge.fontWeight,
    },
    measurementCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surface,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    measurementEyebrow: {
      ...sectionLabel,
      color: theme.chart5 ?? theme.textSecondary,
      marginBottom: spacing.xs,
    },
    measurementTitle: {
      ...resolvedTypography.sectionTitle,
      color: theme.textPrimary,
      marginBottom: spacing.xs,
    },
    measurementHint: {
      ...body,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: spacing.md,
      opacity: 0.88,
    },
    measurementStack: {
      borderRadius: 22,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      overflow: "hidden",
    },
    measurementDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
    },
    calculateButton: {
      position: "relative",
      overflow: "hidden",
      minHeight: 58,
      borderRadius: 22,
      marginTop: spacing.lg,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 16,
      elevation: 5,
    },
    calculateButtonPressed: {
      opacity: 0.97,
      transform: [{ scale: 0.99 }],
    },
    calculateButtonDisabled: {
      opacity: 0.8,
    },
    calculateButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    calculateButtonText: {
      ...action,
      color: theme.buttonPrimaryText,
      letterSpacing: action.letterSpacing ?? 1.1,
      textTransform: "uppercase",
    },
    resultCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surface,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    resultEyebrow: {
      ...sectionLabel,
      color: theme.chart2 ?? theme.info,
      marginBottom: spacing.xs,
    },
    resultTitle: {
      ...resolvedTypography.sectionTitle,
      color: theme.textPrimary,
      fontSize: 28,
      lineHeight: 32,
      marginBottom: spacing.sm,
    },
    resultDescription: {
      ...body,
      color: theme.textSecondary,
      lineHeight: 24,
      marginBottom: spacing.md,
    },
    strategyCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surface,
      padding: spacing.lg,
      shadowColor: theme.shadow,
      shadowOpacity: 0.26,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 5,
      marginBottom: spacing.lg,
    },
    strategyHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: spacing.md,
    },
    strategyLabel: {
      ...sectionLabel,
      color: theme.chart5 ?? theme.textSecondary,
    },
    strategyBody: {
      ...body,
      color: theme.textPrimary,
      fontSize: 17,
      lineHeight: 28,
    },
    statRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      minHeight: 96,
      borderRadius: 18,
      backgroundColor: theme.surfaceMuted ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      justifyContent: "space-between",
    },
    statLabel: {
      ...sectionLabel,
      color: theme.textSecondary,
      opacity: 0.9,
    },
    statValue: {
      ...body,
      color: theme.textPrimary,
    },
    wisdomCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? theme.border,
      backgroundColor: theme.cardRaised ?? theme.surface,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      shadowColor: theme.shadow,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 16,
      elevation: 4,
    },
    wisdomLabel: {
      ...resolvedTypography.sectionTitle,
      color: theme.textPrimary,
      marginBottom: spacing.sm,
    },
    wisdomBody: {
      ...body,
      color: theme.textSecondary,
      fontSize: 16,
      lineHeight: 28,
    },
  });
};
