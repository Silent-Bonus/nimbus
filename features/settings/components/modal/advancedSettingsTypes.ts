import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type AdvancedSettingKey =
  | "liquid_unit"
  | "weight_unit"
  | "weather_unit"
  | "height_unit"
  | "length_unit"
  | "start_of_day"
  | "start_of_week"
  | "sleep_time";

export type AdvancedSettingItem = {
  key: AdvancedSettingKey;
  label: string;
  description: string;
  options: string[];
  icon: ComponentProps<typeof Ionicons>["name"];
  section: "measurement" | "schedule";
};

export type AdvancedSettingDisplayItem = AdvancedSettingItem & {
  selectedUnit?: string | null;
};

export type AdvancedSettingSection = {
  title: string;
  hint: string;
  items: AdvancedSettingItem[];
};

export type AdvancedSettingsPatch = {
  settings: Partial<Record<AdvancedSettingKey, string>>;
};

export type AdvancedSettingsState = Partial<
  Record<AdvancedSettingKey, string | null | undefined>
>;

const TIME_SETTING_KEYS = new Set<AdvancedSettingKey>([
  "start_of_day",
  "sleep_time",
]);

export function isTimeSettingKey(key: AdvancedSettingKey) {
  return TIME_SETTING_KEYS.has(key);
}

export function formatAdvancedValue(
  key: AdvancedSettingKey,
  value?: string | null
) {
  if (!value) return "Not set";

  const trimmed = value.trim();
  if (!trimmed) return "Not set";

  if (isTimeSettingKey(key)) {
    return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed;
  }

  if (key === "start_of_week") {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  if (key === "weather_unit") {
    const lower = trimmed.toLowerCase();
    if (lower === "celsius") return "Celsius";
    if (lower === "fahrenheit") return "Fahrenheit";
    return trimmed;
  }

  if (
    key === "liquid_unit" ||
    key === "weight_unit" ||
    key === "height_unit" ||
    key === "length_unit"
  ) {
    return trimmed.toLowerCase();
  }

  return trimmed;
}
