import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ThemeContext from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");

interface HeroFeatureCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: [string, string];
  bgImage?: any; // require('...') or { uri: '...' }
}

const HeroFeatureCard: React.FC<HeroFeatureCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  colors,
  bgImage,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <View style={styles.cardInner}>
        {/* Background Image (Optional) */}
        {bgImage && (
          <Image
            source={bgImage}
            style={[StyleSheet.absoluteFill, styles.bgImage]}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradient]}
        />

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={28} color={newTheme.background} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.arrowCircle}>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={newTheme.textPrimary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    cardContainer: {
      width: width - spacing.md * 2, // Full width minus padding
      height: 110,
      // marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    cardInner: {
      flex: 1,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    bgImage: {
      opacity: 0.4,
    },
    gradient: {
      opacity: 0.85,
    },
    content: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
    },
    textCol: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      ...svaTypography.textStyle.title,
      color: "#FFF", // Always white for contrast on gradients
      fontSize: 18,
      marginBottom: 2,
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.85)",
      fontSize: 13,
      lineHeight: 18,
    },
    arrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: spacing.sm,
    },
  });

export default HeroFeatureCard;
