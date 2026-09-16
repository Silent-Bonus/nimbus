// components/selfCare/mentalTest/MentalHealthTestResult.tsx

import React, { useContext, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import { ImageKey, getImage } from "@/utils/getImage";

type ResultRow = {
  label: string;
  score: number; // <- what you're passing from formattedScores
};

export type ResultData = {
  title: string;
  quote: string;
  image: ImageKey;
  results: ResultRow[];
  description: string;
  tips: string[];
};

type Props = {
  data: ResultData;
};

const MentalHealthTestResult: React.FC<Props> = ({ data }) => {
  const navigation = useNavigation();
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  const [resultData, setResultData] = useState<ResultData | null>(null);

  useEffect(() => {
    if (data) setResultData(data);
  }, [data]);

  const styles = useMemo(
    () => styling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  if (!resultData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Preparing your insights…</Text>
      </View>
    );
  }

  const illustration = getImage(resultData.image);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Primary result card */}
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>My result</Text>

          <Text style={styles.resultTitle}>{resultData.title}</Text>
          <Text style={styles.resultQuote}>{resultData.quote}</Text>

          <View style={styles.illustrationWrapper}>
            <View style={styles.illustrationCard}>
              <Image
                source={illustration}
                contentFit="contain"
                style={styles.illustration}
                transition={200}
              />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {resultData.results.map((item, idx) => (
              <View key={idx} style={styles.statPill}>
                <Text style={styles.statValue}>{item.score}%</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>What this means for you</Text>
          <Text style={styles.descriptionText}>{resultData.description}</Text>

          {!!resultData.tips?.length && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
                Gentle self-support ideas
              </Text>
              {resultData.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* extra space so last content doesn’t sit under the CTA bar */}
        <View style={{ height: spacing["2xl"] * 3 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <StyledButton
          label="Share result"
          variant="secondary"
          size="medium"
          fullWidth={false}
          style={styles.shareButton}
          // onPress={handleShare} // wire later
        />
        <StyledButton
          label="Retake test"
          variant="ghost"
          size="medium"
          fullWidth={false}
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

export default MentalHealthTestResult;

// ───────────────────────── styles ─────────────────────────

const styling = (t: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent", // ScreenView owns bg
    },
    scrollContent: {
      paddingHorizontal: spacing.xs,
      paddingTop: spacing.xs,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      ...svaTypography.textStyle.body,
      color: t.textSecondary,
    },

    /* Result card */

    resultCard: {
      backgroundColor: t.cardRaised, // slightly lifted from bg
      borderRadius: 28,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      shadowColor: t.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
      borderWidth: 1,
      borderColor: t.borderMuted,
      marginBottom: spacing.lg,
    },
    resultLabel: {
      ...svaTypography.textStyle.caption,
      textTransform: "uppercase",
      letterSpacing: 1.1,
      color: t.textSecondary,
      marginBottom: spacing.xs,
    },
    resultTitle: {
      ...svaTypography.textStyle.heading2,
      color: t.textPrimary,
      marginBottom: spacing.xs,
    },
    resultQuote: {
      ...svaTypography.textStyle.body,
      color: t.textSecondary,
      fontStyle: "italic",
      marginBottom: spacing.lg,
    },

    /* Illustration frame */

    illustrationWrapper: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    illustrationCard: {
      width: "80%",
      maxWidth: 260,
      aspectRatio: 3 / 4, // poster-ish, more elegant
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: t.surfaceMuted,
      borderWidth: 1,
      borderColor: t.focusRing ?? "rgba(163,190,140,0.35)", // subtle accent edge
      shadowColor: t.shadow,
      shadowOpacity: 0.35,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 18 },
    },
    illustration: {
      width: "100%",
      height: "100%",
    },

    /* Stats */

    statsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: spacing.sm,
      columnGap: spacing.sm,
      marginTop: spacing.sm,
    },
    statPill: {
      flexBasis: "48%",
      backgroundColor: t.surfaceMuted,
      borderRadius: 18,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: t.borderMuted,
    },
    statValue: {
      ...svaTypography.textStyle.body,
      fontWeight: "700",
      color: t.accent,
    },
    statLabel: {
      ...svaTypography.textStyle.caption,
      color: t.textSecondary,
      marginTop: 2,
    },

    /* Details card */

    detailsCard: {
      backgroundColor: t.card,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: t.borderMuted,
    },
    sectionTitle: {
      ...svaTypography.textStyle.authLabel,
      color: t.textPrimary,
      marginBottom: spacing.sm,
    },
    descriptionText: {
      ...svaTypography.textStyle.body,
      color: t.textSecondary,
      lineHeight: 22,
    },
    tipRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: spacing.sm,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: t.accent,
      marginTop: spacing.xs,
      marginRight: spacing.sm,
    },
    tipText: {
      ...svaTypography.textStyle.body,
      color: t.textSecondary,
      flex: 1,
    },

    /* Bottom bar */

    bottomBar: {
      position: "absolute",
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: 24,
      backgroundColor: "rgba(16,18,14,0.94)",
      shadowColor: t.shadow,
      shadowOpacity: 0.4,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 14 },
      gap: spacing.sm,
    },
    shareButton: {
      flex: 1,
    },
  });
