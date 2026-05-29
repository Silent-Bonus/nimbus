import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ROUTES } from "@/constants/routes";
import {
  CURATED_MANIFESTS,
  getCuratedManifestById,
  type CuratedManifest,
} from "@/features/tools/data/curatedManifests";
import { usePremiumGate } from "@/contexts/PremiumGateContext";
import ManifestHero from "@/features/tools/components/curated-manifest-detail/ManifestHero";
import ManifestStatGrid from "@/features/tools/components/curated-manifest-detail/ManifestStatGrid";
import ManifestSection from "@/features/tools/components/curated-manifest-detail/ManifestSection";
import BenefitList from "@/features/tools/components/curated-manifest-detail/BenefitList";

const getStringParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

export const CuratedManifestDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const { openGate, getAccessState } = usePremiumGate();
  const styles = styling(svaColors, spacing, svaTypography, insets.bottom);

  const idParam = getStringParam(params.id);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const manifest: CuratedManifest = useMemo(() => {
    return (
      getCuratedManifestById(idParam) ??
      CURATED_MANIFESTS[0]
    );
  }, [idParam]);

  const accessState = getAccessState("curated_manifest_detail");
  const hasPremium = accessState === "allowed";

  useEffect(() => {
    // Show the shared gate once when a free user lands on the detail screen.
    if (accessState === "preview") {
      openGate("curated_manifest_detail", "screen_entry");
    }
  }, [accessState, idParam, openGate]);

  const handleProtocolStackPress = useCallback(() => {
    if (!hasPremium) {
      openGate("curated_manifest_protocols", "cta_press");
      return;
    }

    router.push({
      pathname: ROUTES.AUTH.TOOLS_CURATED_MANIFEST_PROTOCOLS,
      params: { id: manifest.id },
    });
  }, [hasPremium, manifest.id, openGate]);

  const ctaLabel = hasPremium
    ? "View Protocol Stack"
    : "Unlock Protocol Stack";
  const ctaHint = hasPremium
    ? "Opens the protocol stack"
    : "Opens the upgrade modal";

  const onShare = async () => {
    try {
      await Share.share({
        title: manifest.title,
        message: `${manifest.title}\n\n${manifest.description}`,
      });
    } catch (error) {
      console.warn("share failed", error);
    }
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title="Biological Protocol"
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "share-outline",
              accessibilityLabel: "Share manifest",
              onPress: onShare,
            },
          ]}
          titleStyle={styles.headerTitle}
          containerStyle={styles.header}
        />

        <ManifestHero
          image={manifest.image}
          kicker={manifest.category || "Blueprint"}
          title={manifest.title}
        />

        <View style={styles.leadCard}>
          <Text style={styles.description}>{manifest.description}</Text>
        </View>

        <ManifestStatGrid
          items={[
            { label: "Level", value: manifest.level },
            { label: "Rating", value: manifest.rating.toFixed(1), hint: `${manifest.reviews} reviews` },
            { label: "XP Reward", value: `${manifest.xp_reward}` },
          ]}
        />

        <ManifestSection title="Context">
          <Text style={styles.sectionText}>{manifest.context}</Text>
        </ManifestSection>

        <ManifestSection title="Benefits">
          <BenefitList items={manifest.benefits} />
        </ManifestSection>

        <View style={styles.footerSpace} />
      </ScrollView>

      <View style={styles.footerDock}>
        <NimbusButton
          label={ctaLabel}
          onPress={handleProtocolStackPress}
          accessibilityHint={ctaHint}
          rightIcon={
            <Ionicons
              name={hasPremium ? "arrow-forward" : "lock-closed"}
              size={18}
              color={svaColors.button.primary.text}
            />
          }
          style={styles.ctaButton}
        />
      </View>
    </ScreenView>
  );
};

const styling = (
  colors: any,
  spacing: any,
  typography: any,
  bottomInset: number
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: bottomInset + spacing.xl * 3,
    },
    header: {
      marginBottom: spacing.lg,
    },
    headerTitle: {
      fontSize: 18,
      lineHeight: 20,
      letterSpacing: 0.2,
      fontStyle: "italic",
    },
    leadCard: {
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      marginBottom: spacing.xl,
    },
    description: {
      fontFamily: "CormorantGaramond_500Medium",
      fontSize: 17,
      lineHeight: 27,
      color: colors.text.primary,
      fontStyle: "italic",
      letterSpacing: -0.2,
    },
    sectionText: {
      ...typography.body,
      color: colors.text.primary,
    },
    footerSpace: {
      height: spacing.xl,
    },
    footerDock: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: bottomInset + spacing.md,
      zIndex: 20,
      backgroundColor: "rgba(34, 37, 30, 0.96)",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      padding: spacing.sm,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.32,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    ctaButton: {
      width: "100%",
    },
  });

export default CuratedManifestDetailScreen;
