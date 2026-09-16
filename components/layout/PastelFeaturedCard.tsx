// src/components/common/NimbusPastelFeaturedCard.tsx

import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import ThemeContext from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");
const DEFAULT_CARD_WIDTH = width * 0.8;

export interface PastelFeaturedCardProps {
  title: string;
  subtitle?: string; // e.g., "3 min · Soundscape"
  description?: string; // footer text
  image: ImageSourcePropType;
  onPress: () => void;
  colors: {
    bg: string; // main pastel background
    footer: string; // footer strip color
  };
  width?: number; // override width if needed
}

const PastelFeaturedCard: React.FC<PastelFeaturedCardProps> = ({
  title,
  subtitle,
  description,
  image,
  onPress,
  colors,
  width,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  const styles = styling(
    newTheme,
    spacing,
    svaTypography,
    colors,
    width ?? DEFAULT_CARD_WIDTH
  );

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.inner}>
        {/* Top content */}
        <View style={styles.content}>
          <Image source={image} style={styles.avatar} />
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Fixed footer */}
        {description ? (
          <View style={styles.footer}>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styling = (
  newTheme: any,
  spacing: any,
  svaTypography: any,
  colors: { bg: string; footer: string },
  cardWidth: number
) =>
  StyleSheet.create({
    card: {
      width: cardWidth,
      minHeight: 150,
      marginRight: spacing.md,
      marginVertical: spacing.md,
      borderRadius: 22,
      backgroundColor: colors.bg,
      overflow: "hidden",
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    inner: {
      flex: 1,
      justifyContent: "space-between",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 20,
      marginRight: spacing.md,
    },
    textContent: {
      flex: 1,
    },
    // Text colors tuned for LIGHT pastel cards (Nimbus-ish olives)
    title: {
      ...svaTypography.textStyle.title,
      fontSize: 18,
      color: "#141813", // deep olive-black
      marginBottom: 4,
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: "#4B5347", // muted olive-grey
    },
    footer: {
      backgroundColor: colors.footer,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderTopWidth: 0.5,
      borderTopColor: "rgba(0,0,0,0.05)",
    },
    description: {
      ...svaTypography.textStyle.caption,
      color: "#22261F",
    },
  });

export default PastelFeaturedCard;
