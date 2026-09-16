import React, { useContext, useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";
import type { AffirmationRecommendation } from "@/features/self-care/utils/affirmationPresentation";
import AffirmationRecommendationCard, {
  getAffirmationRecommendationCardWidth,
} from "@/features/self-care/components/affirmation/AffirmationRecommendationCard";

type AffirmationRecommendationSectionProps = {
  items: AffirmationRecommendation[];
  selectedId: string;
  onSelect: (item: AffirmationRecommendation) => void;
};

const AffirmationRecommendationSection = ({
  items,
  selectedId,
  onSelect,
}: AffirmationRecommendationSectionProps) => {
  const { newTheme, spacing, svaTypography } =
    useContext(ThemeContext);

  const windowWidth = Dimensions.get("window").width;
  const cardWidth = useMemo(
    () => getAffirmationRecommendationCardWidth(windowWidth),
    [windowWidth]
  );

  const styles = useMemo(
    () => styling(newTheme, spacing, svaTypography),
    [newTheme, spacing, svaTypography]
  );

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>RECOMMENDED LINE</Text>
      </View>

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
          <AffirmationRecommendationCard
            item={item}
            selected={item.id === selectedId}
            onPress={onSelect}
            width={cardWidth}
          />
        )}
      />
    </View>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) =>
  StyleSheet.create({
    section: {
      marginBottom: spacing.lg,
    },
    header: {
      marginBottom: spacing.sm,
    },
    eyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.authTinyLabel.fontFamily,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    listContent: {
      paddingRight: spacing.md,
      paddingVertical: spacing.xs,
    },
  });

export default AffirmationRecommendationSection;
