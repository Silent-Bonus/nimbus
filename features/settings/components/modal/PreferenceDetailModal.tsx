import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import SettingsBottomSheet from "./SettingsBottomSheet";
import {
  formatAdvancedValue,
  isTimeSettingKey,
  type AdvancedSettingKey,
  type AdvancedSettingsPatch,
} from "./advancedSettingsTypes";
import type { SvaColorSet, Spacing } from "@/theme/types";

type PreferenceDetailTypography = {
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type PreferenceDetailStyles = ReturnType<typeof createStyles>;

type Props = {
  visible: boolean;
  categoryKey: AdvancedSettingKey;
  selectedUnit?: string | null;
  label: string;
  options: string[];
  onSave: (val: AdvancedSettingsPatch) => Promise<boolean | void> | boolean | void;
  onClose: () => void;
};

const RECOMMENDED = ["05:00", "06:00", "07:00", "08:00", "09:00"];

export default function PreferenceDetailModal({
  visible,
  categoryKey,
  selectedUnit,
  label,
  options,
  onSave,
  onClose,
}: Props) {
  const { svaColors, svaTypography, typography, spacing } =
    useContext(ThemeContext);
  const [selected, setSelected] = useState<string>(selectedUnit ?? "");
  const [saving, setSaving] = useState(false);

  const fonts = useMemo<PreferenceDetailTypography>(
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

  const styles: PreferenceDetailStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing),
    [svaColors, fonts, spacing]
  );

  useEffect(() => {
    if (!visible) return;
    setSelected(selectedUnit ?? "");
  }, [selectedUnit, visible]);

  const timeMode = isTimeSettingKey(categoryKey);

  const recommendedOptions = useMemo(() => {
    if (!timeMode) return [];
    const normalized = new Set(options.map((option) => normalizeOption(option)));
    return RECOMMENDED.filter((item) => normalized.has(normalizeOption(item)));
  }, [options, timeMode]);

  const otherOptions = useMemo(() => {
    if (!timeMode) return options;
    const recommendedSet = new Set(recommendedOptions.map((item) => normalizeOption(item)));
    return options.filter((item) => !recommendedSet.has(normalizeOption(item)));
  }, [options, recommendedOptions, timeMode]);

  const selectedValue = formatAdvancedValue(categoryKey, selected || selectedUnit);
  const hasChanges =
    normalizeOption(selected, categoryKey) !==
    normalizeOption(selectedUnit ?? "", categoryKey);

  const canSave = selected.trim().length > 0 && !saving && hasChanges;

  const saveLabel = saving ? "Saving..." : "Save changes";

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      const payloadValue = normalizePayloadValue(categoryKey, selected);
      const result = await onSave({
        settings: {
          [categoryKey]: payloadValue,
        },
      });

      if (result !== false) {
        onClose();
      }
    } catch (error) {
      console.warn("save advanced preference failed", error);
    } finally {
      setSaving(false);
    }
  };

  const headerBadgeLabel = timeMode ? "Schedule" : "Measurements";
  const headerBadgeIcon = timeMode ? "time-outline" : "options-outline";

  return (
    <SettingsBottomSheet
      visible={visible}
      onClose={onClose}
      eyebrow="Advanced settings"
      title={label}
      subtitle="Choose one value and save it back to your profile."
      badgeLabel={headerBadgeLabel}
      badgeIcon={headerBadgeIcon}
      closeLabel={`Close ${label}`}
      footer={
        <View style={styles.footerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel changes"
            onPress={onClose}
            style={({ pressed }) => [
              styles.footerButton,
              styles.footerButtonSecondary,
              pressed && styles.footerButtonPressed,
            ]}
          >
            <Text style={styles.footerSecondaryLabel}>Cancel</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saveLabel}
            onPress={handleSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.footerButton,
              styles.footerButtonPrimary,
              pressed && canSave && styles.footerButtonPressed,
              !canSave && styles.footerButtonDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color={svaColors.bg.base} />
            ) : (
              <Text style={styles.footerPrimaryLabel}>{saveLabel}</Text>
            )}
          </Pressable>
        </View>
      }
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconWrap}>
          <Ionicons
            name={timeMode ? "moon-outline" : "sparkles-outline"}
            size={18}
            color={svaColors.brand.primary}
          />
        </View>

        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Current selection</Text>
          <Text style={styles.summaryValue}>{selectedValue}</Text>
          <Text style={styles.summaryText}>
            {timeMode
              ? "Pick a rhythm that feels natural. The top row highlights recommended windows."
              : "Choose the unit that best matches your profile and tracking habits."}
          </Text>
        </View>
      </View>

      {timeMode ? (
        <>
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recommended</Text>
              <Text style={styles.sectionMeta}>
                {String(recommendedOptions.length).padStart(2, "0")}
              </Text>
            </View>

            <View style={styles.timeChipRow}>
              {recommendedOptions.length ? (
                recommendedOptions.map((option) => (
                  <OptionChip
                    key={option}
                    label={option}
                    active={normalizeOption(option) === normalizeOption(selected, categoryKey)}
                    colors={svaColors}
                    styles={styles}
                    onPress={() => setSelected(option)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No recommended times found.</Text>
              )}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Other options</Text>
              <Text style={styles.sectionMeta}>
                {String(otherOptions.length).padStart(2, "0")}
              </Text>
            </View>

            <View style={styles.timeChipRow}>
              {otherOptions.map((option) => (
                <OptionChip
                  key={option}
                  label={option}
                  active={normalizeOption(option) === normalizeOption(selected, categoryKey)}
                  colors={svaColors}
                  styles={styles}
                  onPress={() => setSelected(option)}
                />
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.optionGrid}>
          {options.map((option) => {
            const active = normalizeOption(option, categoryKey) === normalizeOption(selected, categoryKey);

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={option}
                onPress={() => setSelected(option)}
                style={({ pressed }) => [
                  styles.optionCard,
                  active && styles.optionCardActive,
                  pressed && styles.optionCardPressed,
                ]}
              >
                <View style={styles.optionCardTopRow}>
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {option}
                  </Text>

                  {active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={svaColors.brand.primary}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={18}
                      color={svaColors.text.secondary}
                    />
                  )}
                </View>

                <Text style={styles.optionHint}>
                  {active ? "Selected" : "Tap to switch"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </SettingsBottomSheet>
  );
}

function OptionChip({
  label,
  active,
  colors,
  styles,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: SvaColorSet;
  styles: PreferenceDetailStyles;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.timeChip,
        active && styles.timeChipActive,
        pressed && styles.timeChipPressed,
      ]}
    >
      <Text
        style={[
          styles.timeChipText,
          active && styles.timeChipTextActive,
        ]}
      >
        {label}
      </Text>
      {active ? (
        <Ionicons name="checkmark" size={14} color={colors.bg.base} />
      ) : null}
    </Pressable>
  );
}

function normalizeOption(value: string, key?: AdvancedSettingKey) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (key && isTimeSettingKey(key)) {
    return trimmed.slice(0, 5).padStart(5, "0");
  }

  return trimmed.toLowerCase();
}

function normalizePayloadValue(key: AdvancedSettingKey, value: string) {
  const trimmed = value.trim();
  if (isTimeSettingKey(key)) {
    return trimmed.slice(0, 5);
  }

  if (key === "start_of_week" || key === "weather_unit") {
    return trimmed.toLowerCase();
  }

  return trimmed.toLowerCase();
}

function createStyles(
  colors: SvaColorSet,
  fonts: PreferenceDetailTypography,
  spacing: Spacing
) {
  return StyleSheet.create({
    summaryCard: {
      flexDirection: "row",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
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
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    summaryValue: {
      marginTop: 4,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 18,
      lineHeight: 22,
    },
    summaryText: {
      marginTop: 6,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
    sectionBlock: {
      marginBottom: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 15.5,
      lineHeight: 20,
    },
    sectionMeta: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    timeChipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    timeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    timeChipActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    timeChipPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.94,
    },
    timeChipText: {
      fontFamily: fonts.monoFamily,
      color: colors.text.primary,
      fontSize: 10.5,
      lineHeight: 12,
      letterSpacing: 1.1,
    },
    timeChipTextActive: {
      color: colors.bg.base,
    },
    emptyText: {
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
    optionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    optionCard: {
      width: "48%",
      minHeight: 94,
      padding: 14,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    optionCardActive: {
      backgroundColor: colors.bg.subtle,
      borderColor: colors.brand.primary,
    },
    optionCardPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    optionCardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 18,
    },
    optionText: {
      flex: 1,
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 18,
    },
    optionTextActive: {
      color: colors.text.primary,
    },
    optionHint: {
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingBottom: spacing.xs,
    },
    footerButton: {
      flex: 1,
      height: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
    },
    footerButtonSecondary: {
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    footerButtonPrimary: {
      backgroundColor: colors.brand.primary,
    },
    footerButtonPressed: {
      opacity: 0.92,
    },
    footerButtonDisabled: {
      opacity: 0.5,
    },
    footerSecondaryLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 14.5,
      lineHeight: 18,
    },
    footerPrimaryLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.bg.base,
      fontSize: 14.5,
      lineHeight: 18,
    },
  });
}
