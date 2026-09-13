import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { BlueprintCard } from "@/features/home/types/biometricBlueprint";

import type { BiometricBlueprintStyles } from "./styles";

type BlueprintTileProps = {
  card: BlueprintCard;
  styles: BiometricBlueprintStyles;
  onPress: () => void;
};

export const BlueprintTile = ({
  card,
  styles,
  onPress,
}: BlueprintTileProps) => {
  const progressWidth: `${number}%` = `${Math.round(card.progress * 100)}%`;
  const showChevron = Boolean(card.item?.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${card.title} check-in`}
      disabled={card.disabled}
      onPress={onPress}
      style={({ pressed }) => [
        card.layout === "compact" ? styles.compactCard : styles.wideCard,
        card.disabled && styles.cardDisabled,
        pressed && !card.disabled && styles.cardPressed,
      ]}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", card.tint]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />

      {card.layout === "compact" ? (
        <View style={styles.compactInner}>
          <View style={styles.compactTopRow}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: card.tint,
                  borderColor: "rgba(255,255,255,0.06)",
                },
              ]}
            >
              <Ionicons name={card.icon} size={18} color={card.accent} />
            </View>

            <View style={styles.compactMetricGroup}>
              <Text style={styles.compactMetric}>{card.metric}</Text>
              {showChevron && (
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={card.accent}
                  style={styles.compactChevron}
                />
              )}
            </View>
          </View>

          <View style={styles.compactBody}>
            <Text style={styles.kicker}>{card.kicker}</Text>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {card.title}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[card.accent, card.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.wideInner}>
          <View
            style={[
              styles.wideIconWrap,
              {
                backgroundColor: card.tint,
                borderColor: "rgba(255,255,255,0.06)",
              },
            ]}
          >
            <Ionicons name={card.icon} size={20} color={card.accent} />
          </View>

          <View style={styles.wideTextBlock}>
            <Text style={styles.kicker}>{card.kicker}</Text>
            <Text style={styles.wideTitle} numberOfLines={1}>
              {card.title}
            </Text>
          </View>

          <View style={styles.wideMetricGroup}>
            <Text style={styles.wideMetric}>{card.metric}</Text>
            {showChevron && (
              <Ionicons
                name="chevron-forward"
                size={14}
                color={card.accent}
                style={styles.wideChevron}
              />
            )}
          </View>
        </View>
      )}

      {card.layout === "wide" && (
        <View style={styles.wideProgressWrap}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[card.accent, card.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
};
