import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenHeader from "@/components/layout/ScreenHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import ThemeContext from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  formatAdvancedValue,
  type AdvancedSettingDisplayItem,
  type AdvancedSettingSection,
  type AdvancedSettingsPatch,
  type AdvancedSettingsState,
} from "@/features/settings/components/modal/advancedSettingsTypes";
import PreferenceDetailModal from "@/features/settings/components/modal/PreferenceDetailModal";
import type { SvaColorSet, Spacing } from "@/theme/types";

type AdvancedSettingsTypography = {
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type AdvancedSettingsStyles = ReturnType<typeof createStyles>;

type SectionBlockProps = {
  section: AdvancedSettingSection;
  items: AdvancedSettingDisplayItem[];
  styles: AdvancedSettingsStyles;
  colors: SvaColorSet;
  onPressItem: (item: AdvancedSettingDisplayItem) => void;
};

const ADVANCED_SECTIONS: AdvancedSettingSection[] = [
  {
    title: "Measurement Units",
    hint: "Keep body and environment metrics consistent.",
    items: [
      {
        key: "liquid_unit",
        label: "Liquid unit",
        description: "Hydration, drinks, and fluid tracking.",
        options: ["ml", "oz"],
        icon: "water-outline",
        section: "measurement",
      },
      {
        key: "weight_unit",
        label: "Weight unit",
        description: "Scale and progress tracking.",
        options: ["kg", "lbs"],
        icon: "barbell-outline",
        section: "measurement",
      },
      {
        key: "height_unit",
        label: "Height unit",
        description: "Profile height and body references.",
        options: ["cm", "in"],
        icon: "resize-outline",
        section: "measurement",
      },
      {
        key: "weather_unit",
        label: "Weather unit",
        description: "Temperature display in the app.",
        options: ["Celsius", "Fahrenheit"],
        icon: "partly-sunny-outline",
        section: "measurement",
      },
      {
        key: "length_unit",
        label: "Length unit",
        description: "Distances and movement metrics.",
        options: ["feet", "km", "miles"],
        icon: "map-outline",
        section: "measurement",
      },
    ],
  },
  {
    title: "Daily Rhythm",
    hint: "Shape the cadence of your day and evening.",
    items: [
      {
        key: "start_of_day",
        label: "Start of the day",
        description: "Choose the hour that begins your routine.",
        options: Array.from({ length: 24 }, (_, index) =>
          `${String(index).padStart(2, "0")}:00`
        ),
        icon: "sunny-outline",
        section: "schedule",
      },
      {
        key: "start_of_week",
        label: "Start of the week",
        description: "Match your planning cycle.",
        options: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        icon: "calendar-outline",
        section: "schedule",
      },
      {
        key: "sleep_time",
        label: "Sleep time",
        description: "Set your wind-down anchor.",
        options: Array.from({ length: 24 }, (_, index) =>
          `${String(index).padStart(2, "0")}:00`
        ),
        icon: "moon-outline",
        section: "schedule",
      },
    ],
  },
];

function SectionBlock({
  section,
  items,
  styles,
  colors,
  onPressItem,
}: SectionBlockProps) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderCopy}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionHint}>{section.hint}</Text>
        </View>
        <Text style={styles.sectionCount}>
          {String(items.length).padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.cardGroup}>
        {items.map((item) => (
          <SettingRow
            key={item.key}
            item={item}
            colors={colors}
            styles={styles}
            onPress={() => onPressItem(item)}
          />
        ))}
      </View>
    </View>
  );
}

function SettingRow({
  item,
  colors,
  styles,
  onPress,
}: {
  item: AdvancedSettingDisplayItem;
  colors: SvaColorSet;
  styles: AdvancedSettingsStyles;
  onPress: () => void;
}) {
  const value = formatAdvancedValue(item.key, item.selectedUnit);
  const valueTone = item.selectedUnit ? colors.text.primary : colors.text.secondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${value}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingCard,
        pressed && styles.settingCardPressed,
      ]}
    >
      <View style={styles.settingIconWrap}>
        <Ionicons name={item.icon} size={18} color={colors.brand.primary} />
      </View>

      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={styles.settingDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.settingMeta}>
        <Text style={[styles.settingValue, { color: valueTone }]} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
      </View>
    </Pressable>
  );
}

