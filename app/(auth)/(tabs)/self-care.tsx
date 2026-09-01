import React, { useContext, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import type { ColorSet, Spacing } from "@/theme/types";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type ActionTile = {
  label: string;
  icon: IconName;
  route: string;
  navigationMode?: "push" | "navigate";
};

type SectionConfig = {
  eyebrow: string;
  title: string;
  chipIcon: IconName;
  actions: ActionTile[];
};

type SelfCareFonts = {
  serif: string;
  mono: string;
  action: string;
};

const SECTION_DATA: SectionConfig[] = [
  {
    eyebrow: "Cognitive Core",
    title: "Mind",
    chipIcon: "brain",
    actions: [
      {
        label: "Reflection",
        icon: "book-edit-outline",
        route: ROUTES.AUTH.SELF_CARE_REFLECTIONS,
      },
      {
        label: "Meditation",
        icon: "meditation",
        route: ROUTES.AUTH.SELF_CARE_MEDITATION,
        navigationMode: "navigate",
      },
      {
        label: "Affirmation",
        icon: "cards-heart-outline",
        route: ROUTES.AUTH.SELF_CARE_AFFIRMATION,
      },
      {
        label: "Breath Work",
        icon: "weather-windy",
        route: ROUTES.AUTH.SELF_CARE_BREATHWORK,
      },
    ],
  },
  {
    eyebrow: "Physical Vitality",
    title: "Body",
    chipIcon: "dumbbell",
    actions: [
      {
        label: "Vitals",
        icon: "heart-pulse",
        route: ROUTES.AUTH.SELF_CARE_VITALS,
      },
      {
        label: "Workout Progress",
        icon: "dumbbell",
        route: ROUTES.AUTH.SELF_CARE_WORKOUT,
      },
    ],
  },
  {
    eyebrow: "Inner Resonance",
    title: "Soul",
    chipIcon: "star-four-points-outline",
    actions: [
      {
        label: "Scribble",
        icon: "pencil-outline",
        route: ROUTES.AUTH.TOOLS_SCRIBBLE_LIST,
      },
      {
        label: "Soundscape",
        icon: "music-circle-outline",
        route: ROUTES.AUTH.SELF_CARE_SOUNDSCAPE,
      },
    ],
  },
];

const SelfCareActionTile = ({
  action,
  onPress,
  iconColor,
  styles,
}: {
  action: ActionTile;
  onPress: (route: string, mode?: "push" | "navigate") => void;
  iconColor: string;
  styles: ReturnType<typeof makeStyles>;
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={() => onPress(action.route, action.navigationMode)}
      style={({ pressed }) => [
        styles.actionTile,
        pressed && styles.actionTilePressed,
      ]}
    >
      <View style={styles.actionIconWrap}>
        <MaterialCommunityIcons
          name={action.icon}
          size={18}
          color={iconColor}
        />
      </View>
      <Text style={styles.actionLabel} numberOfLines={2}>
        {action.label}
      </Text>
    </Pressable>
  );
};

const SelfCareSectionCard = ({
  section,
  onPress,
  chipIconColor,
  styles,
}: {
  section: SectionConfig;
  onPress: (route: string, mode?: "push" | "navigate") => void;
  chipIconColor: string;
  styles: ReturnType<typeof makeStyles>;
}) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionInner}>
        <View style={styles.sectionTopRow}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionEyebrow} numberOfLines={1}>
              {section.eyebrow}
            </Text>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              {section.title}
            </Text>
          </View>

          <View style={styles.sectionChip}>
            <MaterialCommunityIcons
              name={section.chipIcon}
              size={18}
              color={chipIconColor}
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          {section.actions.map((action) => (
            <SelfCareActionTile
              key={action.label}
              action={action}
              onPress={onPress}
              iconColor={chipIconColor}
              styles={styles}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default function SelfCare() {
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const ringSize = useMemo(() => {
    return Math.min(220, Math.max(176, Math.round(width * 0.58)));
  }, [width]);

  const fontFamilies = useMemo(
    () => ({
      serif:
        svaTypography?.textStyle.authTitle.fontFamily ??
        "CormorantGaramond_500Medium",
      mono:
        svaTypography?.textStyle.authMonoLabel.fontFamily ?? "SpaceMono-Regular",
      action: typography.button.fontFamily ?? "Outfit_600SemiBold",
    }),
    [svaTypography, typography.button.fontFamily]
  );

  const styles = useMemo(
    () => makeStyles(theme, spacing, ringSize, fontFamilies),
    [theme, spacing, ringSize, fontFamilies]
  );

  const onRoutePress = (route: string, mode: "push" | "navigate" = "push") => {
    if (mode === "navigate") {
      router.navigate(route as never);
      return;
    }

    router.push(route as never);
  };

  return (
    <ScreenView bgColor={theme.background} padding={0} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.root}>
        <AppHeader
          title="Sattva Sanctuary"
          subtitle="A quiet orbit for mind, body, soul."
          containerStyle={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 154 },
          ]}
        >
          <View style={styles.heroBlock}>
            <View style={styles.ringStage}>
              <View style={styles.scoreRing}>
                <View style={styles.scoreRingInner}>
                  <Text style={styles.scoreNumber}>84</Text>
                </View>
              </View>
            </View>

            <Text style={styles.heroTitle} numberOfLines={1}>
              Sattva Level
            </Text>
            <Text style={styles.heroSubtitle} numberOfLines={1}>
              OPTIMIZED STATE • HIGH COHERENCE
            </Text>
          </View>

          <View style={styles.sectionStack}>
            {SECTION_DATA.map((section) => (
              <SelfCareSectionCard
                key={section.title}
                section={section}
                onPress={onRoutePress}
                chipIconColor={theme.accent}
                styles={styles}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScreenView>
  );
}

const makeStyles = (
  theme: ColorSet,
  spacing: Spacing,
  ringSize: number,
  fonts: SelfCareFonts
) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    screen: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    header: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingTop: spacing.xs,
    },
    heroBlock: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    ringStage: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    scoreRing: {
      width: ringSize,
      height: ringSize,
      borderRadius: ringSize / 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    scoreRingInner: {
      flex: 1,
      borderRadius: ringSize / 2 - 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreNumber: {
      fontFamily: fonts.serif,
      fontSize: 60,
      lineHeight: 62,
      color: theme.accent,
      letterSpacing: -1.2,
    },
    heroTitle: {
      fontFamily: fonts.serif,
      fontSize: 24,
      lineHeight: 28,
      color: theme.textPrimary,
      textAlign: "center",
    },
    heroSubtitle: {
      marginTop: 6,
      fontFamily: fonts.mono,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 3.1,
      color: theme.textSecondary,
      textAlign: "center",
      textTransform: "uppercase",
      opacity: 0.92,
    },
    sectionStack: {
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    sectionCard: {
      borderRadius: 30,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOpacity: 0.32,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 9,
    },
    sectionInner: {
      paddingHorizontal: 18,
      paddingVertical: 18,
    },
    sectionTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    sectionCopy: {
      flex: 1,
      paddingRight: 12,
    },
    sectionEyebrow: {
      fontFamily: fonts.mono,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color: theme.textSecondary,
      opacity: 0.9,
    },
    sectionTitle: {
      marginTop: 6,
      fontFamily: fonts.serif,
      fontSize: 32,
      lineHeight: 34,
      color: theme.textPrimary,
    },
    sectionChip: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    actionTile: {
      width: "48%",
      minHeight: 92,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 14,
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
      marginBottom: spacing.sm,
    },
    actionTilePressed: {
      backgroundColor: theme.surface,
      borderColor: theme.accent,
      transform: [{ scale: 0.98 }],
    },
    actionIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.05)",
    },
    actionLabel: {
      fontFamily: fonts.action,
      fontSize: 13,
      lineHeight: 16,
      letterSpacing: 0.2,
      color: theme.textPrimary,
      textAlign: "center",
      opacity: 0.94,
    },
  });
