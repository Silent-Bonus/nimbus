// src/components/shorts/VideoScrollerSkeleton.tsx

import React, { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import ThemeContext from "@/contexts/ThemeContext";

const SKELETON_ITEMS = [1, 2, 3];

const VideoScrollerSkeleton: React.FC = () => {
  const { newTheme, spacing } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing);

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerSkeleton} />

      <View style={styles.row}>
        {SKELETON_ITEMS.map((key) => (
          <Animated.View key={key} style={[styles.card, { opacity }]}>
            <View style={styles.categoryBar} />
            <View style={styles.bottomBlock} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default VideoScrollerSkeleton;

const styling = (newTheme: any, spacing: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing.lg,
    },
    headerSkeleton: {
      width: 160,
      height: 24,
      borderRadius: 999,
      backgroundColor: newTheme.surfaceMuted,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: "row",
    },
    card: {
      width: 180,
      height: 260,
      marginRight: spacing.md,
      borderRadius: 22,
      backgroundColor: newTheme.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: newTheme.border ?? "rgba(255,255,255,0.04)",
      padding: spacing.sm,
      justifyContent: "space-between",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    categoryBar: {
      width: 80,
      height: 18,
      borderRadius: 999,
      backgroundColor: newTheme.surface,
      alignSelf: "flex-start",
    },
    bottomBlock: {
      width: "100%",
      height: 60,
      borderRadius: 14,
      backgroundColor: newTheme.surface,
    },
  });
