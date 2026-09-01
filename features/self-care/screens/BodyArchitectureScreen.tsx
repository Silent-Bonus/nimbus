import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { calculateBodyShapeVitals } from "@/features/auth/services/loginService";
import {
  formatFlexibleDecimal,
  parseMetricNumber,
  sanitizeDecimalInput,
} from "@/features/self-care/components/body-vitals";
import {
  getStoredBodyVitalsContext,
  setStoredBodyVitalsContext,
} from "@/features/self-care/services/bodyVitalsStorage";
import {
  buildBodyShapeCalculationPayload,
  normalizeBodyVitalsCalculationResponse,
} from "@/features/self-care/services/bodyVitalsService";
import {
  formatBodyShapeLabel,
  formatLabelForHero,
  formatPercent,
  getBodyShapeDescription,
  getBodyShapeMovementStrategy,
} from "@/features/self-care/utils/bodyArchitecture";
import { resolveBodyVitalsTypography } from "@/features/self-care/utils/bodyVitalsTheme";
import type {
  BodyVitalsBodyShape,
  BodyVitalsContext,
  BodyVitalsMeasurements,
} from "@/features/self-care/types/bodyVitals";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

type StatCard = {
  label: string;
  value: string;
};

type MeasurementFormState = {
  bust_cm: string;
  waist_cm: string;
  high_hip_cm: string;
  low_hip_cm: string;
};

type ShapeResult = {
  rawShape: string | null;
  label: string;
  description: string;
  movementStrategy: string;
  confidence: number | null;
  metabolicInsight: string | null;
};

type MeasurementInputRowProps = {
  label: string;
  helper: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  unit?: string;
};

const DEFAULT_MEASUREMENT_FORM: MeasurementFormState = {
  bust_cm: "",
  waist_cm: "",
  high_hip_cm: "",
  low_hip_cm: "",
};

function formatMeasurementInput(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }

  return formatFlexibleDecimal(value, 1);
}

function toMeasurementNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveMeasurementForm(
  context: BodyVitalsContext | null | undefined
): MeasurementFormState {
  const measurements: BodyVitalsMeasurements | null | undefined =
    context?.inputs?.measurements ??
    context?.latest_snapshot?.outputs?.body_shape?.measurements ??
    context?.profile?.measurements ??
    null;

  return {
    bust_cm: formatMeasurementInput(measurements?.bust_cm),
    waist_cm: formatMeasurementInput(measurements?.waist_cm),
    high_hip_cm: formatMeasurementInput(measurements?.high_hip_cm),
    low_hip_cm: formatMeasurementInput(measurements?.low_hip_cm),
  };
}

function buildShapeResult(
  shape: BodyVitalsBodyShape | string | null | undefined,
  metabolicInsight?: string | null
): ShapeResult {
  const shapeValue =
    typeof shape === "string" ? shape : shape?.label ?? shape?.code ?? null;

  return {
    rawShape:
      typeof shape === "string" ? shape : shape?.code ?? shape?.label ?? null,
    label: formatBodyShapeLabel(shapeValue),
    description: getBodyShapeDescription(shapeValue),
    movementStrategy:
      typeof shape === "string"
        ? getBodyShapeMovementStrategy(shape)
        : shape?.movement_strategy ?? getBodyShapeMovementStrategy(shapeValue),
    confidence: typeof shape === "string" ? null : shape?.confidence ?? null,
    metabolicInsight: metabolicInsight ?? null,
  };
}

function resolveSavedShapeResult(
  context: BodyVitalsContext | null
): ShapeResult | null {
  const savedShape =
    context?.latest_snapshot?.outputs?.body_shape ??
    (context?.profile?.body_shape_label || context?.profile?.body_shape_code
      ? {
          label: context.profile?.body_shape_label,
          code: context.profile?.body_shape_code,
          confidence: context.profile?.body_shape_confidence,
          movement_strategy: context.profile?.movement_strategy,
        }
      : null) ??
    (context?.saved_summary?.body_shape_label ||
    context?.saved_summary?.body_shape_code
      ? {
          label: context.saved_summary?.body_shape_label,
          code: context.saved_summary?.body_shape_code,
          confidence: context.saved_summary?.body_shape_confidence,
          movement_strategy: context.saved_summary?.movement_strategy,
        }
      : null);

  if (!savedShape) {
    return null;
  }

  return buildShapeResult(
    savedShape,
    context?.latest_snapshot?.outputs?.metabolic_insight ??
      context?.profile?.metabolic_insight ??
      context?.saved_summary?.metabolic_insight ??
      null
  );
}

function resolveResultStrategy(
  calculatedResult: ShapeResult | null,
  savedShape: BodyVitalsBodyShape | null,
  context: BodyVitalsContext | null
) {
  if (calculatedResult) {
    return calculatedResult.movementStrategy;
  }

  return (
    savedShape?.movement_strategy ??
    context?.profile?.movement_strategy ??
    getBodyShapeMovementStrategy(savedShape?.label ?? savedShape?.code)
  );
}

