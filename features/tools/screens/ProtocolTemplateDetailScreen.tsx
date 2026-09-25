import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ROUTES } from "@/constants/routes";
import { getProtocolTemplate } from "@/features/tools/services/protocolTemplateService";
import type { ProtocolTemplateApiItem } from "@/features/tools/types/protocolTemplateTypes";
import {
  getProtocolTemplateById,
  getProtocolTemplateIdParam,
} from "@/features/tools/utils/protocolTemplateUtils";
import {
  PROTOCOL_TEMPLATES,
  type ProtocolTemplate,
} from "@/features/tools/data/protocolTemplates";
import ManifestHero from "@/features/tools/components/protocol-template-detail/ManifestHero";
import ManifestStatGrid from "@/features/tools/components/protocol-template-detail/ManifestStatGrid";
import ManifestSection from "@/features/tools/components/protocol-template-detail/ManifestSection";
import BenefitList from "@/features/tools/components/protocol-template-detail/BenefitList";

export const ProtocolTemplateDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography, insets.bottom);

  const idParam = getProtocolTemplateIdParam(params.id);
  const [template, setTemplate] = useState<ProtocolTemplateApiItem | null>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (!idParam) return;

    let isMounted = true;

    void getProtocolTemplate(idParam)
      .then((response) => {
        if (isMounted) setTemplate(response.data);
      })
      .catch((error) => {
        console.warn("Unable to load habit template details:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [idParam]);

  const manifest: ProtocolTemplate = useMemo(() => {
    return getProtocolTemplateById(idParam) ?? PROTOCOL_TEMPLATES[0];
  }, [idParam]);

  const handleProtocolStackPress = useCallback(() => {
    // Premium gating is temporarily disabled on this detail screen so the
    // protocol stack can be opened without displaying the upgrade modal.
    // To restore the paywall, reinstate the access check and openGate call:
    // if (!hasPremium) {
    //   openGate("protocol_template_protocols", "cta_press");
    //   return;
    // }
    router.push({
      pathname: ROUTES.AUTH.TOOLS_PROTOCOL_TEMPLATE_PROTOCOLS,
      params: { id: idParam ?? manifest.id },
    });
  }, [idParam, manifest.id]);

  const title = template?.title || template?.name || manifest.title;
  const description = template?.description || manifest.description;
  const category = template?.category || manifest.category;
  const image = template?.image ? { uri: template.image } : manifest.image;
  const context = template?.context || manifest.context;
  const benefits = template?.benefits.length ? template.benefits : manifest.benefits;
  const level = template?.level || "—";
  const rating = template?.rating == null ? "—" : template.rating.toFixed(1);
  const reviewCount = template?.review_count ?? 0;
  const xpReward = template?.xp_reward ?? manifest.xp_reward;

  // The shared premium modal is intentionally not opened when this screen is
  // entered. Keep the previous screen-entry gate documented here so it can be
  // restored when premium gating is re-enabled for protocol templates.
  // useEffect(() => {
  //   if (accessState === "preview") {
  //     openGate("protocol_template_detail", "screen_entry");
  //   }
  // }, [accessState, idParam, openGate]);

  const onShare = async () => {
    try {
      await Share.share({
        title,
        message: `${title}\n\n${description}`,
      });
    } catch (error) {
      console.warn("share failed", error);
    }
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title={title}
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "share-outline",
              accessibilityLabel: "Share manifest",
              onPress: onShare,
            },
          ]}
          titleNumberOfLines={2}
          containerStyle={styles.header}
        />

        <ManifestHero image={image} kicker={category || "Blueprint"} title={title} />

        <View style={styles.leadCard}>
          <Text style={styles.description}>{description}</Text>
        </View>

        <ManifestStatGrid
          items={[
            { label: "Level", value: level },
            {
              label: "Rating",
              value: rating,
              hint: `${reviewCount} reviews`,
            },
            { label: "XP Reward", value: `${xpReward}` },
          ]}
        />

        <ManifestSection title="Context">
          <Text style={styles.sectionText}>{context}</Text>
        </ManifestSection>

        <ManifestSection title="Benefits">
          <BenefitList items={benefits} />
        </ManifestSection>

        <View style={styles.footerSpace} />
      </ScrollView>

      <View style={styles.footerDock}>
        <NimbusButton
          label="View Protocol Stack"
          onPress={handleProtocolStackPress}
          accessibilityHint="Opens the protocol stack"
          rightIcon={
            <Ionicons
              name="arrow-forward"
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
  svaTypography: any,
  bottomInset: number
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
    },
    content: {
      paddingTop: spacing.xs,
      paddingBottom: bottomInset + spacing.xl * 3,
    },
    header: {
      marginBottom: spacing.lg,
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
      fontFamily: SVATypography.fontFamily.display,
      fontSize: 17,
      lineHeight: 27,
      color: colors.text.primary,
      fontStyle: "italic",
      letterSpacing: -0.2,
    },
    sectionText: {
      ...svaTypography.textStyle.body,
      color: colors.text.primary,
    },
    footerSpace: {
      height: spacing.xl,
    },
    footerDock: {
      position: "absolute",
      left: spacing.layout?.screenPadding ?? 20,
      right: spacing.layout?.screenPadding ?? 20,
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

export default ProtocolTemplateDetailScreen;
