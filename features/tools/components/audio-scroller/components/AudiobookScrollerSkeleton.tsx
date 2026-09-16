// src/components/audiobooks/AudiobookScrollerSkeleton.tsx
import React, { useContext, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";
import ThemeContext from "@/contexts/ThemeContext";

const SKELETON_ITEMS = [1, 2, 3];

const AudiobookScrollerSkeleton: React.FC = () => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
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
            <View style={styles.coverBlock} />
            <View style={styles.titleBlock} />
            <View style={styles.authorBlock} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default AudiobookScrollerSkeleton;

const styling = (newTheme: any, spacing: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing.lg,
    },
    headerSkeleton: {
      width: 140,
      height: 22,
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
      padding: spacing.sm,
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
    coverBlock: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: newTheme.surface,
      marginBottom: spacing.sm,
    },
    titleBlock: {
      height: 16,
      borderRadius: 999,
      backgroundColor: newTheme.surface,
      marginBottom: 6,
    },
    authorBlock: {
      width: "60%",
      height: 12,
      borderRadius: 999,
      backgroundColor: newTheme.surface,
    },
  });
