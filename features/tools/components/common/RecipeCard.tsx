import React, { useContext, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ThemeContext from "@/contexts/ThemeContext";
import { tokens } from "@/theme/tokens";

interface RecipeCardProps {
  title: string;
  image: any;
  tag?: string;
  time?: string;
  calories?: string;
  height?: number;
  imageHeightRatio?: number;
  imageHeight?: number;
  titleNumberOfLines?: number;
  favorite?: boolean;
  onPress: () => void;
  onFavoritePress?: (isFav: boolean) => Promise<void>;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  title = "Untitled Recipe",
  image,
  tag = "Healthy",
  time = "15 min",
  calories,
  height = 320,
  imageHeightRatio = 0.75,
  imageHeight,
  titleNumberOfLines = 1,
  favorite: initialFavorite = false,
  onPress,
  onFavoritePress,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const [isFav, setIsFav] = useState(initialFavorite);
  const [isSyncing, setIsSyncing] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleFavoritePress = async () => {
    if (isSyncing) return;

    // Heart pulse animation
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const nextFavState = !isFav;
    setIsFav(nextFavState);
    setIsSyncing(true);

    try {
      if (onFavoritePress) {
        await onFavoritePress(nextFavState);
      } else {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.log(
          `Recipe "${title}" ${
            nextFavState ? "added to" : "removed from"
          } favorites.`
        );
      }
    } catch (error) {
      console.error("Failed to sync favorite state", error);
      setIsFav(!nextFavState); // Revert on failure
    } finally {
      setIsSyncing(false);
    }
  };

  const styles = styling(
    newTheme,
    spacing,
    svaTypography,
    height,
    imageHeightRatio,
    imageHeight
  );

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <ImageBackground
          source={
            typeof image === "string"
              ? { uri: image }
              : image || require("@/assets/images/mt.jpg")
          }
          style={styles.image}
          imageStyle={styles.imageRadius}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent"]}
            style={styles.topGradient}
          />
          <View style={styles.topRow}>
            <View />
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.heartButton}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={isFav ? "heart" : "heart-outline"}
                  size={18}
                  color={isFav ? "#FF4B4B" : "#FFFFFF"}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>

          <Text style={styles.title} numberOfLines={titleNumberOfLines}>
            {title}
          </Text>

          <View style={styles.timeLabelContainer}>
            <Ionicons
              name="time-outline"
              size={12}
              color={newTheme.textSecondary}
            />
            <Text style={styles.timeLabel}>{time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styling = (
  theme: any,
  spacing: any,
  svaTypography: any,
  height: number,
  imageHeightRatio: number,
  imageHeight?: number
) =>
  StyleSheet.create({
    card: {
      flex: 1,
      height: height,
      borderRadius: tokens.radius.card || 20,
      backgroundColor: theme.surface,
      margin: spacing.xs,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.divider,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    touchable: {
      flex: 1,
    },
    image: {
      height: imageHeight ?? `${imageHeightRatio * 100}%`,
      width: "100%",
    },
    imageRadius: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    topGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 50,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: spacing.sm,
    },
    heartButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.2)",
    },
    bottomContent: {
      paddingHorizontal: spacing.sm + 2,
      paddingTop: spacing.xs + 2,
      paddingBottom: spacing.md,
      flex: 0,
      justifyContent: "flex-start",
      // marginBottom: 30,
    },
    tagContainer: {
      backgroundColor: theme.selected,
      paddingHorizontal: 8,
      paddingVertical: 1,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    tagText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.accent,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    timeLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: spacing.xs,
    },
    timeLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
    },
    title: {
      ...svaTypography.textStyle.authLabel,
      color: theme.textPrimary,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    // metaRow: {
    //   flexDirection: "row",
    //   alignItems: "center",
    //   marginTop: 4,
    // },
    // metaItem: {
    //   flexDirection: "row",
    //   alignItems: "center",
    //   gap: 4,
    // },
    // metaText: {
    //   ...svaTypography.textStyle.caption,
    //   color: theme.textSecondary,
    //   fontSize: 11,
    // },
  });

export default RecipeCard;
