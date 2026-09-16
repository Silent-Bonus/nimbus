import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import WorkoutGuideInfoCard from "@/features/self-care/components/workout/WorkoutGuideInfoCard";
import WorkoutGuideSlideCard from "@/features/self-care/components/workout/WorkoutGuideSlideCard";
import {
  getWorkoutGuideLevelContent,
  type WorkoutGuideLevel,
} from "@/features/self-care/utils/workoutGuide";
import type { WorkoutCardModel } from "@/features/self-care/utils/workoutLibrary";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

interface WorkoutGuideModalProps {
  workout: WorkoutCardModel | null;
  onClose: () => void;
  initialLevel?: WorkoutGuideLevel;
}

const WorkoutGuideModal: React.FC<WorkoutGuideModalProps> = ({
  workout,
  onClose,
  initialLevel = "easy",
}) => {
  const { newTheme: theme, svaTypography, spacing } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, spacing),
    [theme, svaTypography, spacing]
  );
  const { width } = useWindowDimensions();

  const slidesRef = useRef<ScrollView | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const workoutId = workout?.id;

  const guide = useMemo(
    () => getWorkoutGuideLevelContent(initialLevel),
    [initialLevel]
  );
  const slideWidth = Math.max(width - spacing.xl * 2, 280);

  useEffect(() => {
    if (!workoutId) return;

    setActiveSlideIndex(0);
    slidesRef.current?.scrollTo({ x: 0, animated: false });
  }, [workoutId, initialLevel]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / slideWidth
      );
      setActiveSlideIndex(nextIndex);
    },
    [slideWidth]
  );

  if (!workout) {
    return null;
  }

  const content = (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>EXERCISE GUIDE</Text>
            <Text style={styles.title} numberOfLines={1}>
              {workout.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {workout.subtitle}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close exercise guide"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <Ionicons name="close" size={20} color={theme.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.carouselBlock}>
          <View style={styles.carouselHeader}>
            <Text style={styles.carouselLabel}>Swipe through the form cues</Text>
            <Text style={styles.carouselIndex}>
              {String(activeSlideIndex + 1).padStart(2, "0")} /{" "}
              {String(guide.slides.length).padStart(2, "0")}
            </Text>
          </View>

          <ScrollView
            ref={slidesRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
          >
            {guide.slides.map((item) => (
              <WorkoutGuideSlideCard
                key={item.id}
                slide={item}
                style={{ width: slideWidth }}
              />
            ))}
          </ScrollView>

          <View style={styles.dotsRow}>
            {guide.slides.map((slide, index) => (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  index === activeSlideIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.infoScroll}
        >
          <WorkoutGuideInfoCard
            testID="workout-guide-overview"
            title="Overview"
            description={guide.summary}
            items={[]}
          />

          <WorkoutGuideInfoCard
            testID="workout-guide-howto"
            title="How to do it"
            description="Move with control and keep the shape honest from the first rep to the last."
            items={guide.howTo}
          />

          <WorkoutGuideInfoCard
            testID="workout-guide-posture"
            title="Posture cues"
            description="Hold these cues lightly in the background while you move."
            items={guide.posture}
          />
        </ScrollView>
      </View>
    </View>
  );

  if (process.env.NODE_ENV === "test") {
    return content;
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={Boolean(workout)}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {content}
    </Modal>
  );
};

const styling = (
  theme: ColorSet,
  svaTypography: any | undefined,
  spacing: Spacing,

) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(3, 4, 3, 0.82)",
      justifyContent: "flex-end",
    },
    sheet: {
      maxHeight: "94%",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    handle: {
      alignSelf: "center",
      width: 52,
      height: 5,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      marginBottom: spacing.md,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    headerCopy: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    eyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.chart2 ?? theme.buttonPrimary,
      fontSize: 11,
      letterSpacing: 1.8,
      marginBottom: spacing.xs,
    },
    title: {
      fontFamily:
        svaTypography?.textStyle.displayMedium.fontFamily ??
        svaTypography.textStyle.heading2.fontFamily,
      color: theme.textPrimary,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 4,
    },
    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    closeButtonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    carouselBlock: {
      marginTop: spacing.lg,
    },
    carouselHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    carouselLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.textSecondary,
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    carouselIndex: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        svaTypography.textStyle.caption.fontFamily,
      color: theme.chart2 ?? theme.buttonPrimary,
      fontSize: 11,
      letterSpacing: 1.1,
    },
    carouselContent: {
    },
    dotsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.surfaceMuted,
    },
    dotActive: {
      width: 20,
      backgroundColor: theme.buttonPrimary,
    },
    infoScroll: {
      paddingTop: spacing.md,
      paddingBottom: spacing.xl * 2,
    },
  });

export default WorkoutGuideModal;
