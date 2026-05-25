import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type TrendPoint = {
  label: string;
  value: number;
};

export type CoreVitalMetric = {
  key: string;
  label: string;
  value: string;
  detail: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  tone: "blue" | "amber" | "violet" | "green";
  emphasis?: "primary" | "secondary";
};

export type MonthlyPulsePoint = {
  label: string;
  value: number;
  color?: string;
};

export type RadarAxisPoint = {
  label: string;
  value: number;
  color?: string;
};
