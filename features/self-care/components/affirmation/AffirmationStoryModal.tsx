import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import type { AffirmationRecommendation } from "@/features/self-care/utils/affirmationLibrary";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type AffirmationStoryModalProps = {
  visible: boolean;
  onClose: () => void;
  slides: AffirmationRecommendation[];
  initialSlideId?: string;
};

type StorySlideProps = {
  item: AffirmationRecommendation;
  index: number;
  total: number;
  slideWidth: number;
  styles: ReturnType<typeof styling>;
};

const StorySlide = ({
  item,
  index,
  total,
  slideWidth,
  styles,
}: StorySlideProps) => {
  return (
    <View style={[styles.slideWrap, { width: slideWidth }]}>
      <View style={styles.slideCard}>
        <LinearGradient
          colors={item.palette.colors}
          start={{ x: 0.08, y: 0.05 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View
          pointerEvents="none"
          style={[styles.slideGlow, { backgroundColor: item.palette.accentSoft }]}
        />
        <View pointerEvents="none" style={styles.slideGlowSoft} />

        <View style={styles.slideInner}>
          <View style={styles.slideTopRow}>
            <View
              style={[
                styles.slideTag,
                {
                  backgroundColor: item.palette.tagBg,
                  borderColor: item.palette.tagBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="cards-heart-outline"
                size={12}
                color={item.palette.tagText}
              />
              <Text style={[styles.slideTagText, { color: item.palette.tagText }]}>
                {item.tag.toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.slideCounter, { color: item.palette.text }]}>
              {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </Text>
          </View>

          <View style={styles.slideCopyBlock}>
            <Text style={[styles.slideTitle, { color: item.palette.text }]} numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={[styles.slideQuote, { color: item.palette.text }]} numberOfLines={5}>
              {item.affirmation}
            </Text>

            {item.detail ? (
              <Text
                style={[styles.slideDetail, { color: item.palette.text }]}
                numberOfLines={3}
              >
                {item.detail}
              </Text>
            ) : null}
          </View>

          <View style={styles.slideFooter}>
            <Text style={[styles.slideFooterText, { color: item.palette.text }]}>
              Swipe for the next line
            </Text>
            <View
              style={[
                styles.slideChevronBubble,
                { backgroundColor: item.palette.tagBg },
              ]}
            >
              <Ionicons name="chevron-forward" size={16} color={item.palette.text} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const AffirmationStoryModal = ({
  visible,
  onClose,
  slides,
  initialSlideId,
}: AffirmationStoryModalProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");

  const listRef = useRef<FlatList<AffirmationRecommendation>>(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(height)).current;

  const [isMounted, setIsMounted] = useState(visible);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideWidth = Math.max(1, Math.round(width - spacing.md * 2));
  const sheetHeight = Math.min(Math.round(height * 0.9), 780);
  const storyDeckLabel =
    slides.length === 1
      ? "1 slide to hold the mood."
      : `${slides.length} slides to hold the mood.`;

  const initialIndex = useMemo(() => {
    const foundIndex = slides.findIndex((item) => item.id === initialSlideId);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [initialSlideId, slides]);

  const activeSlide = slides[activeIndex] ?? slides[initialIndex] ?? slides[0];

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, svaTypography),
    [newTheme, spacing, typography, svaTypography]
  );

  const animateIn = useCallback(() => {
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(sheetHeight);

    if (
      !Animated ||
      typeof Animated.parallel !== "function" ||
      typeof Animated.timing !== "function"
    ) {
      backdropOpacity.setValue(1);
      sheetTranslateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetHeight, sheetTranslateY]);

  const animateOut = useCallback(() => {
    if (
      !Animated ||
      typeof Animated.parallel !== "function" ||
      typeof Animated.timing !== "function"
    ) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(sheetHeight);
      setIsMounted(false);
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: sheetHeight,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [backdropOpacity, sheetHeight, sheetTranslateY]);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      setActiveIndex(initialIndex);
      animateIn();
      listRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
      return;
    }

    if (isMounted) {
      animateOut();
    }
  }, [animateIn, animateOut, initialIndex, isMounted, visible]);

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(sheetHeight);
    }
  }, [backdropOpacity, sheetHeight, sheetTranslateY, visible]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleMomentumEnd = useCallback(
    (event: any) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
      if (Number.isFinite(nextIndex)) {
        setActiveIndex(Math.max(0, Math.min(nextIndex, slides.length - 1)));
      }
    },
    [slideWidth, slides.length]
  );

  if (!isMounted) {
    return null;
  }

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={styles.overlay}
    >
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <View style={styles.sheetShell} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,
              {
                height: sheetHeight,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                activeSlide?.palette.accentSoft ?? "rgba(255,255,255,0.08)",
                "transparent",
              ]}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 0.95, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />

            <View style={[styles.inner, { paddingBottom: insets.bottom + spacing.md }]}>
              <View style={styles.dragHandle} />

              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>AFFIRMATION STORY</Text>
                  <Text style={styles.title}>{storyDeckLabel}</Text>
                  <Text style={styles.subtitle}>
                    Swipe horizontally through the selected line and the full deck.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close affirmation story"
                  onPress={handleClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <Ionicons name="close" size={20} color={newTheme.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.metaPill,
                    {
                      backgroundColor: activeSlide?.palette.tagBg,
                      borderColor: activeSlide?.palette.tagBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.metaText,
                      { color: activeSlide?.palette.tagText ?? newTheme.textSecondary },
                    ]}
                  >
                    {`${String(activeIndex + 1).padStart(2, "0")} / ${String(
                      slides.length
                    ).padStart(2, "0")}`}
                  </Text>
                </View>

                <View style={styles.dotRow}>
                  {slides.map((slide, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <View
                        key={slide.id}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: isActive
                              ? activeSlide?.palette.accent ?? newTheme.accent
                              : newTheme.borderMuted ?? "rgba(255,255,255,0.08)",
                            transform: [{ scale: isActive ? 1.1 : 1 }],
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              <FlatList
                ref={listRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                initialNumToRender={slides.length}
                maxToRenderPerBatch={slides.length}
                windowSize={slides.length}
                decelerationRate="fast"
                bounces={false}
                snapToAlignment="start"
                getItemLayout={(_, index) => ({
                  length: slideWidth,
                  offset: slideWidth * index,
                  index,
                })}
                onMomentumScrollEnd={handleMomentumEnd}
                contentContainerStyle={styles.carouselContent}
                style={[styles.carousel, { width: slideWidth }]}
                renderItem={({ item, index }) => (
                  <StorySlide
                    item={item}
                    index={index}
                    total={slides.length}
                    slideWidth={slideWidth}
                    styles={styles}
                  />
                )}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography: TypographyTokens | undefined
) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 50,
      elevation: 50,
    },
    root: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.overlayStrong ?? "rgba(7, 9, 7, 0.7)",
    },
    sheetShell: {
      flex: 1,
      justifyContent: "flex-end",
    },
    sheet: {
      width: "100%",
      borderTopLeftRadius: 34,
      borderTopRightRadius: 34,
      overflow: "hidden",
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -12 },
      elevation: 16,
    },
    inner: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    dragHandle: {
      width: 44,
      height: 4,
      borderRadius: 999,
      alignSelf: "center",
      marginBottom: spacing.md,
      backgroundColor: theme.borderMuted ?? "rgba(255,255,255,0.12)",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    headerCopy: {
      flex: 1,
      minWidth: 0,
    },
    eyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.5,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    title: {
      ...typography.h3,
      color: theme.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      ...typography.caption,
      color: theme.textSecondary,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
    },
    closeButtonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    metaPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    metaText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    dotRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 99,
    },
    carousel: {
      flex: 1,
      alignSelf: "center",
    },
    carouselContent: {
      alignItems: "stretch",
    },
    slideWrap: {
      flex: 1,
      paddingBottom: spacing.sm,
      paddingRight: spacing.xs,
    },
    slideCard: {
      flex: 1,
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
    slideGlow: {
      position: "absolute",
      top: -24,
      right: -18,
      width: 128,
      height: 128,
      borderRadius: 999,
      opacity: 0.82,
    },
    slideGlowSoft: {
      position: "absolute",
      bottom: -40,
      left: -20,
      width: 160,
      height: 160,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.18)",
      opacity: 0.4,
    },
    slideInner: {
      flex: 1,
      justifyContent: "space-between",
      padding: spacing.lg,
      gap: spacing.md,
    },
    slideTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    slideTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    slideTagText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.25,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    slideCounter: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      textTransform: "uppercase",
      fontWeight: "700",
      opacity: 0.85,
    },
    slideCopyBlock: {
      flex: 1,
      justifyContent: "center",
      gap: 10,
      paddingVertical: spacing.sm,
    },
    slideTitle: {
      fontFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.25,
    },
    slideQuote: {
      ...typography.h3,
      fontSize: 27,
      lineHeight: 34,
      letterSpacing: -0.35,
    },
    slideDetail: {
      ...typography.caption,
      color: theme.textSecondary,
      lineHeight: 18,
      opacity: 0.92,
    },
    slideFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    slideFooterText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.3,
      textTransform: "uppercase",
      fontWeight: "700",
      opacity: 0.82,
    },
    slideChevronBubble: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.14)",
    },
  });

export default AffirmationStoryModal;
