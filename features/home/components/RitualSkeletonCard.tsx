import React from "react";
import { View, StyleSheet, Animated } from "react-native";

export const RitualSkeletonCard = ({ theme }: { theme: any }) => {
  // Simple pulse animation could be added here if desired, 
  // but static skeleton matching the shape is a good first step.
  
  return (
    <View
      style={{
        width: 110,
        height: 150,
        backgroundColor: theme.cardRaised ?? "#262A22",
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: theme.border ?? "rgba(255,255,255,0.1)",
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
      }}
    >
      {/* Circle Placeholder */}
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.surface ?? "rgba(255,255,255,0.05)",
          marginBottom: 16,
        }}
      />
      
      {/* Title Placeholder */}
      <View
        style={{
          width: "70%",
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.surface ?? "rgba(255,255,255,0.05)",
          marginBottom: 8,
        }}
      />
      
      {/* Status Placeholder */}
      <View
        style={{
          width: "40%",
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.surface ?? "rgba(255,255,255,0.05)",
        }}
      />
    </View>
  );
};