export const AdvancedSettingsScreen = () => {
  const { newTheme, svaColors, svaTypography, typography, spacing } =
    useContext(ThemeContext);
  const { loadUserFromStorage, updateProfile } = useAuth();
  const toast = useNimbusToast();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] =
    useState<AdvancedSettingDisplayItem | null>(null);
  const [merged, setMerged] = useState<AdvancedSettingDisplayItem[]>(
    () => flattenSections()
  );

  const fonts = useMemo<AdvancedSettingsTypography>(
    () => ({
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Outfit_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Outfit_600SemiBold",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles: AdvancedSettingsStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing),
    [svaColors, fonts, spacing]
  );

  const refreshSettings = useCallback(async () => {
    setLoading(true);

    try {
      const cached = (await loadUserFromStorage?.()) as
        | { settings?: AdvancedSettingsState | null }
        | null
        | undefined;

      const nextSettings = cached?.settings ?? {};
      setMerged(
        flattenSections().map((item) => ({
          ...item,
          selectedUnit: nextSettings[item.key] ?? null,
        }))
      );
    } catch (error) {
      console.warn("load advanced settings failed", error);
    } finally {
      setLoading(false);
    }
  }, [loadUserFromStorage]);

  useFocusEffect(
    useCallback(() => {
      refreshSettings();
    }, [refreshSettings])
  );

  useEffect(() => {
    if (!detailVisible) {
      setSelectedSetting(null);
    }
  }, [detailVisible]);

  const handlePressItem = useCallback((item: AdvancedSettingDisplayItem) => {
    setSelectedSetting({
      ...item,
      selectedUnit: item.selectedUnit ?? null,
    });
    setDetailVisible(true);
  }, []);

  const handleSaveSetting = useCallback(
    async (payload: AdvancedSettingsPatch) => {
      try {
        const saved = await updateProfile?.(payload);
        if (saved?.success) {
          const nextSettings =
            (saved?.data?.settings as AdvancedSettingsState | undefined) ??
            payload.settings;

          setMerged((current) =>
            current.map((item) => ({
              ...item,
              selectedUnit: nextSettings[item.key] ?? item.selectedUnit ?? null,
            }))
          );

          toast.show({
            variant: "success",
            title: "Advanced settings updated",
            message: "Your preferences are in sync with your profile.",
          });
          return true;
        }

        toast.show({
          variant: "error",
          title: "Could not save settings",
          message: saved?.message ?? "Please try again.",
        });
        return false;
      } catch (error) {
        console.warn("save advanced settings failed", error);
        toast.show({
          variant: "error",
          title: "Could not save settings",
          message: "Please try again.",
        });
        return false;
      }
    },
    [toast, updateProfile]
  );

  const handleBack = useCallback(() => {
    if (detailVisible) {
      setDetailVisible(false);
      return;
    }

    router.back();
  }, [detailVisible]);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
  }, []);

  const activeCount = merged.filter((item) => item.selectedUnit).length;

  return (
    <ScreenView bgColor={newTheme.background} padding={0} style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScreenHeader
        title="Advanced Settings"
        subtitle="Tune your measurement units and daily rhythm from one clean screen."
        onBack={handleBack}
        containerStyle={styles.headerContainer}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 126 },
        ]}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            {loading ? (
              <ActivityIndicator size="small" color={svaColors.brand.primary} />
            ) : (
              <Ionicons
                name="options-outline"
                size={18}
                color={svaColors.brand.primary}
              />
            )}
          </View>

          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Focused unit editing</Text>
            <Text style={styles.summaryText}>
              Tap any item below to open a dedicated picker bottom sheet.
            </Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Configured</Text>
            <Text style={styles.kpiValue}>{activeCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total items</Text>
            <Text style={styles.kpiValue}>{merged.length}</Text>
          </View>
        </View>

        {ADVANCED_SECTIONS.map((section) => {
          const items = merged.filter((item) =>
            section.items.some((sectionItem) => sectionItem.key === item.key)
          );

          return (
            <SectionBlock
              key={section.title}
              section={section}
              items={items}
              styles={styles}
              colors={svaColors}
              onPressItem={handlePressItem}
            />
          );
        })}
      </ScrollView>

      {selectedSetting ? (
        <PreferenceDetailModal
          visible={detailVisible}
          categoryKey={selectedSetting.key}
          selectedUnit={selectedSetting.selectedUnit}
          label={selectedSetting.label}
          options={selectedSetting.options}
          onSave={handleSaveSetting}
          onClose={handleCloseDetail}
        />
      ) : null}
    </ScreenView>
  );
};

function flattenSections(): AdvancedSettingDisplayItem[] {
  return ADVANCED_SECTIONS.flatMap((section) => section.items);
}

function createStyles(
  colors: SvaColorSet,
  fonts: AdvancedSettingsTypography,
  spacing: Spacing
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    headerContainer: {
      marginBottom: 12,
      paddingBottom: 0,
      paddingHorizontal: 12,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 6,
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    summaryIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    summaryCopy: {
      flex: 1,
    },
    summaryTitle: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 16,
      lineHeight: 20,
    },
    summaryText: {
      marginTop: 4,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
    kpiRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    kpiCard: {
      flex: 1,
      padding: spacing.md,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    kpiLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    kpiValue: {
      marginTop: 6,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 20,
      lineHeight: 24,
    },
    sectionBlock: {
      marginBottom: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    sectionHeaderCopy: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 17,
      lineHeight: 22,
    },
    sectionHint: {
      marginTop: 2,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
    },
    sectionCount: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      paddingTop: 4,
    },
    cardGroup: {
      gap: 10,
    },
    settingCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: 14,
      borderRadius: 22,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    settingCardPressed: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.bg.subtle,
    },
    settingIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg.subtle,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    settingCopy: {
      flex: 1,
      gap: 3,
    },
    settingLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 15.5,
      lineHeight: 19,
    },
    settingDescription: {
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
    },
    settingMeta: {
      alignItems: "flex-end",
      gap: 4,
      minWidth: 68,
    },
    settingValue: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
  });
};
