import ThemeContext from "@/contexts/ThemeContext";
import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";

interface CardData {
  id: string;
  title?: string;
  image: any; // require() or { uri: '' }
}

interface TrendingCardCarouselProps {
  title: string;
  type: string;
  data: CardData[];
  onPress: (id: string, type: string) => void;
  onClickOfAll?: () => void;
}

const { width } = Dimensions.get("window");

const TrendingCardCarousel: React.FC<TrendingCardCarouselProps> = ({
  title,
  data,
  type,
  onPress,
  onClickOfAll,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        {onClickOfAll && (
          <TouchableOpacity onPress={onClickOfAll}>
            <Text style={styles.seeAll}>All ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel */}
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingLeft: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPress(item.id, type)}
            style={styles.cardWrapper}
            activeOpacity={0.9}
          >
            <View style={styles.cardOuter}>
              <Image
                source={item.image}
                style={[StyleSheet.absoluteFill, styles.cardImage]}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.card}>
                {/* soft dark overlay to unify artwork */}
                <View
                  style={[
                    styles.overlay,
                    { backgroundColor: newTheme.overlay },
                  ]}
                />
                {/* title pill (for tests/curated content) */}
                {item.title && (
                  <View style={styles.titlePill}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      marginVertical: spacing.lg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      // paddingHorizontal: spacing.md,
    },
    headerText: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
    },
    seeAll: {
      ...svaTypography.textStyle.body,
      color: newTheme.accent,
      fontWeight: "600",
    },
    cardWrapper: {
      marginRight: spacing.md,
    },
    cardOuter: {
      width: width * 0.55,
      height: width * 0.75,
      borderRadius: 24,
      backgroundColor: newTheme.cardRaised,
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
      overflow: "hidden",
    },
    card: {
      flex: 1,
      justifyContent: "flex-end",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      borderRadius: 24,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.18,
      borderRadius: 24,
    },
    titlePill: {
      position: "absolute",
      bottom: spacing.md,
      left: spacing.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: newTheme.overlayStrong,
    },
    cardTitle: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
      fontWeight: "600",
    },
  });

export default TrendingCardCarousel;
