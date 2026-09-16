import React, { useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import ThemeContext from "@/contexts/ThemeContext";

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: any;
  backgroundColor?: string;
}

interface HorizontalBannerProps {
  data: BannerItem[];
  onPress: (id: string) => void;
}

const { width } = Dimensions.get("window");

const HorizontalBanner: React.FC<HorizontalBannerProps> = ({
  data,
  onPress,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // base card width (aligned with outer screen padding)
  const cardWidth = width - spacing.md * 2;
  const itemSpacing = spacing.md;
  const itemFullWidth = cardWidth + itemSpacing; // card + gap

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / itemFullWidth);
    setCurrentIndex(index);
  };

  return (
    <>
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={itemFullWidth}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingLeft: spacing.md, // align first card with screen padding
          paddingRight: spacing.md - itemSpacing, // so last card sits nicely
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View
            style={[
              styles.banner,
              {
                width: cardWidth,
                backgroundColor: item.backgroundColor || newTheme.cardRaised,
                marginRight: itemSpacing, // 👈 this is the visible gap
              },
            ]}
          >
            <View style={styles.leftContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onPress(item.id)}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>{item.buttonText}</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={item.image}
              style={styles.rightImage}
              resizeMode="contain"
            />
          </View>
        )}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {data.map((_, index) => {
          const isActive = currentIndex === index;
          return (
            <View
              key={index}
              style={[styles.dot, isActive && styles.activeDot]}
            />
          );
        })}
      </View>
    </>
  );
};

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    banner: {
      height: 160,
      marginVertical: spacing.lg,
      borderRadius: 24,
      flexDirection: "row",
      overflow: "hidden",
      alignItems: "center",
      padding: spacing.lg,
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    leftContent: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
    },
    button: {
      marginTop: spacing.md,
      paddingVertical: spacing.sm * 0.75,
      paddingHorizontal: spacing.lg,
      borderRadius: 999,
      backgroundColor: newTheme.buttonPrimary,
      alignSelf: "flex-start",
    },
    buttonText: {
      ...svaTypography.textStyle.caption,
      color: newTheme.buttonPrimaryText,
      fontWeight: "700",
    },
    rightImage: {
      width: 96,
      height: 120,
      marginLeft: spacing.md,
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: newTheme.borderMuted,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: newTheme.accent,
      width: 10,
      height: 10,
    },
  });

export default HorizontalBanner;
