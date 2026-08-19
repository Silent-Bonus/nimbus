import React, { useContext } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ImageSourcePropType } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { SvaColorSet, Spacing, TypographyTokens } from "@/theme/types";

export type ProtocolTemplateCardItem = {
  title: string;
  image: ImageSourcePropType;
  imageFit?: "cover" | "contain";
  tags: readonly string[];
};

type ProtocolTemplateCardProps = {
  item: ProtocolTemplateCardItem;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  showTags?: boolean;
  accessibilityLabel?: string;
};

type ProtocolTemplateCardStyles = {
  shadowWrap: ViewStyle;
  card: ViewStyle;
  cardPressed: ViewStyle;
  imageWrap: ViewStyle;
  image: ImageStyle;
  imageContain: ImageStyle;
  imageGlow: ViewStyle;
  body: ViewStyle;
  bodyCompact: ViewStyle;
  title: TextStyle;
  tagsRow: ViewStyle;
  tagChip: ViewStyle;
  tagText: TextStyle;
};

const ProtocolTemplateCard: React.FC<ProtocolTemplateCardProps> = ({
  item,
  onPress,
  style,
  showTags = true,
  accessibilityLabel,
}) => {
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const styles = styling(svaColors, svaTypography, spacing);

  const imageSource: ImageSourcePropType = item.image;

  return (
    <View style={[styles.shadowWrap, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `Open ${item.title}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.imageWrap}>
          <Image
            source={imageSource}
            style={[
              styles.image,
              item.imageFit === "contain" && styles.imageContain,
            ]}
            contentFit={item.imageFit ?? "cover"}
            transition={250}
          />
          <LinearGradient
            colors={["rgba(10, 12, 9, 0.05)", "rgba(10, 12, 9, 0.58)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.imageGlow} />
        </View>

        <View style={[styles.body, !showTags && styles.bodyCompact]}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {showTags ? (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  typography: TypographyTokens | undefined,
  spacing: Spacing
) =>
  StyleSheet.create({
    shadowWrap: {
      borderRadius: 24,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.3,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    card: {
      flex: 1,
      minHeight: 318,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    cardPressed: {
      transform: [{ scale: 0.985 }],
    },
    imageWrap: {
      height: 206,
      backgroundColor: "#151913",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    imageContain: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    imageGlow: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(163, 190, 140, 0.12)",
      top: -30,
      right: -30,
    },
    body: {
      flex: 1,
      backgroundColor: colors.surface.base,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      justifyContent: "space-between",
    },
    bodyCompact: {
      justifyContent: "flex-start",
      gap: spacing.sm,
    },
    title: {
      fontFamily: "CormorantGaramond_600SemiBold",
      fontSize: 19,
      lineHeight: 22,
      color: colors.text.primary,
      letterSpacing: -0.3,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: spacing.md,
    },
    tagChip: {
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: "rgba(163, 190, 140, 0.1)",
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    tagText: {
      ...(typography?.textStyle.authTinyLabel ?? {}),
      color: colors.brand.primary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.1,
    },
  }) as ProtocolTemplateCardStyles;

export default ProtocolTemplateCard;
