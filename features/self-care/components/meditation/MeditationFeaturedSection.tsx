import React, { useContext } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import MeditationFeaturedCard from "@/features/self-care/components/meditation/MeditationFeautredCard";
import type { EnrichedMeditation } from "../../types/wellnessContentTypes";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

interface MeditationFeaturedSectionProps {
  data: EnrichedMeditation[];
  onPress: (item: EnrichedMeditation) => void | Promise<void>;
  colorPalette: { bgColor: string; color: string }[];
}

const MeditationFeaturedSection: React.FC<MeditationFeaturedSectionProps> = ({
  data,
  onPress,
  colorPalette,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  if (!data.length) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>For You</Text>
      <FlatList
        horizontal
        data={data.slice(0, 5)}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={CARD_WIDTH + spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: spacing.md }}
        renderItem={({ item, index }) => (
          <MeditationFeaturedCard
            data={item}
            onPress={onPress}
            cardColor={colorPalette[index % colorPalette.length]}
          />
        )}
      />
    </View>
  );
};

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    sectionContainer: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
      marginBottom: spacing.sm,
    },
  });

export default MeditationFeaturedSection;
