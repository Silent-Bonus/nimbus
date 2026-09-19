// components/selfCare/mentalTest/MentalHealthTestDetails.tsx

import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import ThemeContext from "@/contexts/ThemeContext";
import { getImage, type ImageKey } from "@/utils/getImage";

type MedicalTestDetailsData = {
  image?: ImageKey;
  description: string;
  content?: Array<{
    title: string;
    body: string;
  }>;
};

type Props = {
  onStart: () => void;
  medicalTestData?: MedicalTestDetailsData;
};

const MentalHealthTestDetails: React.FC<Props> = ({
  onStart,
  medicalTestData,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const illustration = useMemo(
    () =>
      medicalTestData?.image ? getImage(medicalTestData.image) : undefined,
    [medicalTestData]
  );

  if (!medicalTestData) return null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationCard}>
            <Image
              source={illustration}
              style={styles.illustration}
              contentFit="cover"
              transition={200}
            />
          </View>
        </View>

        {/* Description card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description of Contents</Text>
          <Text style={styles.cardBody}>{medicalTestData.description}</Text>
        </View>

        {/* What you will explore */}
        {!!medicalTestData.content?.length && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What You Will Explore</Text>
            {medicalTestData.content.map((section: any, idx: number) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Spacer so content doesn’t touch CTA */}
        <View style={{ height: spacing["2xl"] * 2.5 }} />
      </ScrollView>

      {/* Floating CTA */}
      <View style={styles.ctaContainer}>
        <View style={styles.ctaInner}>
          <StyledButton
            label="Begin Assessment"
            variant="primary"
            onPress={onStart}
            fullWidth
          />
          <Text style={styles.ctaText}>
            Discover more about your inner self
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MentalHealthTestDetails;

const styling = (t: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
    },

    /* ─ Hero illustration ─ */

    illustrationWrapper: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    illustrationCard: {
      width: "100%",
      height: 160,
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: t.surface, // #2A2D24
      borderWidth: 1,
      borderColor: t.borderMuted, // #2D3028
      shadowColor: t.shadow,
      shadowOpacity: 0.35,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
    illustration: {
      width: "100%",
      height: "100%",
    },

    /* ─ Info cards ─ */

    card: {
      backgroundColor: t.cardRaised, // #262A22
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: t.border, // #3A3E33
      shadowColor: t.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    cardTitle: {
      ...svaTypography.textStyle.authLabel,
      fontSize: 16,
      color: t.accent, // #A3BE8C
      letterSpacing: 0.3,
      marginBottom: spacing.sm,
      fontWeight: "700",
    },
    cardBody: {
      ...svaTypography.textStyle.body,
      color: t.textPrimary,
      lineHeight: 22,
    },

    section: {
      marginTop: spacing.md,
    },
    sectionTitle: {
      ...svaTypography.textStyle.body,
      fontWeight: "600",
      color: "rgba(236,239,244,0.92)",
      marginBottom: spacing.xs,
    },
    sectionBody: {
      ...svaTypography.textStyle.body,
      color: t.textSecondary,
      lineHeight: 22,
    },

    /* ─ CTA panel ─ */

    ctaContainer: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.xl,
      borderRadius: 24,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: "rgba(16,18,14,0.92)", // darker scrim so lime button pops
      borderWidth: 1,
      borderColor: "rgba(163,190,140,0.35)",
      shadowColor: t.shadow,
      shadowOpacity: 0.45,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 18 },
      elevation: 14,
    },
    ctaInner: {
      width: "100%",
      alignItems: "center",
    },
    ctaText: {
      ...svaTypography.textStyle.caption,
      marginTop: spacing.xs,
      color: t.textSecondary,
    },
  });
