import React, { useContext } from "react";
import { StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet } from "@/theme/types";

export type RecipeNutritionStat = {
  label: string;
  value: string;
};

type RecipeDetailHeroProps = {
  image: ImageSourcePropType;
  stats: RecipeNutritionStat[];
};

const RecipeDetailHero: React.FC<RecipeDetailHeroProps> = ({ image, stats }) => {
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Image
          source={image}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["rgba(9, 11, 8, 0.02)", "rgba(9, 11, 8, 0.68)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        <View style={styles.statsCard}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.stat}>
                <Text style={styles.statValue} numberOfLines={1}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {stat.label.toUpperCase()}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
};

const styling = (colors: SvaColorSet, spacing: Spacing) =>
  StyleSheet.create({
    wrap: {
      marginBottom: spacing.lg,
    },
    card: {
      height: 304,
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    topGlow: {
      position: "absolute",
      top: -48,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: "rgba(163, 190, 140, 0.18)",
    },
    bottomGlow: {
      position: "absolute",
      bottom: -50,
      left: -30,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(163, 190, 140, 0.08)",
    },
    statsCard: {
      position: "absolute",
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.md,
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 20,
      backgroundColor: "rgba(17, 20, 16, 0.88)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    stat: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 54,
    },
    divider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: "rgba(255,255,255,0.08)",
      marginHorizontal: spacing.sm,
    },
    statValue: {
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 18,
      letterSpacing: 0.1,
      fontWeight: "700",
    },
    statLabel: {
      marginTop: 2,
      color: colors.text.secondary,
      fontSize: 9,
      lineHeight: 11,
      letterSpacing: 1.5,
      fontWeight: "700",
    },
  });

export default RecipeDetailHero;
