import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";

type ManifestHeroProps = {
  image: ImageSourcePropType;
  kicker: string;
  title: string;
};

const ManifestHero: React.FC<ManifestHeroProps> = ({
  image,
  kicker,
  title,
}) => {
  const { svaColors, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Image source={image} style={styles.image} contentFit="cover" />
        <LinearGradient
          colors={["rgba(9, 11, 8, 0.02)", "rgba(9, 11, 8, 0.68)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
        <View style={styles.textBlock}>
          <Text style={styles.kickerText}>{kicker.toUpperCase()}</Text>
          <Text style={styles.titleText} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styling = (colors: any, spacing: any) =>
  StyleSheet.create({
    wrap: {
      marginBottom: spacing.lg,
    },
    hero: {
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
      top: -50,
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
    textBlock: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.lg,
    },
    kickerText: {
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 2,
      color: colors.text.secondary,
      fontWeight: "700",
      marginBottom: 8,
    },
    titleText: {
      fontFamily: SVATypography.fontFamily.displayStrong,
      fontSize: 28,
      lineHeight: 30,
      color: colors.text.primary,
      letterSpacing: -0.4,
    },
  });

export default ManifestHero;
