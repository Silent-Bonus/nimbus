import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import ThemeContext from "@/contexts/ThemeContext";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { ROUTES } from "@/constants/routes";
import {
  MeditationAnchorPulseOrb,
  MeditationAnchorSuggestionCard,
} from "@/features/check-in/components/meditationAnchor";
import {
  formatTime,
  parseAnchorAt,
  parseGoalMinutes,
} from "@/features/check-in/utils/meditationAnchor";
import type {
  ColorSet,
  Spacing,
  TypographyTokens,
} from "@/theme/types";

const getDisplayFont = (svaTypography: any) =>
  svaTypography?.textStyle.authTitle?.fontFamily ??
  svaTypography?.textStyle.displayMedium?.fontFamily ??
  undefined;

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  svaTypography: TypographyTokens
) => {
  const displayFont = getDisplayFont(svaTypography) ?? svaTypography.textStyle.heading2.fontFamily;

  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === "ios" ? 140 : 160,
    },
    sectionCopy: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      ...svaTypography.textStyle.heading2,
      color: theme.textPrimary,
      fontFamily: displayFont,
      letterSpacing: -0.35,
    },
    sectionBody: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      lineHeight: 22,
      marginTop: 8,
    },
    leaveCard: {
      marginTop: spacing.lg,
      borderRadius: 24,
      padding: spacing.md,
      backgroundColor: "rgba(255,255,255,0.035)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    leaveCopy: {
      flex: 1,
    },
    leaveLabel: {
      ...svaTypography.textStyle.button,
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    leaveBody: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    leaveButton: {
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      backgroundColor: "rgba(255,255,255,0.05)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    leaveButtonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    leaveButtonText: {
      ...svaTypography.textStyle.button,
      color: theme.textPrimary,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    sectionHeaderRow: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      opacity: 0.78,
      letterSpacing: 1.7,
      textTransform: "uppercase",
    },
    sectionBodySmall: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
    anchorNote: {
      marginTop: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    anchorNoteText: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      flex: 1,
      lineHeight: 18,
    },
  });
};

export const MeditationAnchorScreen = () => {
  const navigation = useNavigation();
  const { goal, anchorAt } = useLocalSearchParams<{
    goal?: string | string[];
    anchorAt?: string | string[];
  }>();

  const { newTheme: theme, spacing, svaTypography } =
    useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const scrollRef = useRef<ScrollView>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const goalMinutes = useMemo(() => parseGoalMinutes(goal), [goal]);
  const anchoredAtDate = useMemo(() => parseAnchorAt(anchorAt), [anchorAt]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((value) => Math.min(goalMinutes * 60, value + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [goalMinutes]);

  const refreshAnchor = useCallback(() => {
    setElapsedSeconds(0);
  }, []);

  const handleLeaveMeditation = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const scrollToSuggestions = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    <ScreenView bgColor={theme.background} padding={0}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="Presence Anchored"
          subtitle={`${goalMinutes}m goal • vibration sync`}
          onBack={() => navigation.goBack()}
          rightActions={[
            {
              icon: "refresh-outline",
              accessibilityLabel: "Reset anchor progress",
              onPress: refreshAnchor,
            },
            {
              icon: "information-circle-outline",
              accessibilityLabel: "Jump to suggestions",
              onPress: scrollToSuggestions,
            },
          ]}
        />

        <MeditationAnchorPulseOrb
          goalMinutes={goalMinutes}
          elapsedSeconds={elapsedSeconds}
          anchorAt={anchoredAtDate}
        />

        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Stay with the pulse.</Text>
          <Text style={styles.sectionBody}>
            Let the circle fill to the goal while the room stays quiet and the
            body softens.
          </Text>
        </View>

        <View style={styles.leaveCard}>
          <View style={styles.leaveCopy}>
            <Text style={styles.leaveLabel}>Need to step out?</Text>
            <Text style={styles.leaveBody}>
              Leave the session and return to the meditation check-in.
            </Text>
          </View>

          <Pressable
            onPress={handleLeaveMeditation}
            style={({ pressed }) => [
              styles.leaveButton,
              pressed && styles.leaveButtonPressed,
            ]}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={theme.textPrimary}
            />
            <Text style={styles.leaveButtonText}>Leave meditation</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionLabel}>SUGGESTED NEXT</Text>
            <Text style={styles.sectionBodySmall}>
              Keep the ritual going with a deeper meditation or a calmer soundscape.
            </Text>
          </View>
        </View>

        <MeditationAnchorSuggestionCard
          title="Guided Meditation"
          description="Step into a 10-minute guided settle to deepen the anchored state."
          meta="10 min"
          actionLabel="Open meditation"
          icon="leaf-outline"
          tint="rgba(163,190,140,0.12)"
          accent={theme.chart5 ?? theme.accent}
          onPress={() => router.push(ROUTES.AUTH.SELF_CARE_MEDITATION)}
        />

        <View style={{ height: spacing.md }} />

        <MeditationAnchorSuggestionCard
          title="Soundscape"
          description="Open a low amber ambience to keep the nervous system quiet."
          meta="Ambient"
          actionLabel="Open soundscape"
          icon="musical-notes-outline"
          tint="rgba(121,169,242,0.10)"
          accent={theme.chart2 ?? theme.accent}
          onPress={() => router.push(ROUTES.AUTH.SELF_CARE_SOUNDSCAPE)}
        />

        <View style={styles.anchorNote}>
          <Ionicons
            name="sparkles-outline"
            size={16}
            color={theme.chart5 ?? theme.accent}
          />
          <Text style={styles.anchorNoteText}>
            {anchoredAtDate
              ? `Anchor locked at ${formatTime(anchoredAtDate)}.`
              : "The first hold has already set the tone."}
          </Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenView>
  );
};

export default MeditationAnchorScreen;
