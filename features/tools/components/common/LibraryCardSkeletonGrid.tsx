import { View, StyleSheet } from "react-native";

type LibraryCardSkeletonGridProps = {
  spacing: any;
  theme: any;
};

export const LibraryCardSkeletonGrid: React.FC<LibraryCardSkeletonGridProps> = ({
  spacing,
  theme,
}) => {
  const skeletonItems = [1, 2, 3, 4];

  return (
    <View style={{ paddingTop: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          rowGap: spacing.md,
        }}
      >
        {skeletonItems.map((id) => (
          <View
            key={id}
            style={{
              width: "48%",
              height: 230,
              borderRadius: 20,
              backgroundColor: theme.surfaceMuted ?? "#181C18",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.surface ?? "#1E211E",
                opacity: 0.8,
              }}
            />
            <View
              style={{
                height: 56,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderColor: theme.divider,
                backgroundColor: "#1A1D1A",
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};
