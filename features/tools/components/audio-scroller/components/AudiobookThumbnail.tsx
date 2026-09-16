// src/components/audiobooks/components/AudiobookThumbnail.tsx

import React, { useContext } from "react";
import { StyleSheet, View, Text, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import ThemeContext from "@/contexts/ThemeContext";
import { AudiobookData } from "../AudioScroller"; // adjust path if needed

interface AudiobookThumbnailProps {
  audiobook: AudiobookData;
  onPress: () => void;
}

const AudiobookThumbnail: React.FC<AudiobookThumbnailProps> = ({
  audiobook,
  onPress,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: audiobook.coverImageUrl }}
        style={[StyleSheet.absoluteFill, styles.imageStyle]}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.imageBackground}>
        {/* soft overlay for readability */}
        <View style={styles.overlay} />

        {/* bottom glass panel */}
        <View style={styles.bottomWrapper}>
          <View style={styles.bottomGlass}>
            <Text style={styles.title} numberOfLines={2}>
              {audiobook.title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {audiobook.coach_name || "Unknown Author"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default AudiobookThumbnail;

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
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    pressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.96,
    },
    imageBackground: {
      flex: 1,
      justifyContent: "flex-end",
    },
    imageStyle: {
      borderRadius: 22,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.18)",
    },
    bottomWrapper: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
    },
    bottomGlass: {
      borderRadius: 18,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm * 0.9,
      backgroundColor: "rgba(0,0,0,0.45)",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(255,255,255,0.08)",
    },
    title: {
      ...svaTypography.textStyle.body,
      color: "#FFFFFF",
      fontWeight: "700",
      marginBottom: 4,
    },
    author: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.85)",
      fontWeight: "500",
    },
  });
