/* ---------------- skeleton card ---------------- */

import { View, StyleSheet } from "react-native";

export const DailyCheckinSkeletonCard = ({ theme }: { theme: any }) => {
  return (
    <View
      style={{
        width: 160,
        height: 140,
        borderRadius: 16,
        marginRight: 12,
        backgroundColor: theme.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.divider,
        padding: 12,
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: "#2E322B",
        }}
      />
      <View
        style={{
          height: 10,
          borderRadius: 6,
          backgroundColor: "#30342C",
          width: "70%",
        }}
      />
      <View
        style={{
          height: 8,
          borderRadius: 6,
          backgroundColor: "#30342C",
          width: "50%",
        }}
      />
    </View>
  );
};
