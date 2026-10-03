import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { getProtocolTemplates } from "@/features/tools/services/protocolTemplateService";
import {
  toProtocolTemplateCardData,
  type ProtocolTemplateCardData,
} from "@/features/tools/utils/protocolTemplateUtils";
import type { SvaColorSet, Spacing, TypographyTokens } from "@/theme/types";

export default function ProtocolHighlightsRail() {
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const [protocols, setProtocols] = useState<ProtocolTemplateCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useMemo(
    () => makeStyles(svaColors, svaTypography, spacing),
    [svaColors, svaTypography, spacing]
  );

  useEffect(() => {
    let active = true;

    const loadProtocols = async () => {
      try {
        const response = await getProtocolTemplates();
        if (active) {
          setProtocols(
            response.success && Array.isArray(response.data)
              ? response.data.slice(0, 10).map(toProtocolTemplateCardData)
              : []
          );
        }
      } catch (error) {
        console.warn("Unable to load featured protocols:", error);
        if (active) setProtocols([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProtocols();
    return () => {
      active = false;
    };
  }, []);

  if (!loading && protocols.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>CURATED FOR YOUR PRACTICE</Text>
          <Text style={styles.heading}>Top protocols</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all protocols"
          onPress={() =>
            router.push(ROUTES.AUTH.TOOLS_PROTOCOL_TEMPLATES as never)
          }
          style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons
            name="arrow-forward"
            size={15}
            color={svaColors.brand.primary}
          />
        </Pressable>
      </View>
      <Text style={styles.description}>
        Small, repeatable rituals to support your everyday wellbeing.
      </Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={svaColors.brand.primary} />
          <Text style={styles.loadingText}>Gathering protocols…</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {protocols.map((protocol, index) => (
            <Pressable
              key={protocol.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${protocol.title}`}
              onPress={() =>
                router.push({
                  pathname: ROUTES.AUTH.TOOLS_PROTOCOL_TEMPLATE_DETAIL,
                  params: { id: String(protocol.id) },
                })
              }
              style={({ pressed }) => [
                styles.protocolCard,
                pressed && styles.cardPressed,
              ]}
            >
              {protocol.image ? (
                <Image
                  source={protocol.image}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={220}
                />
              ) : (
                <View style={styles.imageFallback}>
                  <Ionicons
                    name="leaf-outline"
                    size={35}
                    color={svaColors.brand.primary}
                  />
                </View>
              )}
              <LinearGradient
                colors={["rgba(13,16,12,0.05)", "rgba(13,16,12,0.88)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardTopRow}>
                <Text style={styles.category} numberOfLines={1}>
                  {(protocol.category || "PROTOCOL").toUpperCase()}
                </Text>
                <Text style={styles.rank}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>
              <View style={styles.cardBottomRow}>
                <View style={styles.cardText}>
                  {!!protocol.level && (
                    <Text style={styles.level} numberOfLines={1}>
                      {protocol.level.toUpperCase()}
                    </Text>
                  )}
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {protocol.title}
                  </Text>
                </View>
                <View style={styles.openIcon}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={svaColors.bg.base}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (
  colors: SvaColorSet,
  typography: TypographyTokens,
  spacing: Spacing
) =>
  StyleSheet.create({
    section: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    headingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    headingCopy: {
      flex: 1,
    },
    eyebrow: {
      ...(typography?.textStyle.authTinyLabel ?? {}),
      color: colors.brand.primary,
      letterSpacing: 1.8,
      fontSize: 9,
    },
    heading: {
      ...(typography?.textStyle.authTitle ?? {}),
      color: colors.text.primary,
      fontSize: 25,
      lineHeight: 30,
      marginTop: 3,
    },
    seeAll: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 8,
      paddingLeft: 8,
    },
    pressed: {
      opacity: 0.65,
    },
    seeAllText: {
      ...(typography?.textStyle.button ?? {}),
      color: colors.brand.primary,
      fontSize: 12,
    },
    description: {
      ...(typography?.textStyle.caption ?? {}),
      color: colors.text.secondary,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      fontSize: 12,
      lineHeight: 17,
    },
    rail: {
      paddingRight: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    protocolCard: {
      width: 272,
      height: 176,
      borderRadius: 23,
      overflow: "hidden",
      justifyContent: "space-between",
      padding: spacing.md,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    cardPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }],
    },
    imageFallback: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.base,
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    category: {
      ...(typography?.textStyle.authTinyLabel ?? {}),
      color: colors.text.primary,
      backgroundColor: "rgba(13,16,12,0.58)",
      overflow: "hidden",
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 5,
      fontSize: 9,
      letterSpacing: 1.1,
      maxWidth: 190,
    },
    rank: {
      ...(typography?.textStyle.authTitle ?? {}),
      color: "rgba(255,255,255,0.72)",
      fontSize: 20,
      lineHeight: 24,
    },
    cardBottomRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    cardText: {
      flex: 1,
    },
    level: {
      ...(typography?.textStyle.authTinyLabel ?? {}),
      color: colors.brand.primary,
      fontSize: 9,
      letterSpacing: 1.4,
      marginBottom: 4,
    },
    cardTitle: {
      ...(typography?.textStyle.authLabelStrong ?? {}),
      color: colors.text.primary,
      fontSize: 18,
      lineHeight: 22,
    },
    openIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.primary,
      marginBottom: 1,
    },
    loading: {
      minHeight: 160,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      borderRadius: 24,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    loadingText: {
      ...(typography?.textStyle.caption ?? {}),
      color: colors.text.secondary,
    },
  });
