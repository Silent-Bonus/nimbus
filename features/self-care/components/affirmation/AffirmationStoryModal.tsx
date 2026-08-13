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
import { getAffirmationRecommendationPalette } from "@/features/self-care/utils/affirmationPresentation";
import type { AffirmationCard } from "@/features/self-care/types/affirmation";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

type AffirmationStatementSlide = {
  id: string;
  statement: string;
};

type AffirmationStoryModalProps = {
  visible: boolean;
  onClose: () => void;
  affirmation?: AffirmationCard | null;
  isLoading?: boolean;
};

type StorySlideProps = {
  affirmation: AffirmationCard;
  item: AffirmationStatementSlide;
  index: number;
  total: number;
  slideWidth: number;
  styles: ReturnType<typeof styling>;
};

const StorySlide = ({
  affirmation,
  item,
  index,
  total,
  slideWidth,
  styles,
}: StorySlideProps) => {
  const palette = getAffirmationRecommendationPalette(affirmation.toneCategory);
  const isLastSlide = index === total - 1;

  return (
    <View style={[styles.slideWrap, { width: slideWidth }]}>
      <View style={styles.slideCard}>
        <LinearGradient
          colors={palette.colors}
          start={{ x: 0.08, y: 0.05 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View
          pointerEvents="none"
          style={[styles.slideGlow, { backgroundColor: palette.accentSoft }]}
        />
        <View pointerEvents="none" style={styles.slideGlowSoft} />

        <View style={styles.slideInner}>
          <View style={styles.slideTopRow}>
            <View
              style={[
                styles.slideTonePill,
                {
                  backgroundColor: palette.tagBg,
                  borderColor: palette.tagBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="cards-heart-outline"
                size={12}
                color={palette.tagText}
              />
              <Text style={[styles.slideToneText, { color: palette.tagText }]}>
                {affirmation.tone}
              </Text>
            </View>

            <Text style={[styles.slideCounter, { color: palette.text }]}>
              {`${index + 1}/${total}`}
            </Text>
          </View>

          {affirmation.tags?.length ? (
            <View style={styles.tagRow}>
              {affirmation.tags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: palette.tagBg,
                      borderColor: palette.tagBorder,
                    },
                  ]}
                >
                  <Text
                    style={[styles.tagChipText, { color: palette.tagText }]}
                    numberOfLines={1}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.slideCopyBlock}>
            <Text style={[styles.slideTitle, { color: palette.text }]}>
              {affirmation.title}
            </Text>

            <Text
              style={[styles.slideDetail, { color: palette.text }]}
              numberOfLines={3}
            >
              {affirmation.detail}
            </Text>

            <Text
              style={[styles.statementLabel, { color: palette.text }]}
              numberOfLines={1}
            >
              Statement
            </Text>

            <Text
              style={[styles.slideQuote, { color: palette.text }]}
              numberOfLines={6}
            >
              {item.statement}
            </Text>
          </View>

          {!isLastSlide ? (
            <View style={styles.slideFooter}>
              <Text style={[styles.slideFooterText, { color: palette.text }]}>
                Swipe to the next statement
              </Text>
              <View
                style={[
                  styles.slideChevronBubble,
                  { backgroundColor: palette.tagBg },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={palette.text}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const AffirmationStoryModal = ({
  visible,
  onClose,
  affirmation,
  isLoading = false,
}: AffirmationStoryModalProps) => {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");

  const listRef = useRef<FlatList<AffirmationStatementSlide>>(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(height)).current;

  const [isMounted, setIsMounted] = useState(visible);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideWidth = Math.max(1, Math.round(width - spacing.md * 2));
  const sheetHeight = Math.min(Math.round(height * 0.9), 780);
  const statementSlides = useMemo<AffirmationStatementSlide[]>(
    () =>
      (affirmation?.statements?.length
        ? affirmation.statements
        : affirmation?.quote
          ? [affirmation.quote]
          : []
      ).map((statement, index) => ({
        id: `${affirmation?.id ?? "affirmation"}-statement-${index}`,
        statement,
      })),
    [affirmation]
  );

  const styles = useMemo(
    () => styling(newTheme, spacing, typography, svaTypography),
    [newTheme, spacing, typography, svaTypography]
  );

  const palette = useMemo(
    () =>
      getAffirmationRecommendationPalette(
        affirmation?.toneCategory ?? "confidence"
      ),
    [affirmation?.toneCategory]
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
      setActiveIndex(0);
      animateIn();
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
      return;
    }

    if (isMounted) {
      animateOut();
    }
  }, [animateIn, animateOut, isMounted, visible]);

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(sheetHeight);
    }
  }, [backdropOpacity, sheetHeight, sheetTranslateY, visible]);

  useEffect(() => {
    setActiveIndex(0);
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [affirmation?.id]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleMomentumEnd = useCallback(
    (event: any) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
      if (Number.isFinite(nextIndex)) {
        setActiveIndex(Math.max(0, Math.min(nextIndex, statementSlides.length - 1)));
      }
    },
    [slideWidth, statementSlides.length]
  );

  if (!isMounted || !affirmation) {
    return null;
  }

  return (
    <View pointerEvents={visible ? "auto" : "none"} style={styles.overlay}>
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
              colors={[palette.accentSoft, "transparent"]}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 0.95, y: 1 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />

            <View style={[styles.inner, { paddingBottom: insets.bottom + spacing.md }]}>
              <View style={styles.dragHandle} />

              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>AFFIRMATION</Text>
                  <Text style={styles.title}>{affirmation.title}</Text>
                  <Text style={styles.subtitle}>
                    Open one affirmation and move through it statement by statement.
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

              {isLoading ? (
                <View style={styles.loadingPill}>
                  <Text style={styles.loadingText}>Refreshing affirmation…</Text>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.metaPill,
                    {
                      backgroundColor: palette.tagBg,
                      borderColor: palette.tagBorder,
                    },
                  ]}
                >
                  <Text style={[styles.metaText, { color: palette.tagText }]}>
                    {`${activeIndex + 1}/${statementSlides.length}`}
                  </Text>
                </View>

                <View style={styles.dotRow}>
                  {statementSlides.map((slide, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <View
                        key={slide.id}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: isActive
                              ? palette.accent
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
                data={statementSlides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                initialNumToRender={statementSlides.length}
                maxToRenderPerBatch={statementSlides.length}
                windowSize={statementSlides.length}
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
                    affirmation={affirmation}
                    item={item}
                    index={index}
                    total={statementSlides.length}
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
    loadingPill: {
      alignSelf: "flex-start",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      marginBottom: spacing.sm,
    },
    loadingText: {
      ...typography.caption,
      color: theme.textSecondary,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    metaPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
    },
    metaText: {
      ...typography.smallCaption,
      fontWeight: "700",
    },
    dotRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      flex: 1,
      gap: 6,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 999,
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
    },
    slideCard: {
      flex: 1,
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    slideGlow: {
      position: "absolute",
      top: -24,
      right: -16,
      width: 112,
      height: 112,
      borderRadius: 999,
      opacity: 0.9,
    },
    slideGlowSoft: {
      position: "absolute",
      bottom: -30,
      left: -20,
      width: 136,
      height: 136,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.16)",
      opacity: 0.5,
    },
    slideInner: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: "space-between",
      gap: spacing.md,
    },
    slideTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    slideTonePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    slideToneText: {
      ...typography.smallCaption,
      fontWeight: "700",
    },
    slideCounter: {
      ...typography.smallCaption,
      fontWeight: "700",
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    tagChipText: {
      ...typography.smallCaption,
      fontWeight: "600",
    },
    slideCopyBlock: {
      flex: 1,
      justifyContent: "center",
      gap: spacing.sm,
    },
    slideTitle: {
      ...typography.h3,
    },
    slideDetail: {
      ...typography.caption,
    },
    statementLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.2,
      textTransform: "uppercase",
      opacity: 0.78,
    },
    slideQuote: {
      ...typography.h2,
      lineHeight: 36,
    },
    slideFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    slideFooterText: {
      ...typography.caption,
      fontWeight: "600",
    },
    slideChevronBubble: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default AffirmationStoryModal;
