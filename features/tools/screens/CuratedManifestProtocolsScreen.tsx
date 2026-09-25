import React, { useContext, useEffect, useMemo } from "react";
import { FlatList, Share, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import EmptyState from "@/features/tools/components/common/EmptyState";
import ManifestProtocolCard from "@/features/tools/components/curated-manifest-detail/ManifestProtocolCard";
import {
  CURATED_MANIFESTS,
  getCuratedManifestById,
  type CuratedManifest,
} from "@/features/tools/data/curatedManifests";
import { ROUTES } from "@/constants/routes";

const getStringParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

export const CuratedManifestProtocolsScreen: React.FC = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography, insets.bottom);

  const idParam = getStringParam(params.id);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const manifest: CuratedManifest = useMemo(
    () => getCuratedManifestById(idParam) ?? CURATED_MANIFESTS[0],
    [idParam]
  );

  const onShare = async () => {
    try {
      const protocolSummary = manifest.protocols
        .map(
          (step, index) =>
            `${String(index + 1).padStart(2, "0")}. ${step.title} · ${step.duration} · ${step.reminder_time}`
        )
        .join("\n");

      await Share.share({
        title: manifest.title,
        message: `${manifest.title}\n\n${protocolSummary}`,
      });
    } catch (error) {
      console.warn("share failed", error);
    }
  };

  const onAdaptProtocol = () => {
    router.push({
      pathname: ROUTES.AUTH.CREATE_PROTOCOL,
      params: { title: manifest.title },
    });
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} padding={0} style={styles.screen}>
      <FlatList
        data={manifest.protocols}
        keyExtractor={(item, index) => `${manifest.id}-${item.title}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <ScreenHeader
            title="Biological Protocol"
            onBack={() => navigation.goBack()}
            rightActions={[
              {
                icon: "share-outline",
                accessibilityLabel: "Share protocol stack",
                onPress: onShare,
              },
            ]}
            titleStyle={styles.headerTitle}
            containerStyle={styles.header}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No protocol steps found."
            subtitle="This manifest does not have any protocol steps yet."
            color={svaColors.text.secondary}
          />
        }
        renderItem={({ item, index }) => (
          <ManifestProtocolCard step={item} index={index} />
        )}
      />

      <View
        style={[
          styles.footerDock,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <NimbusButton
          label="Adapt Protocol"
          onPress={onAdaptProtocol}
          rightIcon={
            <Ionicons
              name="sparkles"
              size={16}
              color={svaColors.button.primary.text}
            />
          }
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
        />
      </View>
    </ScreenView>
  );
};

const styling = (
  colors: any,
  spacing: any,
  _typography: any,
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
      paddingBottom: bottomInset + spacing.xl * 2,
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
    footerDock: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      backgroundColor: colors.bg.base,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    },
    actionButton: {
      width: "100%",
      height: 52,
      borderRadius: 18,
    },
    actionButtonText: {
      letterSpacing: 1,
    },
    separator: {
      height: spacing.lg,
    },
  });

export default CuratedManifestProtocolsScreen;
