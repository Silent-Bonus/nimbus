import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/features/tools/components/common/EmptyState";
import ManifestProtocolCard from "@/features/tools/components/protocol-template-detail/ManifestProtocolCard";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import {
  activateProtocolTemplate,
  getProtocolTemplate,
} from "@/features/tools/services/protocolTemplateService";
import type { ProtocolTemplateApiItem } from "@/features/tools/types/protocolTemplateTypes";
import {
  getProtocolTemplateById,
  getProtocolTemplateIdParam,
} from "@/features/tools/utils/protocolTemplateUtils";
import {
  PROTOCOL_TEMPLATES,
  type ProtocolTemplate,
} from "@/features/tools/data/protocolTemplates";
export const ProtocolTemplateProtocolsScreen: React.FC = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const toast = useNimbusToast();
  const styles = styling(svaColors, spacing, svaTypography, insets.bottom);

  const idParam = getProtocolTemplateIdParam(params.id);
  const [template, setTemplate] = useState<ProtocolTemplateApiItem | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        console.warn("Unable to load protocol stack:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [idParam]);

  const manifest: ProtocolTemplate = useMemo(
    () => getProtocolTemplateById(idParam) ?? PROTOCOL_TEMPLATES[0],
    [idParam]
  );

  const onAdaptProtocol = async () => {
    const templateId = template?.id ?? idParam;
    if (!templateId || isActivating) return;

    setIsActivating(true);
    try {
      await activateProtocolTemplate(templateId);
      setShowSuccessModal(true);
    } catch (error) {
      console.warn("Unable to adapt protocol:", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "We couldn't adapt this protocol right now.";

      toast.show({
        variant: "error",
        title: "Unable to adapt protocol",
        message,
        position: "top",
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <ScreenView bgColor={svaColors.bg.base} style={styles.screen}>
      <FlatList
        data={template?.blueprints ?? []}
        keyExtractor={(item, index) =>
          `${template?.id ?? manifest.id}-${item.name}-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <ScreenHeader
            title="Protocol Stack"
            onBack={() => navigation.goBack()}
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

      <View style={styles.footerDock}>
        <NimbusButton
          label="Adapt Protocol"
          onPress={() => void onAdaptProtocol()}
          loading={isActivating}
          rightIcon={
            <Ionicons
              name="sparkles"
              size={16}
              color={svaColors.button.primary.text}
            />
          }
          style={styles.adaptButton}
        />
      </View>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.successModal}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close success message"
              onPress={() => setShowSuccessModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={svaColors.text.secondary} />
            </Pressable>
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={svaColors.brand.primary}
            />
            <Text style={styles.successTitle}>Protocol adapted</Text>
            <Text style={styles.successMessage}>
              This protocol has been added to your habits.
            </Text>
          </View>
        </View>
      </Modal>
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
      paddingTop: spacing.xs,
      paddingBottom: bottomInset + spacing.xl * 5,
    },
    header: {
      marginBottom: spacing.lg,
    },
    separator: {
      height: spacing.lg,
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
    adaptButton: {
      width: "100%",
    },
    modalBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor: "rgba(0, 0, 0, 0.58)",
    },
    successModal: {
      width: "100%",
      maxWidth: 360,
      alignItems: "center",
      borderRadius: 26,
      padding: spacing.xl,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    closeButton: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    successTitle: {
      marginTop: spacing.md,
      color: colors.text.primary,
      fontSize: 22,
      fontFamily: SVATypography.fontFamily.displayStrong,
    },
    successMessage: {
      marginTop: spacing.sm,
      color: colors.text.secondary,
      textAlign: "center",
      fontSize: 15,
      lineHeight: 22,
    },
  });

export default ProtocolTemplateProtocolsScreen;
