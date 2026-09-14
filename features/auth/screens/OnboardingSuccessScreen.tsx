import React, { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Svg, { Circle } from "react-native-svg";

import { StyledButton } from "@/components/ui/StyledButton";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { StoreKey } from "@/constants/Constant";
import { ROUTES } from "@/constants/routes";
import ThemeContext from "@/contexts/ThemeContext";
import { activateJourneyPlan, getCurrentJourneyPlan, type JourneyPlan } from "@/features/journeys/services/journeyService";

type DoshaKey = "vata" | "pitta" | "kapha";
type RankedDosha = { key: DoshaKey; label: string; score: number; color: string };

const DOSHA_META: Record<DoshaKey, { label: string; color: string }> = {
  vata: { label: "Vata", color: "#5E81AC" },
  pitta: { label: "Pitta", color: "#BF616A" },
  kapha: { label: "Kapha", color: "#A3BE8C" },
};

function getToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function DoshaChart({ doshas, primary, secondary }: { doshas: RankedDosha[]; primary?: RankedDosha; secondary?: RankedDosha }) {
  const size = 252;
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={chartStyles.wrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#2D3028" strokeWidth={38} fill="none" />
        {doshas.map((dosha) => {
          const length = (dosha.score / 100) * circumference;
          const segment = (
            <Circle
              key={dosha.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={dosha.color}
              strokeWidth={38}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              fill="none"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
          offset += length;
          return segment;
        })}
      </Svg>
      <View style={chartStyles.center}>
        <Text style={chartStyles.eyebrow}>DOMINANT</Text>
        <Text style={chartStyles.title}>{primary?.label.toUpperCase() ?? "SVA"}-{secondary?.label.toUpperCase() ?? ""}</Text>
      </View>
    </View>
  );
}

export const OnboardingSuccessScreen = () => {
  const { svaColors, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(() => styling(svaColors, svaTypography), [svaColors, svaTypography]);
  const [assessment, setAssessment] = useState<any>(null);
  const [journeyPlan, setJourneyPlan] = useState<JourneyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [journeyError, setJourneyError] = useState("");

  useEffect(() => {
    void SecureStore.getItemAsync(StoreKey.DOSHA_ASSESSMENT_RESULT_KEY)
      .then((value) => {
        if (!value) return;
        try { setAssessment(JSON.parse(value)); } catch { setAssessment(null); }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void getCurrentJourneyPlan()
      .then((response) => {
        const data = response?.data;
        if (response?.success && data && "id" in data && typeof data.id === "number") setJourneyPlan(data as JourneyPlan);
      })
      .catch(() => setJourneyError("Your journey plan is still being prepared."))
      .finally(() => setJourneyLoading(false));
    void SecureStore.deleteItemAsync(StoreKey.TUTORIAL_PENDING_KEY);
  }, []);

  const handleActivate = async () => {
    if (!journeyPlan?.id || activating) return;
    setActivating(true);
    setJourneyError("");
    try {
      const response = await activateJourneyPlan(journeyPlan.id, getToday());
      if (!response?.success) {
        setJourneyError(response?.message ?? "Unable to activate your journey.");
        return;
      }
      router.replace(ROUTES.TABS.HOME);
    } catch (error: any) {
      setJourneyError(error?.message ?? "Unable to activate your journey.");
    } finally { setActivating(false); }
  };

  const scores = assessment?.result_payload?.normalized_scores ?? {};
  const rankedDoshas = (Object.keys(DOSHA_META) as DoshaKey[])
    .map((key) => ({ key, score: Number(scores[key] ?? 0), ...DOSHA_META[key] }))
    .sort((a, b) => b.score - a.score);
  const primary = rankedDoshas[0];
  const secondary = rankedDoshas[1];
  const summary = assessment?.result_summary ?? "Your personal alignment is ready.";

  return (
    <ScreenView padding={0} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Biological Signature</Text>
        </View>

        {loading ? <View style={styles.loading}><ActivityIndicator color={svaColors.brand.primary} /><Text style={styles.loadingText}>Revealing your rhythm…</Text></View> : (
          <>
            <DoshaChart doshas={rankedDoshas} primary={primary} secondary={secondary} />
            <View style={styles.legend}>
              {rankedDoshas.map((dosha) => <View key={dosha.key} style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: dosha.color }]} /><Text style={styles.legendText}>{dosha.label.toUpperCase()}</Text></View>)}
            </View>

            <View style={styles.alignmentCard}>
              <Text style={styles.cardEyebrow}>CURRENT ALIGNMENT</Text>
              <Text style={styles.alignmentText}>{summary}</Text>
              {journeyLoading ? <ActivityIndicator style={styles.journeyLoader} color={svaColors.brand.primary} /> : journeyPlan ? (
                <StyledButton label={activating ? "Activating…" : "Activate Your Journey"} onPress={() => void handleActivate()} disabled={activating} style={styles.activateButton} />
              ) : null}
              {!!journeyError && <Text style={styles.journeyError}>{journeyError}</Text>}
            </View>

            {!journeyPlan && !journeyLoading && <StyledButton label="Enter My Sanctuary" onPress={() => router.replace(ROUTES.TABS.HOME)} style={styles.cta} />}
            <Text style={styles.ctaHint}>Your daily practice starts here.</Text>
          </>
        )}
      </ScrollView>
    </ScreenView>
  );
};

const chartStyles = StyleSheet.create({
  wrap: { width: 252, height: 252, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  center: { position: "absolute", alignItems: "center" },
  eyebrow: { color: "#A1A69B", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  title: { color: "#ECEFF4", fontSize: 20, fontStyle: "italic", fontWeight: "600", marginTop: 8 },
});

const styling = (colors: any, typography: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.base },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 50, paddingBottom: 42 },
  header: { alignItems: "center", justifyContent: "center", marginBottom: 22 },
  pageTitle: { ...typography.textStyle.authTitle, color: colors.brand.primary, fontSize: 24, fontStyle: "italic" },
  legend: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 18, marginBottom: 34 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { ...typography.textStyle.authTinyLabel, color: colors.text.secondary, letterSpacing: 1 },
  alignmentCard: { padding: 24, borderRadius: 24, backgroundColor: colors.surface.raised, borderWidth: 1, borderColor: colors.border.default },
  cardEyebrow: { ...typography.textStyle.authTinyLabel, color: colors.text.secondary, letterSpacing: 1.5, marginBottom: 18 },
  alignmentText: { ...typography.textStyle.authTitle, color: colors.text.primary, fontSize: 23, lineHeight: 29 },
  journeyLoader: { marginTop: 22 },
  activateButton: { width: "100%", marginTop: 24 },
  journeyError: { ...typography.textStyle.authFootnote, color: colors.state.warning, textAlign: "center", marginTop: 12 },
  cta: { width: "100%", marginTop: 24 },
  ctaHint: { ...typography.textStyle.authFootnote, color: colors.text.disabled, textAlign: "center", marginTop: 12 },
  loading: { alignItems: "center", justifyContent: "center", minHeight: 420, gap: 14 },
  loadingText: { ...typography.textStyle.authSubtitle, color: colors.text.secondary },
});

export default OnboardingSuccessScreen;