function resolveResultWisdom(
  calculatedResult: ShapeResult | null,
  context: BodyVitalsContext | null
) {
  if (calculatedResult) {
    return (
      calculatedResult.metabolicInsight ??
      `Your current blueprint reads as ${calculatedResult.label.toLowerCase()}. ${
        calculatedResult.movementStrategy
      }`
    );
  }

  return (
    context?.latest_snapshot?.outputs?.metabolic_insight ??
    context?.profile?.metabolic_insight ??
    "Add your measurements and calculate your current body blueprint to unlock a more precise interpretation."
  );
}

function MeasurementInputRow({
  label,
  helper,
  value,
  onChangeText,
  onBlur,
  unit = "cm",
}: MeasurementInputRowProps) {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const resolvedTypography = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
  const styles = useMemo(
    () =>
      makeMeasurementInputStyles(
        newTheme,
        spacing,
        resolvedTypography,
        svaTypography?.textStyle
      ),
    [newTheme, resolvedTypography, spacing, svaTypography]
  );

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          maxLength={6}
          onBlur={onBlur}
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={newTheme.textDisabled}
          selectionColor={newTheme.accent}
          style={styles.input}
          value={value}
          autoCorrect={false}
          underlineColorAndroid="transparent"
        />
        <Text style={styles.unit}>{unit.toUpperCase()}</Text>
      </View>
    </View>
  );
}

export default function BodyArchitectureScreen() {
  const { newTheme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
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
  const resolvedTypography = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );
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

    return {
      bust_cm: bust,
      waist_cm: waist,
      high_hip_cm: highHip,
      low_hip_cm: lowHip,
    };
  }, [measurementForm]);

  const styles = useMemo(
    () => styling(newTheme, spacing, resolvedTypography, titleSize),
    [newTheme, resolvedTypography, spacing, titleSize]
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
            <MeasurementInputRow
              label="Bust"
              helper="Fullest point"
              value={measurementForm.bust_cm}
              onChangeText={(text) => handleMeasurementChange("bust_cm", text)}
              onBlur={() => handleMeasurementBlur("bust_cm")}
            />
            <View style={styles.measurementDivider} />
            <MeasurementInputRow
              label="Waist"
              helper="Narrowest point"
              value={measurementForm.waist_cm}
              onChangeText={(text) => handleMeasurementChange("waist_cm", text)}
              onBlur={() => handleMeasurementBlur("waist_cm")}
            />
            <View style={styles.measurementDivider} />
            <MeasurementInputRow
              label="High Hip"
              helper="Pelvic line"
              value={measurementForm.high_hip_cm}
              onChangeText={(text) =>
                handleMeasurementChange("high_hip_cm", text)
              }
              onBlur={() => handleMeasurementBlur("high_hip_cm")}
            />
            <View style={styles.measurementDivider} />
            <MeasurementInputRow
              label="Low Hip"
              helper="Widest point"
              value={measurementForm.low_hip_cm}
              onChangeText={(text) =>
                handleMeasurementChange("low_hip_cm", text)
              }
              onBlur={() => handleMeasurementBlur("low_hip_cm")}
            />
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

      {/* <Text style={styles.watermark}>SVA</Text> */}
    </ScreenView>
  );
}

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  resolvedTypography: ReturnType<typeof resolveBodyVitalsTypography>,
  titleSize: number
) => {
  const {
    screenTitle,
    sectionLabel,
    body,
    action,
    heroDisplayLarge,
    caption,
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
      ...screenTitle,
      color: theme.textPrimary,
      fontSize: 22,
      lineHeight: 28,
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
      fontSize: 13,
      letterSpacing: 1.7,
      fontWeight: "800",
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
      ...screenTitle,
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
      color: theme.textPrimary,
      fontFamily: body.fontFamily,
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
      ...screenTitle,
      fontSize: 22,
      lineHeight: 26,
      color: theme.textPrimary,
      marginBottom: spacing.sm,
    },
    wisdomBody: {
      color: theme.textSecondary,
      fontFamily: caption.fontFamily,
      fontSize: 16,
      lineHeight: 28,
    },
    watermark: {
      position: "absolute",
      right: -4,
      bottom: 18,
      fontFamily: heroDisplayLarge.fontFamily,
      fontSize: 72,
      lineHeight: 72,
      color: theme.textSecondary,
      opacity: 0.045,
      letterSpacing: -4,
    },
  });
};

const makeMeasurementInputStyles = (
  theme: ColorSet,
  spacing: Spacing,
  typography: ReturnType<typeof resolveBodyVitalsTypography>,
  displayStyles?: TypographyTokens["textStyle"]
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      ...typography.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.88,
    },
    helper: {
      ...typography.caption,
      color: theme.textSecondary,
      opacity: 0.72,
      marginTop: 4,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
      minWidth: 118,
      justifyContent: "flex-end",
    },
    input: {
      minWidth: 56,
      padding: 0,
      margin: 0,
      color: theme.textPrimary,
      backgroundColor: "transparent",
      textAlign: "right",
      fontFamily:
        displayStyles?.authTitle?.fontFamily ??
        displayStyles?.displayMedium?.fontFamily ??
        typography.numericValue.fontFamily,
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.4,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    unit: {
      ...typography.sectionLabel,
      color: theme.textSecondary,
      opacity: 0.9,
    },
  });
