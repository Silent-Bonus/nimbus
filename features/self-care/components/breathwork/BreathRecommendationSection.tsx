import React, { useContext, useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing } from "@/theme/types";
import type { BreathRecommendation } from "@/features/self-care/types/breathworkTypes";
import BreathRecommendationCard, {
  getBreathRecommendationCardWidth,
} from "@/features/self-care/components/breathwork/BreathRecommendationCard";

type BreathRecommendationSectionProps = {
  items: BreathRecommendation[];
  selectedId: string;
  onSelect: (item: BreathRecommendation) => void;
  onPlay: (item: BreathRecommendation) => void;
};

const BreathRecommendationSection = ({
  items,
  selectedId,
  onSelect,
  onPlay,
}: BreathRecommendationSectionProps) => {
  const { spacing } = useContext(ThemeContext);

  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    return getBreathRecommendationCardWidth(screenWidth);
  }, []);

  const styles = useMemo(
    () => styling(spacing),
    [spacing]
  );

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        snapToAlignment="start"
        snapToInterval={cardWidth + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <BreathRecommendationCard
            item={item}
            selected={item.id === selectedId}
            onPress={onSelect}
            onPlay={onPlay}
            width={cardWidth}
          />
        )}
      />
    </View>
  );
};

const styling = (spacing: Spacing) =>
  StyleSheet.create({
    section: {
      marginBottom: spacing.lg,
    },
    listContent: {
      paddingRight: spacing.md,
      paddingVertical: spacing.xs,
    },
  });

export default BreathRecommendationSection;
