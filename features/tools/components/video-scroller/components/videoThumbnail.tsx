// src/components/shorts/component/videoThumbnail/videoThumbnail.tsx
// (adjust path as per your project)

import React, { useContext } from "react";
import { StyleSheet, View, Text, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import ThemeContext from "@/contexts/ThemeContext";
// import { VideoData } from "../../VideoScroller"; // adjust if you want to import the type

// Re-declare if you don't want to import
export interface VideoData {
  id: number;
  title: string;
  image: string;
  category?: string;
  source: string;
  views?: string;
}

interface VideoThumbnailProps {
  video: VideoData;
  onPress: () => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ video, onPress }) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: video.image }}
        style={[StyleSheet.absoluteFill, styles.imageStyle]}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.imageBackground}>
        {/* global soft overlay for readability */}
        <View style={styles.overlay} />

        {/* category pill */}
        {video.category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {video.category.toLowerCase()}
            </Text>
          </View>
        ) : null}

        {/* bottom glass panel */}
        <View style={styles.bottomWrapper}>
          <View style={styles.bottomGlass}>
            <Text style={styles.title} numberOfLines={2}>
              {video.title}
            </Text>
            {video.views ? (
              <Text style={styles.views} numberOfLines={1}>
                {video.views}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default VideoThumbnail;

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      width: 180,
      height: 260,
      marginRight: spacing.md,
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: newTheme.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: newTheme.border ?? "rgba(255,255,255,0.04)",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.18,
          shadowRadius: 18,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    pressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.96,
    },
    imageBackground: {
      flex: 1,
      justifyContent: "space-between",
    },
    imageStyle: {
      borderRadius: 22,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.18)", // slightly lighter than before
    },

    // top category pill
    categoryPill: {
      alignSelf: "flex-start",
      marginTop: spacing.sm,
      marginLeft: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 12, // softened, not a perfect pill
      backgroundColor: "rgba(0,0,0,0.35)",
    },
    categoryText: {
      ...svaTypography.textStyle.caption,
      fontSize: 11,
      color: "rgba(255,255,255,0.86)",
      fontWeight: "500",
      letterSpacing: 0.2,
    },

    // bottom glass
    bottomWrapper: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
    },
    bottomGlass: {
      borderRadius: 18,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm * 0.9,
      backgroundColor: "rgba(0,0,0,0.42)",
      // fake "gradient" by adding a top border fade
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(255,255,255,0.08)",
    },
    title: {
      ...svaTypography.textStyle.body,
      color: "#FFFFFF",
      fontWeight: "700",
      marginBottom: 4,
    },
    views: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.8)",
      fontWeight: "500",
    },
  });
