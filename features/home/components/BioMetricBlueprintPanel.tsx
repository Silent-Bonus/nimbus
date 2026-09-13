import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

import ThemeContext from "@/contexts/ThemeContext";
import { getBiometricBlueprintItems } from "@/features/home/service";
import {
  BlueprintSkeleton,
  BlueprintTile,
} from "@/features/home/components/biometricBlueprint";
import {
  buildBlueprintCards,
  buildTemplates,
} from "@/features/home/utils/biometricBlueprint";
import type {
  BiometricBlueprintPanelProps,
  BlueprintCard,
  LoadedCheckin,
} from "@/features/home/types";
import { makeStyles } from "@/features/home/components/biometricBlueprint/styles";

const Panel = ({ date }: BiometricBlueprintPanelProps) => {
  const router = useRouter();
  const { newTheme, spacing, typography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(newTheme, spacing, typography),
    [newTheme, spacing, typography],
  );

  const [items, setItems] = useState<LoadedCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const fetchBlueprints = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Pull the selected day's check-ins and normalize them into blueprint cards.
      const nextItems = await getBiometricBlueprintItems(date);
      setItems(nextItems);
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          error.response?.data?.detail ??
          error.message ??
          "Unable to load blueprint")
        : error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unable to load blueprint";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    // Refresh whenever the selected date changes.
    fetchBlueprints();
  }, [fetchBlueprints]);

  // Theme-driven template cards stay stable; only the live data changes.
  const templates = useMemo(() => buildTemplates(newTheme), [newTheme]);

  // Merge live check-ins with the fixed template set for rendering.
  const blueprintCards = useMemo<BlueprintCard[]>(
    () => buildBlueprintCards(items, templates),
    [items, templates],
  );

  const onCardPress = useCallback(
    (card: BlueprintCard) => {
      if (!card.item?.id) return;

      // Route into the matching check-in screen with the selected date.
      router.push({
        pathname: card.item.route,
        params: {
          id: card.item.id.toString(),
          date,
        },
      });
    },
    [date, router],
  );

  const toggleCollapse = () => {
    // Keep the expand/collapse motion in sync with the section toggle.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleCollapse} style={styles.header}>
        <Text style={styles.sectionTitle}>BIO-METRIC BLUEPRINT</Text>
        <Ionicons
          name={isCollapsed ? "chevron-down" : "chevron-up"}
          size={18}
          color={newTheme.accent}
        />
      </Pressable>

      {!isCollapsed && (
        <>
          {loading ? (
            <>
              <View style={styles.topGrid}>
                <BlueprintSkeleton styles={styles} />
                <BlueprintSkeleton styles={styles} />
              </View>
              <View style={styles.fullWidthStack}>
                <BlueprintSkeleton styles={styles} wide />
              </View>
            </>
          ) : error ? (
            <Pressable onPress={fetchBlueprints} style={styles.errorCard}>
              <Text style={styles.errorTitle}>
                Unable to load biometric blueprint.
              </Text>
              <Text style={styles.errorSubtitle}>Tap to retry.</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.topGrid}>
                {blueprintCards
                  .filter((card) => card.layout === "compact")
                  .map((card) => (
                    <BlueprintTile
                      key={card.key}
                      card={card}
                      styles={styles}
                      onPress={() => onCardPress(card)}
                    />
                  ))}
              </View>

              <View style={styles.fullWidthStack}>
                {blueprintCards
                  .filter((card) => card.layout === "wide")
                  .map((card) => (
                    <BlueprintTile
                      key={card.key}
                      card={card}
                      styles={styles}
                      onPress={() => onCardPress(card)}
                    />
                  ))}
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
};

const BioMetricBlueprintPanel = ({ date }: BiometricBlueprintPanelProps) => {
  return <Panel date={date} />;
};

export default BioMetricBlueprintPanel;
